'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Bell, Settings, Command, Menu, X, XCircle, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Link from 'next/link';
import NotificationDropdown from './NotificationDropdown';

function HeaderContent() {
    const { user } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const urlQuery = searchParams.get('search') || '';
    const [searchQuery, setSearchQuery] = useState(urlQuery);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // List of searchable features
    const allFeatures = [
        { name: 'Dashboard', path: '/dashboard', icon: '🏠', keywords: ['home', 'main', 'stats'] },
        { name: 'Learning Stats', path: '/dashboard#stats-section', icon: '📈', keywords: ['xp', 'streak', 'progress', 'scholar'] },
        { name: 'Study Analytics', path: '/dashboard#analytics-section', icon: '📊', keywords: ['time spent', 'mastery', 'charts', 'graphs'] },
        { name: 'Quiz Reports', path: '/dashboard#reports-section', icon: '📄', keywords: ['results', 'history', 'scores', 'reports'] },
        { name: 'AI Mentor', path: '/ai-mentor', icon: '🤖', keywords: ['chat', 'bot', 'help', 'ask'] },
        { name: 'Forum', path: '/forum', icon: '💬', keywords: ['community', 'posts', 'discussion'] },
        { name: 'Subjects', path: '/subjects', icon: '📚', keywords: ['courses', 'chapters', 'topics'] },
        { name: 'Leaderboard', path: '/leaderboard', icon: '🏆', keywords: ['rank', 'top', 'players'] },
        { name: 'Profile', path: '/profile', icon: '👤', keywords: ['account', 'user', 'settings'] },
        { name: 'Settings', path: '/settings', icon: '⚙️', keywords: ['preferences', 'config'] },
        { name: 'Zen Zone', path: '/zen-zone', icon: '🧘', keywords: ['focus', 'music', 'lofi'] },
        { name: 'Admin Panel', path: '/admin', icon: '🛡️', keywords: ['management', 'users', 'roles'], adminOnly: true },
    ];

    const filteredFeatures = searchQuery.trim() === ''
        ? []
        : allFeatures.filter(f => {
            if (f.adminOnly && user?.role !== 'ADMIN') return false;
            const query = searchQuery.toLowerCase();
            return f.name.toLowerCase().includes(query) ||
                f.keywords.some(k => k.includes(query));
        });

    // ONLY sync input when the actual URL query string changes
    useEffect(() => {
        setSearchQuery(urlQuery);
    }, [urlQuery]);

    // Handle clicks outside of dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sidebar event listener & Shortcuts
    useEffect(() => {
        const handleToggle = (event: any) => {
            setSidebarOpen(event.detail.open);
        };
        window.addEventListener('toggleSidebar', handleToggle);

        const handleKeyDown = (e: KeyboardEvent) => {
            // Keyboard Shortcut: Cmd/Ctrl + K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setShowResults(true);
            }

            // ESC to close
            if (e.key === 'Escape') {
                setShowResults(false);
                inputRef.current?.blur();
            }

            // Arrow navigation
            if (showResults && filteredFeatures.length > 0) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % filteredFeatures.length);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + filteredFeatures.length) % filteredFeatures.length);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    router.push(filteredFeatures[selectedIndex].path);
                    setShowResults(false);
                    setSearchQuery('');
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('toggleSidebar', handleToggle);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showResults, filteredFeatures, selectedIndex, router]);

    const toggleSidebar = () => {
        const newState = !sidebarOpen;
        setSidebarOpen(newState);
        window.dispatchEvent(new CustomEvent('toggleSidebar', { detail: { open: newState } }));
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (filteredFeatures.length > 0) {
            router.push(filteredFeatures[selectedIndex].path);
            setShowResults(false);
            setSearchQuery('');
        } else {
            // Fallback to subject search
            router.push(`/subjects?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setShowResults(false);
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
            <div className="flex-1 max-w-xl mx-4 relative" ref={dropdownRef}>
                <form onSubmit={handleSearchSubmit}>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition" size={18} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onFocus={() => setShowResults(true)}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowResults(true);
                                setSelectedIndex(0);
                            }}
                            placeholder="Type to search features..."
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

                {/* Search Results Dropdown */}
                {showResults && searchQuery.trim() !== '' && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A2333] border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {filteredFeatures.length > 0 ? (
                            <div className="py-2">
                                <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                    Quick Navigation
                                </div>
                                {filteredFeatures.map((feature, index) => (
                                    <button
                                        key={feature.path}
                                        onClick={() => {
                                            router.push(feature.path);
                                            setShowResults(false);
                                            setSearchQuery('');
                                        }}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${index === selectedIndex ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-300 hover:bg-gray-800'}`}
                                    >
                                        <span className="text-lg">{feature.icon}</span>
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-medium">{feature.name}</p>
                                        </div>
                                        {index === selectedIndex && (
                                            <ChevronRight size={14} className="opacity-50" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center">
                                <p className="text-sm text-gray-500 italic">No features found for "{searchQuery}"</p>
                                <button
                                    onClick={() => router.push(`/subjects?search=${encodeURIComponent(searchQuery)}`)}
                                    className="mt-2 text-xs text-cyan-500 hover:underline"
                                >
                                    Search for topics in Subjects instead →
                                </button>
                            </div>
                        )}
                    </div>
                )}
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
