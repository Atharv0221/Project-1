'use client';

import { useState, useEffect } from 'react';
import {
    ShieldCheck, Users, MessageSquare, HelpCircle, CheckCircle2,
    Search, RefreshCcw, UserPlus, UserMinus, ChevronRight, Loader2,
    BarChart3, GraduationCap, Plus, Trash2, Mail, Youtube, Edit2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { getAdminStats, getAllUsers, updateUserRole } from '@/services/adminService';
import { getMentors, createMentor, deleteMentor, updateMentor, Mentor } from '@/services/mentorService';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

const BOARDS_OPT = ['CBSE', 'ICSE', 'Maharashtra State Board', 'Gujarat Board', 'UP Board'];
const LANG_OPT = ['English', 'Hindi', 'Marathi'];
const STD_OPT = ['8', '9', '10'];

function MultiSelect({ options, value, onChange, placeholder }: { options: string[]; value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
    const toggle = (o: string) => onChange(value.includes(o) ? value.filter(x => x !== o) : [...value, o]);
    return (
        <div className="flex flex-wrap gap-2 p-2 bg-[#0B1120] border border-gray-700 rounded-xl min-h-[44px]">
            {value.map(v => (
                <span key={v} className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-bold">
                    {v}
                    <button onClick={() => toggle(v)} className="hover:text-red-400"><X size={10} /></button>
                </span>
            ))}
            <div className="relative flex-1">
                <select
                    onChange={e => { if (e.target.value) toggle(e.target.value); e.target.value = ''; }}
                    className="appearance-none bg-transparent text-gray-500 text-xs cursor-pointer focus:outline-none w-full"
                    defaultValue=""
                >
                    <option value="" disabled>{value.length === 0 ? placeholder : 'Add more...'}</option>
                    {options.filter(o => !value.includes(o)).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
        </div>
    );
}

const EMPTY_FORM = { name: '', email: '', youtubeChannel: '', boards: [] as string[], languages: [] as string[], standards: [] as string[], bio: '' };

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'users' | 'mentors'>('users');
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    // Mentor State
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [mentorLoading, setMentorLoading] = useState(false);
    const [showAddMentor, setShowAddMentor] = useState(false);
    const [mentorForm, setMentorForm] = useState(EMPTY_FORM);
    const [savingMentor, setSavingMentor] = useState(false);
    const [mentorError, setMentorError] = useState('');
    const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);

    useEffect(() => {
        if (user && user.role !== 'ADMIN') { router.push('/dashboard'); return; }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, usersData] = await Promise.all([getAdminStats(), getAllUsers()]);
            setStats(statsData);
            setUsers(usersData);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMentors = async () => {
        setMentorLoading(true);
        try { setMentors(await getMentors()); }
        catch (e) { console.error(e); }
        finally { setMentorLoading(false); }
    };

    useEffect(() => { if (activeTab === 'mentors') fetchMentors(); }, [activeTab]);

    const handleToggleRole = async (targetUser: any) => {
        const newRole = targetUser.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
        setUpdatingUserId(targetUser.id);
        try {
            await updateUserRole(targetUser.id, newRole);
            setUsers(users.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Failed to update user role:', error);
            alert('Failed to update role');
        } finally { setUpdatingUserId(null); }
    };

    const handleSaveMentor = async () => {
        if (!mentorForm.name || !mentorForm.email || !mentorForm.boards.length || !mentorForm.languages.length || !mentorForm.standards.length) {
            setMentorError('Name, email, board, language and standard are required.'); return;
        }
        setSavingMentor(true); setMentorError('');
        try {
            if (editingMentor) {
                const updated = await updateMentor(editingMentor.id, mentorForm);
                setMentors(mentors.map(m => m.id === editingMentor.id ? updated : m));
            } else {
                const newMentor = await createMentor(mentorForm as any);
                setMentors([newMentor, ...mentors]);
            }
            setShowAddMentor(false); setMentorForm(EMPTY_FORM); setEditingMentor(null);
        } catch (e: any) {
            setMentorError(e.message || 'Failed to save mentor.');
        } finally { setSavingMentor(false); }
    };

    const handleDeleteMentor = async (id: string) => {
        if (!confirm('Delete this mentor?')) return;
        try { await deleteMentor(id); setMentors(mentors.filter(m => m.id !== id)); }
        catch (e) { alert('Failed to delete.'); }
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
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-1000" />
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-bold mb-4">
                                <ShieldCheck size={16} />ADMIN CONTROL CENTER
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">System Overview</h1>
                            <p className="text-gray-400">Manage users, mentors, and platform settings.</p>
                        </div>
                        <button onClick={fetchData} className="bg-[#151B2D] border border-gray-800 p-3 rounded-2xl hover:border-cyan-500/50 transition-all flex items-center gap-2 group">
                            <RefreshCcw size={18} className={`text-gray-400 group-hover:text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-bold">Refresh</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard icon={Users} label="Total Students" value={stats?.users || 0} color="cyan" loading={loading} />
                        <StatCard icon={MessageSquare} label="Forum Posts" value={stats?.posts || 0} color="purple" loading={loading} />
                        <StatCard icon={HelpCircle} label="Total Questions" value={stats?.questions || 0} color="orange" loading={loading} />
                        <StatCard icon={CheckCircle2} label="Quiz Attempts" value={stats?.attempts || 0} color="emerald" loading={loading} />
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setActiveTab('users')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-cyan-500 text-black' : 'bg-[#151B2D] text-gray-400 hover:text-white border border-gray-800'}`}>
                            <Users size={16} />User Management
                        </button>
                        <button onClick={() => setActiveTab('mentors')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'mentors' ? 'bg-cyan-500 text-black' : 'bg-[#151B2D] text-gray-400 hover:text-white border border-gray-800'}`}>
                            <GraduationCap size={16} />Mentors
                        </button>
                    </div>

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="bg-[#151B2D] border border-gray-800 rounded-3xl overflow-hidden mb-12">
                            <div className="p-8 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center"><Users className="text-cyan-400" /></div>
                                    <div><h2 className="text-2xl font-bold">User Management</h2><p className="text-sm text-gray-500">Manage roles and view user activity stats.</p></div>
                                </div>
                                <div className="relative w-full md:w-96">
                                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full bg-[#0B1120] border border-gray-700 rounded-2xl py-3 pl-12 pr-4 focus:border-cyan-500/50 focus:outline-none transition-all text-sm" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0B1120]/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                        <tr><th className="px-8 py-4">User</th><th className="px-8 py-4">Role</th><th className="px-8 py-4">Joined</th><th className="px-8 py-4 text-right">Actions</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {loading ? ([...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-8 py-6"><div className="h-10 bg-gray-800 rounded-xl w-48" /></td>
                                                <td className="px-8 py-6"><div className="h-6 bg-gray-800 rounded-lg w-20" /></td>
                                                <td className="px-8 py-6"><div className="h-6 bg-gray-800 rounded-lg w-24" /></td>
                                                <td className="px-8 py-6 text-right"><div className="h-10 bg-gray-800 rounded-xl w-32 ml-auto" /></td>
                                            </tr>
                                        ))) : filteredUsers.length > 0 ? (
                                            filteredUsers.map(u => (
                                                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white">{u.name?.[0]?.toUpperCase() || 'U'}</div>
                                                            <div><div className="font-bold text-white">{u.name}</div><div className="text-xs text-gray-500">{u.email}</div></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>{u.role}</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button onClick={() => handleToggleRole(u)} disabled={updatingUserId === u.id || u.email === user.email}
                                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ml-auto ${updatingUserId === u.id ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : u.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-white'}`}>
                                                            {updatingUserId === u.id ? <Loader2 size={14} className="animate-spin" /> : u.role === 'ADMIN' ? <UserMinus size={14} /> : <UserPlus size={14} />}
                                                            {u.role === 'ADMIN' ? 'Revoke Admin' : 'Make Admin'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-500">No users found matching your search.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Mentors Tab */}
                    {activeTab === 'mentors' && (
                        <div className="bg-[#151B2D] border border-gray-800 rounded-3xl overflow-hidden mb-12">
                            <div className="p-8 border-b border-gray-800 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center"><GraduationCap className="text-cyan-400" /></div>
                                    <div><h2 className="text-2xl font-bold">Mentor Management</h2><p className="text-sm text-gray-500">Add and manage mentor profiles for students.</p></div>
                                </div>
                                <button onClick={() => { setMentorForm(EMPTY_FORM); setEditingMentor(null); setShowAddMentor(true); setMentorError(''); }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl transition-all">
                                    <Plus size={16} />Add Mentor
                                </button>
                            </div>
                            {mentorLoading ? (
                                <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-cyan-400" /></div>
                            ) : mentors.length === 0 ? (
                                <div className="text-center py-16 text-gray-500"><GraduationCap size={40} className="mx-auto mb-3 text-gray-700" />No mentors added yet.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#0B1120]/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                            <tr><th className="px-6 py-4">Mentor</th><th className="px-6 py-4">Boards</th><th className="px-6 py-4">Standards</th><th className="px-6 py-4">Languages</th><th className="px-6 py-4">Rating</th><th className="px-6 py-4 text-right">Actions</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {mentors.map(m => (
                                                <tr key={m.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-black text-sm">{m.name[0]}</div>
                                                            <div><div className="font-bold text-white text-sm">{m.name}</div><div className="text-xs text-gray-500">{m.email}</div></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{m.boards.map(b => <span key={b} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-xs">{b}</span>)}</div></td>
                                                    <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{m.standards.map(s => <span key={s} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs">Std {s}</span>)}</div></td>
                                                    <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{m.languages.map(l => <span key={l} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">{l}</span>)}</div></td>
                                                    <td className="px-6 py-4">{m.avgRating ? <span className="text-yellow-400 font-bold">⭐ {m.avgRating}</span> : <span className="text-gray-600 text-xs">No ratings</span>}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => { setEditingMentor(m); setMentorForm({ name: m.name, email: m.email, youtubeChannel: m.youtubeChannel || '', boards: m.boards, languages: m.languages, standards: m.standards, bio: m.bio || '' }); setShowAddMentor(true); setMentorError(''); }}
                                                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all flex items-center gap-1">
                                                                <Edit2 size={12} />Edit
                                                            </button>
                                                            <button onClick={() => handleDeleteMentor(m.id)}
                                                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1">
                                                                <Trash2 size={12} />Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Add/Edit Mentor Modal */}
            <AnimatePresence>
                {showAddMentor && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowAddMentor(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-[#0F1729] border border-gray-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                                <h2 className="text-xl font-black">{editingMentor ? 'Edit Mentor' : 'Add New Mentor'}</h2>
                                <button onClick={() => setShowAddMentor(false)} className="text-gray-500 hover:text-white p-2 hover:bg-gray-800 rounded-xl">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <Field label="Full Name *"><input value={mentorForm.name} onChange={e => setMentorForm({ ...mentorForm, name: e.target.value })} placeholder="Dr. Ramesh Sharma" className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-white text-sm focus:border-cyan-500/50 focus:outline-none" /></Field>
                                <Field label="Email Address *"><input type="email" value={mentorForm.email} onChange={e => setMentorForm({ ...mentorForm, email: e.target.value })} placeholder="mentor@email.com" className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-white text-sm focus:border-cyan-500/50 focus:outline-none" /></Field>
                                <Field label="YouTube Channel (optional)"><input value={mentorForm.youtubeChannel} onChange={e => setMentorForm({ ...mentorForm, youtubeChannel: e.target.value })} placeholder="@channelname" className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-white text-sm focus:border-cyan-500/50 focus:outline-none" /></Field>
                                <Field label="Board of Teaching *"><MultiSelect options={BOARDS_OPT} value={mentorForm.boards} onChange={v => setMentorForm({ ...mentorForm, boards: v })} placeholder="Select boards..." /></Field>
                                <Field label="Can Speak In *"><MultiSelect options={LANG_OPT} value={mentorForm.languages} onChange={v => setMentorForm({ ...mentorForm, languages: v })} placeholder="Select languages..." /></Field>
                                <Field label="Can Teach Standards *"><MultiSelect options={STD_OPT} value={mentorForm.standards} onChange={v => setMentorForm({ ...mentorForm, standards: v })} placeholder="Select standards..." /></Field>
                                <Field label="Short Bio (optional)"><textarea value={mentorForm.bio} onChange={e => setMentorForm({ ...mentorForm, bio: e.target.value })} placeholder="Brief background..." rows={3} className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-white text-sm focus:border-cyan-500/50 focus:outline-none resize-none" /></Field>
                                {mentorError && <p className="text-red-400 text-sm">{mentorError}</p>}
                                <button onClick={handleSaveMentor} disabled={savingMentor}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl transition-all disabled:opacity-50">
                                    {savingMentor ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    {savingMentor ? 'Saving...' : editingMentor ? 'Update Mentor' : 'Add Mentor'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
            {children}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, loading }: any) {
    const colorClasses: any = {
        cyan: 'text-cyan-400 bg-cyan-500/10',
        purple: 'text-purple-400 bg-purple-500/10',
        orange: 'text-orange-400 bg-orange-500/10',
        emerald: 'text-emerald-400 bg-emerald-500/10',
    };
    return (
        <div className="bg-[#151B2D] border border-gray-800 rounded-3xl p-6 group hover:border-cyan-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl ${colorClasses[color]}`}><Icon size={24} /></div>
                <div className="p-2 bg-gray-800/50 rounded-lg"><BarChart3 size={14} className="text-gray-600" /></div>
            </div>
            {loading ? (<div className="h-8 bg-gray-800 rounded-lg animate-pulse w-24 mb-2" />) : (<div className="text-3xl font-black mb-1 tracking-tight">{value.toLocaleString()}</div>)}
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</div>
        </div>
    );
}
