import pandas as pd
import numpy as np
import os
from config import OUTPUTS_DIR, PROCESSED_DIR
import geopandas as gpd
from shapely.geometry import Point
from pathlib import Path

_grid_cache: pd.DataFrame | None = None

def _load() -> pd.DataFrame:
    global _grid_cache
    if _grid_cache is not None:
        return _grid_cache

    path = OUTPUTS_DIR / "Grid_Predictions.csv"
    if not path.exists():
        print(f"⚠️  Grid_Predictions.csv not found at {path}, using mock data")
        _grid_cache = _mock_data()
        return _grid_cache

    df = pd.read_csv(path)
    print(f"✅ Loaded Grid_Predictions.csv — {len(df)} rows")

    required = ['Grid_ID','City','Center_Lat','Center_Lng',
                'Cafe_Count','Total_Reviews','NTL_Mean',
                'POI_Density','Score','Score_Class']
    for col in required:
        if col not in df.columns:
            df[col] = 0

    if 'District' not in df.columns:
        df['District'] = 'Unknown'

    # Fill NaN
    df['Cafe_Count']    = df['Cafe_Count'].fillna(0).astype(int)
    df['Total_Reviews'] = df['Total_Reviews'].fillna(0).astype(int)
    df['NTL_Mean']      = df['NTL_Mean'].fillna(0).astype(float)
    df['POI_Density']   = df['POI_Density'].fillna(0).astype(float)
    df['Score']         = df['Score'].fillna(0).astype(float)
    df['Score_Class']   = df['Score_Class'].fillna(0).astype(int)

    pop_dir = OUTPUTS_DIR.parent / "population"
    city_files = {
        'DaNang': pop_dir / 'danang_population.geojson',
        'HCM':    pop_dir / 'hcm_population.geojson',
        'HaNoi':  pop_dir / 'hn_population.geojson',
    }
    gdfs = []
    for city_name, fpath in city_files.items():
        if fpath.exists():
            gdf = gpd.read_file(fpath)
            gdf['_city'] = city_name
            gdfs.append(gdf[['geometry', '_city']])

    if gdfs:
        land_gdf = gpd.GeoDataFrame(pd.concat(gdfs, ignore_index=True), crs='EPSG:4326')
        points_gdf = gpd.GeoDataFrame(
            df,
            geometry=gpd.points_from_xy(df['Center_Lng'], df['Center_Lat']),
            crs='EPSG:4326'
        )
        joined = gpd.sjoin(points_gdf, land_gdf, how='inner', predicate='within')
        before = len(df)
        df = df.loc[joined.index.unique()].reset_index(drop=True)
        print(f"✅ Clipped: {before} → {len(df)} rows")

    _grid_cache = df
    return _grid_cache


def _mock_data() -> pd.DataFrame:
    np.random.seed(42)
    n = 200
    return pd.DataFrame({
        "Grid_ID":      [f"G_{i:06d}" for i in range(n)],
        "City":         ["DaNang"]*80 + ["HCM"]*70 + ["HaNoi"]*50,
        "District":     ["Hải Châu"]*40 + ["Thanh Khê"]*40 + ["Quận 1"]*70 + ["Hoàn Kiếm"]*50,
        "Cafe_Count":   np.random.randint(0, 20, n),
        "Total_Reviews":np.random.randint(0, 5000, n),
        "NTL_Mean":     np.random.uniform(0, 50, n),
        "POI_Density":  np.random.uniform(0, 200, n),
        "Score":        np.random.uniform(25, 100, n),
        "Score_Class":  np.random.randint(0, 3, n),
        "Center_Lat":   np.random.uniform(15.9, 16.1, n),
        "Center_Lng":   np.random.uniform(108.1, 108.3, n),
    })


def get_grids(city, district, min_cafes, max_cafes, sort_by, page, page_size):
    df = _load()
    df = df[df["City"] == city].copy()
    if district:
        df = df[df["District"] == district]
    if min_cafes:
        df = df[df["Cafe_Count"] >= min_cafes]
    if max_cafes:
        df = df[df["Cafe_Count"] <= max_cafes]

    sort_col = {"score": "Score", "cafes": "Cafe_Count", "reviews": "Total_Reviews"}.get(sort_by, "Score")
    df = df.sort_values(sort_col, ascending=False)

    total = len(df)
    start = (page - 1) * page_size
    paged = df.iloc[start: start + page_size]

    return {
        "total":     total,
        "page":      page,
        "page_size": page_size,
        "items":     paged.to_dict(orient="records"),
    }


def get_grid_geojson(city: str, district: str = None):
    df = _load()
    df = df[df["City"] == city].copy()
    if district:
        df = df[df["District"] == district]

    HALF = 0.0025
    features = []
    for _, row in df.iterrows():
        lat  = float(row["Center_Lat"])
        lng  = float(row["Center_Lng"])
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [lng-HALF, lat-HALF], [lng+HALF, lat-HALF],
                    [lng+HALF, lat+HALF], [lng-HALF, lat+HALF],
                    [lng-HALF, lat-HALF],
                ]]
            },
            "properties": {
                "Grid_ID":       str(row["Grid_ID"]),
                "Score":         round(float(row["Score"]), 2),
                "Score_Class":   int(row["Score_Class"]),
                "Cafe_Count":    int(row["Cafe_Count"]),
                "Total_Reviews": int(row["Total_Reviews"]),
                "NTL_Mean":      round(float(row["NTL_Mean"]), 2),
                "POI_Density":   round(float(row["POI_Density"]), 2),
                "District":      str(row["District"]),
            }
        })

    return {"type": "FeatureCollection", "features": features}


def get_districts(city: str):
    df = _load()
    df = df[df["City"] == city]
    districts = sorted(df["District"].dropna().unique().tolist())
    return {"districts": districts}