import { useEffect, useRef } from 'react'
import { setGeoJSONSource, removeSourceAndLayers } from '../GoongMap/goongMapUtils'

const SOURCE_ID = 'grid-source'
const FILL_LAYER = 'grid-fill'
const LINE_LAYER = 'grid-line'

function scoreToColor(score: number): string {
    if (score >= 80) return '#16a34a'  
    if (score >= 65) return '#4ade80'  
    if (score >= 50) return '#facc15'  
    if (score >= 35) return '#fb923c'  
    return '#ef4444'                  
}

interface Props {
    mapInstance: any
    mapReady: boolean
    geojson: any
    onGridClick?: (props: any) => void
}

export default function GridLayer({ mapInstance, mapReady, geojson, onGridClick }: Props) {
    const addedRef = useRef(false)
    const popupRef = useRef<any>(null)

    useEffect(() => {
        const map = mapInstance
        if (!map || !mapReady || !geojson) return

        // Tô màu từng feature theo score
        const painted = {
            ...geojson,
            features: geojson.features.map((f: any) => ({
                ...f,
                properties: {
                    ...f.properties,
                    fill_color: scoreToColor(f.properties.Score),
                }
            }))
        }

        setGeoJSONSource(map, SOURCE_ID, painted)

        if (!addedRef.current) {
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
                    'line-color': 'rgba(0,0,0,0.08)',
                    'line-width': 0.5,
                },
            })

            // Click popup
            map.on('click', FILL_LAYER, (e: any) => {
                const p = e.features?.[0]?.properties
                if (!p) return
                onGridClick?.(p)

                const goongjs = window.goongjs
                if (!goongjs) return
                if (popupRef.current) { popupRef.current.remove(); popupRef.current = null }

                const html = `
          <div style="min-width:200px;padding:12px;font-family:inherit;">
            <p style="font-size:0.7rem;color:#64748b;margin:0 0 4px;">Ô lưới</p>
            <p style="font-weight:700;color:#0f172a;margin:0 0 8px;">${p.Grid_ID}</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.8rem;">
              <div><span style="color:#64748b;">Điểm</span><br/><strong style="color:#0f766e;">${Number(p.Score).toFixed(1)}</strong></div>
              <div><span style="color:#64748b;">Số quán</span><br/><strong>${p.Cafe_Count}</strong></div>
              <div><span style="color:#64748b;">Đánh giá</span><br/><strong>${Number(p.Total_Reviews).toLocaleString()}</strong></div>
              <div><span style="color:#64748b;">NTL</span><br/><strong>${p.NTL_Mean}</strong></div>
            </div>
          </div>`

                popupRef.current = new goongjs.Popup({ maxWidth: '280px', closeOnClick: true })
                    .setLngLat(e.lngLat)
                    .setHTML(html)
                    .addTo(map)
            })

            map.on('mouseenter', FILL_LAYER, () => { map.getCanvas().style.cursor = 'pointer' })
            map.on('mouseleave', FILL_LAYER, () => { map.getCanvas().style.cursor = '' })

            addedRef.current = true
        }

        return () => {
            removeSourceAndLayers(map, SOURCE_ID, [FILL_LAYER, LINE_LAYER])
            addedRef.current = false
            if (popupRef.current) { popupRef.current.remove(); popupRef.current = null }
        }
    }, [mapInstance, mapReady, geojson, onGridClick])

    return null
}