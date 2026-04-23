export function flyToBounds(map: any, bounds: any, options: any = {}) {
  if (!map || !bounds) return
  const [sw, ne] = bounds
  map.fitBounds([sw, ne], {
    padding: options.padding ?? 40,
    duration: options.duration ?? 1200,
    ...(options.maxZoom ? { maxZoom: options.maxZoom } : {}),
  })
}

export function flyToCenter(map: any, center: any, zoom = 14, duration = 1000) {
  if (!map) return
  map.flyTo({ center, zoom, duration })
}

export function setGeoJSONSource(map: any, sourceId: string, geojsonData: any) {
  if (!map || !map.getStyle || !map.getStyle()) return
  const existing = map.getSource(sourceId)
  if (existing) {
    existing.setData(geojsonData)
  } else {
    map.addSource(sourceId, { type: 'geojson', data: geojsonData })
  }
}

export function removeSourceAndLayers(map: any, sourceId: string, layerIds: string[] = []) {
  if (!map || !map.getStyle || !map.getStyle()) return
  for (const layerId of layerIds) {
    if (map.getLayer(layerId)) map.removeLayer(layerId)
  }
  if (map.getSource(sourceId)) map.removeSource(sourceId)
}