import json
from config import PROCESSED_DIR

def get_poi_by_city(city: str):
    path = PROCESSED_DIR / "Coffee_Tea_Data_POI.geojson"
    if not path.exists():
        return {"type": "FeatureCollection", "features": []}
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    features = [
        ft for ft in data.get("features", [])
        if ft.get("properties", {}).get("City") == city
    ]
    return {"type": "FeatureCollection", "features": features}