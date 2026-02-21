'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { getQuizReports } from '../../services/quizService';
import { FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Components
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import DailyPlan from '../../components/dashboard/DailyPlan';
import ScholarStatus from '../../components/dashboard/ScholarStatus';
import TimeSpentGraph from '../../components/dashboard/TimeSpentGraph';
import DifficultyCompletionGraph from '../../components/dashboard/DifficultyCompletionGraph';
import DailyStreak from '../../components/dashboard/DailyStreak';

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [reports, setReports] = useState<any[]>([]);
    const [loadingReports, setLoadingReports] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Sync profile data from server to ensure dashboard metrics (streak, xp) are fresh
        const syncProfile = async () => {
            try {
                const { getProfile } = await import('../../services/profileService');
                const data = await getProfile();
                if (data) {
                    const token = useAuthStore.getState().token;
                    useAuthStore.getState().login(data, token!);
                }
            } catch (error) {
                console.error('Failed to sync profile on dashboard:', error);
            }
        };

        const fetchReports = async () => {
            const token = useAuthStore.getState().token;
            if (!token) {
                setLoadingReports(false);
                return;
            }

            try {
                const data = await getQuizReports();
                setReports(data || []);
            } catch (error: any) {
                if (error.response?.status !== 401) {
                    console.error('Failed to fetch reports:', error);
                }
            } finally {
                setLoadingReports(false);
            }
        };

        syncProfile();
        fetchReports();
    }, [isAuthenticated, router]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0B1120] text-white">
            <Sidebar />
            <Header />

            <main className="ml-0 lg:ml-64 pt-16 p-8 transition-all">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Top Section: Welcome & Stats */}
                    <div id="stats-section" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column (Hero) */}
                        <div className="lg:col-span-2 space-y-8">
                            <WelcomeBanner streak={user.streak} />
                            <DailyPlan />
                        </div>

                        {/* Right Column (Gamification) */}
                        <div className="space-y-8">
                            <ScholarStatus
                                xp={user.xp || 0}
                                rank={0} // Need rank from API
                                streak={user.streak || 0}
                                levelTitle={user.scholarStatus || 'Learner'}
                            />
                            <DailyStreak streak={user.streak} />
                        </div>
                    </div>

                    {/* Bottom Section: Charts */}
                    <div id="analytics-section" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 h-80">
                            <TimeSpentGraph />
                        </div>
                        <div className="h-80">
                            <DifficultyCompletionGraph />
                        </div>
                    </div>

                    {/* Quiz Reports Section */}
                    <div id="reports-section" className="bg-[#151B2D] border border-gray-800 rounded-[2.5rem] p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <FileText className="text-cyan-400" />
                                Previous Quiz Reports
                            </h2>
                        </div>

                        {loadingReports ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                            </div>
                        ) : reports.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reports.map((report) => (
                                    <Link
                                        key={report.id}
                                        href={`/quiz/result/${report.id}?data=${encodeURIComponent(JSON.stringify({
                                            score: report.score,
                                            xpEarned: 0, // Not stored in session but can be inferred or left 0
                                            rankScoreEarned: 0,
                                            newStatus: user.scholarStatus,
                                            message: `Report for ${report.level.chapter.name}`,
                                            nextLevelUnlock: '',
                                            aiFeedback: report.aiFeedback,
                                            recommendations: report.recommendations
                                        }))}`}
                                        className="group"
                                    >
                                        <div className="bg-[#1A2333] border border-gray-700/50 p-6 rounded-3xl flex items-center justify-between hover:border-cyan-500/50 transition-all hover:bg-[#1E293B]">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">
                                                    {Math.round(report.score)}%
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                        {report.level.chapter.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 italic">
                                                        {report.level.chapter.subject.name} • {report.level.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="text-gray-600 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" size={20} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                No quiz reports found. Start a quiz to see your progress!
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
