from fastapi import APIRouter, Query
from services.stats_service import (
    get_macro_stats,
    get_city_compare,
    get_market_gap,
    get_sentiment_distribution,
    get_district_ranking,
    get_poi_ecosystem,
    get_region_linkage,
    get_strategy_stats,
)

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

@router.get("/sentiment")
def sentiment(city: str = Query(default="all")):
    return get_sentiment_distribution(city)

@router.get("/district-ranking")
def district_ranking(city: str = Query(default="DaNang")):
    return get_district_ranking(city)

@router.get("/poi-ecosystem")
def poi_ecosystem(city: str = Query(default="DaNang")):
    return get_poi_ecosystem(city)

@router.get("/region-linkage")
def region_linkage():
    return get_region_linkage()

@router.get("/strategy-stats")
def strategy_stats(city: str = Query(default="all")):
    return get_strategy_stats(city)