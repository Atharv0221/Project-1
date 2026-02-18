'use client';

import { Flame, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';

export default function WelcomeBanner({ streak = 0 }) {
    const { user } = useAuthStore();

    return (
        <div className="bg-[#151B2D] rounded-3xl p-8 relative overflow-hidden border border-gray-800 group">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

            <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-[#1A1F33] border border-gray-700 rounded-full px-4 py-1.5 mb-6">
                    <Flame size={14} className="text-pink-500 fill-pink-500" />
                    <span className="text-xs font-bold text-pink-500 uppercase tracking-wider">{streak} Day Streak</span>
                </div>

                <h1 className="text-4xl font-bold text-white mb-8">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{user?.name?.split(' ')[0] || 'Student'}</span>!
                </h1>

                <div className="flex gap-4">
                    <Link
                        href="/subjects"
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
                    >
                        Continue Learning
                        <ArrowRight size={18} />
                    </Link>
                    <button className="px-6 py-3 bg-[#1A2333] hover:bg-[#232D42] text-white font-semibold rounded-xl border border-gray-700 transition-all">
                        View Report
                    </button>
                </div>
            </div>

            {/* Bird Illustration Placeholder/Art */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block">
                <div className="relative w-64 h-64">
                    {/* Abstract Geometric Bird constructed with simple CSS similar to design */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                            <path d="M40 100 L100 40 L160 100 L100 160 Z" fill="none" stroke="url(#grad1)" strokeWidth="2" />
                            <path d="M100 40 L160 80 L180 140 L120 180 L60 140 L40 80 Z" fill="url(#grad2)" opacity="0.8" />
                            <defs>
                                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#22d3ee" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
