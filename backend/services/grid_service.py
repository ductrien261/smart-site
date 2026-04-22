import pandas as pd
import numpy as np
from config import OUTPUTS_DIR

def _load():
    path = OUTPUTS_DIR / "Grid_Predictions.csv"
    if path.exists():
        return pd.read_csv(path)
    # Mock
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
    df = df[df["City"] == city]
    if district:
        df = df[df["District"] == district]
    if min_cafes:
        df = df[df["Cafe_Count"] >= min_cafes]
    if max_cafes:
        df = df[df["Cafe_Count"] <= max_cafes]

    sort_col = {"score": "Score", "cafes": "Cafe_Count", "reviews": "Total_Reviews"}.get(sort_by, "Score")
    df = df.sort_values(sort_col, ascending=False)

    total  = len(df)
    start  = (page - 1) * page_size
    paged  = df.iloc[start: start + page_size]

    return {
        "total":     total,
        "page":      page,
        "page_size": page_size,
        "items":     paged.to_dict(orient="records"),
    }

def get_grid_geojson(city: str, district: str = None):
    df = _load()
    df = df[df["City"] == city]
    if district:
        df = df[df["District"] == district]

    features = []
    HALF = 0.0025  # ~250m mỗi chiều, khớp với step grid colab

    for _, row in df.iterrows():
        lat = row["Center_Lat"]
        lng = row["Center_Lng"]
        score = float(row["Score"])

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [lng - HALF, lat - HALF],
                    [lng + HALF, lat - HALF],
                    [lng + HALF, lat + HALF],
                    [lng - HALF, lat + HALF],
                    [lng - HALF, lat - HALF],
                ]]
            },
            "properties": {
                "Grid_ID":       str(row["Grid_ID"]),
                "Score":         score,
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