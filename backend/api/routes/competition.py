from fastapi import APIRouter, Query
from services.competition_service import get_competition_overview

router = APIRouter()

@router.get("/overview")
def competition_overview(city: str = Query(default="DaNang")):
    return get_competition_overview(city)