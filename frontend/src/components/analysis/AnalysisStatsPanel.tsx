import {
    BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const POI_COLORS: Record<string, string> = {
    Food: '#0f766e', Commercial: '#0284c7', Leisure: '#7c3aed',
    Transport: '#0891b2', Office: '#1d4ed8', Residential: '#ca8a04',
    Education: '#16a34a', Other: '#94a3b8',
}

export default function AnalysisStatsPanel({ analysis }: { analysis: any }) {
    if (!analysis) return (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 h-full flex flex-col items-center justify-center gap-3 text-center">
            <span className="text-4xl">📊</span>
            <p className="text-gray-400 text-sm">Vẽ và xác nhận vùng trên bản đồ để xem thống kê.</p>
        </div>
    )

    const { cafe_stats, poi_breakdown, total_poi, competition_level, dominant_poi_category } = analysis

    const poiRows = Object.entries(poi_breakdown as Record<string, number>)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    const radarRows = [
        { subject: 'Rating', value: cafe_stats.avg_rating ? Math.round((cafe_stats.avg_rating / 5) * 100) : 0 },
        { subject: 'Sentiment', value: cafe_stats.avg_sentiment ? Math.round(cafe_stats.avg_sentiment * 100) : 0 },
        { subject: 'Top venues', value: cafe_stats.total_cafes ? Math.round((cafe_stats.high_rated_count / cafe_stats.total_cafes) * 100) : 0 },
        { subject: 'Review density', value: cafe_stats.review_density ? Math.min(100, Math.round((cafe_stats.review_density / 500) * 100)) : 0 },
        { subject: 'Avg reviews', value: cafe_stats.avg_reviews ? Math.min(100, Math.round((cafe_stats.avg_reviews / 300) * 100)) : 0 },
    ]

    const compColor: Record<string, string> = {
        no_data: '#94a3b8', low: '#16a34a', moderate: '#ca8a04', high: '#ea580c', very_high: '#dc2626'
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
            {/* KPIs */}
            <div>
                <p className="text-sm font-semibold text-gray-800 mb-3">☕ Tín hiệu quán cà phê</p>
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Tổng số quán', value: cafe_stats.total_cafes },
                        { label: 'Đánh giá TB', value: cafe_stats.avg_rating ? `${cafe_stats.avg_rating.toFixed(2)}★` : '—' },
                        { label: 'Quán ≥4.5★', value: cafe_stats.high_rated_count },
                        { label: 'Cảm xúc TB', value: cafe_stats.avg_sentiment ? cafe_stats.avg_sentiment.toFixed(3) : '—' },
                    ].map(k => (
                        <div key={k.label} className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-400 mb-1">{k.label}</p>
                            <p className="font-bold text-gray-800">{k.value}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Mức cạnh tranh:</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                        style={{ background: compColor[competition_level] ?? '#94a3b8' }}>
                        {competition_level.replace('_', ' ')}
                    </span>
                </div>
            </div>

            {/* Radar */}
            <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Tín hiệu chất lượng chuẩn hóa</p>
                <p className="text-xs text-gray-400 mb-3">Mỗi trục chuẩn hóa 0–100. Không phải điểm số tuyệt đối.</p>
                <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarRows}>
                        <PolarGrid stroke="rgba(0,0,0,0.08)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Radar dataKey="value" stroke="#0f766e" fill="#0f766e" fillOpacity={0.2}
                            dot={{ r: 3, fill: '#0f766e' }} />
                        <Tooltip formatter={(v: any) => [`${v}/100`, 'Chuẩn hóa']} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* POI Bar */}
            <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">📍 Phân bổ POI ({total_poi} điểm)</p>
                <p className="text-xs text-gray-400 mb-1">Danh mục chủ đạo: <strong>{dominant_poi_category}</strong></p>
                {poiRows.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={poiRows} layout="vertical" margin={{ left: 16, right: 24 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.06)" />
                            <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <Tooltip formatter={(v: any) => [v, 'Số lượng']} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
                                {poiRows.map(r => <Cell key={r.name} fill={POI_COLORS[r.name] ?? '#94a3b8'} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-sm text-gray-400">Không có POI trong vùng này.</p>
                )}
            </div>
        </div>
    )
}