'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';

// Components
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import DailyPlan from '../../components/dashboard/DailyPlan';
import ScholarStatus from '../../components/dashboard/ScholarStatus';
import TimeSpentGraph from '../../components/dashboard/TimeSpentGraph';
import DifficultyCompletionGraph from '../../components/dashboard/DifficultyCompletionGraph';
import DailyStreak from '../../components/dashboard/DailyStreak';
import MockTestCard from '../../components/dashboard/MockTestCard';

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0B1120] text-white">
            <Sidebar />
            <Header />

            <main className="ml-0 lg:ml-64 pt-16 p-8 transition-all">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Top Section: Welcome & Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                            <MockTestCard />
                        </div>
                    </div>

                    {/* Bottom Section: Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 h-80">
                            <TimeSpentGraph />
                        </div>
                        <div className="h-80">
                            <DifficultyCompletionGraph />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
