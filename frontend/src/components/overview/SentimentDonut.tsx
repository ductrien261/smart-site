import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const DATA = [
    { name: 'Tích cực', value: 65, color: '#22c55e' },
    { name: 'Trung lập', value: 25, color: '#d1d5db' },
    { name: 'Tiêu cực', value: 10, color: '#ef4444' },
]

export default function SentimentDonut() {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 h-full flex flex-col">
            <p className="text-sm font-semibold text-gray-800">Phân tích Cảm xúc KH</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-2">Dựa trên dữ liệu Google Reviews</p>
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-44 h-44">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" startAngle={90} endAngle={-270}>
                                {DATA.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => [`${value}%`, "Tên cột"]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold text-gray-800">65%</p>
                        <p className="text-[10px] text-gray-400">TÍCH CỰC</p>
                    </div>
                </div>
                <div className="flex gap-4 mt-3">
                    {DATA.map((d) => (
                        <div key={d.name} className="text-center">
                            <p className="text-xs font-semibold text-gray-700">{d.value}%</p>
                            <p className="text-[10px] text-gray-400">{d.name.toUpperCase()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}