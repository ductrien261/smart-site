export default function AnalysisInsightPanel({
    insights, loading, error
}: { insights: any; loading: boolean; error: string }) {

    if (loading) return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-full flex flex-col items-center justify-center gap-4">
            <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                    <span key={i} className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
            </div>
            <p className="text-sm text-gray-500">Đang phân tích khu vực…</p>
        </div>
    )

    if (error) return (
        <div className="bg-white rounded-2xl border border-red-100 p-6">
            <p className="font-semibold text-red-600 mb-2">⚠ Phân tích thất bại</p>
            <p className="text-sm text-gray-500">{error}</p>
        </div>
    )

    if (!insights) return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">💡</span>
                <div>
                    <p className="font-semibold text-gray-800">Phân tích vị trí thông minh</p>
                    <p className="text-xs text-gray-400">Vẽ vùng trên bản đồ để bắt đầu</p>
                </div>
            </div>
            <ol className="space-y-3 text-sm text-gray-600 flex-1">
                {[
                    ['Nhấn', 'Vẽ vùng', 'trên bản đồ'],
                    ['Nhấn hai góc để', 'xác định khu vực', ''],
                    ['Nhấn', 'Phân tích vùng', 'để gửi yêu cầu'],
                ].map(([a, b, c], i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        <span>{a} <strong>{b}</strong> {c}</span>
                    </li>
                ))}
            </ol>
            <p className="text-xs text-gray-400 mt-4 border-t border-gray-100 pt-4">
                Kết quả chỉ phản ánh <em>tín hiệu quan sát</em>. Không phải dự báo doanh thu hay đảm bảo địa điểm.
            </p>
        </div>
    )

    const { headline, bullets, verdict, competitionMeta } = insights

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🗺</span>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm">Phân tích khu vực</p>
                        <p className="text-xs text-gray-400">Tóm tắt tín hiệu dựa trên quy tắc</p>
                    </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium border"
                    style={{ background: `${competitionMeta.color}15`, color: competitionMeta.color, borderColor: `${competitionMeta.color}30` }}>
                    {competitionMeta.emoji} {competitionMeta.label}
                </span>
            </div>

            {/* Headline */}
            <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-800 leading-relaxed">{headline}</p>
            </div>

            {/* Bullets */}
            <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Tín hiệu quan sát</p>
                <ul className="space-y-1.5">
                    {(bullets as string[]).map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                            <span className="text-blue-400 mt-0.5">•</span>{b}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Verdict */}
            <div className="bg-teal-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-teal-700 mb-1.5 uppercase tracking-wide">Nhận định</p>
                <p className="text-sm text-teal-800 leading-relaxed">{verdict}</p>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
                ℹ Nhận định từ quy tắc tóm tắt dữ liệu quan sát. Không dùng ML hay dự báo doanh thu.
            </p>
        </div>
    )
}