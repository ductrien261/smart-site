<div align="center">

# 🏙️ SmartSite

### Spatial Intelligence Platform for F&B Business Location Analysis

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Language-Python%203.9+-3776AB?style=flat-square&logo=python)](https://www.python.org)
[![License](https://img.shields.io/badge/License-Academic%20Project-lightgrey?style=flat-square)](/)

> **SmartSite** transforms raw geospatial data into actionable business intelligence — helping investors, entrepreneurs, and urban planners identify high-potential locations for F&B ventures through grid-based spatial scoring, POI analysis, and competitive landscape visualization.

</div>

---

<div align="center">
  <img src="demo.gif" alt="SmartSite Demo" width="800"/>
</div>

---

## 🔍 Overview

SmartSite is an end-to-end geospatial analytics platform. The system addresses a real-world problem: *how do you objectively evaluate the business potential of an urban location without relying purely on gut instinct?*

The platform ingests multi-source spatial data - including Google Maps café reviews, OpenStreetMap Points of Interest, night-time light (NTL) satellite imagery, and administrative population boundaries — then processes and fuses them into a unified **Grid Score** per 500m² urban cell. Results are surfaced through a modern web application offering four analytical views.

**Target cities:** Đà Nẵng · TP. Hồ Chí Minh · Hà Nội

---

## ✨ Features

### 🗺️ Market Map (`/map`)
- Interactive multi-layer Goong Maps visualization
- **Grid-based scoring**: the city is divided into uniform ~500m cells, each colored by its composite potential score (Very Low → Very High)
- **POI Layer**: toggle to view all Points of Interest classified into 7 categories (Food, Commercial, Leisure, Transport, Office, Education, Residential)
- **Population Density Heatmap**: an overlay layer showing district-level resident density, normalized by 95th percentile for visual clarity
- Per-grid detail panel on click: Score, Café Count, Total Reviews, NTL Mean, POI Density

### 📍 Location Analysis (`/analysis`)
- **Freehand bounding-box drawing** directly on the map — click two corners to define your region of interest
- Real-time spatial query against the backend: counts cafés, ratings, sentiment scores, and POI breakdown within the drawn area
- **Rule-based insight engine**: generates a headline, bullet observations, and a strategic verdict for the selected zone

### 📊 Competition Landscape (`/competition`)
- City-wide market overview: total grids, total cafés, coverage percentage, max density per cell
- **Potential Class distribution** (Pie chart): AI-scored Low / Medium / High breakdown
- **Café density histogram**: distribution of cafés-per-grid across the city
- **Score histogram**: distribution of composite potential scores
- District-level ranking table: total cafés, grid coverage %, average score, hotspot count

### 📈 Executive Overview (`/overview`)
- Macro KPI dashboard: total cafés indexed, A+ hotspot count, average NTL level, total reviews
- POI ecosystem composition chart
- Customer sentiment distribution donut
- District ranking by score
- Cross-city comparative metrics (Đà Nẵng vs. HCM vs. Hà Nội)
- Market gap analysis: grids with zero cafés but high potential score

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Client                          │
│  React 18 + TypeScript + TailwindCSS + Recharts + Goong Maps   │
│                                                                 │
│  Pages: Overview · Map · Analysis · Competition                 │
│  Components: GoongMap · GridLayer · PoiLayer · PopulationLayer  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP / REST (axios, /api proxy)
┌───────────────────────────▼─────────────────────────────────────┐
│                        FastAPI Backend                          │
│  Uvicorn ASGI · Python 3.9+                                     │
│                                                                 │
│  Routers:  /api/stats · /api/grid · /api/poi                    │
│            /api/analysis · /api/competition · /api/population   │
│                                                                 │
│  Services: GridService · AnalysisService · CompetitionService   │
│            StatsService · PoiService · PopulationService        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ pandas / geopandas
┌───────────────────────────▼─────────────────────────────────────┐
│                      Local Data Layer                           │
│                                                                 │
│  data/processed/   Coffee_Tea_Data_GGMap.csv      (café reviews)│
│                    Coffee_Tea_Data_POI.geojson     (OSM POIs)   │
│                    Spatial_Grid_Tabular.csv        (grid table)  │
│                                                                 │
│  data/outputs/     Grid_Predictions.csv            (AI scores)  │
│                    Spatial_Tensors.npz             (CNN tensor)  │
│                                                                 │
│  data/population/  danang_population.geojson                    │
│                    hcm_population.geojson                       │
│                    hn_population.geojson                        │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| **Grid-based analysis (not point-based)** | Normalizes spatial density across the city; avoids clustering bias from raw coordinate data |
| **In-process data caching** | All data files are loaded once into memory on first request (`_load()` pattern with module-level cache). Eliminates repeated I/O for a read-heavy, low-write workload |
| **GeoJSON built on-the-fly** | Grid polygons are constructed server-side from center coordinates with a fixed half-size `HALF = 0.0025°`, keeping the stored CSV lightweight |
| **GeoPandas spatial join for clipping** | After loading, grid points are clipped to land polygons from the population GeoJSON files to eliminate ocean/water cells |
| **Goong Maps (Mapbox-compatible)** | Vietnamese-language tile service with Mapbox GL JS API compatibility, allowing use of standard layer/source patterns |

---

## 🔬 Data Pipeline

The raw data is processed through a 4-stage notebook pipeline located in `notebooks/`:

```
notebooks/
├── step1_extract/      # Data collection: Google Maps scraping, OSM export
├── step2_processing/   # Cleaning, deduplication, NLP sentiment scoring
├── step3_spatial/      # Grid generation, spatial joins, feature engineering
│                         (Café Count, NTL Mean, POI Density per grid)
└── step4_model/        # AI model training (CNN on spatial tensors)
                          → outputs Grid_Predictions.csv with Score & Score_Class
```

### Composite Score Formula (conceptual)

Each grid cell receives a **Score ∈ [0, 100]** derived from:
- `Café Count` — existing market activity
- `Total Reviews` — consumer engagement signal
- `NTL Mean` — night-time light intensity (proxy for economic activity after hours)
- `POI Density` — surrounding infrastructure richness
- `Score_Class` — AI model classification (0 = Low, 1 = Medium, 2 = High / A+)

### Processed Dataset Summary

| File | Description | Size |
|---|---|---|
| `Coffee_Tea_Data_GGMap.csv` | Café metadata + reviews + sentiment scores from Google Maps | ~877 KB |
| `Coffee_Tea_Data_POI.geojson` | OpenStreetMap POIs classified by category for 3 cities | ~13 MB |
| `Spatial_Grid_Tabular.csv` | Aggregated per-grid tabular features | ~8 MB |
| `Grid_Predictions.csv` | Final grid scores from the trained AI model | ~8.5 MB |
| `Spatial_Tensors.npz` | Multi-channel spatial tensors used as CNN input | ~38 MB |

---

## 📡 API Reference

Base URL: `http://localhost:8000/api`

Interactive docs available at `http://localhost:8000/docs` (Swagger UI).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stats/macro` | Macro KPIs (total cafés, hotspots, NTL level, reviews). Accepts `city` param |
| `GET` | `/stats/city-compare` | Side-by-side metrics for all 3 cities |
| `GET` | `/stats/market-gap` | Per-city count of zero-café grids with high potential |
| `GET` | `/grid` | Paginated, filterable grid list. Params: `city`, `district`, `min_cafes`, `max_cafes`, `sort_by`, `page`, `page_size` |
| `GET` | `/grid/geojson` | Full GeoJSON FeatureCollection for map rendering. Params: `city`, `district` |
| `GET` | `/grid/districts` | List of districts for a given city |
| `GET` | `/poi` | POI GeoJSON for a city |
| `GET` | `/population` | Population boundary GeoJSON for heatmap layer |
| `POST` | `/analysis/zone` | Analyze a bounding box. Body: `{ min_lat, max_lat, min_lng, max_lng, city }` |
| `GET` | `/competition/overview` | Full competition landscape for a city |

---

## 📂 Project Structure

```
smart-site/
│
├── backend/                        # FastAPI application
│   ├── main.py                     # App entry point, CORS config, router mounting
│   ├── config.py                   # Path resolution (BASE_DIR, DATA_DIR, etc.)
│   ├── requirements.txt
│   ├── api/
│   │   └── routes/                 # One router file per domain
│   │       ├── grid.py
│   │       ├── poi.py
│   │       ├── stats.py
│   │       ├── analysis.py
│   │       ├── competition.py
│   │       └── population.py
│   └── services/                   # Business logic, data loading & caching
│       ├── grid_service.py
│       ├── analysis_service.py
│       ├── competition_service.py
│       ├── stats_service.py
│       ├── poi_service.py
│       └── population_service.py
│
├── frontend/                       # Vite + React + TypeScript SPA
│   ├── src/
│   │   ├── App.tsx                 # Root component, React Router setup
│   │   ├── pages/
│   │   │   ├── OverviewPage.tsx    # Executive dashboard
│   │   │   ├── MapPage.tsx         # Multi-layer interactive map
│   │   │   ├── AnalysisPage.tsx    # Bounding-box zone analyzer
│   │   │   └── CompetitionPage.tsx # Competitive landscape charts
│   │   ├── components/
│   │   │   ├── GoongMap/           # Map engine wrapper & utilities
│   │   │   │   ├── GoongMap.tsx    # Singleton map lifecycle manager
│   │   │   │   └── goongMapUtils.ts# setGeoJSONSource / removeSourceAndLayers helpers
│   │   │   ├── map/
│   │   │   │   ├── GridLayer.tsx   # Grid polygon fill/line layer + popup
│   │   │   │   ├── PoiLayer.tsx    # POI circle layer with category colors
│   │   │   │   ├── PopulationLayer.tsx # Normalized density heatmap fill
│   │   │   │   └── GridDetailPanel.tsx # Slide-in grid detail sidebar
│   │   │   ├── analysis/           # Analysis page panels (stats + insights)
│   │   │   ├── overview/           # Overview page widget components
│   │   │   └── layout/             # Sidebar navigation
│   │   ├── hooks/
│   │   │   └── useAnalysis.ts      # Zone analysis state & API integration
│   │   ├── services/
│   │   │   └── api.ts              # Axios client + typed API modules
│   │   └── types/                  # Shared TypeScript interfaces
│   ├── vite.config.ts              # Dev server + /api proxy to :8000
│   └── package.json
│
├── data/
│   ├── raw/                        # Original unprocessed source files
│   ├── processed/                  # Cleaned & feature-engineered datasets
│   ├── outputs/                    # Model predictions & spatial tensors
│   └── population/                 # Administrative boundary GeoJSONs
│
├── models/                         # Saved model artifacts
├── notebooks/                      # Jupyter pipeline (4 steps)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+** with `pip`
- **Node.js 16+** with `npm`
- A [Goong Maps](https://account.goong.io) API key (free tier available)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smart-site.git
cd smart-site
```

### 2. Set up the Backend

```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive API docs: `http://localhost:8000/docs`

> **Note:** The backend expects processed data files under `data/processed/` and `data/outputs/`. If these files are absent, each service will automatically fall back to deterministic mock data so the application remains functional.

### 3. Set up the Frontend

Open a **new terminal** window:

```bash
cd frontend

# Install dependencies
npm install

# Configure your Goong Maps API key
# Create a .env file in the frontend/ directory:
echo "VITE_GOONG_MAPTILES_KEY=your_goong_api_key_here" > .env

# Start the development server
npm run dev
```

The web application will be available at `http://localhost:5173`.

> The Vite dev server proxies all `/api/*` requests to `http://localhost:8000`, so no additional CORS configuration is needed during development.

---

## 🔑 Environment Variables

| Variable | Location | Description |
|---|---|---|
| `VITE_GOONG_MAPTILES_KEY` | `frontend/.env` | Goong Maps tile API key. Without this, the map will display a configuration prompt instead of rendering. |

---