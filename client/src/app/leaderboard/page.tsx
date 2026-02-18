'use client';

import { useState, useEffect } from 'react';
import { getGlobalLeaderboard, getStandardLeaderboard, getSubjectLeaderboard, getUserRank } from '../../services/leaderboardService';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface LeaderboardUser {
    id: string;
    name: string;
    email: string;
    xp: number;
    rankScore: number;
    scholarStatus: string;
    streak: number;
    rank: number;
}

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<'global' | 'standard' | 'subject'>('global');
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [userRank, setUserRank] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStandard, setSelectedStandard] = useState('8');

    useEffect(() => {
        fetchLeaderboard();
        fetchUserRank();
    }, [activeTab, selectedStandard]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            let data;
            if (activeTab === 'global') {
                data = await getGlobalLeaderboard();
            } else if (activeTab === 'standard') {
                data = await getStandardLeaderboard(selectedStandard);
            } else {
                // For subject, we'd need to select a subject first
                data = await getGlobalLeaderboard();
            }
            setLeaderboard(data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRank = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (userId) {
                const data = await getUserRank(userId);
                setUserRank(data);
            }
        } catch (error) {
            console.error('Error fetching user rank:', error);
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="text-yellow-400" size={24} />;
        if (rank === 2) return <Medal className="text-gray-400" size={24} />;
        if (rank === 3) return <Award className="text-orange-400" size={24} />;
        return <span className="text-gray-500 font-bold">#{rank}</span>;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Elite Scholar': return 'text-purple-400';
            case 'Gold Scholar': return 'text-yellow-400';
            case 'Smart Scholar': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Leaderboard
                    </h1>
                    <p className="text-gray-400">Compete with learners across the platform</p>
                </div>

                {/* User Rank Card */}
                {userRank && (
                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                                    <TrendingUp size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Your Rank</h3>
                                    <p className="text-gray-400">#{userRank.rank} out of {userRank.totalUsers} learners</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-cyan-400">{userRank.rankScore}</div>
                                <div className="text-sm text-gray-400">Rank Score</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('global')}
                        className={`px-6 py-3 font-bold transition-all ${activeTab === 'global'
                                ? 'text-cyan-400 border-b-2 border-cyan-400'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Global
                    </button>
                    <button
                        onClick={() => setActiveTab('standard')}
                        className={`px-6 py-3 font-bold transition-all ${activeTab === 'standard'
                                ? 'text-cyan-400 border-b-2 border-cyan-400'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Standard-wise
                    </button>
                </div>

                {/* Standard Selector (only for standard tab) */}
                {activeTab === 'standard' && (
                    <div className="mb-6">
                        <select
                            value={selectedStandard}
                            onChange={(e) => setSelectedStandard(e.target.value)}
                            className="bg-[#1A2333] border border-gray-700 rounded-lg px-4 py-2 text-white"
                        >
                            <option value="8">Standard 8</option>
                            <option value="9">Standard 9</option>
                            <option value="10">Standard 10</option>
                        </select>
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="bg-[#151B2D] rounded-2xl border border-gray-800 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Loading leaderboard...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#1A2333] border-b border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Rank</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Status</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">XP</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">Rank Score</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">Streak</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((user) => (
                                        <tr
                                            key={user.id}
                                            className={`border-b border-gray-800 hover:bg-[#1A2333] transition-colors ${user.id === localStorage.getItem('userId') ? 'bg-cyan-500/5' : ''
                                                }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getRankIcon(user.rank)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${getStatusColor(user.scholarStatus)}`}>
                                                    {user.scholarStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-cyan-400">
                                                {user.xp.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold">
                                                {user.rankScore.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <span className="font-bold text-orange-400">{user.streak}</span>
                                                    <span className="text-gray-500">🔥</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
