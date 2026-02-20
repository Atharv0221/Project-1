'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDifficultyMastery } from '../../services/analyticsService';

import { useAuthStore } from '../../store/authStore';

const DIFFICULTY_COLORS: Record<string, string> = {
    'EASY': '#10b981',
    'MEDIUM': '#f59e0b',
    'HARD': '#ef4444'
};

export default function DifficultyCompletionGraph({ subjectId, chapterId }: { subjectId?: string, chapterId?: string }) {
    const [data, setData] = useState<any[]>([]);
    const [avgMastery, setAvgMastery] = useState(0);
    const [loading, setLoading] = useState(true);
    const { token } = useAuthStore();

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                const result = await getDifficultyMastery(subjectId, chapterId);
                const chartData = result.map((item: any) => ({
                    name: item.difficulty,
                    value: item.accuracy,
                    color: DIFFICULTY_COLORS[item.difficulty] || '#374151'
                }));
                setData(chartData);

                const avg = result.length > 0 ?
                    Math.round(result.reduce((acc: number, curr: any) => acc + curr.accuracy, 0) / result.length) : 0;
                setAvgMastery(avg);
            } catch (error: any) {
                if (error.response?.status !== 401) {
                    console.error('Failed to fetch difficulty mastery:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId, chapterId, token]);

    if (loading) return <div className="bg-[#151B2D] p-6 rounded-3xl border border-gray-800 h-full animate-pulse" />;

    return (
        <div className="bg-[#151B2D] p-6 rounded-3xl border border-gray-800 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-green-500/10 rounded-full">
                    <Target size={16} className="text-green-400" />
                </div>
                <h3 className="font-bold text-white">Mastery by Difficulty</h3>
            </div>

            <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
                {data.some(d => d.value > 0) ? (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={65}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '10px', opacity: 0.7 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center pt-2">
                                <span className="text-xl font-bold text-white">{avgMastery}%</span>
                                <p className="text-[8px] text-gray-500 uppercase font-bold">AVG</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-gray-500 text-sm">No mastery data yet</div>
                )}
            </div>
        </div>
    );
}
