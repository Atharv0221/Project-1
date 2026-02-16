'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { getSubjects } from '../../services/contentService';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ChevronRight, Lock } from 'lucide-react';

interface Subtopic {
    id: string;
    name: string;
}

interface Chapter {
    id: string;
    name: string;
    subtopics: Subtopic[];
}

interface Subject {
    id: string;
    name: string;
    chapters: Chapter[];
}

export default function SubjectsPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchSubjects = async () => {
            try {
                const data = await getSubjects();
                setSubjects(data);
            } catch (error) {
                console.error('Failed to fetch subjects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [isAuthenticated, router]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Available Subjects
                    </h1>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {subjects.map((subject) => (
                            <div key={subject.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg hover:shadow-purple-500/10 transition duration-300">
                                <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                                            <BookOpen size={24} />
                                        </div>
                                        <h2 className="text-xl font-bold">{subject.name}</h2>
                                    </div>

                                    <div className="space-y-4">
                                        {subject.chapters.map((chapter) => (
                                            <div key={chapter.id} className="border-t border-gray-700 pt-4">
                                                <h3 className="font-semibold text-gray-300 mb-2">{chapter.name}</h3>
                                                <div className="space-y-2">
                                                    {chapter.subtopics.map((subtopic) => (
                                                        <Link
                                                            key={subtopic.id}
                                                            href={`/quiz/${subtopic.id}`}
                                                            className="group flex items-center justify-between p-2 rounded hover:bg-gray-700/50 transition cursor-pointer"
                                                        >
                                                            <span className="text-sm text-gray-400 group-hover:text-white transition">
                                                                {subtopic.name}
                                                            </span>
                                                            <ChevronRight size={16} className="text-gray-500 group-hover:text-purple-400 transition" />
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
