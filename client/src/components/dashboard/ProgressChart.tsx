'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
    { day: 'MON', value: 4 },
    { day: 'TUE', value: 6 },
    { day: 'WED', value: 8 }, // Peak
    { day: 'THU', value: 5 },
    { day: 'FRI', value: 9 },
    { day: 'SAT', value: 3 },
    { day: 'SUN', value: 2 },
];

export default function ProgressChart() {
    return (
        <div className="bg-[#151B2D] p-6 rounded-3xl border border-gray-800 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white">My Progress</h3>
                <div className="flex bg-[#0B1120] rounded-lg p-1 border border-gray-800">
                    <button className="px-3 py-1 bg-cyan-500 text-white text-[10px] font-bold rounded uppercase">Weekly</button>
                    <button className="px-3 py-1 text-gray-500 text-[10px] font-bold rounded hover:text-white uppercase">Monthly</button>
                </div>
            </div>

            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 'bold' }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.value >= 8 ? '#22d3ee' : (entry.value >= 5 ? '#a855f7' : '#374151')}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
