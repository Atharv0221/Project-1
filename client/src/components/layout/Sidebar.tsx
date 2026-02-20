'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Sparkles, Zap, MessageSquare, BarChart2, Settings, ShieldCheck, User, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { upgradeToPro } from '../../services/profileService';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: BookOpen, label: 'My Courses', href: '/subjects' },
    { icon: Sparkles, label: 'Zen Zone', href: '/zen-zone' },
    { icon: Zap, label: 'AI Mentor', href: '/ai-mentor' },
    { icon: MessageSquare, label: 'Forum', href: '/forum' },
    { icon: BarChart2, label: 'Analytics', href: '/analytics' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);
    const { user, login, token } = useAuthStore();
    const [upgrading, setUpgrading] = useState(false);

    const handleUpgrade = async () => {
        if (user?.isPro) return;
        setUpgrading(true);
        try {
            const response = await upgradeToPro();
            if (response.isPro) {
                login({ ...user!, isPro: true, subscriptionExpiry: response.subscriptionExpiry }, token!);
            }
        } catch (error) {
            console.error('Failed to upgrade from sidebar:', error);
        } finally {
            setUpgrading(false);
        }
    };

    useEffect(() => {
        const handleToggle = (event: any) => {
            setIsOpen(event.detail.open);
        };

        window.addEventListener('toggleSidebar', handleToggle);
        return () => window.removeEventListener('toggleSidebar', handleToggle);
    }, []);

    if (!isOpen) return null;

    return (
        <aside className="w-64 bg-[#0B1120] text-gray-400 flex flex-col h-screen border-r border-gray-800 fixed left-0 top-0 z-50">
            {/* Brand */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-16 h-16 flex-shrink-0 relative group">
                    <img
                        src="/sidebar-logo.jpg?v=2"
                        alt="Yatsya Logo"
                        className="w-full h-full object-contain relative z-10 rounded-xl"
                    />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-white tracking-wide leading-none">YATSYA</h1>
                    <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mt-1">Adaptive Learning Platform</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                                : 'hover:bg-[#1A2333] hover:text-white'
                                }`}
                        >
                            <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-cyan-400'} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Pro Plan Card */}
            <div className="p-4 mt-auto">
                <div className={`rounded-2xl p-4 border relative overflow-hidden group transition-all duration-300 ${(user?.isPro || user?.role === 'ADMIN') ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30' : 'bg-[#151B2D] border-gray-800'}`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-xl -mr-4 -mt-4 transition group-hover:bg-cyan-500/30"></div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-cyan-400 tracking-wider">
                            {user?.role === 'ADMIN' ? 'ADMIN ACCESS' : user?.isPro ? 'PRO MEMBER' : 'PRO PLAN'}
                        </span>
                        <ShieldCheck size={16} className="text-cyan-400" />
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                        {user?.role === 'ADMIN' ? 'You have administrative bypass for all features.' : user?.isPro ? 'You have unlimited access to all AI features.' : 'Get unlimited access to AI Tutoring for ₹99.'}
                    </p>
                    <button
                        onClick={handleUpgrade}
                        disabled={upgrading || user?.isPro || user?.role === 'ADMIN'}
                        className={`w-full py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${(user?.isPro || user?.role === 'ADMIN')
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 cursor-default'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]'}`}
                    >
                        {upgrading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (user?.isPro || user?.role === 'ADMIN') ? (
                            <>
                                <CheckCircle size={14} />
                                Active
                            </>
                        ) : (
                            'Upgrade Now'
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
}
