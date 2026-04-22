from fastapi import APIRouter, Query
from services.stats_service import get_macro_stats, get_city_compare, get_market_gap

router = APIRouter()

@router.get("/macro")
def macro_stats(city: str = Query(default="all")):
    return get_macro_stats(city)

@router.get("/city-compare")
def city_compare():
    return get_city_compare()

@router.get("/market-gap")
def market_gap():
    return get_market_gap()