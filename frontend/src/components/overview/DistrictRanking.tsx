import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const DISTRICTS = [
    { name: 'Hải Châu', score: 95, trend: 'up' },
    { name: 'Thanh Khê', score: 88, trend: 'up' },
    { name: 'Sơn Trà', score: 82, trend: 'flat' },
    { name: 'Ngũ Hành Sơn', score: 75, trend: 'up' },
    { name: 'Cẩm Lệ', score: 68, trend: 'down' },
]

const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp size={14} className="text-blue-500" />
    if (trend === 'down') return <TrendingDown size={14} className="text-red-400" />
    return <Minus size={14} className="text-gray-400" />
}

export default function DistrictRanking() {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 h-full">
            <p className="text-sm font-semibold text-gray-800">Xếp hạng Tiềm năng Quận</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">Các khu vực dẫn đầu chỉ số SmartSite</p>
            <div className="space-y-1">
                <div className="grid grid-cols-3 text-[10px] text-gray-400 uppercase tracking-wider px-1 pb-1 border-b border-gray-100">
                    <span>Quận</span><span className="text-center">Điểm</span><span className="text-right">Xu hướng</span>
                </div>
                {DISTRICTS.map((d, i) => (
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