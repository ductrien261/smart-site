import json
from config import DATA_DIR

CITY_FILES = {
    'DaNang': DATA_DIR / 'population' / 'danang_population.geojson',
    'HCM':    DATA_DIR / 'population' / 'hcm_population.geojson',
    'HaNoi':  DATA_DIR / 'population' / 'hn_population.geojson',
}

def get_population(city: str):
    path = CITY_FILES.get(city)
    if not path or not path.exists():
        return {'type': 'FeatureCollection', 'features': []}
    with open(path, encoding='utf-8') as f:
        return json.load(f)