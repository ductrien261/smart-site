export interface MacroStats {
  total_cafes: number
  hotspot_a_plus: number
  sentiment: number
  ntl_level: string
  ntl_value: number
  total_reviews: number
  coverage_pct: number
  avg_rating: number
}

export interface CityCompare {
  city: string
  label: string
  pattern: string
  color: string
  cafes: number
  coverage: number
  fierce_competition: number
}

export interface MarketGap {
  city: string
  total: number
  with_cafe: number
  potential: number
}

export interface GridCell {
  Grid_ID: string
  City: string
  District: string
  Cafe_Count: number
  Total_Reviews: number
  NTL_Mean: number
  POI_Density: number
  Score: number
  Score_Class: number
  Center_Lat: number
  Center_Lng: number
}

export interface SentimentItem {
  name: string
  value: number
  color: string
}

export interface DistrictRankItem {
  name: string
  score: number
  trend: string
  total_grids: number
  hotspot_count: number
}

export interface POIEcosystemItem {
  label: string
  value: number
}

export interface RegionLinkageItem {
  city: string
  mat_do: number
  coverage: number
  avg_score: number
}

export interface StrategyStats {
  total_grids: number
  hotspot_a: number
  blue_ocean: number
}