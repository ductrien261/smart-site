import { useCallback, useEffect, useRef, useState } from 'react'
import { gridApi } from '../services/api'
import GoongMap from '../components/GoongMap/GoongMap'
import GridLayer from '../components/map/GridLayer'
import PoiLayer from '../components/map/PoiLayer'
import PopulationLayer from '../components/map/PopulationLayer'
import { poiApi, populationApi } from '../services/api'
import { flyToCenter } from '../components/GoongMap/goongMapUtils'
import GridDetailPanel from '../components/map/GridDetailPanel'

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
  const [totalGrids, setTotalGrids] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [mapReady, setMapReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDensity, setShowDensity] = useState(false)
  const [poiGeojson, setPoiGeojson] = useState<any>(null)
  const [popGeojson, setPopGeojson] = useState<any>(null)
  const [selectedGrid, setSelectedGrid] = useState<any>(null)

  const mapRef = useRef<any>(null)

  const currentCity = CITY_OPTIONS.find(c => c.value === city)!

  // Load districts khi đổi city
  useEffect(() => {
    gridApi.getDistricts(city).then(r => setDistricts(r.data.districts))
    setDistrict('')
  }, [city])

  // Load geojson + list
  useEffect(() => {
    setLoading(true)
    gridApi.getGridGeoJSON(city, district || undefined).then(geo => {
      setGeojson(geo.data)
      setTotalGrids(geo.data.features.length)
      const sum = (geo.data.features as any[]).reduce((acc: number, f: any) => acc + (f.properties.Total_Reviews || 0), 0)
      setTotalReviews(sum)
    }).finally(() => setLoading(false))
  }, [city, district])
  useEffect(() => {
    poiApi.getPoi(city).then(r => setPoiGeojson(r.data))
    populationApi.getPopulation(city).then(r => setPopGeojson(r.data))
  }, [city])

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
          <select value={district} onChange={e => setDistrict(e.target.value)}
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
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex-1 min-h-[650px]">
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
            {mapReady && popGeojson && showDensity && (
              <PopulationLayer
                mapInstance={mapRef.current}
                mapReady={mapReady}
                geojson={popGeojson}
                opacity={0.45}
              />
            )}
            {mapReady && geojson && viewMode === 'grid' && (
              <GridLayer
                mapInstance={mapRef.current}
                mapReady={mapReady}
                geojson={geojson}
                onGridClick={(props) => setSelectedGrid(props)}
              />
            )}
            {selectedGrid && (
              <GridDetailPanel
                grid={selectedGrid}
                onClose={() => setSelectedGrid(null)}
              />
            )}
            {mapReady && poiGeojson && viewMode === 'point' && (
              <PoiLayer
                mapInstance={mapRef.current}
                mapReady={mapReady}
                geojson={poiGeojson}
              />
            )}
            <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-md text-xs space-y-2 min-w-[160px]">
              {viewMode === 'grid' && (
                <div>
                  <p className="font-semibold text-gray-700 mb-1.5">Tiềm năng</p>
                  {[
                    { color: '#16a34a', label: 'Rất tốt (≥80)' },
                    { color: '#4ade80', label: 'Tốt (65–80)' },
                    { color: '#facc15', label: 'Trung bình (50–65)' },
                    { color: '#fb923c', label: 'Thấp (35–50)' },
                    { color: '#ef4444', label: 'Rất thấp (<35)' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 py-0.5">
                      <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {viewMode === 'point' && (
                <div>
                  <p className="font-semibold text-gray-700 mb-1.5">Loại POI</p>
                  {[
                    { color: '#ef4444', label: 'Food' },
                    { color: '#3b82f6', label: 'Commercial' },
                    { color: '#8b5cf6', label: 'Leisure' },
                    { color: '#06b6d4', label: 'Transport' },
                    { color: '#1d4ed8', label: 'Office' },
                    { color: '#16a34a', label: 'Education' },
                    { color: '#f59e0b', label: 'Residential' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 py-0.5">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {showDensity && (
                <div className={viewMode !== 'grid' && viewMode !== 'point' ? '' : 'border-t border-gray-100 pt-2'}>
                  <p className="font-semibold text-gray-700 mb-1.5">Dân số</p>
                  <div className="h-2 rounded-full w-full" style={{
                    background: 'linear-gradient(to right, #ffffff, #fde68a, #fb923c, #dc2626, #7f1d1d)'
                  }} />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>Thấp</span><span>Cao</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}