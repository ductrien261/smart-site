const STRATEGIES = [
    {
        grade: 'A+',
        title: 'Vùng Sôi động',
        desc: 'Phù hợp Chuỗi F&B lớn. Ưu tiên Traffic cao, chấp nhận giá thuê đất.',
        color: 'bg-blue-600',
    },
    {
        grade: 'B+',
        title: 'Đại dương Xanh',
        desc: 'Phù hợp Cafe Đặc sản. Tìm kiếm khách hàng trung thành, ít cạnh tranh.',
        color: 'bg-green-600',
    },
]

export default function StrategyCards() {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 h-full">
            <p className="text-sm font-semibold text-gray-800">Chiến lược Đề xuất</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">Dựa trên kết quả phân lớp của AI</p>
            <div className="space-y-3">
                {STRATEGIES.map((s) => (
                    <div key={s.grade} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className={`${s.color} text-white text-xs font-bold rounded-lg w-9 h-9 flex items-center justify-center shrink-0`}>
                            {s.grade}
                        </div>
                        <div>
                            <p className="text-base font-semibold text-gray-800">{s.title}</p>
                            <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}