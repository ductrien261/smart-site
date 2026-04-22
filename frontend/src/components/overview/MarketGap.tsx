import type { MarketGap as MarketGapType } from '../../types'

interface Props { data: MarketGapType[] }

const CITY_LABEL: Record<string, string> = {
    DaNang: 'Đà Nẵng', HCM: 'TP.HCM', HaNoi: 'Hà Nội'
}

export default function MarketGap({ data }: Props) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-sm font-semibold text-gray-800">Khoảng trống thị trường</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">Ô lưới có lực cầu (Demand Index &gt; 0) nhưng chưa có quán cà phê</p>
            <div className="grid grid-cols-3 gap-4">
                {data.map((d) => (
                    <div key={d.city} className="border border-gray-100 rounded-xl p-4">
                        <p className="font-semibold text-gray-700 mb-3">{CITY_LABEL[d.city] ?? d.city}</p>
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tổng ô lưới</span>
                                <span className="font-medium text-gray-700">{d.total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Ô có quán</span>
                                <span className="font-medium text-gray-700">{d.with_cafe.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-100 pt-1.5">
                                <span className="text-orange-500 font-medium">Ô trống tiềm năng</span>
                                <span className="font-bold text-orange-500">{d.potential.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 italic">
                * "Ô trống tiềm năng" = ô có hoạt động kinh tế (NTL, POI) nhưng chưa có quán — cần xác minh thực địa trước khi kết luận
            </p>
        </div>
    )
}