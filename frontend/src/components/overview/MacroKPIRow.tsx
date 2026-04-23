import { Target, Smile, Zap, BarChart3 } from 'lucide-react'
import type { MacroStats } from '../../types'

interface Props { data: MacroStats }

export default function MacroKPIRow({ data }: Props) {
    const items = [
        {
            label: 'QUY MÔ THỊ TRƯỜNG',
            value: data.total_cafes.toLocaleString(),
            sub: `Phủ sóng ${data.coverage_pct}%`,
            subColor: 'text-blue-400',
            icon: <Target size={28} className="text-gray-200" />,
        },
        {
            label: 'HOTSPOTS LOẠI A+',
            value: String(data.hotspot_a_plus),
            sub: `Trong ${data.total_reviews.toLocaleString()} đánh giá`,
            subColor: 'text-blue-400',
            icon: <BarChart3 size={28} className="text-gray-200" />,
        },
        {
            label: 'CHỈ SỐ SENTIMENT',
            value: `${data.sentiment}/5.0`,
            sub: `Rating TB: ${data.avg_rating}★`,
            subColor: data.sentiment >= 3.5 ? 'text-green-500' : 'text-orange-400',
            icon: <Smile size={28} className="text-gray-200" />,
        },
        {
            label: 'ĐỘ SẦM UẤT (NTL)',
            value: data.ntl_level,
            sub: null,
            subColor: '',
            icon: <Zap size={28} className="text-gray-200" />,
            isNtl: true,
            ntlValue: data.ntl_value,
        },
    ]

    return (
        <div className="grid grid-cols-4 gap-4 mb-6">
            {items.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 flex justify-between items-start">
                    <div>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">{item.label}</p>
                        <p className={`mt-2 font-bold text-gray-900 ${item.isNtl ? 'text-3xl' : 'text-4xl'}`}>
                            {item.value}
                        </p>
                        {item.isNtl && (
                            <div className="mt-2 w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${Math.min((item.ntlValue! / 50) * 100, 100)}%` }}
                                />
                            </div>
                        )}
                        {item.sub && (
                            <p className={`text-xs mt-1.5 ${item.subColor}`}>
                                {item.sub}
                            </p>
                        )}
                    </div>
                    <div className="opacity-20">{item.icon}</div>
                </div>
            ))}
        </div>
    )
}