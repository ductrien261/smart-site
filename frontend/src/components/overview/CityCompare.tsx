import type { CityCompare as CityCompareType } from '../../types'

interface Props { data: CityCompareType[] }

const colorMap: Record<string, string> = {
    blue: 'border-blue-400 text-blue-600 bg-blue-50',
    red: 'border-red-400 text-red-600 bg-red-50',
    green: 'border-green-400 text-green-600 bg-green-50',
}

export default function CityCompare({ data }: Props) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-sm font-semibold text-gray-800">Tổng quan vĩ mô thị trường</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">So sánh quy mô, tỷ lệ phủ sóng và mô hình phân bổ không gian giữa 3 thành phố</p>
            <div className="grid grid-cols-3 gap-4">
                {data.map((city) => {
                    const cls = colorMap[city.color] ?? colorMap.blue
                    return (
                        <div key={city.city} className={`rounded-xl border-l-4 p-4 ${cls.split(' ').slice(0, 2).join(' ')} bg-gray-50`}>
                            <div className="flex items-center justify-between mb-3">
                                <p className={`font-bold text-base ${cls.split(' ')[1]}`}>{city.label}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cls.split(' ').slice(1).join(' ')}`}>
                                    {city.pattern}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase">Số quán</p>
                                    <p className="font-bold text-gray-800">{city.cafes.toLocaleString()}+</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase">Phủ sóng</p>
                                    <p className="font-bold text-gray-800">{city.coverage}%</p>
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className="text-[10px] text-gray-400 uppercase">Cạnh tranh khốc liệt</p>
                                <p className="font-bold text-gray-800">{city.fierce_competition}%</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}