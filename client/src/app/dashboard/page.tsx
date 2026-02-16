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
import ProgressChart from '../../components/dashboard/ProgressChart';
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
                            <WelcomeBanner />
                            <DailyPlan />
                        </div>

                        {/* Right Column (Gamification) */}
                        <div className="space-y-8">
                            <ScholarStatus />
                            <MockTestCard />
                        </div>
                    </div>

                    {/* Bottom Section: Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 h-80">
                            <ProgressChart />
                        </div>
                        {/* Placeholder for future widget or more stats */}
                        <div className="bg-[#151B2D] p-6 rounded-3xl border border-gray-800 flex items-center justify-center">
                            <p className="text-gray-500 font-medium">More analytics coming soon...</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
