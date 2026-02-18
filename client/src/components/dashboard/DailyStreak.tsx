'use client';

import { Flame } from 'lucide-react';

export default function DailyStreak({ streak = 5 }) {
    const badges = [
        { days: 7, label: '7 Days', achieved: streak >= 7 },
        { days: 15, label: '15 Days', achieved: streak >= 15 },
        { days: 30, label: '30 Days', achieved: streak >= 30 },
    ];

    return (
        <div className="bg-[#151B2D] p-6 rounded-3xl border border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-500/10 rounded-full">
                        <Flame size={16} className="text-orange-500 fill-orange-500" />
                    </div>
                    <h3 className="font-bold text-white">Daily Streak</h3>
                </div>
                <span className="text-2xl font-bold text-white">{streak} 🔥</span>
            </div>

            <div className="flex justify-between gap-2">
                {badges.map((badge) => (
                    <div
                        key={badge.days}
                        className={`flex-1 py-3 px-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${badge.achieved
                                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                                : 'bg-[#0B1120] border-gray-800 text-gray-600 opacity-50'
                            }`}
                    >
                        <span className="text-xs font-bold mb-1">{badge.label}</span>
                        <div className={`w-2 h-2 rounded-full ${badge.achieved ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
