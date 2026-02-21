'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
    const [message, setMessage] = useState('');
    const [resending, setResending] = useState(false);
    const [resendEmail, setResendEmail] = useState('');
    const [resendMsg, setResendMsg] = useState('');

    useEffect(() => {
        if (!token) { setStatus('no-token'); return; }

        fetch(`http://localhost:5000/api/auth/verify-email?token=${token}`)
            .then(async res => {
                const data = await res.json();
                if (res.ok) {
                    setStatus('success');
                    setMessage(data.message);
                    // Redirect to login after 3s
                    setTimeout(() => router.push('/login'), 3000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed.');
                }
            })
            .catch(() => { setStatus('error'); setMessage('Network error. Please try again.'); });
    }, [token]);

    const handleResend = async () => {
        if (!resendEmail.trim()) return;
        setResending(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resendEmail })
            });
            const data = await res.json();
            setResendMsg(data.message);
        } catch {
            setResendMsg('Failed to resend. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 bg-[#151B2D] border border-gray-800 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                {/* Logo */}
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-8">
                    YATSYA
                </div>

                {status === 'loading' && (
                    <div>
                        <Loader2 size={52} className="animate-spin text-cyan-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Verifying your email...</h2>
                        <p className="text-gray-500 text-sm">Please wait a moment.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div>
                        <CheckCircle size={52} className="text-emerald-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-white mb-2">Email Verified! 🎉</h2>
                        <p className="text-gray-400 text-sm mb-6">{message}</p>
                        <p className="text-gray-500 text-xs">Redirecting to login in 3 seconds...</p>
                        <Link href="/login" className="inline-block mt-4 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl transition-all text-sm">
                            Go to Login →
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <XCircle size={52} className="text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-white mb-2">Verification Failed</h2>
                        <p className="text-gray-400 text-sm mb-6">{message}</p>

                        {/* Resend section */}
                        <div className="bg-[#0B1120] border border-gray-700 rounded-2xl p-5 text-left">
                            <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                                <Mail size={14} className="text-cyan-400" />
                                Resend verification email
                            </p>
                            <input
                                type="email"
                                placeholder="Enter your email..."
                                value={resendEmail}
                                onChange={e => setResendEmail(e.target.value)}
                                className="w-full bg-[#151B2D] border border-gray-700 rounded-xl p-3 text-white text-sm placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none mb-3"
                            />
                            <button
                                onClick={handleResend}
                                disabled={resending || !resendEmail}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl transition-all disabled:opacity-50 text-sm"
                            >
                                {resending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                                {resending ? 'Sending...' : 'Resend Email'}
                            </button>
                            {resendMsg && <p className="text-emerald-400 text-xs mt-2 text-center">{resendMsg}</p>}
                        </div>
                    </div>
                )}

                {status === 'no-token' && (
                    <div>
                        <XCircle size={52} className="text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-white mb-2">No Token Provided</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Please use the verification link sent to your email.
                        </p>
                        <Link href="/login" className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl transition-all text-sm">
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
