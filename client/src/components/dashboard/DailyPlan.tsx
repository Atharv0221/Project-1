'use client';

import { TrendingDown, Zap } from 'lucide-react';

export default function DailyPlan() {
    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-lg font-bold text-white">Adaptive Daily Plan</h3>
                </div>
                <span className="text-xs text-gray-500 font-medium">Suggested by AI Mentor</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Weak Topic Card */}
                <div className="bg-[#151B2D] p-5 rounded-2xl border border-gray-800 hover:border-gray-700 transition group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                            <TrendingDown size={24} />
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-bold text-white">45m</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">EST. TIME</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1 block">WEAK TOPIC</span>
                        <h4 className="text-lg font-bold text-white mb-1">Organic Chemistry</h4>
                        <p className="text-sm text-gray-400">Focus on: Carbon Bonds</p>
                    </div>
                </div>

                {/* Revision Card */}
                <div className="bg-[#151B2D] p-5 rounded-2xl border border-gray-800 hover:border-gray-700 transition group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300">
                            <Zap size={24} />
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-bold text-white">20m</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">EST. TIME</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">REVISION</span>
                        <h4 className="text-lg font-bold text-white mb-1">Newtonian Laws</h4>
                        <p className="text-sm text-gray-400">Ready for advanced MCQ</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
