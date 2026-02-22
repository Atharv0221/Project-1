'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, Loader2, CheckCircle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPendingPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const [resending, setResending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleResend = async () => {
        setResending(true); setSent(false); setError('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) { setSent(true); }
            else { setError(data.message || 'Failed to resend.'); }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-cyan-500/8 blur-[150px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/8 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-md text-center">
                {/* Logo */}
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-8">
                    YATSYA
                </div>

                <div className="bg-[#151B2D] border border-gray-800 rounded-3xl p-10 shadow-2xl">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Mail size={36} className="text-cyan-400" />
                    </div>

                    <h1 className="text-2xl font-black text-white mb-2">Check Your Email! 📧</h1>
                    <p className="text-gray-400 text-sm mb-1">
                        We sent a verification link to:
                    </p>
                    <p className="text-cyan-400 font-bold text-sm mb-6 break-all">{email || 'your email address'}</p>

                    <div className="bg-[#0B1120] border border-gray-800 rounded-2xl p-5 text-left mb-6 space-y-3">
                        <Step num={1} text="Open your email inbox" />
                        <Step num={2} text='Find the email from "Yatsya Platform"' />
                        <Step num={3} text='Click "Verify My Email" button' />
                        <Step num={4} text="Come back and log in!" />
                    </div>

                    <p className="text-gray-500 text-xs mb-4">
                        Didn't receive the email? Check your <strong className="text-gray-400">spam/junk</strong> folder, or resend below.
                    </p>

                    {sent ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-bold py-3">
                            <CheckCircle size={16} />
                            Email resent! Check your inbox.
                        </div>
                    ) : (
                        <button onClick={handleResend} disabled={resending}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#0B1120] border border-gray-700 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-400 font-bold rounded-xl transition-all text-sm disabled:opacity-50">
                            {resending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCcw size={15} />}
                            {resending ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                    )}
                    {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

                    <div className="mt-6 pt-6 border-t border-gray-800">
                        <Link href="/login" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Step({ num, text }: { num: number; text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-black flex-shrink-0">
                {num}
            </div>
            <span className="text-gray-400 text-sm">{text}</span>
        </div>
    );
}
