'use client';

import { Star, Trophy, Book, Swords, Users } from 'lucide-react';

export default function ScholarStatus() {
    return (
        <div className="bg-[#151B2D] p-6 rounded-3xl border border-gray-800">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-yellow-500/10 rounded-full">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                </div>
                <h3 className="font-bold text-white">Scholar Status</h3>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">CURRENT RANK</span>
                        <h4 className="text-2xl font-bold text-white leading-none mt-1">Gold Scholar XIV</h4>
                    </div>
                    <div className="text-right">
                        <span className="text-xl font-bold text-cyan-400">72%</span>
                        <span className="block text-[10px] text-gray-500 font-bold uppercase">Progress</span>
                    </div>
                </div>
                <div className="h-2 bg-[#0B1120] rounded-full overflow-hidden">
                    <div className="h-full w-[72%] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                </div>
                <p className="text-center text-[10px] text-gray-500 mt-2 font-medium">1,240 / 2,000 XP TO LEVEL 15</p>
            </div>

            <div>
                <h5 className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4">RECENT BADGES</h5>
                <div className="flex gap-4 justify-between">
                    {/* Badge 1 */}
                    <div className="w-12 h-12 rounded-full bg-[#1A2333] border border-gray-700 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-900/10">
                        <Trophy size={20} />
                    </div>
                    {/* Badge 2 */}
                    <div className="w-12 h-12 rounded-full bg-[#1A2333] border border-gray-700 flex items-center justify-center text-orange-400 shadow-lg shadow-orange-900/10">
                        <Book size={20} />
                    </div>
                    {/* Badge 3 */}
                    <div className="w-12 h-12 rounded-full bg-[#1A2333] border border-gray-700 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-900/10">
                        <Swords size={20} />
                    </div>
                    {/* Badge 4 */}
                    <div className="w-12 h-12 rounded-full bg-[#1A2333] border border-gray-700 flex items-center justify-center text-green-400 shadow-lg shadow-green-900/10">
                        <Users size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
}
