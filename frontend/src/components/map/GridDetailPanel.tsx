import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { X } from 'lucide-react'

interface Props {
    grid: any
    onClose: () => void
}

function scoreToColor(score: number) {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 65) return 'text-lime-600 bg-lime-50'
    if (score >= 50) return 'text-yellow-600 bg-yellow-50'
    if (score >= 35) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
}

function scoreLabel(score: number) {
    if (score >= 80) return 'Rất tốt'
    if (score >= 65) return 'Tốt'
    if (score >= 50) return 'Trung bình'
    if (score >= 35) return 'Thấp'
    return 'Rất thấp'
}

export default function GridDetailPanel({ grid, onClose }: Props) {
    const radarData = [
        { subject: 'Tiềm năng', value: Math.min(100, Number(grid.Score) || 0) },
        { subject: 'Mật độ POI', value: Math.min(100, (Number(grid.POI_Density) / 3) || 0) },
        { subject: 'Ánh sáng', value: Math.min(100, (Number(grid.NTL_Mean) * 2) || 0) },
        { subject: 'Đánh giá', value: Math.min(100, (Number(grid.Total_Reviews) / 50) || 0) },
        { subject: 'Quán CF', value: Math.min(100, (Number(grid.Cafe_Count) * 15) || 0) },
    ]

    const score = Number(grid.Score) || 0
    const scoreClass = Number(grid.Score_Class) || 0

    return (
        <div className="absolute top-4 right-4 z-20 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b border-gray-100">
                <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wide">Ô lưới</p>
                    <p className="font-bold text-gray-900 text-base">{grid.Grid_ID}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{grid.District} · {grid.City || 'DaNang'}</p>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <X size={16} className="text-gray-400" />
                </button>
            </div>

            {/* Score lớn */}
            <div className="px-4 pt-4 pb-2 flex items-center gap-3">
                <div className={`text-3xl font-bold px-3 py-1.5 rounded-xl ${scoreToColor(score)}`}>
                    {score.toFixed(1)}
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-800">{scoreLabel(score)}</p>
                    <p className="text-xs text-gray-400">
                        Phân lớp: <span className="font-medium text-gray-600">
                            {scoreClass === 2 ? 'A+ Hotspot' : scoreClass === 1 ? 'B Tiềm năng' : 'C Thấp'}
                        </span>
                    </p>
                </div>
            </div>

            {/* Radar chart */}
            <div className="px-2 pb-2">
                <p className="text-xs text-gray-400 px-2 mb-1">Phân tích đa chiều</p>
                <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                        <PolarGrid stroke="rgba(0,0,0,0.08)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Radar
                            dataKey="value"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.2}
                            dot={{ r: 3, fill: '#3b82f6' }}
                        />
                        <Tooltip formatter={(v: number) => [`${v.toFixed(0)}/100`, 'Điểm']} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                {[
                    { label: 'Số quán CF', value: grid.Cafe_Count, unit: 'quán' },
                    { label: 'Tổng đánh giá', value: Number(grid.Total_Reviews).toLocaleString(), unit: '' },
                    { label: 'Ánh sáng NTL', value: Number(grid.NTL_Mean).toFixed(1), unit: '' },
                    { label: 'Mật độ POI', value: Number(grid.POI_Density).toFixed(0), unit: 'điểm' },
                ].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{item.label}</p>
                        <p className="font-bold text-gray-800 mt-0.5">
                            {item.value} <span className="text-xs font-normal text-gray-400">{item.unit}</span>
                        </p>
                    </div>
                ))}
            </div>

            {/* Disclaimer */}
            <div className="px-4 pb-4">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                    ℹ Điểm dựa trên model AI từ dữ liệu quan sát. Cần khảo sát thực địa trước khi quyết định.
                </p>
            </div>
        </div>
    )
}