import pandas as pd
import numpy as np
import json
from config import PROCESSED_DIR

_cafe_cache = None
_poi_cache  = None

def _load_cafe():
    global _cafe_cache
    if _cafe_cache is not None:
        return _cafe_cache

    path = PROCESSED_DIR / "Coffee_Tea_Data_GGMap.csv"
    if not path.exists():
        print(f"⚠️  Coffee_Tea_Data_GGMap.csv not found, using mock")
        _cafe_cache = _mock_cafe()
        return _cafe_cache

    df = pd.read_csv(path)
    print(f"✅ Loaded Coffee_Tea_Data_GGMap.csv — {len(df)} rows")

    # Đảm bảo cột cần thiết
    if 'sentiment_score_final' not in df.columns:
        df['sentiment_score_final'] = 0.5
    if 'rating' not in df.columns:
        df['rating'] = 0.0
    if 'reviews_count' not in df.columns:
        df['reviews_count'] = 0

    df['lat'] = pd.to_numeric(df['lat'], errors='coerce')
    df['lng'] = pd.to_numeric(df['lng'], errors='coerce')
    df = df.dropna(subset=['lat','lng'])

    _cafe_cache = df
    return _cafe_cache


def _load_poi():
    global _poi_cache
    if _poi_cache is not None:
        return _poi_cache

    path = PROCESSED_DIR / "Coffee_Tea_Data_POI.geojson"
    if not path.exists():
        print(f"⚠️  Coffee_Tea_Data_POI.geojson not found, using mock")
        _poi_cache = _mock_poi()
        return _poi_cache

    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    rows = []
    for ft in data.get("features", []):
        props  = ft.get("properties", {})
        coords = ft.get("geometry", {}).get("coordinates", [None, None])
        if coords[0] is None:
            continue
        rows.append({
            "City":           props.get("City", ""),
            "lon":            float(coords[0]),
            "lat":            float(coords[1]),
            "Category_Clean": props.get("Category_Clean", "Other"),
        })

    df = pd.DataFrame(rows)
    print(f"✅ Loaded Coffee_Tea_Data_POI.geojson — {len(df)} rows")
    _poi_cache = df
    return _poi_cache


def _mock_cafe():
    np.random.seed(42)
    n = 500
    return pd.DataFrame({
        "City":                  ["DaNang"]*200 + ["HCM"]*200 + ["HaNoi"]*100,
        "lat":                   np.random.uniform(15.9, 16.2, n),
        "lng":                   np.random.uniform(108.0, 108.4, n),
        "rating":                np.random.uniform(3.0, 5.0, n),
        "reviews_count":         np.random.randint(5, 3000, n),
        "sentiment_score_final": np.random.uniform(0.0, 1.0, n),
    })


def _mock_poi():
    np.random.seed(42)
    n = 300
    return pd.DataFrame({
        "City": ["DaNang"]*n,
        "lat":  np.random.uniform(15.9, 16.2, n),
        "lon":  np.random.uniform(108.0, 108.4, n),
        "Category_Clean": np.random.choice(
            ["Food","Commercial","Leisure","Transport","Office","Education","Residential"], n
        ),
    })


def _competition_meta(n: int):
    if n == 0:
        return {"level": "no_data",     "label": "Chưa có dữ liệu", "emoji": "⬜", "color": "#94a3b8"}
    if n <= 3:
        return {"level": "low",          "label": "Ít cạnh tranh",   "emoji": "🟢", "color": "#16a34a"}
    if n <= 10:
        return {"level": "moderate",     "label": "Cạnh tranh vừa",  "emoji": "🟡", "color": "#ca8a04"}
    if n <= 24:
        return {"level": "high",         "label": "Cạnh tranh cao",  "emoji": "🟠", "color": "#ea580c"}
    return {"level": "very_high",       "label": "Cạnh tranh khốc liệt", "emoji": "🔴", "color": "#dc2626"}


def analyze_bbox(min_lat, max_lat, min_lng, max_lng, city):
    cafe_df = _load_cafe()
    poi_df = _load_poi()

    # Filter bbox
    cafe_in = cafe_df[
        (cafe_df["lat"] >= min_lat) & (cafe_df["lat"] <= max_lat) &
        (cafe_df["lng"] >= min_lng) & (cafe_df["lng"] <= max_lng)
    ]
    poi_in = poi_df[
        (poi_df["lat"] >= min_lat) & (poi_df["lat"] <= max_lat) &
        (poi_df["lon"] >= min_lng) & (poi_df["lon"] <= max_lng)
    ]

    # Cafe stats
    total_cafes = len(cafe_in)
    avg_rating = round(
        float(cafe_in["rating"].mean()), 2) if total_cafes else None
    avg_reviews = round(
        float(cafe_in["reviews_count"].mean()), 1) if total_cafes else None
    avg_sentiment = round(
        float(cafe_in["sentiment_score_final"].mean()), 3) if total_cafes else None
    high_rated = int((cafe_in["rating"] >= 4.5).sum()) if total_cafes else 0
    review_density = round(
        float(cafe_in["reviews_count"].sum() / total_cafes), 1) if total_cafes else None

    # POI breakdown
    poi_breakdown = {}
    if len(poi_in):
        counts = poi_in["Category_Clean"].value_counts().to_dict()
        poi_breakdown = {k: int(v) for k, v in counts.items()}
    total_poi = int(len(poi_in))
    dominant = max(
        poi_breakdown, key=poi_breakdown.get) if poi_breakdown else "N/A"

    comp_meta = _competition_meta(total_cafes)

    # Rule-based insight
    headline = _build_headline(
        total_cafes, avg_rating, avg_sentiment, dominant)
    bullets = _build_bullets(total_cafes, avg_rating,
                             avg_sentiment, high_rated, total_poi, dominant)
    verdict = _build_verdict(total_cafes, avg_rating, total_poi)

    return {
        "analysis": {
            "cafe_stats": {
                "total_cafes":     total_cafes,
                "avg_rating":      avg_rating,
                "avg_reviews":     avg_reviews,
                "avg_sentiment":   avg_sentiment,
                "high_rated_count": high_rated,
                "review_density":  review_density,
            },
            "poi_breakdown":          poi_breakdown,
            "total_poi":              total_poi,
            "competition_level":      comp_meta["level"],
            "dominant_poi_category":  dominant,
        },
        "insights": {
            "headline":        headline,
            "bullets":         bullets,
            "verdict":         verdict,
            "competitionMeta": comp_meta,
        }
    }


def _build_headline(n, rating, sentiment, dominant):
    if n == 0:
        return "Khu vực chưa có quán cà phê — tiềm năng khám phá cao."
    if n <= 3 and (rating or 0) >= 4.0:
        return f"Vùng thưa thớt với {n} quán chất lượng cao — ít cạnh tranh trực tiếp."
    if n > 15:
        return f"Vùng sầm uất với {n} quán — cạnh tranh cao, cần định vị khác biệt."
    return f"Vùng có {n} quán cà phê — mức cạnh tranh vừa phải, POI chủ đạo: {dominant}."


def _build_bullets(n, rating, sentiment, high_rated, total_poi, dominant):
    bullets = []
    if n == 0:
        bullets.append("Chưa có quán cà phê trong vùng khảo sát.")
    else:
        bullets.append(f"Tổng {n} quán — {high_rated} quán đạt ≥4.5★.")
        if rating:
            bullets.append(f"Đánh giá trung bình: {rating:.2f}★.")
        if sentiment:
            bullets.append(
                f"Cảm xúc khách hàng TB: {sentiment:.2f} (thang 0–1).")
    bullets.append(
        f"Tổng {total_poi} điểm POI — danh mục chủ đạo: {dominant}.")
    return bullets


def _build_verdict(n, rating, total_poi):
    if n == 0 and total_poi > 10:
        return "Khu vực có hoạt động kinh tế (POI) nhưng chưa có quán — cơ hội tiên phong."
    if n <= 5 and total_poi > 20:
        return "Mật độ POI cao, ít quán cạnh tranh — điều kiện thuận lợi để thử nghiệm."
    if n > 20:
        return "Thị trường đã bão hòa — cần sản phẩm khác biệt rõ ràng để cạnh tranh."
    return "Cần khảo sát thực địa để xác nhận tín hiệu từ dữ liệu quan sát."
