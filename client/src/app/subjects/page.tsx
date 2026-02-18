'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { getSubjects, getStandards } from '../../services/contentService';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ChevronRight, Lock, BarChart2 } from 'lucide-react';
import TimeSpentGraph from '../../components/dashboard/TimeSpentGraph';
import DifficultyCompletionGraph from '../../components/dashboard/DifficultyCompletionGraph';

interface Level {
    id: string;
    name: string;
}

interface Subtopic {
    id: string;
    name: string;
}

interface Chapter {
    id: string;
    name: string;
    subtopics: Subtopic[];
    levels: Level[];
}

interface Subject {
    id: string;
    name: string;
    standard: string;
    chapters: Chapter[];
}

export default function SubjectsPage() {
    const { user, isAuthenticated, token } = useAuthStore();
    const router = useRouter();
    const [standards, setStandards] = useState<{ id: string, name: string }[]>([]);
    const [selectedStandard, setSelectedStandard] = useState<string>('8'); // Default to 8
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewStatsSubjectId, setViewStatsSubjectId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Wait for token to be available before fetching
        if (!token) return;

        // Set default standard from user profile if available, otherwise 8
        if (user?.classStandard) {
            const std = user.classStandard.replace(/\D/g, ''); // Extract number just in case
            if (['8', '9', '10'].includes(std)) {
                setSelectedStandard(std);
            }
        }

        const fetchData = async () => {
            try {
                // Fetch standards (though we know them, it's good practice)
                const standardsData = await getStandards();
                setStandards(standardsData);
            } catch (error) {
                console.error('Failed to fetch standards:', error);
                // Fallback
                setStandards([
                    { id: '8', name: 'Standard 8' },
                    { id: '9', name: 'Standard 9' },
                    { id: '10', name: 'Standard 10' }
                ]);
            }
        };

        fetchData();
    }, [isAuthenticated, router, user, token]);

    // Fetch subjects whenever selectedStandard changes
    useEffect(() => {
        const fetchSubjects = async () => {
            setLoading(true);
            try {
                const data = await getSubjects(selectedStandard);
                setSubjects(data);
            } catch (error) {
                console.error('Failed to fetch subjects:', error);
            } finally {
                setLoading(false);
            }
        };

        if (selectedStandard) {
            fetchSubjects();
        }
    }, [selectedStandard]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0B1120] text-white p-8 pl-0 lg:pl-72 pt-24">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 bg-gray-800/50 rounded-xl hover:bg-gray-700 transition border border-gray-700">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                            Available Subjects
                        </h1>
                    </div>

                    {/* Standard Selector */}
                    <div className="flex bg-[#151B2D] p-1.5 rounded-2xl border border-gray-800">
                        {['8', '9', '10'].map((std) => (
                            <button
                                key={std}
                                onClick={() => setSelectedStandard(std)}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${selectedStandard === std
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                                    : 'text-gray-500 hover:text-white hover:bg-[#1A2333]'
                                    }`}
                            >
                                Class {std}
                            </button>
                        ))}
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
                        {subjects && subjects.length > 0 ? subjects.map((subject) => (
                            <div key={subject.id} className="bg-[#151B2D] rounded-3xl overflow-hidden border border-gray-800 shadow-lg hover:shadow-cyan-500/10 transition duration-300 flex flex-col h-full group">
                                <div className="p-6 flex-grow">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform">
                                                <BookOpen size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white">{subject.name}</h2>
                                                <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest">Class {subject.standard}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setViewStatsSubjectId(viewStatsSubjectId === subject.id ? null : subject.id)}
                                            className={`p-2 rounded-xl border transition-all ${viewStatsSubjectId === subject.id ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-gray-800 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50'}`}
                                            title="View Analytics"
                                        >
                                            <BarChart2 size={20} />
                                        </button>
                                    </div>

                                    {viewStatsSubjectId === subject.id ? (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                            <div className="h-44">
                                                <TimeSpentGraph subjectId={subject.id} />
                                            </div>
                                            <div className="h-44">
                                                <DifficultyCompletionGraph subjectId={subject.id} />
                                            </div>
                                            <button
                                                onClick={() => setViewStatsSubjectId(null)}
                                                className="w-full py-3 text-[10px] font-black text-gray-500 hover:text-cyan-400 uppercase tracking-[0.2em] mt-2 transition-colors"
                                            >
                                                Close Stats
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {subject.chapters && subject.chapters.length > 0 ? subject.chapters.map((chapter) => (
                                                <div key={chapter.id} className="border-t border-gray-800 pt-4 first:border-0 first:pt-0">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.8)]"></div>
                                                        <h3 className="font-bold text-gray-200 text-sm">{chapter.name}</h3>
                                                    </div>
                                                    <div className="space-y-1.5 ml-2 border-l border-gray-800/50 pl-4">
                                                        {chapter.levels && chapter.levels.length > 0 ? chapter.levels.map((level: any) => (
                                                            <Link
                                                                key={level.id}
                                                                href={`/quiz/${level.id}`}
                                                                className="group/item flex items-center justify-between p-2 rounded-xl hover:bg-[#1C2539] transition-all cursor-pointer"
                                                            >
                                                                <span className="text-xs text-gray-500 group-hover/item:text-cyan-400 transition-colors">
                                                                    {level.name}
                                                                </span>
                                                                <ChevronRight size={14} className="text-gray-700 group-hover/item:text-cyan-500 transition-transform group-hover/item:translate-x-1" />
                                                            </Link>
                                                        )) : (
                                                            chapter.subtopics && chapter.subtopics.length > 0 ? chapter.subtopics.map((subtopic) => (
                                                                <Link
                                                                    key={subtopic.id}
                                                                    href={`/quiz/${subtopic.id}`}
                                                                    className="group/item flex items-center justify-between p-2 rounded-xl hover:bg-[#1C2539] transition-all cursor-pointer"
                                                                >
                                                                    <span className="text-xs text-gray-500 group-hover/item:text-cyan-400 transition-colors">
                                                                        {subtopic.name}
                                                                    </span>
                                                                    <ChevronRight size={14} className="text-gray-700 group-hover/item:text-cyan-500 transition-transform group-hover/item:translate-x-1" />
                                                                </Link>
                                                            )) : (
                                                                <p className="text-[10px] text-gray-600 italic py-1 pl-2">Coming Soon</p>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="flex flex-col items-center justify-center py-8 text-center bg-[#0B1120]/50 rounded-2xl border border-dashed border-gray-800">
                                                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">No chapters found</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center bg-[#151B2D] rounded-[2.5rem] border border-gray-800 border-dashed">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#0B1120] mb-6 text-gray-700 border border-gray-800 shadow-xl">
                                    <BookOpen size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">No content found</h3>
                                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                    We haven't uploaded subjects for Standard {selectedStandard} yet. Check back soon!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
