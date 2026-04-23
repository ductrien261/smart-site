import { useEffect, useRef } from 'react'
import { setGeoJSONSource, removeSourceAndLayers } from '../GoongMap/goongMapUtils'

const SOURCE = 'population-source'
const FILL = 'population-fill'
const LINE = 'population-line'

interface Props {
    mapInstance: any
    mapReady: boolean
    geojson: any
    opacity?: number
}

export default function PopulationLayer({ mapInstance, mapReady, geojson, opacity = 0.5 }: Props) {
    const addedRef = useRef(false)

    useEffect(() => {
        const map = mapInstance
        if (!map || !mapReady || !geojson) return

        const densities = geojson.features.map((f: any) => f.properties?.density_per_km2 || 0)
        const p95 = densities.sort((a: number, b: number) => a - b)[Math.floor(densities.length * 0.95)] || 1

        const painted = {
            ...geojson,
            features: geojson.features.map((f: any) => ({
                ...f,
                properties: {
                    ...f.properties,
                    _density_norm: Math.min((f.properties?.density_per_km2 || 0) / p95, 1)
                }
            }))
        }

        setGeoJSONSource(map, SOURCE, painted)

        if (!addedRef.current) {
            map.addLayer({
                id: FILL,
                type: 'fill',
                source: SOURCE,
                paint: {
                    'fill-color': [
                        'interpolate', ['linear'], ['get', '_density_norm'],
                        0, '#ffffff',
                        0.1, '#fde68a',
                        0.3, '#fb923c',
                        0.6, '#dc2626',
                        1, '#7f1d1d'
                    ],
                    'fill-opacity': 0.55,
                }
            })
            map.addLayer({
                id: LINE,
                type: 'line',
                source: SOURCE,
                paint: {
                    'line-color': 'rgba(0,0,0,0.1)',
                    'line-width': 0.5,
                }
            })
            addedRef.current = true
        }

        return () => {
            removeSourceAndLayers(map, SOURCE, [FILL, LINE])
            addedRef.current = false
        }
    }, [mapInstance, mapReady, geojson, opacity])

    return null
}