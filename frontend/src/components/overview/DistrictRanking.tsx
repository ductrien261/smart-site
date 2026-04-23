import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { DistrictRankItem } from '../../types'

interface Props {
    data: DistrictRankItem[]
}

const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp size={14} className="text-blue-500" />
    if (trend === 'down') return <TrendingDown size={14} className="text-red-400" />
    return <Minus size={14} className="text-gray-400" />
}

export default function DistrictRanking({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 h-full flex items-center justify-center">
                <p className="text-sm text-gray-400">Đang tải dữ liệu…</p>
            </div>
        )
    }

    // Chỉ hiển thị top 5
    const top = data.slice(0, 5)

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 h-full">
            <p className="text-sm font-semibold text-gray-800">Xếp hạng Tiềm năng Quận</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">Các khu vực dẫn đầu chỉ số SmartSite</p>
            <div className="space-y-1">
                <div className="grid grid-cols-3 text-[10px] text-gray-400 uppercase tracking-wider px-1 pb-1 border-b border-gray-100">
                    <span>Quận</span><span className="text-center">Điểm</span><span className="text-right">Xu hướng</span>
                </div>
                {top.map((d) => (
                    <div key={d.name} className="grid grid-cols-3 items-center py-3 px-1 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-base text-gray-700">{d.name}</span>
                        <span className="text-center text-base font-semibold text-blue-600">{d.score}</span>
                        <div className="flex justify-end"><TrendIcon trend={d.trend} /></div>
                    </div>
                ))}
            </div>
        </div>
    )
}