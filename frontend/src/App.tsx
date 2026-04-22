import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import OverviewPage from './pages/OverviewPage'
import MapPage from './pages/MapPage'
import AnalysisPage from './pages/AnalysisPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview"  element={<OverviewPage />} />
            <Route path="/map"       element={<MapPage />} />
            <Route path="/analysis"  element={<AnalysisPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}