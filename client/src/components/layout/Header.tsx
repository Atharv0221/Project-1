'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Settings, Command, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Link from 'next/link';

export default function Header() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        // Dispatch custom event to notify sidebar
        window.dispatchEvent(new CustomEvent('toggleSidebar', { detail: { open: !sidebarOpen } }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log('Searching for:', searchQuery);
            // TODO: Implement search functionality
        }
    };

    return (
        <header className={`h-16 border-b border-gray-800 bg-[#0B1120] flex items-center justify-between px-8 fixed top-0 right-0 z-40 transition-all ${sidebarOpen ? 'left-64' : 'left-0'}`}>
            {/* Sidebar Toggle */}
            <button
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-cyan-400 transition mr-4"
                aria-label="Toggle Sidebar"
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Search */}
            <div className="flex-1 max-w-xl">
                <form onSubmit={handleSearch}>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search courses, tests, or AI help..."
                            className="w-full bg-[#151B2D] border border-gray-700 rounded-lg py-2 pl-10 pr-12 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-gray-600"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-gray-500 border border-gray-700 px-1.5 py-0.5 rounded">
                            <Command size={10} />
                            <span>K</span>
                        </div>
                    </div>
                </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="hover:text-cyan-400 transition relative">
                        <Bell size={20} />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#0B1120]"></span>
                    </button>
                    <Link href="/settings" className="hover:text-cyan-400 transition">
                        <Settings size={20} />
                    </Link>
                </div>

                <div className="h-8 w-[1px] bg-gray-800"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-white max-w-[150px] truncate">{user?.name || 'Student'}</p>
                    </div>
                    <Link href="/profile" className="block">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 p-[2px] hover:scale-105 transition cursor-pointer">
                            <div className="w-full h-full rounded-full bg-[#0B1120] flex items-center justify-center overflow-hidden">
                                <img
                                    src={user?.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
