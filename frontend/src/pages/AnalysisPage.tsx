import { useCallback, useRef, useState } from 'react'
import GoongMap from '../components/GoongMap/GoongMap'
import { setGeoJSONSource, removeSourceAndLayers } from '../components/GoongMap/goongMapUtils'
import { useAnalysis, type Bbox } from '../hooks/useAnalysis'
import AnalysisStatsPanel from '../components/analysis/AnalysisStatsPanel'
import AnalysisInsightPanel from '../components/analysis/AnalysisInsightPanel'

type DrawStep = 'idle' | 'drawing_first' | 'drawing_second' | 'draft' | 'confirmed'

function bboxToGeoJSON(bbox: Bbox, dashed = false) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [bbox.min_lng, bbox.min_lat],
        [bbox.max_lng, bbox.min_lat],
        [bbox.max_lng, bbox.max_lat],
        [bbox.min_lng, bbox.max_lat],
        [bbox.min_lng, bbox.min_lat],
      ]]
    },
    properties: { dashed }
  }
}

export default function AnalysisPage() {
  const mapRef = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)
  const [step, setStep] = useState<DrawStep>('idle')
  const [firstPt, setFirstPt] = useState<[number, number] | null>(null)
  const [draftBbox, setDraftBbox] = useState<Bbox | null>(null)
  const [city, setCity] = useState('DaNang')

  const { analysis, insights, loading, error, bbox, submitBbox, reset, resetCount } = useAnalysis()

  const CITY_OPTIONS = [
    { value: 'DaNang', label: 'Đà Nẵng', center: [108.2022, 16.0544] as [number, number] },
    { value: 'HCM', label: 'TP.HCM', center: [106.6297, 10.8231] as [number, number] },
    { value: 'HaNoi', label: 'Hà Nội', center: [105.8412, 21.0245] as [number, number] },
  ]

  const syncRect = useCallback((b: Bbox | null, confirmed = false) => {
    const map = mapRef.current
    if (!map) return
    if (!b) {
      removeSourceAndLayers(map, 'draw-rect', ['draw-rect-fill', 'draw-rect-outline'])
      return
    }
    setGeoJSONSource(map, 'draw-rect', bboxToGeoJSON(b))
    if (!map.getLayer('draw-rect-fill')) {
      map.addLayer({
        id: 'draw-rect-fill', type: 'fill', source: 'draw-rect',
        paint: { 'fill-color': '#0f766e', 'fill-opacity': confirmed ? 0.18 : 0.1 }
      })
      map.addLayer({
        id: 'draw-rect-outline', type: 'line', source: 'draw-rect',
        paint: {
          'line-color': '#0f766e', 'line-width': 2,
          'line-dasharray': confirmed ? [1, 0] : [6, 4]
        }
      })
    } else {
      map.setPaintProperty('draw-rect-fill', 'fill-opacity', confirmed ? 0.18 : 0.1)
      map.setPaintProperty('draw-rect-outline', 'line-dasharray', confirmed ? [1, 0] : [6, 4])
    }
  }, [])

  const handleMapClick = useCallback((e: any) => {
    if (step === 'drawing_first') {
      setFirstPt([e.lngLat.lat, e.lngLat.lng])
      setStep('drawing_second')
    } else if (step === 'drawing_second' && firstPt) {
      const b: Bbox = {
        min_lat: Math.min(firstPt[0], e.lngLat.lat),
        max_lat: Math.max(firstPt[0], e.lngLat.lat),
        min_lng: Math.min(firstPt[1], e.lngLat.lng),
        max_lng: Math.max(firstPt[1], e.lngLat.lng),
      }
      setDraftBbox(b)
      syncRect(b, false)
      setStep('draft')
    }
  }, [step, firstPt, syncRect])

  const handleStartDraw = () => {
    setStep('drawing_first')
    setFirstPt(null)
    setDraftBbox(null)
    syncRect(null)
  }

  const handleCancel = () => {
    setStep('idle')
    setFirstPt(null)
    setDraftBbox(null)
    syncRect(null)
  }

  const handleConfirm = async () => {
    if (!draftBbox) return
    setStep('confirmed')
    syncRect(draftBbox, true)
    await submitBbox(draftBbox, city)
  }

  const handleReset = () => {
    reset()
    setStep('idle')
    setFirstPt(null)
    setDraftBbox(null)
    syncRect(null)
  }

  const toolbarLabel = {
    idle: 'Vẽ vùng để phân tích',
    drawing_first: '📍 Nhấn vào góc đầu tiên…',
    drawing_second: '📍 Nhấn vào góc đối diện…',
    draft: '✅ Đã vẽ vùng — xác nhận để phân tích',
    confirmed: '🔒 Vùng đã xác nhận',
  }[step]

  const currentCity = CITY_OPTIONS.find(c => c.value === city)!

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 pt-7 pb-4 bg-white border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Phân tích vị trí thông minh</h1>
            <p className="text-base text-gray-400 mt-1">
              Vẽ vùng trên bản đồ · truy vấn tín hiệu quán cà phê &amp; POI · phân tích dựa trên quy tắc
            </p>
          </div>
          <div className="text-right text-sm bg-teal-50 border border-teal-100 rounded-xl px-4 py-2 max-w-xs">
            <p className="text-teal-700 font-medium text-xs">SmartSite hiển thị</p>
            <p className="text-teal-600 text-xs mt-0.5">
              <em>tín hiệu quan sát</em> và <strong>xếp hạng tương đối</strong>.
              Không phải dự báo doanh thu.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex items-center gap-3">
          {/* City */}
          <select value={city} onChange={e => setCity(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
            {CITY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <span className="text-sm text-gray-500 px-2">{toolbarLabel}</span>

          <div className="ml-auto flex items-center gap-2">
            {(analysis || error) && (
              <button onClick={handleReset}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                ↺ Đặt lại
              </button>
            )}
            {step === 'idle' || step === 'confirmed' ? (
              <button onClick={handleStartDraw} disabled={loading}
                className="px-5 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                ✏ Vẽ vùng
              </button>
            ) : step === 'drawing_first' || step === 'drawing_second' ? (
              <button onClick={handleCancel}
                className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
                Hủy
              </button>
            ) : step === 'draft' ? (
              <>
                <button onClick={handleCancel}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
                  Vẽ lại
                </button>
                <button onClick={handleConfirm} disabled={loading}
                  className="px-5 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                  {loading ? 'Đang phân tích…' : 'Phân tích vùng'}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="px-8 pt-5"
        style={{ cursor: step === 'drawing_first' || step === 'drawing_second' ? 'crosshair' : 'default' }}>
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: '460px' }}>
          <GoongMap
            key={resetCount}
            center={currentCity.center}
            zoom={13}
            className="w-full h-full"
            onMapReady={(map) => { mapRef.current = map; setMapReady(true) }}
            onMapClick={handleMapClick}
          />
        </div>
        {/* Bbox coords */}
        {(draftBbox || bbox) && (
          <div className="flex gap-6 mt-2 text-xs text-gray-400 px-1">
            {(() => {
              const b = draftBbox || bbox!; return (
                <>
                  <span>SW: {b.min_lat.toFixed(5)}, {b.min_lng.toFixed(5)}</span>
                  <span>NE: {b.max_lat.toFixed(5)}, {b.max_lng.toFixed(5)}</span>
                </>
              )
            })()}
          </div>
        )}
      </div>

      {/* Bottom panels */}
      <div className="flex gap-5 px-8 pt-5 pb-8 flex-1">
        <div className="flex-1 min-w-0">
          <AnalysisStatsPanel analysis={analysis} />
        </div>
        <div className="w-96 shrink-0">
          <AnalysisInsightPanel insights={insights} loading={loading} error={error} />
        </div>
      </div>
    </div>
  )
}