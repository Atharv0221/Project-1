'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Bell, Settings, Command, Menu, X, XCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Link from 'next/link';
import NotificationDropdown from './NotificationDropdown';

function HeaderContent() {
    const { user } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const inputRef = useRef<HTMLInputElement>(null);

    const urlQuery = searchParams.get('search') || '';
    const [searchQuery, setSearchQuery] = useState(urlQuery);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ONLY sync input when the actual URL query string changes
    useEffect(() => {
        setSearchQuery(urlQuery);
    }, [urlQuery]);

    // Sidebar event listener
    useEffect(() => {
        const handleToggle = (event: any) => {
            setSidebarOpen(event.detail.open);
        };
        window.addEventListener('toggleSidebar', handleToggle);

        // Keyboard Shortcut: Cmd/Ctrl + K
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('toggleSidebar', handleToggle);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const toggleSidebar = () => {
        const newState = !sidebarOpen;
        setSidebarOpen(newState);
        window.dispatchEvent(new CustomEvent('toggleSidebar', { detail: { open: newState } }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (query) {
            router.push(`/subjects?search=${encodeURIComponent(query)}`);
        } else {
            router.push('/subjects'); // Reset search
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        router.push('/subjects');
    };

    return (
        <header className={`h-16 border-b border-gray-800 bg-[#0B1120] flex items-center justify-between px-4 md:px-8 fixed top-0 right-0 z-40 transition-all ${sidebarOpen ? 'lg:left-64 left-0' : 'left-0'}`}>
            {/* Sidebar Toggle */}
            <button
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-cyan-400 transition p-2"
                aria-label="Toggle Sidebar"
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-4">
                <form onSubmit={handleSearch}>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition" size={18} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search topics..."
                            className="w-full bg-[#151B2D] border border-gray-700 rounded-xl py-2 pl-10 pr-20 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-gray-600 focus:ring-1 focus:ring-cyan-500/30"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="text-gray-500 hover:text-red-400 transition p-1"
                                >
                                    <XCircle size={16} />
                                </button>
                            )}
                            <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-500 border border-gray-700 px-1.5 py-0.5 rounded bg-gray-900 pointer-events-none">
                                <Command size={10} />
                                <span>K</span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-6">
                <div className="flex items-center gap-2 md:gap-4 text-gray-400">
                    <NotificationDropdown />
                    <Link href="/settings" className="hover:text-cyan-400 transition p-2">
                        <Settings size={20} />
                    </Link>
                </div>

                <div className="h-8 w-[1px] bg-gray-800 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden xl:block">
                        <p className="text-sm font-bold text-white max-w-[120px] truncate">{user?.name || 'Student'}</p>
                    </div>
                    <Link href="/profile" className="block shrink-0">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 p-[2px] transition hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]">
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

export default function Header() {
    return (
        <Suspense fallback={<header className="h-16 bg-[#0B1120] border-b border-gray-800 fixed top-0 right-0 left-64 z-40" />}>
            <HeaderContent />
        </Suspense>
    );
}
