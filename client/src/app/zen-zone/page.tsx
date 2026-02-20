'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Wind, Music, Coffee, Heart, Volume2, BookOpen, ChevronRight, Target, HelpCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getZenRevisionData } from '@/services/analyticsService';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

const QUOTES = [
    "You are capable of amazing things.",
    "Stress is temporary, your potential is forever.",
    "One step at a time, one breath at a time.",
    "Your worth is not defined by a single test.",
    "Focus on the progress, not just the result.",
    "You've got this, Champion!",
    "Pause. Breathe. Reset.",
];

export default function ZenZonePage() {
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [breathingStep, setBreathingStep] = useState('Inhale'); // Inhale, Hold, Exhale
    const [progress, setProgress] = useState(0);
    const [revisionData, setRevisionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getZenRevisionData();
                setRevisionData(data);
            } catch (error) {
                console.error("Error fetching Zen data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Quote rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Breathing Logic (4-4-4 pattern)
    useEffect(() => {
        let step = 'Inhale';
        let p = 0;
        const interval = setInterval(() => {
            p += 2;
            if (p > 100) {
                p = 0;
                if (step === 'Inhale') step = 'Hold';
                else if (step === 'Hold') step = 'Exhale';
                else step = 'Inhale';
                setBreathingStep(step);
            }
            setProgress(p);
        }, 80); // ~4 seconds per step
        return () => clearInterval(interval);
    }, []);

    const nextFlashcard = () => {
        setShowAnswer(false);
        setCurrentQuestionIndex((prev) => (prev + 1) % (revisionData?.importantQuestions?.length || 1));
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white">
            <Sidebar />
            <Header />

            <main className="ml-0 lg:ml-64 pt-20 p-8 transition-all relative">
                {/* Ambient Background Particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-1000"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Header */}
                    <header className="mb-12 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-bold mb-4">
                            <Sparkles size={16} />
                            ZEN ZONE
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Personalized Revision Hub</h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Relaxing stress-relievers and quick power-revisions for your next exam. <span className="text-cyan-400 font-bold">100% Free Access</span>
                        </p>
                    </header>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

                        {/* Column 1: Breathing & Relax */}
                        <div className="space-y-8">
                            {/* Guided Breathing */}
                            <div className="col-span-1 bg-[#151B2D] border border-gray-800 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                                <div className="absolute top-4 right-4 bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Free Forever</div>
                                <h3 className="text-xl font-bold mb-8 flex items-center gap-3 self-start">
                                    <Wind className="text-cyan-400" />
                                    Breathing Guide
                                </h3>

                                <div className="relative w-48 h-48 mb-8">
                                    <motion.div
                                        animate={{
                                            scale: breathingStep === 'Inhale' ? 1.4 : breathingStep === 'Exhale' ? 1 : 1.4,
                                            opacity: breathingStep === 'Hold' ? 0.8 : 0.5
                                        }}
                                        transition={{ duration: 4, ease: "easeInOut" }}
                                        className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl"
                                    />

                                    <motion.div
                                        animate={{
                                            scale: breathingStep === 'Inhale' ? 1.2 : breathingStep === 'Exhale' ? 0.8 : 1.2,
                                        }}
                                        transition={{ duration: 4, ease: "easeInOut" }}
                                        className="absolute inset-0 border-4 border-cyan-500/30 rounded-full flex items-center justify-center bg-[#0B1120]/50"
                                    >
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-cyan-400">{breathingStep}</div>
                                        </div>
                                    </motion.div>

                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle cx="96" cy="96" r="90" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-gray-800" />
                                        <circle cx="96" cy="96" r="90" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray={565} strokeDashoffset={565 - (565 * progress) / 100} className="text-cyan-500 transition-all duration-100" />
                                    </svg>
                                </div>
                            </div>

                            {/* Lofi Radio */}
                            <div className="bg-[#151B2D] border border-gray-800 rounded-3xl p-8 space-y-6 relative group hover:border-purple-500/30 transition-all">
                                <div className="absolute top-4 right-4 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Unlimited</div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Music className="text-purple-400" />
                                    Focus Beats
                                </h3>

                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Music size={24} className="text-white animate-bounce" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold truncate">Study with Yatsya</div>
                                        <div className="text-xs text-gray-500 italic">Lofi Radio</div>
                                    </div>
                                    <button className="p-3 bg-white/5 rounded-full hover:bg-white/10 text-purple-400 transition-colors">
                                        <Volume2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Revision Hub (Topics) */}
                        <div className="space-y-8">
                            <div className="bg-[#151B2D] border border-gray-800 rounded-3xl p-8 min-h-[400px]">
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <Target className="text-orange-400" />
                                    Quick Revise
                                </h3>
                                <p className="text-sm text-gray-500 mb-8">Science-backed review of your weakest topics before the exam.</p>

                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-800 rounded-2xl animate-pulse" />)}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {revisionData?.weakTopics?.map((topic: any, idx: number) => (
                                            <div key={idx} className="group p-5 bg-[#0B1120] border border-gray-800 rounded-2xl hover:border-orange-500/30 transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">{topic.subject} • {topic.chapter}</div>
                                                        <div className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">{topic.name}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-bold text-gray-400">{topic.mastery}%</div>
                                                        <div className="text-[10px] text-gray-600 uppercase">Mastery</div>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-orange-500 h-full rounded-full" style={{ width: `${topic.mastery}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                        <button className="w-full py-4 mt-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-all">
                                            View Revision Summary
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Quote Card */}
                            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-3xl p-8 text-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={quoteIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-xl font-serif italic text-white/90"
                                    >
                                        "{QUOTES[quoteIndex]}"
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Column 3: Important Questions (Flashcards) */}
                        <div className="space-y-8">
                            <div className="bg-[#151B2D] border border-gray-800 rounded-3xl p-8 min-h-[400px] flex flex-col">
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <HelpCircle className="text-emerald-400" />
                                    Last Minute Check
                                </h3>
                                <p className="text-sm text-gray-500 mb-8">Important high-yield questions for quick mental recall.</p>

                                {loading ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col">
                                        <motion.div
                                            key={currentQuestionIndex + (showAnswer ? '-ans' : '-q')}
                                            initial={{ rotateY: 180, opacity: 0 }}
                                            animate={{ rotateY: 0, opacity: 1 }}
                                            transition={{ duration: 0.4 }}
                                            className={`flex-1 p-8 rounded-2xl border ${showAnswer ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-[#0B1120] border-gray-700'} flex flex-col items-center justify-center text-center cursor-pointer`}
                                            onClick={() => setShowAnswer(!showAnswer)}
                                        >
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                                                {showAnswer ? 'Correct Concept' : `Question ${currentQuestionIndex + 1} of ${revisionData?.importantQuestions?.length}`}
                                            </span>
                                            <div className={`text-lg font-bold ${showAnswer ? 'text-emerald-400' : 'text-white'}`}>
                                                {showAnswer
                                                    ? revisionData?.importantQuestions[currentQuestionIndex]?.explanation
                                                    : revisionData?.importantQuestions[currentQuestionIndex]?.content}
                                            </div>
                                            {!showAnswer && (
                                                <div className="mt-8 text-xs text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-4 py-2 rounded-full ring-1 ring-emerald-500/30">
                                                    Tap to Reveal
                                                </div>
                                            )}
                                        </motion.div>

                                        <div className="flex gap-4 mt-8">
                                            <button
                                                onClick={nextFlashcard}
                                                className="flex-1 py-4 bg-emerald-500 text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                                            >
                                                Next Question
                                                <CheckCircle2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tips Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#151B2D] p-5 rounded-2xl border border-gray-800 flex items-center gap-3 group hover:border-orange-500/30 transition-all">
                                    <Coffee className="text-orange-400" size={20} />
                                    <span className="text-xs font-bold text-gray-400">Coffee Break</span>
                                </div>
                                <div className="bg-[#151B2D] p-5 rounded-2xl border border-gray-800 flex items-center gap-3 group hover:border-pink-500/30 transition-all">
                                    <Heart className="text-pink-400" size={20} />
                                    <span className="text-xs font-bold text-gray-400">Self Care</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
