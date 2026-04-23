from services.grid_service import _load as _load_grid

def _load_grid_df():
    return _load_grid()

def get_macro_stats(city: str = "all"):
    df = _load_grid_df()
    if city != "all":
        df = df[df["City"] == city]

    total_cafes   = int(df["Cafe_Count"].sum())     
    hotspot_a     = int((df["Score_Class"] == 2).sum())
    avg_ntl       = round(float(df["NTL_Mean"].mean()), 2)
    total_reviews = int(df["Total_Reviews"].sum())

    ntl_level = "Mức Khá" if avg_ntl > 5 else "Mức Thấp"

    return {
        "total_cafes":    total_cafes,
        "hotspot_a_plus": hotspot_a,
        "sentiment":      3.8,
        "ntl_level":      ntl_level,
        "ntl_value":      avg_ntl,
        "ai_confidence":  94.5,
        "total_reviews":  total_reviews,
    }


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