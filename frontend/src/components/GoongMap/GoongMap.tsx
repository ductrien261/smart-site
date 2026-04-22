import { useEffect, useRef } from 'react'

declare global {
    interface Window { goongjs: any }
}

const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY || ''
const GOONG_STYLE_URL = 'https://tiles.goong.io/assets/goong_map_web.json'

function getGoongJS() {
    const gjs = window.goongjs
    if (!gjs || !GOONG_MAPTILES_KEY) return null
    if (!gjs._accessTokenSet) {
        gjs.accessToken = GOONG_MAPTILES_KEY
        gjs._accessTokenSet = true
    }
    return gjs
}

interface Props {
    center?: [number, number]
    zoom?: number
    className?: string
    onMapReady?: (map: any) => void
    onMapClick?: (e: any) => void
}

export default function GoongMap({
    center = [108.2022, 16.0544],
    zoom = 12,
    className = '',
    onMapReady,
    onMapClick,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const onReadyRef = useRef(onMapReady)
    const onClickRef = useRef(onMapClick)
    onReadyRef.current = onMapReady
    onClickRef.current = onMapClick

    useEffect(() => {
        const goongjs = getGoongJS()
        if (!goongjs || !containerRef.current) return

        const map = new goongjs.Map({
            container: containerRef.current,
            style: GOONG_STYLE_URL,
            center, zoom,
            preserveDrawingBuffer: true,
        })
        map.addControl(new goongjs.NavigationControl(), 'top-right')
        map.on('load', () => onReadyRef.current?.(map))
        map.on('click', (e: any) => onClickRef.current?.(e))

        return () => map.remove()
    }, [])

    if (!GOONG_MAPTILES_KEY) {
        return (
            <div className={`flex flex-col items-center justify-center h-full bg-gray-50 rounded-2xl gap-3 p-6 text-center ${className}`}>
                <span className="text-4xl">🗺️</span>
                <p className="font-semibold text-gray-800">Chưa cấu hình Goong Maps API Key</p>
                <code className="bg-gray-800 text-blue-300 px-4 py-2 rounded-lg text-sm">
                    VITE_GOONG_MAPTILES_KEY=your_key
                </code>
                <p className="text-sm text-gray-500">
                    Đăng ký miễn phí tại{' '}
                    <a href="https://account.goong.io" target="_blank" rel="noreferrer" className="text-teal-600 font-medium">
                        account.goong.io
                    </a>
                </p>
            </div>
        )
    }

    return <div ref={containerRef} className={`w-full h-full ${className}`} />
}