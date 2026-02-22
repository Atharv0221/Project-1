'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, CheckCircle, User, Mail, Lock, BookOpen } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SignupPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        board: 'Maharashtra State Board',
    });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const passwordStrength = (p: string) => {
        if (p.length === 0) return null;
        if (p.length < 6) return { label: 'Too short', color: 'bg-red-500', width: '25%' };
        if (p.length < 8) return { label: 'Weak', color: 'bg-orange-500', width: '50%' };
        if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Good', color: 'bg-yellow-500', width: '75%' };
        return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
    };
    const strength = passwordStrength(form.password);

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API}/auth/register`, {
                name: form.name,
                email: form.email,
                password: form.password,
                board: form.board,
            });
            // Redirect to "check your email" page — do NOT auto-login
            router.push(`/verify-email/pending?email=${encodeURIComponent(form.email)}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/8 blur-[140px] rounded-full" />
                <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/8 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        YATSYA
                    </span>
                    <p className="text-gray-500 text-sm mt-1">Adaptive Learning Platform</p>
                </div>

                <div className="bg-[#151B2D] border border-gray-800 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-black text-white mb-1">Create Account</h2>
                    <p className="text-gray-500 text-sm mb-6">You'll need to verify your email after signup.</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <Field icon={User} label="Full Name">
                            <input
                                type="text" value={form.name} onChange={set('name')}
                                placeholder="John Doe" required
                                className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 pl-10 text-white text-sm placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                            />
                        </Field>

                        {/* Email */}
                        <Field icon={Mail} label="Email Address">
                            <input
                                type="email" value={form.email} onChange={set('email')}
                                placeholder="you@example.com" required
                                className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 pl-10 text-white text-sm placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                            />
                        </Field>

                        {/* Board */}
                        <Field icon={BookOpen} label="Educational Board">
                            <select value={form.board} onChange={set('board')} required
                                className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 pl-10 text-white text-sm focus:border-cyan-500/50 focus:outline-none transition-colors appearance-none cursor-pointer">
                                <option value="Maharashtra State Board">Maharashtra State Board</option>
                                <option value="CBSE">CBSE</option>
                                <option value="ICSE">ICSE</option>
                                <option value="Gujarat Board">Gujarat Board</option>
                                <option value="UP Board">UP Board</option>
                                <option value="Other">Other</option>
                            </select>
                        </Field>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={form.password} onChange={set('password')}
                                    placeholder="Min. 6 characters" required minLength={6}
                                    className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 pl-10 pr-10 text-white text-sm placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                                />
                                <button type="button" onClick={() => setShowPass(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {/* Strength bar */}
                            {strength && (
                                <div className="mt-1.5 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                                    </div>
                                    <span className={`text-xs font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={form.confirmPassword} onChange={set('confirmPassword')}
                                    placeholder="Re-enter your password" required
                                    className={`w-full bg-[#0B1120] border rounded-xl p-3 pl-10 pr-10 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors ${form.confirmPassword && form.confirmPassword !== form.password
                                            ? 'border-red-500/60 focus:border-red-500'
                                            : form.confirmPassword && form.confirmPassword === form.password
                                                ? 'border-emerald-500/60 focus:border-emerald-500'
                                                : 'border-gray-700 focus:border-cyan-500/50'
                                        }`}
                                />
                                <button type="button" onClick={() => setShowConfirm(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                                {form.confirmPassword && form.confirmPassword === form.password && (
                                    <CheckCircle size={15} className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-400" />
                                )}
                            </div>
                            {form.confirmPassword && form.confirmPassword !== form.password && (
                                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                            )}
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl transition-all disabled:opacity-50 mt-2 text-sm">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                            {loading ? 'Creating Account...' : 'Create Account & Verify Email →'}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
            <div className="relative">
                <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none" />
                {children}
            </div>
        </div>
    );
}
