'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Radio, Zap, MessageSquare, BarChart2, Settings, ShieldCheck, User } from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: BookOpen, label: 'My Courses', href: '/subjects' },
    { icon: Radio, label: 'Live Exams', href: '/live-exams' },
    { icon: Zap, label: 'AI Mentor', href: '/ai-mentor' },
    { icon: MessageSquare, label: 'Forum', href: '/forum' },
    { icon: BarChart2, label: 'Analytics', href: '/analytics' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);

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
                <div className="w-10 h-10 flex items-center justify-center">
                    <img
                        src="/logo.png"
                        alt="Yatsya Logo"
                        className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(236,72,153,0.4)]"
                    />
                </div>
                <div>
                    <h1 className="text-white font-bold text-lg leading-tight">Yatsya AI</h1>
                    <p className="text-xs text-cyan-400">Adaptive Learning</p>
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
                <div className="bg-[#151B2D] rounded-2xl p-4 border border-gray-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-xl -mr-4 -mt-4 transition group-hover:bg-cyan-500/30"></div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-cyan-400 tracking-wider">PRO PLAN</span>
                        <ShieldCheck size={16} className="text-cyan-400" />
                    </div>
                    <p className="text-xs text-gray-400 mb-3">Get unlimited access to AI Tutoring.</p>
                    <button className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                        Upgrade Now
                    </button>
                </div>
            </div>
        </aside>
    );
}
