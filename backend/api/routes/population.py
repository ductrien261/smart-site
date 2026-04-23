from fastapi import APIRouter, Query
from services.population_service import get_population

router = APIRouter()

@router.get("")
def population(city: str = Query(default="DaNang")):
    return get_population(city)