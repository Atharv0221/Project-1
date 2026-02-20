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
    const [isMobile, setIsMobile] = useState(false);

    // Initial state and resize handler
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            // On mobile, start closed. On desktop, start open.
            const initialState = !mobile;
            setIsOpen(initialState);
            window.dispatchEvent(new CustomEvent('toggleSidebar', { detail: { open: initialState } }));
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar on mobile when navigating
    useEffect(() => {
        if (isMobile && isOpen) {
            setIsOpen(false);
            window.dispatchEvent(new CustomEvent('toggleSidebar', { detail: { open: false } }));
        }
    }, [pathname]);

    const toggleSidebar = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        window.dispatchEvent(new CustomEvent('toggleSidebar', { detail: { open: newState } }));
    };

    // Dynamic menu items based on role
    const filteredMenuItems = [...menuItems];
    if (user?.role === 'ADMIN') {
        filteredMenuItems.push({ icon: ShieldCheck, label: 'Admin Panel', href: '/admin' });
    }

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

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`bg-[#0B1120] text-gray-400 flex flex-col h-screen border-r border-gray-800 fixed left-0 top-0 z-50 transition-all duration-300 transform ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
                    } ${isMobile ? 'shadow-2xl' : ''}`}
            >
                {/* Brand & Close Button (Mobile) */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex-shrink-0 relative group">
                            <img
                                src="/sidebar-logo.jpg?v=2"
                                alt="Yatsya Logo"
                                className="w-full h-full object-contain relative z-10 rounded-lg"
                            />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold text-white tracking-wide leading-none">YATSYA</h1>
                        </div>
                    </div>
                    {isMobile && (
                        <button
                            onClick={toggleSidebar}
                            className="p-2 text-gray-500 hover:text-white lg:hidden"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {filteredMenuItems.map((item) => {
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
                            {user?.role === 'ADMIN' ? 'You have administrative bypass for all features.' : user?.isPro ? 'You have unlimited access to all AI features.' : 'Get unlimited access to AI Tutoring for ₹99 for 6 months.'}
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
        </>
    );
}
