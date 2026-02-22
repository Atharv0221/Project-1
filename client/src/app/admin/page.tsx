'use client';

import { useState, useEffect } from 'react';
import {
    ShieldCheck, Users, MessageSquare, HelpCircle, CheckCircle2,
    Search, RefreshCcw, UserPlus, UserMinus, ChevronRight, Loader2,
    BarChart3, GraduationCap, Plus, Trash2, Mail, Youtube, Edit2, X,
    Clock, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import {
    getAdminStats, getAllUsers, updateUserRole,
    addMentorAvailability, deleteMentorAvailability, addSubscriptionHours
} from '@/services/adminService';
import { getMentors, createMentor, deleteMentor, updateMentor, getMentorAvailability, Mentor, Availability } from '@/services/mentorService';
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

const getProfilePicUrl = (path: string) => {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const EMPTY_FORM = { name: '', email: '', youtubeChannel: '', boards: [] as string[], languages: [] as string[], standards: [] as string[], bio: '', playlists: [] as { title: string, url: string, category?: string }[], profilePicture: null as File | null };

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

    // Availability Management State
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [mentorSlots, setMentorSlots] = useState<Availability[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [newSlot, setNewSlot] = useState({ date: '', startTime: '', endTime: '' });

    // Credits Management State
    const [showCreditsModal, setShowCreditsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [creditAmount, setCreditAmount] = useState(6);
    const [savingCredits, setSavingCredits] = useState(false);


    // Image Crop State
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
    const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);

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

    function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // Reset crop state
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() || '');
                setCropModalOpen(true);
            });
            reader.readAsDataURL(e.target.files[0]);
            e.target.value = ''; // Reset input so same file can be selected again
        }
    }

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        setImageRef(e.currentTarget);
        const crop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
            width,
            height
        );
        setCrop(crop);
    }

    const generateCroppedImage = async () => {
        if (!completedCrop || !imageRef) return;

        const canvas = document.createElement('canvas');
        const scaleX = imageRef.naturalWidth / imageRef.width;
        const scaleY = imageRef.naturalHeight / imageRef.height;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(
            imageRef,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        canvas.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], 'profile_picture.jpg', { type: 'image/jpeg' });
            setMentorForm((prev) => ({ ...prev, profilePicture: file }));
            setCroppedPreviewUrl(URL.createObjectURL(blob));
            setCropModalOpen(false);
        }, 'image/jpeg');
    };

    const handleSaveMentor = async () => {
        if (!mentorForm.name || !mentorForm.email || !mentorForm.boards.length || !mentorForm.languages.length || !mentorForm.standards.length) {
            setMentorError('Name, email, board, language and standard are required.'); return;
        }
        setSavingMentor(true); setMentorError('');
        try {
            const formData = new FormData();
            formData.append('name', mentorForm.name);
            formData.append('email', mentorForm.email);
            if (mentorForm.youtubeChannel) formData.append('youtubeChannel', mentorForm.youtubeChannel);
            if (mentorForm.bio) formData.append('bio', mentorForm.bio);
            mentorForm.boards.forEach(b => formData.append('boards', b));
            mentorForm.languages.forEach(l => formData.append('languages', l));
            mentorForm.standards.forEach(s => formData.append('standards', s));
            if (mentorForm.profilePicture) {
                formData.append('profilePicture', mentorForm.profilePicture);
            }
            if (mentorForm.playlists && mentorForm.playlists.length > 0) {
                formData.append('playlists', JSON.stringify(mentorForm.playlists));
            }

            if (editingMentor) {
                formData.append('isActive', editingMentor.isActive ? 'true' : 'false');
                const updated = await updateMentor(editingMentor.id, formData);
                setMentors(mentors.map(m => m.id === editingMentor.id ? updated : m));
            } else {
                const newMentor = await createMentor(formData as unknown as any); // Type assertion for compatibility
                setMentors([newMentor, ...mentors]);
            }
            setShowAddMentor(false); setMentorForm(EMPTY_FORM); setEditingMentor(null); setCroppedPreviewUrl(null);
        } catch (e: any) {
            setMentorError(e.message || 'Failed to save mentor.');
        } finally { setSavingMentor(false); }
    };

    const handleDeleteMentor = async (id: string) => {
        if (!confirm('Delete this mentor?')) return;
        try { await deleteMentor(id); setMentors(mentors.filter(m => m.id !== id)); }
        catch (e) { alert('Failed to delete.'); }
    };

    const handleManageAvailability = async (mentor: Mentor) => {
        setSelectedMentor(mentor);
        setShowAvailabilityModal(true);
        setLoadingSlots(true);
        try {
            const slots = await getMentorAvailability(mentor.id);
            setMentorSlots(slots);
        } catch (e) {
            console.error('Failed to fetch slots:', e);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleAddSlot = async () => {
        if (!selectedMentor || !newSlot.date || !newSlot.startTime || !newSlot.endTime) return;

        const start = new Date(`${newSlot.date}T${newSlot.startTime}`);
        const end = new Date(`${newSlot.date}T${newSlot.endTime}`);

        try {
            const data = await addMentorAvailability(selectedMentor.id, start.toISOString(), end.toISOString());
            setMentorSlots([...mentorSlots, data.availability]);
            setNewSlot({ date: '', startTime: '', endTime: '' });
        } catch (e) {
            alert('Failed to add slot');
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        try {
            await deleteMentorAvailability(slotId);
            setMentorSlots(mentorSlots.filter(s => s.id !== slotId));
        } catch (e) {
            alert('Failed to delete slot');
        }
    };

    const handleManageCredits = (targetUser: any) => {
        setSelectedUser(targetUser);
        setShowCreditsModal(true);
        setCreditAmount(6);
    };

    const handleSaveCredits = async () => {
        if (!selectedUser) return;
        setSavingCredits(true);
        try {
            const res = await addSubscriptionHours(selectedUser.id, creditAmount);
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, mentoringHoursRemaining: res.hoursRemaining } : u));
            setShowCreditsModal(false);
        } catch (e) {
            alert('Failed to add credits');
        } finally {
            setSavingCredits(false);
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
                                                    <td className="px-8 py-6 text-right flex justify-end gap-2">
                                                        <button onClick={() => handleManageCredits(u)}
                                                            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2">
                                                            <Clock size={14} /> Credits
                                                        </button>
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
                                <button onClick={() => { setMentorForm(EMPTY_FORM); setEditingMentor(null); setShowAddMentor(true); setMentorError(''); setCroppedPreviewUrl(null); }}
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
                                                            {m.profilePicture ? (
                                                                <img src={getProfilePicUrl(m.profilePicture)} alt={m.name} className="w-9 h-9 rounded-xl object-cover" />
                                                            ) : (
                                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-black text-sm">{m.name[0]}</div>
                                                            )}
                                                            <div><div className="font-bold text-white text-sm">{m.name}</div><div className="text-xs text-gray-500">{m.email}</div></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{m.boards.map(b => <span key={b} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-xs">{b}</span>)}</div></td>
                                                    <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{m.standards.map(s => <span key={s} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs">Std {s}</span>)}</div></td>
                                                    <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{m.languages.map(l => <span key={l} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">{l}</span>)}</div></td>
                                                    <td className="px-6 py-4">{m.avgRating ? <span className="text-yellow-400 font-bold">⭐ {m.avgRating}</span> : <span className="text-gray-600 text-xs">No ratings</span>}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => handleManageAvailability(m)}
                                                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-1">
                                                                <Clock size={12} /> Availability
                                                            </button>
                                                            <button onClick={() => { setEditingMentor(m); setMentorForm({ name: m.name, email: m.email, youtubeChannel: m.youtubeChannel || '', boards: m.boards, languages: m.languages, standards: m.standards, playlists: m.playlists || [], bio: m.bio || '', profilePicture: null }); setCroppedPreviewUrl(null); setShowAddMentor(true); setMentorError(''); }}
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
                                <Field label="Profile Picture (optional)">
                                    <div className="flex items-center gap-4">
                                        {(croppedPreviewUrl || (editingMentor && editingMentor.profilePicture)) && (
                                            <img
                                                src={croppedPreviewUrl || getProfilePicUrl(editingMentor!.profilePicture!)}
                                                alt="Preview"
                                                className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/50"
                                            />
                                        )}
                                        <input type="file" accept="image/jpeg, image/png, image/gif" onChange={onSelectFile} className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-white text-sm focus:border-cyan-500/50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20" />
                                    </div>
                                </Field>
                                <Field label="YouTube Channel (optional)"><input value={mentorForm.youtubeChannel} onChange={e => setMentorForm({ ...mentorForm, youtubeChannel: e.target.value })} placeholder="@channelname" className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-white text-sm focus:border-cyan-500/50 focus:outline-none" /></Field>
                                <Field label="Board of Teaching *"><MultiSelect options={BOARDS_OPT} value={mentorForm.boards} onChange={v => setMentorForm({ ...mentorForm, boards: v })} placeholder="Select boards..." /></Field>
                                <Field label="Can Speak In *"><MultiSelect options={LANG_OPT} value={mentorForm.languages} onChange={v => setMentorForm({ ...mentorForm, languages: v })} placeholder="Select languages..." /></Field>
                                <Field label="Can Teach Standards *"><MultiSelect options={STD_OPT} value={mentorForm.standards} onChange={v => setMentorForm({ ...mentorForm, standards: v })} placeholder="Select standards..." /></Field>
                                <Field label="Short Bio (optional)"><textarea value={mentorForm.bio} onChange={e => setMentorForm({ ...mentorForm, bio: e.target.value })} placeholder="Brief background..." rows={3} className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-white text-sm focus:border-cyan-500/50 focus:outline-none resize-none" /></Field>
                                <Field label="YouTube Playlists (optional)">
                                    <div className="space-y-3 mt-2">
                                        {mentorForm.playlists.map((playlist, idx) => (
                                            <div key={idx} className="flex flex-col gap-2 p-3 bg-[#0B1120] border border-gray-700 rounded-xl relative group">
                                                <input value={playlist.title} onChange={e => {
                                                    const newPlaylists = [...mentorForm.playlists];
                                                    newPlaylists[idx].title = e.target.value;
                                                    setMentorForm({ ...mentorForm, playlists: newPlaylists });
                                                }} placeholder="Playlist Title (e.g., Algebra Crash Course)" className="bg-transparent text-sm font-bold focus:outline-none w-full border-b border-gray-700 focus:border-cyan-500 pb-1" />
                                                <input value={playlist.url} onChange={e => {
                                                    const newPlaylists = [...mentorForm.playlists];
                                                    newPlaylists[idx].url = e.target.value;
                                                    setMentorForm({ ...mentorForm, playlists: newPlaylists });
                                                }} placeholder="URL (https://youtube.com/...)" className="bg-transparent text-xs text-gray-400 focus:outline-none w-full border-b border-gray-700 focus:border-cyan-500 pb-1" />
                                                <input value={playlist.category || ''} onChange={e => {
                                                    const newPlaylists = [...mentorForm.playlists];
                                                    newPlaylists[idx].category = e.target.value;
                                                    setMentorForm({ ...mentorForm, playlists: newPlaylists });
                                                }} placeholder="Category (e.g., Math, Physics) (Optional)" className="bg-transparent text-xs text-cyan-400 focus:outline-none w-full pb-1" />
                                                <button onClick={() => {
                                                    setMentorForm({ ...mentorForm, playlists: mentorForm.playlists.filter((_, i) => i !== idx) });
                                                }} className="absolute top-2 right-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => setMentorForm({ ...mentorForm, playlists: [...mentorForm.playlists, { title: '', url: '', category: '' }] })}
                                            className="w-full py-2 border border-dashed border-gray-700 rounded-xl text-xs font-bold text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors flex items-center justify-center gap-1">
                                            <Plus size={14} /> Add Playlist
                                        </button>
                                    </div>
                                </Field>
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

            {/* Crop Modal */}
            <AnimatePresence>
                {cropModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
                        onClick={() => setCropModalOpen(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-[#0F1729] border border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#151B2D]">
                                <h3 className="text-lg font-bold">Crop Profile Picture</h3>
                                <button onClick={() => setCropModalOpen(false)} className="text-gray-500 hover:text-white p-1 hover:bg-gray-800 rounded-lg"><X size={18} /></button>
                            </div>
                            <div className="p-4 flex-1 flex justify-center items-center bg-black/50 overflow-auto max-h-[60vh]">
                                {imgSrc && (
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                        aspect={1}
                                        circularCrop
                                    >
                                        <img
                                            src={imgSrc}
                                            alt="Crop me"
                                            className="max-h-[50vh] object-contain"
                                            onLoad={onImageLoad}
                                        />
                                    </ReactCrop>
                                )}
                            </div>
                            <div className="p-4 border-t border-gray-800 bg-[#151B2D] flex justify-end gap-2">
                                <button onClick={() => setCropModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all">Cancel</button>
                                <button onClick={generateCroppedImage} disabled={!completedCrop?.width || !completedCrop?.height} className="px-5 py-2 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-black transition-all disabled:opacity-50">Crop & Save</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Availability Management Modal */}
            <AnimatePresence>
                {showAvailabilityModal && selectedMentor && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
                        onClick={() => setShowAvailabilityModal(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-[#0F1729] border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-black">{selectedMentor.name}'s Availability</h2>
                                    <p className="text-xs text-gray-500">Manage time slots for this mentor.</p>
                                </div>
                                <button onClick={() => setShowAvailabilityModal(false)} className="text-gray-500 hover:text-white p-2 hover:bg-gray-800 rounded-xl">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto space-y-6">
                                {/* Add New Slot Form */}
                                <div className="bg-[#151B2D] border border-gray-800 p-4 rounded-2xl space-y-4">
                                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Add New Slot</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Field label="Date">
                                            <input type="date" value={newSlot.date} onChange={e => setNewSlot({ ...newSlot, date: e.target.value })} className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-2.5 text-white text-sm focus:border-cyan-500/50 focus:outline-none" />
                                        </Field>
                                        <Field label="Start Time">
                                            <input type="time" value={newSlot.startTime} onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })} className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-2.5 text-white text-sm focus:border-cyan-500/50 focus:outline-none" />
                                        </Field>
                                        <Field label="End Time">
                                            <input type="time" value={newSlot.endTime} onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })} className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-2.5 text-white text-sm focus:border-cyan-500/50 focus:outline-none" />
                                        </Field>
                                    </div>
                                    <button onClick={handleAddSlot} className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                                        <Plus size={16} /> Add Availability Slot
                                    </button>
                                </div>

                                {/* Existing Slots */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Current Slots</h3>
                                    {loadingSlots ? (
                                        <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-cyan-500" /></div>
                                    ) : mentorSlots.length === 0 ? (
                                        <p className="text-center py-8 text-gray-600 text-sm italic">No slots scheduled yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {mentorSlots.map(slot => (
                                                <div key={slot.id} className={`flex items-center justify-between p-4 rounded-2xl border ${slot.isBooked ? 'bg-red-500/5 border-red-500/20' : 'bg-[#0B1120] border-gray-800'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-lg ${slot.isBooked ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                                            <Calendar size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-white">
                                                                {new Date(slot.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(slot.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} -
                                                                {new Date(slot.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {slot.isBooked ? (
                                                            <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">Booked</span>
                                                        ) : (
                                                            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Available</span>
                                                        )}
                                                        <button onClick={() => handleDeleteSlot(slot.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Credits Management Modal */}
            <AnimatePresence>
                {showCreditsModal && selectedUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
                        onClick={() => setShowCreditsModal(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-[#0F1729] border border-gray-800 rounded-3xl w-full max-w-sm"
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                                <h2 className="text-xl font-black">Manage Hours</h2>
                                <button onClick={() => setShowCreditsModal(false)} className="text-gray-500 hover:text-white p-2 hover:bg-gray-800 rounded-xl">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
                                        <Clock size={24} className="text-amber-500" />
                                    </div>
                                    <h3 className="font-bold text-white">{selectedUser.name}</h3>
                                    <p className="text-xs text-gray-500">{selectedUser.email}</p>
                                    <div className="mt-4 p-3 bg-[#0B1120] rounded-2xl border border-gray-800 inline-block">
                                        <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Current Balance</span>
                                        <span className="text-2xl font-black text-cyan-400">{selectedUser.mentoringHoursRemaining || 0} Hours</span>
                                    </div>
                                </div>

                                <Field label="Add More Hours">
                                    <div className="flex gap-2">
                                        {[6, 12, 24].map(amt => (
                                            <button key={amt} onClick={() => setCreditAmount(amt)}
                                                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all border ${creditAmount === amt ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-[#0B1120] text-gray-400 border-gray-800 hover:border-gray-600'}`}>
                                                +{amt}h
                                            </button>
                                        ))}
                                    </div>
                                    <input type="number" value={creditAmount} onChange={e => setCreditAmount(parseInt(e.target.value) || 0)} className="w-full mt-3 bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-white text-sm focus:border-cyan-500/50 focus:outline-none" placeholder="Enter custom amount..." />
                                </Field>

                                <button onClick={handleSaveCredits} disabled={savingCredits}
                                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl transition-all shadow-[0_4px_15px_rgba(245,158,11,0.3)] disabled:opacity-50 flex items-center justify-center gap-2">
                                    {savingCredits ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                    Update Credits
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
