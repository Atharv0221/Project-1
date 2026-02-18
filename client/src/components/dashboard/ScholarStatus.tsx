'use client';

import { Star, Trophy, Zap, Crown } from 'lucide-react';

interface ScholarStatusProps {
    xp: number;
    rank: number;
    streak: number;
    levelTitle: string;
    nextLevelXp: number;
}

export default function ScholarStatus({
    xp = 1240,
    rank = 14,
    streak = 5,
    levelTitle = 'Gold Scholar',
    nextLevelXp = 3000
}: Partial<ScholarStatusProps>) {

    const progress = Math.min((xp / nextLevelXp) * 100, 100);

    return (
        <div className="bg-[#151B2D] p-6 rounded-3xl border border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-yellow-500/10 rounded-full">
                        <Crown size={16} className="text-yellow-500 fill-yellow-500" />
                    </div>
                    <h3 className="font-bold text-white">Scholar Status</h3>
                </div>
                <div className="flex items-center gap-1 text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg">
                    <Zap size={14} className="fill-orange-400" />
                    <span className="text-xs font-bold">{streak}x Streak</span>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">CURRENT LEVEL</span>
                        <h4 className="text-xl font-bold text-white leading-none mt-1">{levelTitle}</h4>
                    </div>
                    <div className="text-right">
                        <span className="text-xl font-bold text-cyan-400">{Math.round(progress)}%</span>
                        <span className="block text-[10px] text-gray-500 font-bold uppercase">TO NEXT LEVEL</span>
                    </div>
                </div>
                <div className="h-2 bg-[#0B1120] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-center text-[10px] text-gray-500 mt-2 font-medium">{xp} / {nextLevelXp} XP</p>
            </div>

            <div className="flex items-center justify-between bg-[#0B1120] p-3 rounded-xl border border-gray-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-900/20 text-cyan-400 flex items-center justify-center border border-cyan-800">
                        <Trophy size={14} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">CLASS RANK</p>
                        <p className="text-sm font-bold text-white">#{rank}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-900/20 text-purple-400 flex items-center justify-center border border-purple-800">
                        <Star size={14} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">TOTAL XP</p>
                        <p className="text-sm font-bold text-white">{xp}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
