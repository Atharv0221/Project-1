'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
            });

            const { user, token } = response.data;
            login(user, token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050A18] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Dots Pattern (Simulated) */}
            <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>

            <div className="w-full max-w-[420px] relative z-10">
                <div className="bg-[#0B1120]/80 backdrop-blur-xl border border-blue-900/30 rounded-3xl p-8 shadow-2xl">

                    {/* Logo Section */}
                    <div className="bg-[#10162B] rounded-2xl p-8 mb-8 text-center border border-blue-900/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl -mr-10 -mt-10"></div>

                        {/* Bird Logo */}
                        <div className="w-32 h-32 mx-auto mb-2 relative flex items-center justify-center">
                            <img
                                src="/logo.png"
                                alt="Yatsya Logo"
                                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                            />
                        </div>

                        <h1 className="text-3xl font-bold text-white tracking-widest mb-1">YATSYA</h1>
                        <p className="text-[10px] text-yellow-500 uppercase tracking-[0.3em] font-medium">Your Adaptive Growth Partner</p>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm text-center">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-[#0F1525] border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-gray-600"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                                <Link href="/forgot-password" className="text-[10px] font-bold text-pink-500 hover:text-pink-400 transition">Forgot Password?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#0F1525] border border-gray-800 rounded-lg py-3 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-gray-600"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-500 to-orange-400 hover:from-purple-600 hover:to-orange-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 group"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition" />}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-purple-400 font-bold hover:text-purple-300 transition">
                                Create an Account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center space-y-2">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">© 2024 Yatsya Inc. • Secure Adaptive Protocol v4.0.2</p>
                    <div className="flex justify-center gap-6 text-[10px] text-gray-500">
                        <a href="#" className="hover:text-gray-400">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-400">Terms of Service</a>
                        <a href="#" className="hover:text-gray-400">Support</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
