'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import Link from 'next/link';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [board, setBoard] = useState('Maharashtra State Board');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password,
                board,
            });

            router.push('/login?message=Account created successfully. Please log in.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold mb-6 text-center text-purple-400">Sign Up</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Educational Board</label>
                        <select
                            value={board}
                            onChange={(e) => setBoard(e.target.value)}
                            className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-purple-500 focus:outline-none text-white"
                            required
                        >
                            <option value="Maharashtra State Board">Maharashtra State Board</option>
                            <option value="CBSE">CBSE</option>
                            <option value="ICSE">ICSE</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded font-bold transition duration-200"
                    >
                        Create Account
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-purple-400 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
