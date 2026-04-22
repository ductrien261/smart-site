from fastapi import APIRouter
from pydantic import BaseModel
from services.analysis_service import analyze_bbox

router = APIRouter()

class BboxRequest(BaseModel):
    min_lat: float
    max_lat: float
    min_lng: float
    max_lng: float
    city:    str = "DaNang"

@router.post("/zone")
def analyze_zone(body: BboxRequest):
    return analyze_bbox(body.min_lat, body.max_lat, body.min_lng, body.max_lng, body.city)