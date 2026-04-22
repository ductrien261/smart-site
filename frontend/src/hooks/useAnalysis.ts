import { useState, useCallback } from 'react'
import { analysisApi } from '../services/api'

export interface Bbox {
    min_lat: number; max_lat: number
    min_lng: number; max_lng: number
}

export function useAnalysis() {
    const [analysis, setAnalysis] = useState<any>(null)
    const [insights, setInsights] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [bbox, setBbox] = useState<Bbox | null>(null)
    const [resetCount, setResetCount] = useState(0)

    const submitBbox = useCallback(async (b: Bbox, city = 'DaNang') => {
        setBbox(b)
        setLoading(true)
        setError('')
        try {
            const res = await analysisApi.analyzeZone({ ...b, city })
            setAnalysis(res.data.analysis)
            setInsights(res.data.insights)
        } catch {
            setError('Không thể kết nối backend. Đảm bảo FastAPI đang chạy cổng 8000.')
        } finally {
            setLoading(false)
        }
    }, [])

    const reset = useCallback(() => {
        setAnalysis(null); setInsights(null)
        setError(''); setBbox(null)
        setResetCount(c => c + 1)
    }, [])

    return { analysis, insights, loading, error, bbox, submitBbox, reset, resetCount }
}