'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { Settings as SettingsIcon, LogOut, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function SettingsPage() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage('New passwords do not match!');
            setLoading(false);
            return;
        }

        try {
            const token = useAuthStore.getState().token;
            await axios.put('http://localhost:5000/api/auth/change-password', {
                userId: user?.id,
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Failed to change password.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white">
            <Sidebar />
            <Header />

            <main className="ml-64 pt-16 p-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <SettingsIcon className="text-cyan-400" size={32} />
                        Settings
                    </h1>

                    {/* Change Password Section */}
                    <div className="bg-[#151B2D] rounded-3xl p-8 border border-gray-800 mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Lock className="text-purple-400" size={24} />
                            <h2 className="text-xl font-bold">Change Password</h2>
                        </div>

                        {message && (
                            <div className={`mb-6 p-4 rounded-xl ${message.includes('success') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full bg-[#0B1120] border border-gray-700 rounded-xl px-4 py-3 pr-12 focus:border-cyan-500 outline-none transition"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('current')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                                    >
                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full bg-[#0B1120] border border-gray-700 rounded-xl px-4 py-3 pr-12 focus:border-cyan-500 outline-none transition"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('new')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                                    >
                                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full bg-[#0B1120] border border-gray-700 rounded-xl px-4 py-3 pr-12 focus:border-cyan-500 outline-none transition"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                                    >
                                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-purple-500/20"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Logout Section */}
                    <div className="bg-[#151B2D] rounded-3xl p-8 border border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <LogOut className="text-red-400" size={24} />
                            <h2 className="text-xl font-bold">Logout</h2>
                        </div>
                        <p className="text-gray-400 mb-6">
                            Sign out of your account. You'll need to log in again to access your dashboard.
                        </p>
                        <button
                            onClick={handleLogout}
                            className="px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl border border-red-500/30 hover:border-red-500/50 transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
