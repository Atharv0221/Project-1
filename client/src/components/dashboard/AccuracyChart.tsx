'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Crosshair } from 'lucide-react';

const data = [
    { name: 'Quiz 1', accuracy: 65 },
    { name: 'Quiz 2', accuracy: 70 },
    { name: 'Quiz 3', accuracy: 68 },
    { name: 'Quiz 4', accuracy: 75 },
    { name: 'Quiz 5', accuracy: 82 },
    { name: 'Quiz 6', accuracy: 88 },
];

export default function AccuracyChart() {
    return (
        <div className="bg-[#151B2D] p-6 rounded-3xl border border-gray-800 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-purple-500/10 rounded-full">
                    <Crosshair size={16} className="text-purple-400" />
                </div>
                <h3 className="font-bold text-white">Accuracy Trend</h3>
            </div>

            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            hide
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                            cursor={{ stroke: '#4b5563', strokeWidth: 1 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, fill: '#fff' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
