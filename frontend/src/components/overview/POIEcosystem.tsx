const POI_DATA = [
  { label: 'Ẩm thực (Food)',       value: 850, color: '#3b82f6' },
  { label: 'Giải trí (Leisure)',   value: 420, color: '#22c55e' },
  { label: 'Thương mại (Comm)',    value: 310, color: '#f59e0b' },
  { label: 'Giao thông (Trans)',   value: 150, color: '#ec4899' },
  { label: 'Giáo dục (Edu)',       value: 210, color: '#8b5cf6' },
  { label: 'Văn phòng (Office)',   value: 180, color: '#f97316' },
]
const MAX = 850

export default function POIEcosystem() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 h-full">
      <p className="text-sm font-semibold text-gray-800">Cấu trúc Hệ sinh thái POI</p>
      <p className="text-xs text-gray-400 mt-0.5 mb-5">Phân rã đặc trưng không gian khu vực</p>
      <div className="space-y-3">
        {POI_DATA.map((d) => (
          <div key={d.label}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-600">{d.label}</span>
              <span className="font-semibold text-gray-800">{d.value}</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(d.value / MAX) * 100}%`, backgroundColor: d.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}