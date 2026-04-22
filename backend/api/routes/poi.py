from fastapi import APIRouter, Query
from services.poi_service import get_poi_by_city

router = APIRouter()

@router.get("/")
def poi(city: str = Query(default="DaNang")):
    return get_poi_by_city(city)