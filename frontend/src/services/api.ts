import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const statsApi = {
  getMacro: (city = 'all') => api.get('/stats/macro', { params: { city } }),
  getCityCompare: () => api.get('/stats/city-compare'),
  getMarketGap: () => api.get('/stats/market-gap'),
}

export const gridApi = {
  getGrids: (params: Record<string, unknown>) => api.get('/grid', { params }),
  getGridGeoJSON: (city: string, district?: string) =>
    api.get('/grid/geojson', { params: { city, district } }),
  getDistricts: (city: string) => api.get('/grid/districts', { params: { city } }),
}

export const poiApi = {
  getPoi: (city: string) => api.get('/poi', { params: { city } }),
}

export const analysisApi = {
  analyzeZone: (body: Record<string, unknown>) => api.post('/analysis/zone', body),
}

export const competitionApi = {
  getOverview: (city: string) => api.get('/competition/overview', { params: { city } }),
}

export const populationApi = {
  getPopulation: (city: string) => api.get('/population', { params: { city } }),
}