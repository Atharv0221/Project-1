'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Clock, Target, ArrowRight, Home, RefreshCw, BarChart3, Star } from 'lucide-react';
import { useAuthStore } from '../../../../store/authStore';

export default function ResultPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuthStore();

    const [resultData, setResultData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const dataStr = searchParams.get('data');
        if (dataStr) {
            try {
                setResultData(JSON.parse(dataStr));
                setLoading(false);
            } catch (e) {
                console.error("Failed to parse result data", e);
                setLoading(false);
            }
        } else {
            // If no data in query, maybe fetch from API?
            // For now just show loading or redirect
            setLoading(false);
        }
    }, [searchParams]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (!resultData) {
        return (
            <div className="min-h-screen bg-[#0B1120] text-white flex flex-col items-center justify-center p-8">
                <h1 className="text-2xl font-bold mb-4">No Result Found</h1>
                <Link href="/dashboard" className="px-6 py-3 bg-cyan-600 rounded-xl font-bold">Return to Dashboard</Link>
            </div>
        );
    }

    const { score, xpEarned, rankScoreEarned, newStatus, message, nextLevelUnlock } = resultData;

    return (
        <div className="min-h-screen bg-[#0B1120] text-white p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-4xl w-full">
                {/* Main Card */}
                <div className="bg-[#151B2D] rounded-[2.5rem] border border-gray-800 shadow-2xl shadow-cyan-500/10 overflow-hidden relative">

                    {/* Decorative background elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

                    <div className="p-8 md:p-12 relative z-10">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-3xl rotate-12 mb-6 shadow-xl shadow-orange-500/20">
                                <Trophy size={40} className="text-white -rotate-12" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4">Quiz Completed!</h1>
                            <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
                                {message}
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {/* Score Card */}
                            <div className="bg-[#1A2333] border border-gray-700/50 p-6 rounded-3xl text-center transform hover:scale-105 transition-all duration-300">
                                <div className="flex justify-center mb-3 text-cyan-400">
                                    <Target size={24} />
                                </div>
                                <div className="text-3xl font-black text-white mb-1">{Math.round(score)}%</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Accuracy Score</div>
                            </div>

                            {/* XP Card */}
                            <div className="bg-[#1A2333] border border-gray-700/50 p-6 rounded-3xl text-center transform hover:scale-105 transition-all duration-300">
                                <div className="flex justify-center mb-3 text-purple-400">
                                    <Star size={24} />
                                </div>
                                <div className="text-3xl font-black text-white mb-1">+{xpEarned}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">XP Earned</div>
                            </div>

                            {/* Potential Rank Upgrade */}
                            <div className="bg-[#1A2333] border border-gray-700/50 p-6 rounded-3xl text-center transform hover:scale-105 transition-all duration-300">
                                <div className="flex justify-center mb-3 text-pink-400">
                                    <BarChart3 size={24} />
                                </div>
                                <div className="text-3xl font-black text-white mb-1">+{Math.round(rankScoreEarned)}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Rank Points</div>
                            </div>
                        </div>

                        {/* Status Update / Next Steps Section */}
                        <div className="bg-gradient-to-br from-[#1A2333] to-[#0B1120] border border-gray-700 rounded-[2rem] p-8 mb-12 relative overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold mb-2">Scholar Status Updated</h3>
                                    <p className="text-gray-400 mb-4">Your dedication is paying off! You are now a:</p>
                                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
                                        <div className="w-4 h-4 rounded-full bg-cyan-500 animate-pulse"></div>
                                        <span className="text-cyan-400 font-black text-xl tracking-wide">{newStatus}</span>
                                    </div>
                                </div>

                                {nextLevelUnlock && (
                                    <div className="w-full md:w-auto">
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-2">NEXT MILESTONE</span>
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-cyan-500 rounded-xl">
                                                    <RefreshCw size={24} className="text-black" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{nextLevelUnlock} Level</div>
                                                    <div className="text-xs text-gray-500">Ready to unlock</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <Link
                                href="/dashboard"
                                className="flex-1 flex items-center justify-center gap-3 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold rounded-2xl transition-all active:scale-95"
                            >
                                <Home size={20} />
                                Back to Dashboard
                            </Link>
                            <Link
                                href="/subjects"
                                className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/20 active:scale-95"
                            >
                                Continue Learning
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Secondary advice or quote */}
                <div className="mt-8 text-center text-gray-500 text-sm italic">
                    "Every master was once a beginner. Keep pushing your limits!"
                </div>
            </div>
        </div>
    );
}
