export interface MacroStats {
  total_cafes:    number
  hotspot_a_plus: number
  sentiment:      number
  ntl_level:      string
  ntl_value:      number
  ai_confidence:  number
  total_reviews:  number
}

export interface CityCompare {
  city:                string
  label:               string
  pattern:             string
  color:               string
  cafes:               number
  coverage:            number
  fierce_competition:  number
}

export interface MarketGap {
  city:      string
  total:     number
  with_cafe: number
  potential: number
}

export interface GridCell {
  Grid_ID:       string
  City:          string
  District:      string
  Cafe_Count:    number
  Total_Reviews: number
  NTL_Mean:      number
  POI_Density:   number
  Score:         number
  Score_Class:   number
  Center_Lat:    number
  Center_Lng:    number
}