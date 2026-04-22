import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const DATA = [
    { city: 'Hà Nội', mat_do: 1050, tang_truong: 8 },
    { city: 'Đà Nẵng', mat_do: 520, tang_truong: 22 },
    { city: 'TP.HCM', mat_do: 1800, tang_truong: 6 },
]

export default function RegionLinkage() {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-sm font-semibold text-gray-800">Đánh giá Tiềm năng Liên kết vùng</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">So sánh mật độ F&B và tiềm năng tăng trưởng</p>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={DATA} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="city" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Tooltip />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <Bar yAxisId="left" dataKey="mat_do" name="Mật độ quán" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="tang_truong" name="Tốc độ Tăng trưởng (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}