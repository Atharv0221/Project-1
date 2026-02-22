'use client';

import { Clock, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';

interface MentoringCreditsProps {
    hours: number;
}

export default function MentoringCredits({ hours = 0 }: MentoringCreditsProps) {
    return (
        <div className="bg-gradient-to-br from-[#1A2333] to-[#151B2D] p-6 rounded-[2.5rem] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)] flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/5 blur-3xl rounded-full group-hover:bg-cyan-500/10 transition-all duration-700" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                        <Clock size={20} className="text-cyan-400" />
                    </div>
                    {hours < 1 && (
                        <span className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-red-500/20">
                            Credits Low
                        </span>
                    )}
                </div>

                <div className="space-y-1">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Mentoring Credits</span>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-3xl font-black text-white leading-none">{hours}</h4>
                        <span className="text-gray-500 font-bold text-sm">Hours Left</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex gap-2 relative z-10">
                <Link
                    href="/mentors"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black rounded-xl transition-all shadow-[0_4px_10px_rgba(6,182,212,0.3)]"
                >
                    <Calendar size={14} />
                    Book Now
                </Link>
                <Link
                    href="/mentors"
                    className="w-10 h-10 flex items-center justify-center bg-[#0B1120] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 rounded-xl transition-all"
                    title="Get more hours"
                >
                    <ExternalLink size={14} />
                </Link>
            </div>
        </div>
    );
}
