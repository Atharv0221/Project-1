'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Wind, Music, Coffee, Heart, Volume2, BookOpen, ChevronRight, Target, HelpCircle, CheckCircle2, Play, Pause, SkipForward, SkipBack, Lock, Crown, VolumeX, Volume1 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getZenRevisionData } from '@/services/analyticsService';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuthStore } from '@/store/authStore';

const QUOTES = [
    "You are capable of amazing things.",
    "Stress is temporary, your potential is forever.",
    "One step at a time, one breath at a time.",
    "Your worth is not defined by a single test.",
    "Focus on the progress, not just the result.",
    "You've got this, Champion!",
    "Pause. Breathe. Reset.",
];

// Lofi tracks — free ones use royalty-free public audio, pro ones unlock premium vibes
const TRACKS = [
    {
        id: 1,
        title: "Rainy Study Session",
        artist: "Yatsya Lofi",
        duration: "3:42",
        genre: "Lofi Hip-Hop",
        color: "from-cyan-500 to-blue-600",
        isPro: false,
        // Working track
        src: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
    },
    {
        id: 2,
        title: "Lofi Girl Chill",
        artist: "Watermello",
        duration: "2:45",
        genre: "Chill Beats",
        color: "from-purple-500 to-pink-600",
        isPro: false,
        src: "https://cdn.pixabay.com/audio/2026/02/13/audio_adff0ddee5.mp3",
    },
    {
        id: 3,
        title: "Ocean Wave Focus",
        artist: "Yatsya Lofi",
        duration: "3:58",
        genre: "Ambient",
        color: "from-emerald-500 to-cyan-600",
        isPro: false,
        src: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3",
    },
    {
        id: 4,
        title: "Good Night Lofi",
        artist: "FASSounds",
        duration: "3:20",
        genre: "Lofi Jazz",
        color: "from-orange-500 to-yellow-500",
        isPro: false,
        src: "https://cdn.pixabay.com/audio/2023/07/30/audio_e0908e8569.mp3",
    },
    // PRO TRACKS
    {
        id: 5,
        title: "Cherry Blossom Beats",
        artist: "Lofi Library",
        duration: "4:12",
        genre: "Japanese Lofi",
        color: "from-pink-500 to-rose-600",
        isPro: true,
        src: "https://cdn.pixabay.com/audio/2026/01/06/audio_2e752c8e21.mp3",
    },
    {
        id: 6,
        title: "Coffee Chill",
        artist: "Watermello",
        duration: "2:55",
        genre: "Focus Flow",
        color: "from-indigo-500 to-purple-700",
        isPro: true,
        src: "https://cdn.pixabay.com/audio/2025/12/30/audio_c6c6e726a9.mp3",
    },
    {
        id: 7,
        title: "Stellar Ambient",
        artist: "Watermello",
        duration: "3:40",
        genre: "Space Lofi",
        color: "from-violet-500 to-blue-700",
        isPro: true,
        src: "https://cdn.pixabay.com/audio/2025/12/30/audio_6477e71e4c.mp3",
    },
    {
        id: 8,
        title: "Monsoon Rain Lofi",
        artist: "Lofi Music",
        duration: "4:05",
        genre: "Desi Lofi",
        color: "from-teal-500 to-emerald-700",
        isPro: true,
        src: "https://cdn.pixabay.com/audio/2025/12/28/audio_738b7c2f2e.mp3",
    },
];

export default function ZenZonePage() {
    const { user } = useAuthStore();
    const isPro = user?.isPro || user?.role === 'ADMIN';

    const [quoteIndex, setQuoteIndex] = useState(0);
    const [breathingStep, setBreathingStep] = useState('Inhale');
    const [progress, setProgress] = useState(0);
    const [revisionData, setRevisionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    // Music player state
    const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7);
    const [trackProgress, setTrackProgress] = useState(0);
    const [trackDuration, setTrackDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [localTracks, setLocalTracks] = useState<any[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const ALL_TRACKS = [...TRACKS, ...localTracks];
    const currentTrack = ALL_TRACKS[currentTrackIdx] || TRACKS[0];
    const canPlay = !currentTrack.isPro || isPro;

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
        }, 80);
        return () => clearInterval(interval);
    }, []);

    // Audio player logic
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = currentTrack.src;
            audioRef.current.volume = isMuted ? 0 : volume;
            if (isPlaying && canPlay) {
                audioRef.current.play().catch(() => setIsPlaying(false));
            }
        }
    }, [currentTrackIdx, ALL_TRACKS.length]);

    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying && canPlay) {
            audioRef.current.play().catch(() => setIsPlaying(false));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // Track progress
    useEffect(() => {
        if (progressInterval.current) clearInterval(progressInterval.current);
        if (isPlaying) {
            progressInterval.current = setInterval(() => {
                if (audioRef.current) {
                    setTrackProgress(audioRef.current.currentTime);
                    setTrackDuration(audioRef.current.duration || 0);
                }
            }, 500);
        }
        return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
    }, [isPlaying]);

    const handlePlay = (idx: number) => {
        const track = ALL_TRACKS[idx];
        if (!track.isPro || isPro) {
            if (idx === currentTrackIdx) {
                setIsPlaying(!isPlaying);
            } else {
                setCurrentTrackIdx(idx);
                setTrackProgress(0);
                setIsPlaying(true);
            }
        }
    };

    const handlePrev = () => {
        const newIdx = (currentTrackIdx - 1 + ALL_TRACKS.length) % ALL_TRACKS.length;
        setCurrentTrackIdx(newIdx);
        setTrackProgress(0);
        setIsPlaying(true);
    };

    const handleNext = () => {
        const newIdx = (currentTrackIdx + 1) % ALL_TRACKS.length;
        setCurrentTrackIdx(newIdx);
        setTrackProgress(0);
        setIsPlaying(true);
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const newTrack = {
                id: `local-${Date.now()}`,
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: "Your Library",
                duration: "--:--",
                genre: "Local File",
                color: "from-gray-600 to-gray-800",
                isPro: false,
                src: url,
            };
            setLocalTracks((prev) => [...prev, newTrack]);
            setCurrentTrackIdx(ALL_TRACKS.length); // Play the newly added track
            setIsPlaying(true);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = val;
            setTrackProgress(val);
        }
    };

    const formatTime = (sec: number) => {
        if (isNaN(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const nextFlashcard = () => {
        setShowAnswer(false);
        setCurrentQuestionIndex((prev) => (prev + 1) % (revisionData?.importantQuestions?.length || 1));
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white">
            <audio ref={audioRef} onEnded={handleNext} />
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                accept="audio/*"
                className="hidden"
            />
            <Sidebar />
            <Header />

            <main className="ml-0 lg:ml-64 pt-20 p-8 transition-all relative">
                {/* Ambient Background */}
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
                            Relaxing stress-relievers and quick power-revisions for your next exam.{' '}
                            <span className="text-cyan-400 font-bold">100% Free Access</span>
                        </p>
                    </header>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

                        {/* Column 1: Breathing + Lofi Player */}
                        <div className="space-y-8">
                            {/* Guided Breathing */}
                            <div className="bg-[#151B2D] border border-gray-800 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden group hover:border-cyan-500/30 transition-all">
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
                                        animate={{ scale: breathingStep === 'Inhale' ? 1.2 : breathingStep === 'Exhale' ? 0.8 : 1.2 }}
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

                            {/* NOW PLAYING - Music Player */}
                            <div className="bg-[#151B2D] border border-gray-800 rounded-3xl p-6 space-y-5 relative group hover:border-purple-500/30 transition-all">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Music className="text-purple-400" />
                                        Focus Beats
                                    </h3>
                                    <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                                        {isPlaying ? '▶ Live' : 'Paused'}
                                    </div>
                                </div>

                                {/* Album art + info */}
                                <div className={`w-full h-28 bg-gradient-to-br ${currentTrack.color} rounded-2xl flex items-center justify-center relative overflow-hidden`}>
                                    {/* Animated bars visualizer */}
                                    <div className="flex items-end gap-1 h-14">
                                        {[...Array(12)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1.5 bg-white/80 rounded-full"
                                                animate={isPlaying && canPlay ? {
                                                    height: [`${8 + Math.random() * 40}px`, `${8 + Math.random() * 40}px`, `${8 + Math.random() * 40}px`]
                                                } : { height: '8px' }}
                                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.07, repeatType: 'mirror' }}
                                            />
                                        ))}
                                    </div>
                                    {!canPlay && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 rounded-2xl">
                                            <Lock size={20} className="text-yellow-400" />
                                            <span className="text-yellow-400 font-bold text-sm">Pro Only</span>
                                        </div>
                                    )}
                                </div>

                                <div className="text-center">
                                    <div className="font-bold text-white truncate">{currentTrack.title}</div>
                                    <div className="text-xs text-gray-500">{currentTrack.artist} · {currentTrack.genre}</div>
                                    {currentTrack.isPro && (
                                        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-[10px] font-bold">
                                            <Crown size={10} /> PRO
                                        </div>
                                    )}
                                </div>

                                {/* Progress bar */}
                                <div className="space-y-1">
                                    <input
                                        type="range"
                                        min={0}
                                        max={trackDuration || 100}
                                        value={trackProgress}
                                        onChange={handleSeek}
                                        className="w-full h-1 accent-purple-500 cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-500">
                                        <span>{formatTime(trackProgress)}</span>
                                        <span>{formatTime(trackDuration)}</span>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-between">
                                    <button onClick={handlePrev} className="p-2 text-gray-400 hover:text-white transition-colors">
                                        <SkipBack size={20} />
                                    </button>
                                    <button
                                        onClick={() => canPlay ? setIsPlaying(!isPlaying) : null}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${canPlay ? 'bg-purple-500 hover:bg-purple-400 shadow-purple-500/30' : 'bg-gray-700 cursor-not-allowed'}`}
                                    >
                                        {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-0.5" />}
                                    </button>
                                    <button onClick={handleNext} className="p-2 text-gray-400 hover:text-white transition-colors">
                                        <SkipForward size={20} />
                                    </button>
                                </div>

                                {/* Volume */}
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setIsMuted(!isMuted)} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
                                        {isMuted || volume === 0 ? <VolumeX size={16} /> : volume < 0.5 ? <Volume1 size={16} /> : <Volume2 size={16} />}
                                    </button>
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={isMuted ? 0 : volume}
                                        onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                                        className="w-full h-1 accent-purple-500 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Track List + Quote */}
                        <div className="space-y-8">
                            {/* Track List */}
                            <div className="bg-[#151B2D] border border-gray-800 rounded-3xl p-6">
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <BookOpen className="text-cyan-400" size={20} />
                                        Playlist
                                    </h3>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-[10px] font-black tracking-widest uppercase bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-full border border-cyan-500/20 hover:bg-cyan-500 hover:text-white transition-all transform hover:scale-105"
                                    >
                                        + Add Local Track
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {ALL_TRACKS.map((track, idx) => {
                                        const locked = track.isPro && !isPro;
                                        const active = idx === currentTrackIdx;
                                        return (
                                            <div
                                                key={track.id}
                                                onClick={() => handlePlay(idx)}
                                                className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${active ? 'bg-purple-500/10 border border-purple-500/30' : 'hover:bg-white/5 border border-transparent'} ${locked ? 'opacity-60' : ''}`}
                                            >
                                                {/* Mini color dot / play indicator */}
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center flex-shrink-0 relative`}>
                                                    {locked ? (
                                                        <Lock size={14} className="text-white" />
                                                    ) : active && isPlaying ? (
                                                        <div className="flex items-end gap-0.5 h-5">
                                                            {[...Array(4)].map((_, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    className="w-0.5 bg-white rounded-full"
                                                                    animate={{ height: [`${4 + Math.random() * 12}px`, `${4 + Math.random() * 12}px`] }}
                                                                    transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1, repeatType: 'mirror' }}
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <Play size={14} className="text-white ml-0.5" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className={`font-bold text-sm truncate ${active ? 'text-purple-400' : 'text-white'}`}>{track.title}</div>
                                                    <div className="text-xs text-gray-500 truncate">{track.genre}</div>
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {track.isPro && (
                                                        <Crown size={12} className="text-yellow-400" />
                                                    )}
                                                    <span className="text-xs text-gray-600">{track.duration}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pro upgrade banner (only for free users) */}
                                {!isPro && (
                                    <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl flex items-center gap-3">
                                        <Crown size={20} className="text-yellow-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-yellow-400">Unlock 4 Pro Tracks</div>
                                            <div className="text-xs text-gray-500">Get Pro for ₹99 for 6 months — Japanese Lofi, Space Beats & more</div>
                                        </div>
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

                        {/* Column 3: Quick Revise + Flashcards */}
                        <div className="space-y-8">
                            {/* Quick Revise */}
                            <div className="bg-[#151B2D] border border-gray-800 rounded-3xl p-8 min-h-[300px]">
                                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                    <Target className="text-orange-400" />
                                    Quick Revise
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">Science-backed review of your weakest topics before the exam.</p>
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
                                                        <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">{topic.subject} · {topic.chapter}</div>
                                                        <div className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">{topic.name}</div>
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
                                        <button className="w-full py-4 mt-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-all">
                                            View Revision Summary <ChevronRight size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Last Minute Flashcards */}
                            <div className="bg-[#151B2D] border border-gray-800 rounded-3xl p-8 flex flex-col min-h-[300px]">
                                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                    <HelpCircle className="text-emerald-400" />
                                    Last Minute Check
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">High-yield questions for quick mental recall.</p>
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
                                            className={`flex-1 p-6 rounded-2xl border ${showAnswer ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-[#0B1120] border-gray-700'} flex flex-col items-center justify-center text-center cursor-pointer`}
                                            onClick={() => setShowAnswer(!showAnswer)}
                                        >
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                                                {showAnswer ? 'Correct Concept' : `Question ${currentQuestionIndex + 1} of ${revisionData?.importantQuestions?.length}`}
                                            </span>
                                            <div className={`text-base font-bold ${showAnswer ? 'text-emerald-400' : 'text-white'}`}>
                                                {showAnswer
                                                    ? revisionData?.importantQuestions[currentQuestionIndex]?.explanation
                                                    : revisionData?.importantQuestions[currentQuestionIndex]?.content}
                                            </div>
                                            {!showAnswer && (
                                                <div className="mt-6 text-xs text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-4 py-2 rounded-full ring-1 ring-emerald-500/30">
                                                    Tap to Reveal
                                                </div>
                                            )}
                                        </motion.div>
                                        <button
                                            onClick={nextFlashcard}
                                            className="mt-4 py-3 bg-emerald-500 text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                                        >
                                            Next Question <CheckCircle2 size={18} />
                                        </button>
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
