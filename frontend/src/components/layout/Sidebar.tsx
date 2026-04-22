import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, BarChart3 } from 'lucide-react'

const nav = [
  { to: '/overview', icon: LayoutDashboard, label: 'Tổng quan Vĩ mô' },
  { to: '/map',      icon: Map,             label: 'Bản đồ Thẩm định' },
  { to: '/analysis', icon: BarChart3,        label: 'Cảnh quan Cạnh tranh' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-base font-bold">S</span>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 leading-tight">SmartSite</p>
            <p className="text-xs text-gray-400 tracking-widest uppercase mt-0.5">Investor Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-widest px-3 mb-4 font-medium">
          Báo cáo Phân tích
        </p>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-base transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* AI Confidence */}
      <div className="px-4 pb-3">
        <div className="bg-blue-600 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs text-blue-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-300 inline-block" />
            Độ tin cậy AI
          </p>
          <p className="text-4xl font-bold text-white mt-1.5 mb-1">94.5%</p>
          <p className="text-xs text-blue-200">Dựa trên F1-Score Weighted</p>
        </div>
      </div>

      {/* User */}
      <div className="px-6 py-5 border-t border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
          IV
        </div>
        <div>
          <p className="text-base font-medium text-gray-700">Tài khoản Investor</p>
          <p className="text-xs text-gray-400 mt-0.5">Premium Access</p>
        </div>
      </div>
    </aside>
  )
}