<div align="center">

# 🏙️ SmartSite

### Nền tảng Phân tích Không gian Địa lý cho Lựa chọn Địa điểm Kinh doanh F&B

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Language-Python%203.9+-3776AB?style=flat-square&logo=python)](https://www.python.org)
[![License](https://img.shields.io/badge/License-Đồ%20Án%20Học%20Thuật-lightgrey?style=flat-square)](/)

**SmartSite** chuyển đổi dữ liệu không gian địa lý thô thành thông tin kinh doanh có giá trị - giúp nhà đầu tư, doanh nhân và nhà quy hoạch đô thị xác định các địa điểm tiềm năng cao cho các mô hình kinh doanh F&B thông qua chấm điểm không gian theo ô lưới, phân tích POI và trực quan hóa cạnh tranh thị trường.

</div>

---

<div align="center">
  <img src="demo.gif" alt="Demo SmartSite" width="800"/>
</div>

---

## 🔍 Tổng quan

SmartSite là một nền tảng phân tích không gian địa lý toàn diện. Hệ thống giải quyết một bài toán thực tế: *làm thế nào để đánh giá khách quan tiềm năng kinh doanh của một địa điểm đô thị mà không chỉ dựa vào cảm tính?*

Nền tảng thu thập dữ liệu không gian từ nhiều nguồn - bao gồm đánh giá quán cà phê từ Google Maps, Điểm Quan tâm (POI) từ OpenStreetMap, ảnh vệ tinh ánh sáng ban đêm (NTL) và ranh giới dân số hành chính - sau đó xử lý và tổng hợp thành một **Điểm Lưới** thống nhất cho mỗi ô đô thị 500m². Kết quả được hiển thị qua ứng dụng web hiện đại với bốn chế độ phân tích.

**Các thành phố hỗ trợ:** Đà Nẵng · TP. Hồ Chí Minh · Hà Nội

---

## ✨ Tính năng

### 🗺️ Bản đồ Thị trường (`/map`)
- Trực quan hóa bản đồ Goong Maps đa lớp tương tác
- **Chấm điểm theo ô lưới**: thành phố được chia thành các ô đều ~500m, mỗi ô được tô màu theo điểm tiềm năng tổng hợp (Rất Thấp → Rất Cao)
- **Lớp POI**: bật/tắt để xem tất cả Điểm Quan tâm được phân loại thành 7 nhóm (Ẩm thực, Thương mại, Giải trí, Giao thông, Văn phòng, Giáo dục, Dân cư)
- **Bản đồ nhiệt Mật độ Dân số**: lớp phủ hiển thị mật độ dân số theo quận, chuẩn hóa theo bách phân vị thứ 95 để rõ ràng hơn
- Bảng chi tiết từng ô khi nhấp vào: Điểm số, Số quán cà phê, Tổng đánh giá, NTL trung bình, Mật độ POI

### 📍 Phân tích Địa điểm (`/analysis`)
- **Vẽ vùng chọn tự do** trực tiếp trên bản đồ - nhấp hai góc để xác định vùng quan tâm
- Truy vấn không gian thời gian thực đến backend: đếm quán cà phê, đánh giá, điểm cảm xúc và phân bổ POI trong vùng đã chọn
- **Công cụ phân tích dựa trên quy tắc**: tạo ra tiêu đề, các quan sát và nhận xét chiến lược cho khu vực được chọn

### 📊 Bức tranh Cạnh tranh (`/competition`)
- Tổng quan thị trường toàn thành phố: tổng số ô lưới, tổng số quán cà phê, tỷ lệ phủ sóng, mật độ tối đa mỗi ô
- **Phân bổ loại tiềm năng** (biểu đồ tròn): phân chia Thấp / Trung bình / Cao theo điểm AI
- **Biểu đồ phân bổ mật độ quán cà phê**: phân bổ số quán/ô trên toàn thành phố
- **Biểu đồ phân bổ điểm**: phân bổ điểm tiềm năng tổng hợp
- Bảng xếp hạng theo quận: tổng số quán cà phê, tỷ lệ phủ lưới %, điểm trung bình, số điểm nóng

### 📈 Tổng quan Điều hành (`/overview`)
- Bảng KPI vĩ mô: tổng số quán cà phê đã lập chỉ mục, số điểm nóng A+, mức NTL trung bình, tổng đánh giá
- Biểu đồ cấu thành hệ sinh thái POI
- Biểu đồ donut phân bổ cảm xúc khách hàng
- Xếp hạng quận theo điểm
- Số liệu so sánh đa thành phố (Đà Nẵng vs. HCM vs. Hà Nội)
- Phân tích khoảng trống thị trường: các ô không có quán cà phê nhưng có điểm tiềm năng cao

---

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                         Trình duyệt Client                      │
│  React 18 + TypeScript + TailwindCSS + Recharts + Goong Maps   │
│                                                                 │
│  Trang: Overview · Map · Analysis · Competition                 │
│  Component: GoongMap · GridLayer · PoiLayer · PopulationLayer   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP / REST (axios, /api proxy)
┌───────────────────────────▼─────────────────────────────────────┐
│                        FastAPI Backend                          │
│  Uvicorn ASGI · Python 3.9+                                     │
│                                                                 │
│  Router:  /api/stats · /api/grid · /api/poi                     │
│           /api/analysis · /api/competition · /api/population    │
│                                                                 │
│  Service: GridService · AnalysisService · CompetitionService    │
│           StatsService · PoiService · PopulationService         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ pandas / geopandas
┌───────────────────────────▼─────────────────────────────────────┐
│                      Lớp Dữ liệu Cục bộ                        │
│                                                                 │
│  data/processed/   Coffee_Tea_Data_GGMap.csv      (đánh giá)   │
│                    Coffee_Tea_Data_POI.geojson     (OSM POIs)   │
│                    Spatial_Grid_Tabular.csv        (bảng lưới)  │
│                                                                 │
│  data/outputs/     Grid_Predictions.csv            (điểm AI)   │
│                    Spatial_Tensors.npz             (tensor CNN) │
│                                                                 │
│  data/population/  danang_population.geojson                    │
│                    hcm_population.geojson                       │
│                    hn_population.geojson                        │
└─────────────────────────────────────────────────────────────────┘
```

### Các Quyết định Thiết kế Chính

| Quyết định | Lý do |
|---|---|
| **Phân tích theo ô lưới (không theo điểm)** | Chuẩn hóa mật độ không gian trên toàn thành phố; tránh sai lệch do tập trung từ dữ liệu tọa độ thô |
| **Cache dữ liệu trong tiến trình** | Tất cả file dữ liệu được tải một lần vào bộ nhớ theo yêu cầu đầu tiên (pattern `_load()` với cache cấp module). Loại bỏ I/O lặp lại cho khối lượng công việc đọc nhiều, ghi ít |
| **GeoJSON xây dựng theo yêu cầu** | Đa giác lưới được tạo phía server từ tọa độ trung tâm với `HALF = 0.0025°` cố định, giữ CSV lưu trữ nhẹ nhàng |
| **Spatial join của GeoPandas để cắt** | Sau khi tải, các điểm lưới được cắt theo đa giác đất từ file GeoJSON dân số để loại bỏ các ô biển/nước |
| **Goong Maps (tương thích Mapbox)** | Dịch vụ tile tiếng Việt với khả năng tương thích API Mapbox GL JS, cho phép sử dụng các pattern layer/source tiêu chuẩn |

---

## 🔬 Pipeline Dữ liệu

Dữ liệu thô được xử lý qua pipeline notebook 4 bước nằm trong `notebooks/`:

```
notebooks/
├── step1_extract/      # Thu thập dữ liệu: scraping Google Maps, xuất OSM
├── step2_processing/   # Làm sạch, loại trùng, chấm điểm cảm xúc NLP
├── step3_spatial/      # Tạo lưới, spatial join, feature engineering
│                         (Số quán, NTL trung bình, Mật độ POI mỗi ô)
└── step4_model/        # Huấn luyện mô hình AI (CNN trên tensor không gian)
                          → xuất Grid_Predictions.csv với Score & Score_Class
```

### Công thức Điểm Tổng hợp (khái niệm)

Mỗi ô lưới nhận một **Điểm ∈ [0, 100]** được tính từ:
- `Số quán cà phê` - hoạt động thị trường hiện tại
- `Tổng đánh giá` - tín hiệu mức độ quan tâm của người tiêu dùng
- `NTL trung bình` - cường độ ánh sáng ban đêm (chỉ số thay thế cho hoạt động kinh tế sau giờ làm việc)
- `Mật độ POI` - sự phong phú của cơ sở hạ tầng xung quanh
- `Score_Class` - phân loại mô hình AI (0 = Thấp, 1 = Trung bình, 2 = Cao / A+)

### Tóm tắt Bộ Dữ liệu Đã xử lý

| File | Mô tả | Kích thước |
|---|---|---|
| `Coffee_Tea_Data_GGMap.csv` | Metadata quán cà phê + đánh giá + điểm cảm xúc từ Google Maps | ~877 KB |
| `Coffee_Tea_Data_POI.geojson` | POI từ OpenStreetMap được phân loại theo danh mục cho 3 thành phố | ~13 MB |
| `Spatial_Grid_Tabular.csv` | Đặc trưng dạng bảng tổng hợp theo từng ô lưới | ~8 MB |
| `Grid_Predictions.csv` | Điểm lưới cuối cùng từ mô hình AI đã huấn luyện | ~8.5 MB |
| `Spatial_Tensors.npz` | Tensor không gian đa kênh dùng làm đầu vào CNN | ~38 MB |

---

## 📡 Tài liệu API

Base URL: `http://localhost:8000/api`

Tài liệu tương tác có tại `http://localhost:8000/docs` (Swagger UI).

| Phương thức | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/stats/macro` | KPI vĩ mô (tổng quán, điểm nóng, NTL, đánh giá). Nhận tham số `city` |
| `GET` | `/stats/city-compare` | Số liệu so sánh song song cho cả 3 thành phố |
| `GET` | `/stats/market-gap` | Số ô không có quán nhưng tiềm năng cao theo từng thành phố |
| `GET` | `/grid` | Danh sách lưới có phân trang và lọc. Tham số: `city`, `district`, `min_cafes`, `max_cafes`, `sort_by`, `page`, `page_size` |
| `GET` | `/grid/geojson` | GeoJSON FeatureCollection đầy đủ để render bản đồ. Tham số: `city`, `district` |
| `GET` | `/grid/districts` | Danh sách quận của một thành phố |
| `GET` | `/poi` | GeoJSON POI cho một thành phố |
| `GET` | `/population` | GeoJSON ranh giới dân số cho lớp bản đồ nhiệt |
| `POST` | `/analysis/zone` | Phân tích bounding box. Body: `{ min_lat, max_lat, min_lng, max_lng, city }` |
| `GET` | `/competition/overview` | Toàn bộ bức tranh cạnh tranh cho một thành phố |

---

## 📂 Cấu trúc Dự án

```
smart-site/
│
├── backend/                        # Ứng dụng FastAPI
│   ├── main.py                     # Điểm vào ứng dụng, cấu hình CORS, gắn router
│   ├── config.py                   # Phân giải đường dẫn (BASE_DIR, DATA_DIR, v.v.)
│   ├── requirements.txt
│   ├── api/
│   │   └── routes/                 # Một file router cho mỗi domain
│   │       ├── grid.py
│   │       ├── poi.py
│   │       ├── stats.py
│   │       ├── analysis.py
│   │       ├── competition.py
│   │       └── population.py
│   └── services/                   # Logic nghiệp vụ, tải & cache dữ liệu
│       ├── grid_service.py
│       ├── analysis_service.py
│       ├── competition_service.py
│       ├── stats_service.py
│       ├── poi_service.py
│       └── population_service.py
│
├── frontend/                       # Vite + React + TypeScript SPA
│   ├── src/
│   │   ├── App.tsx                 # Component gốc, cấu hình React Router
│   │   ├── pages/
│   │   │   ├── OverviewPage.tsx    # Dashboard điều hành
│   │   │   ├── MapPage.tsx         # Bản đồ tương tác đa lớp
│   │   │   ├── AnalysisPage.tsx    # Công cụ phân tích vùng bounding-box
│   │   │   └── CompetitionPage.tsx # Biểu đồ cạnh tranh thị trường
│   │   ├── components/
│   │   │   ├── GoongMap/           # Wrapper engine bản đồ & tiện ích
│   │   │   │   ├── GoongMap.tsx    # Quản lý vòng đời bản đồ singleton
│   │   │   │   └── goongMapUtils.ts# Các helper setGeoJSONSource / removeSourceAndLayers
│   │   │   ├── map/
│   │   │   │   ├── GridLayer.tsx   # Lớp fill/line đa giác lưới + popup
│   │   │   │   ├── PoiLayer.tsx    # Lớp vòng tròn POI với màu theo danh mục
│   │   │   │   ├── PopulationLayer.tsx # Lớp fill bản đồ nhiệt mật độ chuẩn hóa
│   │   │   │   └── GridDetailPanel.tsx # Sidebar chi tiết ô lưới dạng slide-in
│   │   │   ├── analysis/           # Panel trang Analysis (thống kê + nhận xét)
│   │   │   ├── overview/           # Widget components trang Overview
│   │   │   └── layout/             # Thanh điều hướng sidebar
│   │   ├── hooks/
│   │   │   └── useAnalysis.ts      # State phân tích vùng & tích hợp API
│   │   ├── services/
│   │   │   └── api.ts              # Axios client + các module API có kiểu dữ liệu
│   │   └── types/                  # Interface TypeScript dùng chung
│   ├── vite.config.ts              # Dev server + proxy /api đến :8000
│   └── package.json
│
├── data/
│   ├── raw/                        # File nguồn gốc chưa xử lý
│   ├── processed/                  # Bộ dữ liệu đã làm sạch & feature engineering
│   ├── outputs/                    # Dự đoán mô hình & tensor không gian
│   └── population/                 # GeoJSON ranh giới hành chính
│
├── models/                         # Artifact mô hình đã lưu
├── notebooks/                      # Pipeline Jupyter (4 bước)
└── README.md
```

---

## 🚀 Hướng dẫn Cài đặt

### Yêu cầu

- **Python 3.9+** với `pip`
- **Node.js 16+** với `npm`
- API key của [Goong Maps](https://account.goong.io) (có gói miễn phí)

### 1. Clone repository

```bash
git clone https://github.com/your-username/smart-site.git
cd smart-site
```

### 2. Cài đặt Backend

```bash
cd backend

# Tạo và kích hoạt môi trường ảo (khuyến nghị)
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Cài đặt dependencies
pip install -r requirements.txt

# Khởi động API server
uvicorn main:app --reload --port 8000
```

API sẽ chạy tại `http://localhost:8000`.
Tài liệu API tương tác: `http://localhost:8000/docs`

> **Lưu ý:** Backend yêu cầu các file dữ liệu đã xử lý trong `data/processed/` và `data/outputs/`. Nếu thiếu file, mỗi service sẽ tự động dùng dữ liệu giả để ứng dụng vẫn hoạt động.

### 3. Cài đặt Frontend

Mở một cửa sổ **terminal mới**:

```bash
cd frontend

# Cài đặt dependencies
npm install

# Cấu hình API key Goong Maps
# Tạo file .env trong thư mục frontend/:
echo "VITE_GOONG_MAPTILES_KEY=your_goong_api_key_here" > .env

# Khởi động development server
npm run dev
```

Ứng dụng web sẽ chạy tại `http://localhost:5173`.

> Vite dev server tự động proxy tất cả request `/api/*` đến `http://localhost:8000`, nên không cần cấu hình CORS thêm trong quá trình phát triển.

---

## 🔑 Biến Môi trường

| Biến | Vị trí | Mô tả |
|---|---|---|
| `VITE_GOONG_MAPTILES_KEY` | `frontend/.env` | API key tile của Goong Maps. Nếu không có, bản đồ sẽ hiển thị thông báo cấu hình thay vì render. |

---