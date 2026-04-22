from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import grid, poi, stats, analysis

app = FastAPI(title="SmartSite API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(grid.router,  prefix="/api/grid",  tags=["grid"])
app.include_router(poi.router,   prefix="/api/poi",   tags=["poi"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])

@app.get("/")
def root():
    return {"status": "ok", "message": "SmartSite API running"}