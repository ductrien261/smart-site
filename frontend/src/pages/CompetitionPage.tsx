import { useEffect, useState } from 'react'
import { competitionApi } from '../services/api'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'

const CITY_OPTIONS = [
    { value: 'DaNang', label: 'Đà Nẵng' },
    { value: 'HCM', label: 'TP.HCM' },
    { value: 'HaNoi', label: 'Hà Nội' },
]

const CLASS_COLORS = ['#ef4444', '#facc15', '#16a34a']
const CLASS_LABELS = ['Tiềm năng thấp', 'Tiềm năng TB', 'Tiềm năng cao']

const SCORE_COLORS = ['#ef4444', '#fb923c', '#facc15', '#4ade80', '#16a34a']

export default function CompetitionPage() {
    const [city, setCity] = useState('DaNang')
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [tab, setTab] = useState<'competitive' | 'opportunity'>('competitive')

    useEffect(() => {
        setLoading(true)
        competitionApi.getOverview(city)
            .then(r => setData(r.data))
            .finally(() => setLoading(false))
    }, [city])

    const summary = data?.summary
    const districtStats = data?.district_stats ?? []
    const cafeHist = data?.cafe_histogram ?? []
    const scoreHist = data?.score_histogram ?? []
    const topCompetitive = data?.top_competitive ?? []
    const topOpportunity = data?.top_opportunity ?? []

    const classPieData = summary
        ? Object.entries(summary.class_dist as Record<string, number>).map(([k, v]) => ({
            name: CLASS_LABELS[Number(k)] ?? `Class ${k}`,
            value: v,
            color: CLASS_COLORS[Number(k)],
        }))
        : []

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <div className="px-8 pt-7 pb-5 bg-white border-b border-gray-100">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Cảnh quan Cạnh tranh</h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Phân tích mật độ thị trường · phân bổ tiềm năng · cơ hội trống
                        </p>
                    </div>
                    <select value={city} onChange={e => setCity(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {CITY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center flex-1">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            ) : (
                <div className="px-8 py-6 space-y-5">

                    {/* KPI row */}
                    {summary && (
                        <div className="grid grid-cols-5 gap-4">
                            {[
                                { label: 'Tổng ô lưới', value: summary.total_grids.toLocaleString() },
                                { label: 'Tổng quán', value: summary.total_cafes.toLocaleString() },
                                { label: 'Ô có quán', value: summary.grids_w_cafe.toLocaleString() },
                                { label: 'Tỷ lệ phủ sóng', value: `${summary.coverage_pct}%` },
                                { label: 'Quán max / ô', value: summary.cafe_max },
                            ].map(k => (
                                <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">{k.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{k.value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Charts row 1 */}
                    <div className="grid grid-cols-3 gap-4">

                        {/* Phân bổ Score_Class */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                            <p className="text-sm font-semibold text-gray-800 mb-1">Phân bổ Tiềm năng</p>
                            <p className="text-xs text-gray-400 mb-4">Theo phân lớp model AI</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={classPieData} cx="50%" cy="50%"
                                        innerRadius={50} outerRadius={75}
                                        dataKey="value" nameKey="name"
                                        startAngle={90} endAngle={-270}>
                                        {classPieData.map((d, i) => <Cell key={i} fill={d.color} strokeWidth={0} />)}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => v.toLocaleString()} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Histogram mật độ quán */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                            <p className="text-sm font-semibold text-gray-800 mb-1">Phân bổ Mật độ Quán</p>
                            <p className="text-xs text-gray-400 mb-4">Số quán / ô lưới</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={cafeHist} margin={{ left: -10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                                    <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Số ô']} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Histogram score */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                            <p className="text-sm font-semibold text-gray-800 mb-1">Phân bổ Điểm Tiềm năng</p>
                            <p className="text-xs text-gray-400 mb-4">Score từ model AI</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={scoreHist} margin={{ left: -10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                                    <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Số ô']} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {scoreHist.map((_: any, i: number) => (
                                            <Cell key={i} fill={SCORE_COLORS[i] ?? '#94a3b8'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* District table */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <p className="text-sm font-semibold text-gray-800 mb-4">Thống kê theo Quận / Huyện</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left">
                                        {['Quận/Huyện', 'Tổng ô', 'Tổng quán', 'Phủ sóng', 'Điểm TB', 'Hotspot A+'].map(h => (
                                            <th key={h} className="pb-3 pr-6 text-xs text-gray-400 uppercase tracking-wide font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {districtStats.slice(0, 15).map((d: any) => (
                                        <tr key={d.District} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 pr-6 font-medium text-gray-800">{d.District}</td>
                                            <td className="py-3 pr-6 text-gray-600">{d.total_grids.toLocaleString()}</td>
                                            <td className="py-3 pr-6 text-gray-600">{d.total_cafes}</td>
                                            <td className="py-3 pr-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 rounded-full"
                                                            style={{ width: `${Math.min(d.coverage, 100)}%` }} />
                                                    </div>
                                                    <span className="text-gray-600">{d.coverage}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-6">
                                                <span className={`font-semibold ${d.avg_score >= 85 ? 'text-green-600' :
                                                    d.avg_score >= 70 ? 'text-yellow-600' : 'text-red-500'
                                                    }`}>{d.avg_score}</span>
                                            </td>
                                            <td className="py-3 pr-6">
                                                <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                                    {d.hotspot_count}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top grids tabs */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-semibold text-gray-800">
                                {tab === 'competitive' ? '🔴 Ô cạnh tranh cao nhất' : '🟢 Ô cơ hội tiềm năng'}
                            </p>
                            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                                {[
                                    { key: 'competitive', label: '🔴 Cạnh tranh cao' },
                                    { key: 'opportunity', label: '🟢 Cơ hội trống' },
                                ].map(t => (
                                    <button key={t.key}
                                        onClick={() => setTab(t.key as typeof tab)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.key
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-3">
                            {(tab === 'competitive' ? topCompetitive : topOpportunity).map((g: any, i: number) => (
                                <div key={g.Grid_ID}
                                    className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-400">#{i + 1}</span>
                                        {tab === 'competitive'
                                            ? <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{g.Cafe_Count} quán</span>
                                            : <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Class {g.Score_Class}</span>
                                        }
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm">{g.Grid_ID}</p>
                                    <p className="text-xs text-gray-400 mb-3">{g.District}</p>
                                    <div className="space-y-1 text-xs text-gray-500">
                                        <div className="flex justify-between">
                                            <span>Score</span>
                                            <span className="font-semibold text-gray-700">{Number(g.Score).toFixed(1)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>NTL</span>
                                            <span className="font-semibold text-gray-700">{Number(g.NTL_Mean).toFixed(1)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>POI</span>
                                            <span className="font-semibold text-gray-700">{Number(g.POI_Density).toFixed(0)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}