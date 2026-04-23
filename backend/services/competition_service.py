import pandas as pd
import numpy as np
from services.grid_service import _load as _load_grid

def get_competition_overview(city: str):
    df = _load_grid()
    cdf = df[df["City"] == city].copy()

    if cdf.empty:
        return {}

    total_grids  = len(cdf)
    cafe_max     = int(cdf["Cafe_Count"].max())
    total_cafes  = int(cdf["Cafe_Count"].sum())
    grids_w_cafe = int((cdf["Cafe_Count"] > 0).sum())

    class_dist = cdf["Score_Class"].value_counts().to_dict()

    # Top 10 ô cạnh tranh cao nhất
    top_competitive = (
        cdf[cdf["Cafe_Count"] > 0]
        .sort_values("Cafe_Count", ascending=False)
        .head(10)[["Grid_ID","District","Cafe_Count","Score","NTL_Mean","POI_Density","Center_Lat","Center_Lng"]]
        .to_dict(orient="records")
    )

    # Top 10 ô tiềm năng chưa có quán
    top_opportunity = (
        cdf[(cdf["Cafe_Count"] == 0) & (cdf["Score_Class"] >= 1)]
        .sort_values("Score", ascending=False)
        .head(10)[["Grid_ID","District","Score","Score_Class","NTL_Mean","POI_Density","Center_Lat","Center_Lng"]]
        .to_dict(orient="records")
    )

    # Phân bổ theo quận
    district_stats = (
        cdf.groupby("District")
        .agg(
            total_grids=("Grid_ID", "count"),
            total_cafes=("Cafe_Count", "sum"),
            avg_score=("Score", "mean"),
            hotspot_count=("Score_Class", lambda x: (x == 2).sum()),
            grids_with_cafe=("Cafe_Count", lambda x: (x > 0).sum()),
        )
        .reset_index()
        .sort_values("total_cafes", ascending=False)
    )
    district_stats["avg_score"]  = district_stats["avg_score"].round(2)
    district_stats["coverage"]   = (
        district_stats["grids_with_cafe"] / district_stats["total_grids"] * 100
    ).round(1)

    # Histogram cafe_count distribution
    bins   = [0, 1, 2, 3, 5, 8, 12]
    labels = ["0", "1", "2", "3-4", "5-7", "8+"]
    cdf["cafe_bin"] = pd.cut(cdf["Cafe_Count"], bins=bins, labels=labels, right=False)
    hist = cdf["cafe_bin"].value_counts().reindex(labels, fill_value=0).to_dict()

    # Score distribution
    score_bins   = [0, 40, 55, 70, 85, 101]
    score_labels = ["<40", "40-55", "55-70", "70-85", "85+"]
    cdf["score_bin"] = pd.cut(cdf["Score"], bins=score_bins, labels=score_labels, right=False)
    score_hist = cdf["score_bin"].value_counts().reindex(score_labels, fill_value=0).to_dict()

    return {
        "summary": {
            "city":          city,
            "total_grids":   total_grids,
            "total_cafes":   total_cafes,
            "grids_w_cafe":  grids_w_cafe,
            "cafe_max":      cafe_max,
            "coverage_pct":  round(grids_w_cafe / total_grids * 100, 1),
            "class_dist":    {str(k): int(v) for k, v in class_dist.items()},
        },
        "top_competitive":  top_competitive,
        "top_opportunity":  top_opportunity,
        "district_stats":   district_stats.to_dict(orient="records"),
        "cafe_histogram":   [{"label": k, "count": int(v)} for k, v in hist.items()],
        "score_histogram":  [{"label": k, "count": int(v)} for k, v in score_hist.items()],
    }