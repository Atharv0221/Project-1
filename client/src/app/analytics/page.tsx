'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import TimeSpentGraph from '../../components/dashboard/TimeSpentGraph';
import DifficultyCompletionGraph from '../../components/dashboard/DifficultyCompletionGraph';
import { getAccuracyTrend, getRankProgression } from '../../services/analyticsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Target } from 'lucide-react';

export default function AnalyticsPage() {
    const [accuracyData, setAccuracyData] = useState<any[]>([]);
    const [rankData, setRankData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [accuracy, rank] = await Promise.all([
                getAccuracyTrend(),
                getRankProgression()
            ]);
            setAccuracyData(accuracy);
            setRankData(rank);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white">
            <Sidebar />
            <Header />

            <main className="ml-0 lg:ml-64 pt-16 p-8 transition-all">
                <div className="max-w-7xl mx-auto space-y-8">

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Detailed Analytics</h1>
                        <p className="text-gray-400">Track your performance, accuracy, and study habits.</p>
                    </div>

                    {/* Top Row: Time & Difficulty */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-80">
                            <TimeSpentGraph />
                        </div>
                        <div className="h-80">
                            <DifficultyCompletionGraph />
                        </div>
                    </div>

                    {/* Middle Row: Accuracy Trend */}
                    <div className="bg-[#151B2D] rounded-3xl p-8 border border-gray-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                                <Target className="text-cyan-400" size={20} />
                            </div>
                            <h3 className="font-bold text-white">Accuracy Trend (Last 30 Days)</h3>
                        </div>
                        {loading ? (
                            <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={accuracyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2333" />
                                    <XAxis dataKey="date" stroke="#6B7280" />
                                    <YAxis stroke="#6B7280" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A2333', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#9CA3AF' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="accuracy" stroke="#06B6D4" strokeWidth={3} dot={{ fill: '#06B6D4', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Rank Progression */}
                    <div className="bg-[#151B2D] rounded-3xl p-8 border border-gray-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                <TrendingUp className="text-purple-400" size={20} />
                            </div>
                            <h3 className="font-bold text-white">Rank Score Progression</h3>
                        </div>
                        {loading ? (
                            <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={rankData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2333" />
                                    <XAxis dataKey="date" stroke="#6B7280" />
                                    <YAxis stroke="#6B7280" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A2333', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#9CA3AF' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="rankScore" stroke="#A855F7" strokeWidth={3} dot={{ fill: '#A855F7', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
