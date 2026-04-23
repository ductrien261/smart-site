import { useEffect, useRef } from 'react'
import { setGeoJSONSource, removeSourceAndLayers } from '../GoongMap/goongMapUtils'

const SOURCE = 'poi-source'
const LAYER = 'poi-circles'

interface Props {
    mapInstance: any
    mapReady: boolean
    geojson: any
}

export default function PoiLayer({ mapInstance, mapReady, geojson }: Props) {
    const addedRef = useRef(false)

    useEffect(() => {
        const map = mapInstance
        if (!map || !mapReady || !geojson) return

        setGeoJSONSource(map, SOURCE, geojson)

        if (!addedRef.current) {
            map.addLayer({
                id: LAYER,
                type: 'circle',
                source: SOURCE,
                paint: {
                    'circle-radius': 5,
                    'circle-color': [
                        'match', ['get', 'Category_Clean'],
                        'Food', '#ef4444',
                        'Commercial', '#3b82f6',
                        'Leisure', '#8b5cf6',
                        'Transport', '#06b6d4',
                        'Office', '#1d4ed8',
                        'Education', '#16a34a',
                        'Residential', '#f59e0b',
                        '#94a3b8'
                    ],
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff',
                }
            })
            addedRef.current = true
        }

        return () => {
            removeSourceAndLayers(map, SOURCE, [LAYER])
            addedRef.current = false
        }
    }, [mapInstance, mapReady, geojson])

    return null
}