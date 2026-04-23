from fastapi import APIRouter, Query
from services.grid_service import get_grids, get_grid_geojson

router = APIRouter()

@router.get("")
def grids(
    city: str = Query(default="DaNang"),
    district: str = Query(default=None),
    min_cafes: int = Query(default=0),
    max_cafes: int = Query(default=None),
    sort_by: str = Query(default="score"),
    page: int = Query(default=1),
    page_size: int = Query(default=10),
):
    return get_grids(city, district, min_cafes, max_cafes, sort_by, page, page_size)

@router.get("/geojson")
def grid_geojson(
    city: str = Query(default="DaNang"),
    district: str = Query(default=None),
):
    return get_grid_geojson(city, district)

@router.get("/districts")
def districts(city: str = Query(default="DaNang")):
    from services.grid_service import get_districts
    return get_districts(city)