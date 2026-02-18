'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTimeSpentAnalytics } from '../../services/analyticsService';

import { useAuthStore } from '../../store/authStore';

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#f97316'];

export default function TimeSpentGraph({ subjectId }: { subjectId?: string }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuthStore();

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                const result = await getTimeSpentAnalytics(subjectId);
                // Map API result to chart format
                const chartData = result.map((item: any, index: number) => ({
                    name: item.label,
                    minutes: item.value,
                    color: COLORS[index % COLORS.length]
                }));
                setData(chartData);
            } catch (error) {
                console.error('Failed to fetch time analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId]);

    if (loading) return <div className="bg-[#151B2D] p-6 rounded-3xl border border-gray-800 h-full animate-pulse" />;

    return (
        <div className="bg-[#151B2D] p-6 rounded-3xl border border-gray-800 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-blue-500/10 rounded-full">
                    <Clock size={16} className="text-blue-400" />
                </div>
                <h3 className="font-bold text-white">
                    {subjectId ? 'Chapter-wise Study Time' : 'Time Spent (Subject-wise)'}
                </h3>
            </div>

            <div className="flex-1 min-h-[200px]">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#6b7280', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
                        No study data yet
                    </div>
                )}
            </div>
        </div>
    );
}
