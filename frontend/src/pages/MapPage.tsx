import { useCallback, useEffect, useRef, useState } from 'react'
import { gridApi } from '../services/api'
import type { GridCell } from '../types'
import GoongMap from '../components/GoongMap/GoongMap'
import GridLayer from '../components/map/GridLayer'
import { flyToCenter } from '../components/GoongMap/goongMapUtils'

const CITY_OPTIONS = [
  { value: 'DaNang', label: 'Đà Nẵng', center: [108.2022, 16.0544] as [number, number], zoom: 12 },
  { value: 'HCM', label: 'TP.HCM', center: [106.6297, 10.8231] as [number, number], zoom: 11 },
  { value: 'HaNoi', label: 'Hà Nội', center: [105.8412, 21.0245] as [number, number], zoom: 11 },
]

type ViewMode = 'grid' | 'point'

export default function MapPage() {
  const [city, setCity] = useState('DaNang')
  const [district, setDistrict] = useState('')
  const [districts, setDistricts] = useState<string[]>([])
  const [geojson, setGeojson] = useState<any>(null)
  const [gridList, setGridList] = useState<GridCell[]>([])
  const [totalGrids, setTotalGrids] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [mapReady, setMapReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('score')
  const [showDensity, setShowDensity] = useState(false)

  const mapRef = useRef<any>(null)

  const currentCity = CITY_OPTIONS.find(c => c.value === city)!

  // Load districts khi đổi city
  useEffect(() => {
    gridApi.getDistricts(city).then(r => setDistricts(r.data.districts))
    setDistrict('')
    setPage(1)
  }, [city])

  // Load geojson + list
  useEffect(() => {
    setLoading(true)
    Promise.all([
      gridApi.getGridGeoJSON(city, district || undefined),
      gridApi.getGrids({ city, district: district || undefined, sort_by: sortBy, page, page_size: 10 }),
    ]).then(([geo, list]) => {
      setGeojson(geo.data)
      setGridList(list.data.items)
      setTotalGrids(list.data.total)
      setTotalPages(Math.ceil(list.data.total / 10))
      // Tổng reviews
      const sum = (geo.data.features as any[]).reduce((acc: number, f: any) => acc + (f.properties.Total_Reviews || 0), 0)
      setTotalReviews(sum)
    }).finally(() => setLoading(false))
  }, [city, district, sortBy, page])

  const handleMapReady = useCallback((map: any) => {
    mapRef.current = map
    setMapReady(true)
  }, [])

  // Bay đến city khi đổi
  useEffect(() => {
    if (mapRef.current && mapReady) {
      flyToCenter(mapRef.current, currentCity.center, currentCity.zoom)
    }
  }, [city, mapReady, currentCity])

  const scoreToColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 65) return 'text-lime-600 bg-lime-50'
    if (score >= 50) return 'text-yellow-600 bg-yellow-50'
    if (score >= 35) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 pt-7 pb-4 bg-white border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bản đồ thị trường</h1>
            <p className="text-base text-gray-400 mt-1">
              Tìm hiểu không gian theo ô lưới · chuyển đổi lớp · bản đồ nhiệt
            </p>
          </div>
          {/* Stats góc phải */}
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">Thành phố</p>
              <p className="font-bold text-gray-800">{currentCity.label}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">Ô lưới có dữ liệu</p>
              <p className="font-bold text-gray-800">{totalGrids.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">Tổng Review</p>
              <p className="font-bold text-gray-800">{totalReviews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          {/* View mode toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {(['grid', 'point'] as ViewMode[]).map(m => (
              <button key={m}
                onClick={() => setViewMode(m)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {m === 'grid' ? '▦ Mặt độ' : '• Điểm'}
              </button>
            ))}
          </div>

          {/* City */}
          <select value={city} onChange={e => setCity(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-35">
            {CITY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          {/* District */}
          <select value={district} onChange={e => { setDistrict(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40">
            <option value="">— Tất cả quận —</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Density toggle */}
          <button
            onClick={() => setShowDensity(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${showDensity
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
          >
            👥 Mật độ dân số {showDensity ? 'BẬT' : 'TẮT'}
          </button>

          {/* Sort */}
          <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white text-gray-700 focus:outline-none ml-auto min-w-50">
            <option value="score">Sắp xếp: Điểm tiềm năng</option>
            <option value="cafes">Sắp xếp: Số quán</option>
            <option value="reviews">Sắp xếp: Đánh giá</option>
          </select>
        </div>
      </div>

      {/* Body: map + list */}
      <div className="flex flex-col flex-1 overflow-hidden px-8 py-6 gap-6 min-h-max">

        {/* Color scale */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Thang màu tiềm năng:</span>
          <div className="flex-1 h-3 rounded-full" style={{
            background: 'linear-gradient(to right, #ef4444, #fb923c, #facc15, #4ade80, #16a34a)'
          }} />
          <div className="flex gap-4 text-[11px] text-gray-400">
            <span>Rất thấp</span><span>Thấp</span><span>Trung bình</span><span>Tốt</span><span>Rất tốt</span>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex-1 min-h-[500px]">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-2xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}
          <div className="relative h-full">
            <GoongMap
              center={currentCity.center}
              zoom={currentCity.zoom}
              className="w-full h-full"
              onMapReady={handleMapReady}
            />
            {mapReady && geojson && viewMode === 'grid' && (
              <GridLayer
                mapInstance={mapRef.current}
                mapReady={mapReady}
                geojson={geojson}
              />
            )}
          </div>
        </div>

        {/* Grid list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">
              Tổng quan khu vực
              <span className="text-gray-400 font-normal ml-2">
                Hiển thị {(page - 1) * 10 + 1}–{Math.min(page * 10, totalGrids)} / {totalGrids.toLocaleString()}
              </span>
            </p>
            {/* Pagination */}
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                Trước
              </button>
              <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium">{page}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                Sau
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {gridList.map((g, i) => (
              <div key={g.Grid_ID} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-medium">#{(page - 1) * 10 + i + 1}</span>
                  <span className="text-xs text-gray-400">ĐIỂM QUẬN</span>
                </div>
                <p className="font-bold text-gray-900 text-sm">{g.Grid_ID}</p>
                <p className="text-xs text-gray-400 mb-3">{g.City}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Số quán {g.Cafe_Count}</span>
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Đánh giá {g.Total_Reviews.toLocaleString()}</span>
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">NTL {g.NTL_Mean.toFixed(1)}</span>
                  <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">POI {g.POI_Density.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400">Điểm tiềm năng</p>
                    <p className={`text-lg font-bold px-2 py-0.5 rounded-lg inline-block ${scoreToColor(g.Score)}`}>
                      {g.Score.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">Thành phố</p>
                    <p className="text-sm font-semibold text-gray-700">{g.City}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}