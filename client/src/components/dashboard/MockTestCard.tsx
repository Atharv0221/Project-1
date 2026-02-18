'use client';

import Link from 'next/link';

export default function MockTestCard() {
    return (
        <div className="bg-[#151B2D] p-6 rounded-3xl border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full m-6 animate-pulse shadow-[0_0_10px_#ec4899]"></div>

            <h3 className="font-bold text-white mb-6">Live Mock Tests</h3>

            <div className="bg-gradient-to-br from-[#1A2333] to-[#0B1120] rounded-2xl p-5 border border-gray-700/50">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2 block">UPCOMING EXAM</span>
                <h4 className="text-lg font-bold text-white mb-4 leading-tight">All India Science Merit 2024</h4>

                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#0B1120] rounded-lg p-2 border border-gray-800">
                        <span className="block text-xl font-bold text-white">02</span>
                        <span className="text-[9px] text-gray-500 uppercase">DAYS</span>
                    </div>
                    <div className="bg-[#0B1120] rounded-lg p-2 border border-gray-800">
                        <span className="block text-xl font-bold text-white">14</span>
                        <span className="text-[9px] text-gray-500 uppercase">HRS</span>
                    </div>
                    <div className="bg-[#0B1120] rounded-lg p-2 border border-gray-800">
                        <span className="block text-xl font-bold text-white">38</span>
                        <span className="text-[9px] text-gray-500 uppercase">MINS</span>
                    </div>
                </div>

                <div className="mt-4">
                    <Link href="/subjects" className="block w-full text-center py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl text-white font-bold transition shadow-lg shadow-pink-500/20">
                        Prepare Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
