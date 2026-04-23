import { useEffect, useState } from 'react'
import { statsApi } from '../services/api'
import type {
  MacroStats, CityCompare, MarketGap,
  SentimentItem, DistrictRankItem, POIEcosystemItem,
  RegionLinkageItem, StrategyStats
} from '../types'

import MacroKPIRow from '../components/overview/MacroKPIRow'
import POIEcosystem from '../components/overview/POIEcosystem'
import SentimentDonut from '../components/overview/SentimentDonut'
import DistrictRanking from '../components/overview/DistrictRanking'
import CityCompareComp from '../components/overview/CityCompare'
import MarketGapComp from '../components/overview/MarketGap'
import RegionLinkage from '../components/overview/RegionLinkage'
import StrategyCards from '../components/overview/StrategyCards'

export default function OverviewPage() {
  const [macro, setMacro] = useState<MacroStats | null>(null)
  const [cityData, setCityData] = useState<CityCompare[]>([])
  const [gapData, setGapData] = useState<MarketGap[]>([])
  const [sentimentData, setSentimentData] = useState<SentimentItem[]>([])
  const [districtData, setDistrictData] = useState<DistrictRankItem[]>([])
  const [poiData, setPoiData] = useState<POIEcosystemItem[]>([])
  const [regionData, setRegionData] = useState<RegionLinkageItem[]>([])
  const [strategyData, setStrategyData] = useState<StrategyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      statsApi.getMacro(),
      statsApi.getCityCompare(),
      statsApi.getMarketGap(),
      statsApi.getSentiment(),
      statsApi.getDistrictRanking(),
      statsApi.getPoiEcosystem(),
      statsApi.getRegionLinkage(),
      statsApi.getStrategyStats(),
    ]).then(([m, c, g, s, d, p, r, st]) => {
      setMacro(m.data)
      setCityData(c.data)
      setGapData(g.data)
      setSentimentData(s.data)
      setDistrictData(d.data)
      setPoiData(p.data)
      setRegionData(r.data)
      setStrategyData(st.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-8 flex flex-col h-full min-h-max">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo Điều hành Thị trường F&B</h1>
        <p className="text-sm text-gray-400 mt-1.5">
          Cập nhật lần cuối: Tháng 10. 2023 &nbsp;|&nbsp; Nguồn: SmartSite Data Engine
        </p>
      </div>

      {/* KPI Row */}
      {macro && <MacroKPIRow data={macro} />}

      {/* Row 2: POI + Sentiment + District */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <POIEcosystem data={poiData} />
        <SentimentDonut data={sentimentData} />
        <DistrictRanking data={districtData} />
      </div>

      {/* Row 3: Region Linkage + Strategy */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2"><RegionLinkage data={regionData} /></div>
        <StrategyCards data={strategyData} />
      </div>

      {/* Row 4: City Compare */}
      <div className="mb-4">
        <CityCompareComp data={cityData} />
      </div>

      {/* Row 5: Market Gap */}
      <MarketGapComp data={gapData} />
    </div>
  )
}