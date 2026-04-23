import json
import pandas as pd
from config import PROCESSED_DIR
from services.grid_service import _load as _load_grid

_cafe_cache = None
_poi_cache  = None

def _load_grid_df():
    return _load_grid()

def _load_cafe():
    """Load Coffee_Tea_Data_GGMap.csv for sentiment analysis."""
    global _cafe_cache
    if _cafe_cache is not None:
        return _cafe_cache

    path = PROCESSED_DIR / "Coffee_Tea_Data_GGMap.csv"
    if not path.exists():
        _cafe_cache = pd.DataFrame()
        return _cafe_cache

    df = pd.read_csv(path)
    df['sentiment_score_final'] = pd.to_numeric(df.get('sentiment_score_final'), errors='coerce').fillna(0.5)
    df['rating']                = pd.to_numeric(df.get('rating'), errors='coerce').fillna(0.0)
    df['reviews_count']         = pd.to_numeric(df.get('reviews_count'), errors='coerce').fillna(0).astype(int)
    _cafe_cache = df
    return _cafe_cache


def _load_poi_df():
    """Load Coffee_Tea_Data_POI.geojson as DataFrame."""
    global _poi_cache
    if _poi_cache is not None:
        return _poi_cache

    path = PROCESSED_DIR / "Coffee_Tea_Data_POI.geojson"
    if not path.exists():
        _poi_cache = pd.DataFrame()
        return _poi_cache

    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    rows = []
    for ft in data.get("features", []):
        props  = ft.get("properties", {})
        rows.append({
            "City":           props.get("City", ""),
            "Category_Clean": props.get("Category_Clean", "Other"),
        })

    _poi_cache = pd.DataFrame(rows)
    return _poi_cache


# 1. Macro KPI
def get_macro_stats(city: str = "all"):
    df = _load_grid_df()
    cafe_df = _load_cafe()

    if city != "all":
        df = df[df["City"] == city]
        if "City" in cafe_df.columns and not cafe_df.empty:
            cafe_df = cafe_df[cafe_df["City"] == city]

    total_cafes   = int(df["Cafe_Count"].sum())
    hotspot_a     = int((df["Score_Class"] == 2).sum())
    total_reviews = int(df["Total_Reviews"].sum())

    # Sentiment thật: avg(sentiment_score_final) × 5 → thang 0–5
    if not cafe_df.empty and 'sentiment_score_final' in cafe_df.columns:
        sentiment = round(float(cafe_df['sentiment_score_final'].mean()) * 5, 1)
    else:
        sentiment = 0.0

    # NTL
    avg_ntl = round(float(df["NTL_Mean"].mean()), 2)
    ntl_level = "Mức Khá" if avg_ntl > 5 else "Mức Thấp"

    # Coverage %
    total_grids  = len(df)
    grids_w_cafe = int((df["Cafe_Count"] > 0).sum())
    coverage_pct = round(grids_w_cafe / total_grids * 100, 1) if total_grids else 0

    # Avg rating thật
    if not cafe_df.empty and 'rating' in cafe_df.columns:
        avg_rating = round(float(cafe_df['rating'].mean()), 2)
    else:
        avg_rating = 0.0

    return {
        "total_cafes":    total_cafes,
        "hotspot_a_plus": hotspot_a,
        "sentiment":      sentiment,
        "ntl_level":      ntl_level,
        "ntl_value":      avg_ntl,
        "total_reviews":  total_reviews,
        "coverage_pct":   coverage_pct,
        "avg_rating":     avg_rating,
    }


# 2. City Compare
def get_city_compare():
    df = _load_grid_df()
    result = []
    city_meta = {
        "HCM":    {"label": "TP.HCM", "pattern": "Phân tán rộng",             "color": "blue"},
        "HaNoi":  {"label": "Hà Nội", "pattern": "Cụm thương mại tập trung",  "color": "red"},
        "DaNang": {"label": "Đà Nẵng","pattern": "Trải đều diện rộng",        "color": "green"},
    }
    for city, meta in city_meta.items():
        cdf = df[df["City"] == city]
        total_grids  = len(cdf)
        cafes        = int(cdf["Cafe_Count"].sum())
        grids_w_cafe = int((cdf["Cafe_Count"] > 0).sum())
        coverage     = round(grids_w_cafe / total_grids * 100, 1) if total_grids else 0

        cafe_max     = int(cdf["Cafe_Count"].max()) if total_grids else 0
        threshold    = max(3, cafe_max // 2)
        fierce       = round((cdf["Cafe_Count"] >= threshold).sum() / total_grids * 100, 1) if total_grids else 0

        result.append({
            "city":                city,
            "label":               meta["label"],
            "pattern":             meta["pattern"],
            "color":               meta["color"],
            "cafes":               cafes,
            "coverage":            coverage,
            "fierce_competition":  fierce,
        })
    return result


# 3. Market Gap
def get_market_gap():
    df = _load_grid_df()
    result = []
    for city in ["DaNang", "HCM", "HaNoi"]:
        cdf    = df[df["City"] == city]
        total  = len(cdf)
        w_cafe = int((cdf["Cafe_Count"] > 0).sum())
        potential = int(((cdf["Cafe_Count"] == 0) & (cdf["Score_Class"] >= 1)).sum())
        result.append({
            "city":      city,
            "total":     total,
            "with_cafe": w_cafe,
            "potential": potential,
        })
    return result


# 4. Sentiment Distribution
def get_sentiment_distribution(city: str = "all"):
    """Phân loại sentiment từ Coffee_Tea_Data_GGMap.csv."""
    cafe_df = _load_cafe()

    if cafe_df.empty:
        return []

    if city != "all" and "City" in cafe_df.columns:
        cafe_df = cafe_df[cafe_df["City"] == city]

    s = cafe_df['sentiment_score_final']
    total = len(s)
    if total == 0:
        return []

    positive = int((s >= 0.6).sum())
    neutral  = int(((s >= 0.4) & (s < 0.6)).sum())
    negative = int((s < 0.4).sum())

    return [
        {"name": "Tích cực",  "value": round(positive / total * 100, 1), "color": "#22c55e"},
        {"name": "Trung lập", "value": round(neutral / total * 100, 1),  "color": "#d1d5db"},
        {"name": "Tiêu cực",  "value": round(negative / total * 100, 1), "color": "#ef4444"},
    ]


# 5. District Ranking
def get_district_ranking(city: str = "DaNang"):
    """Xếp hạng quận theo avg Score."""
    df = _load_grid_df()
    cdf = df[df["City"] == city]

    if cdf.empty:
        return []

    stats = (
        cdf.groupby("District")
        .agg(
            avg_score=("Score", "mean"),
            total_grids=("Grid_ID", "count"),
            hotspot_count=("Score_Class", lambda x: int((x == 2).sum())),
        )
        .reset_index()
        .sort_values("avg_score", ascending=False)
    )

    stats["avg_score"] = stats["avg_score"].round(1)

    result = []
    for _, row in stats.iterrows():
        # Trend dựa trên tỷ lệ hotspot (A+)
        hotspot_ratio = row["hotspot_count"] / row["total_grids"] if row["total_grids"] else 0
        if hotspot_ratio >= 0.5:
            trend = "up"
        elif hotspot_ratio >= 0.3:
            trend = "flat"
        else:
            trend = "down"

        result.append({
            "name":  row["District"],
            "score": float(row["avg_score"]),
            "trend": trend,
            "total_grids":    int(row["total_grids"]),
            "hotspot_count":  int(row["hotspot_count"]),
        })

    return result


# 6. POI Ecosystem
def get_poi_ecosystem(city: str = "DaNang"):
    """Đếm POI theo Category_Clean."""
    poi_df = _load_poi_df()

    if poi_df.empty:
        return []

    if city != "all" and "City" in poi_df.columns:
        poi_df = poi_df[poi_df["City"] == city]

    counts = poi_df["Category_Clean"].value_counts().to_dict()

    LABEL_MAP = {
        "Food":        "Ẩm thực (Food)",
        "Commercial":  "Thương mại (Comm)",
        "Leisure":     "Giải trí (Leisure)",
        "Transport":   "Giao thông (Trans)",
        "Education":   "Giáo dục (Edu)",
        "Office":      "Văn phòng (Office)",
        "Residential": "Dân cư (Resid)",
        "Other":       "Khác (Other)",
    }

    result = []
    for cat, count in counts.items():
        result.append({
            "label": LABEL_MAP.get(cat, cat),
            "value": int(count),
        })

    return sorted(result, key=lambda x: x["value"], reverse=True)


# 7. Region Linkage
def get_region_linkage():
    """So sánh mật độ quán và chỉ số tiềm năng giữa 3 thành phố."""
    df = _load_grid_df()

    LABEL_MAP = {"DaNang": "Đà Nẵng", "HCM": "TP.HCM", "HaNoi": "Hà Nội"}

    result = []
    for city in ["HaNoi", "DaNang", "HCM"]:
        cdf = df[df["City"] == city]
        total_grids  = len(cdf)
        total_cafes  = int(cdf["Cafe_Count"].sum())
        grids_w_cafe = int((cdf["Cafe_Count"] > 0).sum())
        coverage     = round(grids_w_cafe / total_grids * 100, 1) if total_grids else 0
        avg_score    = round(float(cdf["Score"].mean()), 1) if total_grids else 0

        result.append({
            "city":        LABEL_MAP.get(city, city),
            "mat_do":      total_cafes,
            "coverage":    coverage,
            "avg_score":   avg_score,
        })

    return result


# 8. Strategy Stats
def get_strategy_stats(city: str = "all"):
    """Đếm số ô lưới theo từng chiến lược."""
    df = _load_grid_df()

    if city != "all":
        df = df[df["City"] == city]

    total = len(df)
    # A+: Score_Class == 2, có nhiều quán → Vùng Sôi động
    hotspot_a = int(((df["Score_Class"] == 2) & (df["Cafe_Count"] > 0)).sum())
    # Đại dương xanh: Score_Class >= 1, chưa có hoặc ít quán → cơ hội
    blue_ocean = int(((df["Score_Class"] >= 1) & (df["Cafe_Count"] == 0)).sum())

    return {
        "total_grids":  total,
        "hotspot_a":    hotspot_a,
        "blue_ocean":   blue_ocean,
    }