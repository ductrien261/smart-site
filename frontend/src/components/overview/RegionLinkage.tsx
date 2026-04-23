import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { RegionLinkageItem } from '../../types'

interface Props {
    data: RegionLinkageItem[]
}

export default function RegionLinkage({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center justify-center" style={{ minHeight: 280 }}>
                <p className="text-sm text-gray-400">Đang tải dữ liệu liên kết vùng…</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-sm font-semibold text-gray-800">Đánh giá Tiềm năng Liên kết vùng</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">So sánh mật độ F&B và phủ sóng thị trường</p>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="city" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Tooltip />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <Bar yAxisId="left" dataKey="mat_do" name="Tổng quán cà phê" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="coverage" name="Tỷ lệ phủ sóng (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}