'use client';

import { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Users,
    MessageSquare,
    HelpCircle,
    CheckCircle2,
    Search,
    RefreshCcw,
    UserPlus,
    UserMinus,
    ChevronRight,
    Loader2,
    BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { getAdminStats, getAllUsers, updateUserRole } from '@/services/adminService';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/dashboard');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, usersData] = await Promise.all([
                getAdminStats(),
                getAllUsers()
            ]);
            setStats(statsData);
            setUsers(usersData);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRole = async (targetUser: any) => {
        const newRole = targetUser.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
        setUpdatingUserId(targetUser.id);
        try {
            await updateUserRole(targetUser.id, newRole);
            setUsers(users.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Failed to update user role:', error);
            alert('Failed to update role');
        } finally {
            setUpdatingUserId(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div className="min-h-screen bg-[#0B1120] text-white">
            <Sidebar />
            <Header />

            <main className="ml-0 lg:ml-64 pt-20 p-8 transition-all relative">
                {/* Ambient Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-1000"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-bold mb-4">
                                <ShieldCheck size={16} />
                                ADMIN CONTROL CENTER
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight flex items-center gap-4">
                                System Overview
                            </h1>
                            <p className="text-gray-400">Manage users, view platform growth, and control platform settings.</p>
                        </div>
                        <button
                            onClick={fetchData}
                            className="bg-[#151B2D] border border-gray-800 p-3 rounded-2xl hover:border-cyan-500/50 transition-all flex items-center gap-2 group"
                        >
                            <RefreshCcw size={18} className={`text-gray-400 group-hover:text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-bold">Refresh Data</span>
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <StatCard
                            icon={Users}
                            label="Total Students"
                            value={stats?.users || 0}
                            color="cyan"
                            loading={loading}
                        />
                        <StatCard
                            icon={MessageSquare}
                            label="Forum Posts"
                            value={stats?.posts || 0}
                            color="purple"
                            loading={loading}
                        />
                        <StatCard
                            icon={HelpCircle}
                            label="Total Questions"
                            value={stats?.questions || 0}
                            color="orange"
                            loading={loading}
                        />
                        <StatCard
                            icon={CheckCircle2}
                            label="Quiz Attempts"
                            value={stats?.attempts || 0}
                            color="emerald"
                            loading={loading}
                        />
                    </div>

                    {/* User Management Section */}
                    <div className="bg-[#151B2D] border border-gray-800 rounded-3xl overflow-hidden mb-12">
                        <div className="p-8 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center">
                                    <Users className="text-cyan-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">User Management</h2>
                                    <p className="text-sm text-gray-500">Manage roles and view user activity stats.</p>
                                </div>
                            </div>

                            {/* Search bar */}
                            <div className="relative w-full md:w-96">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#0B1120] border border-gray-700 rounded-2xl py-3 pl-12 pr-4 focus:border-cyan-500/50 focus:outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* User Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0B1120]/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-4">User</th>
                                        <th className="px-8 py-4">Role</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4">Joined</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-8 py-6"><div className="h-10 bg-gray-800 rounded-xl w-48" /></td>
                                                <td className="px-8 py-6"><div className="h-6 bg-gray-800 rounded-lg w-20" /></td>
                                                <td className="px-8 py-6"><div className="h-6 bg-gray-800 rounded-lg w-16" /></td>
                                                <td className="px-8 py-6"><div className="h-6 bg-gray-800 rounded-lg w-24" /></td>
                                                <td className="px-8 py-6 text-right"><div className="h-10 bg-gray-800 rounded-xl w-32 ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : filteredUsers.length > 0 ? (
                                        filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white">
                                                            {u.name?.[0]?.toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white">{u.name}</div>
                                                            <div className="text-xs text-gray-500">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${u.isPro ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-500'
                                                        }`}>
                                                        {u.isPro ? 'Pro' : 'Free'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-sm text-gray-400">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => handleToggleRole(u)}
                                                        disabled={updatingUserId === u.id || u.email === user.email}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ml-auto ${updatingUserId === u.id ? 'bg-gray-800 text-gray-500 cursor-not-allowed' :
                                                                u.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' :
                                                                    'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-white'
                                                            }`}
                                                    >
                                                        {updatingUserId === u.id ? <Loader2 size={14} className="animate-spin" /> :
                                                            u.role === 'ADMIN' ? <UserMinus size={14} /> : <UserPlus size={14} />}
                                                        {u.role === 'ADMIN' ? 'Revoke Admin' : 'Make Admin'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center text-gray-500">
                                                No users found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, loading }: any) {
    const colorClasses: any = {
        cyan: "text-cyan-400 bg-cyan-500/10",
        purple: "text-purple-400 bg-purple-500/10",
        orange: "text-orange-400 bg-orange-500/10",
        emerald: "text-emerald-400 bg-emerald-500/10",
    };

    return (
        <div className="bg-[#151B2D] border border-gray-800 rounded-3xl p-6 group hover:border-cyan-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
                <div className="p-2 bg-gray-800/50 rounded-lg">
                    <BarChart3 size={14} className="text-gray-600" />
                </div>
            </div>
            {loading ? (
                <div className="h-8 bg-gray-800 rounded-lg animate-pulse w-24 mb-2" />
            ) : (
                <div className="text-3xl font-black mb-1 tracking-tight">{value.toLocaleString()}</div>
            )}
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</div>
        </div>
    );
}
