import { useCallback, useEffect, useRef, useState } from 'react'
import { removeSourceAndLayers, setGeoJSONSource } from '../GoongMap/goongMapUtils'
import './PopulationLayer.css'

const YLORD_PALETTE = [
  '#ffffb2', // very low   (<100)
  '#fecc5c', // low        (100–1k)
  '#fd8d3c', // medium     (1k–5k)
  '#f03b20', // high       (5k–20k)
  '#bd0026', // very high  (>20k)
]

const SOURCE_ID = 'population-density-data'
const FILL_LAYER = 'population-density-fill'
const LINE_LAYER = 'population-density-line'
const HEATMAP_LAYER = 'population-heatmap'
const HEATMAP_SOURCE = 'population-heatmap-data'

const FIXED_BREAKS = [100, 1_000, 5_000, 20_000]
const LEGEND_LABELS = ['<100', '100–1k', '1k–5k', '5k–20k', '>20k']

function densityColorIndexLog(density: number): number {
  for (let i = 0; i < FIXED_BREAKS.length; i++) {
    if (density < FIXED_BREAKS[i]) return i
  }
  return 4
}

function buildChoroplethGeoJSON(features: any[]) {
  return {
    type: 'FeatureCollection',
    features: features.map((f: any) => {
      const density = Number(f.properties.density_per_km2) || 0
      const idx = densityColorIndexLog(density)
      return {
        ...f,
        properties: { ...f.properties, fill_color: YLORD_PALETTE[idx] },
      }
    }),
  }
}

/** Compute the arithmetic centroid of a Polygon or MultiPolygon */
function computeCentroid(geometry: any): [number, number] {
  let coords: number[][] = []
  if (geometry.type === 'Polygon') {
    coords = geometry.coordinates[0]
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach((polygon: number[][][]) => {
      coords = coords.concat(polygon[0])
    })
  }
  if (!coords.length) return [0, 0]
  const sumLng = coords.reduce((s, c) => s + c[0], 0)
  const sumLat = coords.reduce((s, c) => s + c[1], 0)
  return [sumLng / coords.length, sumLat / coords.length]
}

function buildHeatmapGeoJSON(features: any[]) {
  return {
    type: 'FeatureCollection',
    features: features.map((f: any) => {
      const density = Number(f.properties.density_per_km2) || 0
      const weight = Math.log10(density + 1) / 4
      const [lng, lat] = computeCentroid(f.geometry)
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: { weight },
      }
    }),
  }
}

function formatDensity(n: number): string {
  if (!Number.isFinite(n)) return '—'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return Math.round(n).toLocaleString('vi-VN')
}

interface Props {
  mapInstance: any
  mapReady: boolean
  visible?: boolean
  geojson: any
  viewMode?: 'choropleth' | 'heatmap'
}

export default function PopulationLayer({
  mapInstance,
  mapReady,
  visible = false,
  geojson,
  viewMode = 'choropleth',
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const layersAddedRef = useRef(false)
  const popupRef = useRef<any>(null)

  const removeLayers = useCallback(() => {
    const map = mapInstance
    if (!map) return
    if (popupRef.current) {
      popupRef.current.remove()
      popupRef.current = null
    }
    removeSourceAndLayers(map, SOURCE_ID, [FILL_LAYER, LINE_LAYER])
    removeSourceAndLayers(map, HEATMAP_SOURCE, [HEATMAP_LAYER])
    layersAddedRef.current = false
  }, [mapInstance])

  const loadAndRender = useCallback((targetMode: string) => {
    const map = mapInstance
    if (!map || !mapReady || !geojson) return

    setLoading(true)
    setError('')

    try {
      const features = geojson?.features ?? []
      if (!features.length) throw new Error('Không có dữ liệu mật độ cho thành phố này.')

      if (targetMode === 'choropleth') {
        const painted = buildChoroplethGeoJSON(features)
        setGeoJSONSource(map, SOURCE_ID, painted)

        if (!layersAddedRef.current) {
          map.addLayer({
            id: FILL_LAYER,
            type: 'fill',
            source: SOURCE_ID,
            paint: {
              'fill-color': ['get', 'fill_color'],
              'fill-opacity': 0.55,
            },
          })
          map.addLayer({
            id: LINE_LAYER,
            type: 'line',
            source: SOURCE_ID,
            paint: {
              'line-color': 'rgba(0,0,0,0.15)',
              'line-width': 0.5,
            },
          })

          // Popup on click
          map.on('click', FILL_LAYER, (e: any) => {
            if (!e.features?.length) return
            const props = e.features[0].properties
            const ward = props.ward_name ?? '—'
            const district = props.district_name ?? '—'
            const pop = Number.isFinite(Number(props.population))
              ? Number(props.population).toLocaleString('vi-VN') : '—'
            const density = formatDensity(Number(props.density_per_km2))
            const area = Number.isFinite(Number(props.area_km2))
              ? Number(props.area_km2).toFixed(2) : '—'

            const html = (
              '<div style="min-width:220px;padding:14px;font-family:inherit;">'
              + '<div style="margin-bottom:10px;">'
              + '<span style="font-size:0.72rem;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Mật độ dân số</span>'
              + '<h3 style="margin:4px 0 0;font-size:0.95rem;color:#0f172a;">' + ward + '</h3>'
              + '<p style="margin:2px 0 0;font-size:0.8rem;color:#64748b;">' + district + '</p>'
              + '</div>'
              + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'
              + '<div style="padding:8px 10px;border-radius:10px;background:rgba(248,250,252,0.9);border:1px solid rgba(0,0,0,0.04);"><span style="display:block;font-size:0.7rem;color:#64748b;margin-bottom:3px;">Dân số</span><strong style="font-size:0.95rem;">' + pop + '</strong></div>'
              + '<div style="padding:8px 10px;border-radius:10px;background:rgba(248,250,252,0.9);border:1px solid rgba(0,0,0,0.04);"><span style="display:block;font-size:0.7rem;color:#64748b;margin-bottom:3px;">Mật độ (ng/km²)</span><strong style="font-size:0.95rem;">' + density + '</strong></div>'
              + '<div style="padding:8px 10px;border-radius:10px;background:rgba(248,250,252,0.9);border:1px solid rgba(0,0,0,0.04);"><span style="display:block;font-size:0.7rem;color:#64748b;margin-bottom:3px;">Diện tích (km²)</span><strong style="font-size:0.95rem;">' + area + '</strong></div>'
              + '</div>'
              + '<p style="margin:8px 0 0;font-size:0.72rem;color:#64748b;">Nguồn: Tổng điều tra DS-NÔ 2019 (GSO)</p>'
              + '</div>'
            )

            const goongjs = (window as any).goongjs
            if (popupRef.current) { popupRef.current.remove(); popupRef.current = null }
            if (goongjs) {
              popupRef.current = new goongjs.Popup({ maxWidth: '320px', closeOnClick: true })
                .setLngLat(e.lngLat)
                .setHTML(html)
                .addTo(map)
            }
          })

          map.on('mouseenter', FILL_LAYER, () => { map.getCanvas().style.cursor = 'pointer' })
          map.on('mouseleave', FILL_LAYER, () => { map.getCanvas().style.cursor = '' })

          layersAddedRef.current = true

          if (map.getLayer('grid-fill')) map.moveLayer('grid-fill')
          if (map.getLayer('grid-line')) map.moveLayer('grid-line')
        }
      } else {
        const heatGeoJSON = buildHeatmapGeoJSON(features)
        setGeoJSONSource(map, HEATMAP_SOURCE, heatGeoJSON)

        if (!layersAddedRef.current) {
          map.addLayer({
            id: HEATMAP_LAYER,
            type: 'heatmap',
            source: HEATMAP_SOURCE,
            paint: {
              'heatmap-weight': ['get', 'weight'],
              'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 8, 1, 14, 3],
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(255,255,178,0)',
                0.2, '#fecc5c',
                0.4, '#fd8d3c',
                0.6, '#f03b20',
                0.8, '#bd0026',
                1, '#800026',
              ],
              'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 8, 15, 14, 40],
              'heatmap-opacity': 0.75,
            },
          })

          layersAddedRef.current = true
        }
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu mật độ dân số.')
      removeLayers()
    } finally {
      setLoading(false)
    }
  }, [mapInstance, mapReady, geojson, removeLayers])

  useEffect(() => {
    if (!mapReady) return
    if (!visible) {
      removeLayers()
      return
    }
    removeLayers()
    loadAndRender(viewMode)
  }, [visible, viewMode, mapReady, geojson])

  useEffect(() => {
    return () => { removeLayers() }
  }, [])

  useEffect(() => {
    const map = mapInstance
    if (!map || !mapReady || !layersAddedRef.current) return
    const v = visible ? 'visible' : 'none'
    if (map.getLayer(FILL_LAYER)) map.setLayoutProperty(FILL_LAYER, 'visibility', v)
    if (map.getLayer(LINE_LAYER)) map.setLayoutProperty(LINE_LAYER, 'visibility', v)
    if (map.getLayer(HEATMAP_LAYER)) map.setLayoutProperty(HEATMAP_LAYER, 'visibility', v)
  }, [visible, mapInstance, mapReady])

  if (!visible || loading || error || !layersAddedRef.current) {
    if (visible && (loading || error)) {
      return (
        <div className="population-layer-widget">
          {loading && (
            <div className="population-status population-loading">
              Đang tải dữ liệu mật độ…
            </div>
          )}
          {error && !loading && (
            <div className="population-status population-error">
              ⚠ {error}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="population-layer-widget">
      <div className="population-legend">
        {viewMode === 'choropleth' ? (
          <>
            <span className="population-legend-title">Mật độ (ng/km²)</span>
            <div className="population-legend-items">
              {YLORD_PALETTE.map((color, i) => (
                <div key={color} className="population-legend-item">
                  <span className="population-legend-swatch" style={{ background: color }} />
                  <span className="population-legend-range">{LEGEND_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <span className="population-legend-title">Thấp → Cao mật độ dân số</span>
        )}
        <p className="population-legend-note">Nguồn: Tổng điều tra DS-NÔ 2019 (GSO)</p>
      </div>
    </div>
  )
}