'use client';

import { useState } from 'react';
import { ShieldCheck, Sparkles, BarChart, MessageSquare, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { upgradeToPro } from '../../services/profileService';

export default function ProPlanCard() {
    const { user, login, token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const response = await upgradeToPro();
            if (response.isPro) {
                // Update local user state
                const updatedUser = { ...user!, isPro: true, subscriptionExpiry: response.subscriptionExpiry };
                login(updatedUser, token!);
                setSuccess(true);
            }
        } catch (error) {
            console.error('Failed to upgrade:', error);
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = user?.role === 'ADMIN';

    if ((user?.isPro || isAdmin) && !success) return null;

    if (success) {
        return (
            <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 rounded-[2.5rem] p-8 relative overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/50">
                        <CheckCircle2 size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">You're now a PRO!</h2>
                    <p className="text-gray-400 mb-6">Welcome to the elite rank of scholarship. All features are now unlocked.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#151B2D] border border-gray-800 rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-cyan-600/10 to-purple-600/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-cyan-600/20 transition-all duration-500"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20">
                        <ShieldCheck size={24} className="text-white" />
                    </div>
                    <div>
                        <span className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em] mb-1 block">Membership</span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Yatsya Pro Plan</h2>
                    </div>
                    <div className="ml-auto bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                        <span className="text-xs font-bold text-cyan-400">₹99/6mo</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-3 bg-[#1A1F33]/50 p-4 rounded-2xl border border-gray-800 transition-colors hover:border-gray-700">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <Sparkles size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-300">Unlimited AI Mentoring</span>
                    </div>
                    <div className="flex items-center gap-3 bg-[#1A1F33]/50 p-4 rounded-2xl border border-gray-800 transition-colors hover:border-gray-700">
                        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                            <BarChart size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-300">Advanced Analytics</span>
                    </div>
                    <div className="flex items-center gap-3 bg-[#1A1F33]/50 p-4 rounded-2xl border border-gray-800 transition-colors hover:border-gray-700">
                        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                            <MessageSquare size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-300">Priority Forum Support</span>
                    </div>
                    <div className="flex items-center gap-3 bg-[#1A1F33]/50 p-4 rounded-2xl border border-gray-800 transition-colors hover:border-gray-700">
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                            <CheckCircle2 size={18} />
                        </div>
                        <span className="text-sm font-medium text-gray-300">Exclusive Pro Badge</span>
                    </div>
                </div>

                <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] disabled:opacity-70 group"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Processing Secure Payment...
                        </>
                    ) : (
                        <>
                            Upgrade Now (₹99 for 6 months)
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
                <p className="text-[10px] text-center text-gray-500 mt-4 leading-relaxed">
                    By upgrading, you agree to our Terms of Service. Payment is securely processed for a 180-day billing cycle.
                </p>
            </div>
        </div>
    );
}
