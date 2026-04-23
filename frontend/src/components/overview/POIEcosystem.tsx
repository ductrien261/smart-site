import type { POIEcosystemItem } from '../../types'

interface Props {
  data: POIEcosystemItem[]
}

const COLOR_MAP: Record<string, string> = {
  'Ẩm thực (Food)': '#3b82f6',
  'Giải trí (Leisure)': '#22c55e',
  'Thương mại (Comm)': '#f59e0b',
  'Giao thông (Trans)': '#ec4899',
  'Giáo dục (Edu)': '#8b5cf6',
  'Văn phòng (Office)': '#f97316',
  'Dân cư (Resid)': '#06b6d4',
  'Khác (Other)': '#94a3b8',
}

export default function POIEcosystem({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 h-full flex items-center justify-center">
        <p className="text-sm text-gray-400">Đang tải dữ liệu POI…</p>
      </div>
    )
  }

  const MAX = Math.max(...data.map(d => d.value))

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 h-full">
      <p className="text-sm font-semibold text-gray-800">Cấu trúc Hệ sinh thái POI</p>
      <p className="text-xs text-gray-400 mt-0.5 mb-5">Phân rã đặc trưng không gian khu vực</p>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">{d.label}</span>
              <span className="font-semibold text-gray-800">{d.value.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(d.value / MAX) * 100}%`,
                  backgroundColor: COLOR_MAP[d.label] ?? '#94a3b8'
                }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}