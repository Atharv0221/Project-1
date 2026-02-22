'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap, Search, Star, Youtube, Mail, BookOpen,
    Globe, X, Send, CheckCircle, Loader2, Filter, ChevronDown
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { getMentors, rateMentor, Mentor } from '@/services/mentorService';
import { useAuthStore } from '@/store/authStore';

const BOARDS = ['All Boards', 'CBSE', 'ICSE', 'Maharashtra State Board', 'Gujarat Board', 'UP Board'];
const STANDARDS = ['All Standards', '8', '9', '10'];
const LANGUAGES = ['All Languages', 'English', 'Hindi', 'Marathi'];

const getProfilePicUrl = (path: string) => {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const getYouTubeEmbedUrl = (url: string) => {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            if (urlObj.pathname === '/watch') return `https://www.youtube.com/embed/${urlObj.searchParams.get('v')}`;
            if (urlObj.pathname === '/playlist') return `https://www.youtube.com/embed/videoseries?list=${urlObj.searchParams.get('list')}`;
            if (urlObj.pathname.startsWith('/embed/')) return url;
            if (urlObj.hostname === 'youtu.be') return `https://www.youtube.com/embed${urlObj.pathname}`;
        }
    } catch (e) { }
    return url;
};

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(s => (
                <button
                    key={s}
                    disabled={readonly}
                    onMouseEnter={() => !readonly && setHovered(s)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    onClick={() => onChange?.(s)}
                    className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                >
                    <Star
                        size={18}
                        className={`transition-colors ${(hovered || value) >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                    />
                </button>
            ))}
        </div>
    );
}

function MentorCard({ mentor, onClick }: { mentor: Mentor; onClick: () => void }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            onClick={onClick}
            className="bg-[#151B2D] border border-gray-800 hover:border-cyan-500/40 rounded-2xl p-6 cursor-pointer transition-all group"
        >
            {/* Avatar */}
            <div className="flex items-start gap-4 mb-4">
                {mentor.profilePicture ? (
                    <img src={getProfilePicUrl(mentor.profilePicture)} alt={mentor.name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                        {mentor.name[0].toUpperCase()}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg leading-tight group-hover:text-cyan-400 transition-colors truncate">{mentor.name}</h3>
                    {mentor.avgRating ? (
                        <div className="flex items-center gap-1 mt-1">
                            <Star size={13} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-yellow-400 font-bold text-sm">{mentor.avgRating}</span>
                            <span className="text-gray-500 text-xs">({mentor.totalRatings} reviews)</span>
                        </div>
                    ) : (
                        <span className="text-gray-600 text-xs mt-1 block">No ratings yet</span>
                    )}
                </div>
            </div>

            {/* Tags */}
            <div className="space-y-2 text-sm">
                <div className="flex flex-wrap gap-1">
                    {mentor.boards.map(b => (
                        <span key={b} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs">{b}</span>
                    ))}
                </div>
                <div className="flex flex-wrap gap-1">
                    {mentor.standards.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-xs">Std {s}</span>
                    ))}
                </div>
                <div className="flex flex-wrap gap-1">
                    {mentor.languages.map(l => (
                        <span key={l} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs">{l}</span>
                    ))}
                </div>
            </div>

            {mentor.bio && (
                <p className="text-gray-500 text-xs mt-3 line-clamp-2">{mentor.bio}</p>
            )}

            <button className="w-full mt-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold hover:bg-cyan-500 hover:text-white transition-all">
                View Profile
            </button>
        </motion.div>
    );
}

export function MentorModal({ mentor, onClose, currentUserId }: { mentor: Mentor; onClose: () => void; currentUserId: string }) {
    const [ratingValue, setRatingValue] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [ratingDone, setRatingDone] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'playlists' | 'rate'>('profile');
    const [playlistFilter, setPlaylistFilter] = useState<string>('All');
    const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState('');

    const playlistCategories = ['All', ...Array.from(new Set(mentor.playlists?.map(p => p.category).filter(Boolean)))];
    const filteredPlaylists = mentor.playlists?.filter(p => playlistFilter === 'All' || p.category === playlistFilter) || [];

    const handleRate = async () => {
        if (!ratingValue) { setError('Please select a star rating.'); return; }
        setSubmittingRating(true); setError('');
        try {
            await rateMentor(mentor.id, ratingValue, ratingComment);
            setRatingDone(true);
        } catch (e: any) {
            setError(e.message || 'Failed to submit rating.');
        } finally {
            setSubmittingRating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-[#0F1729] border border-gray-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {mentor.profilePicture ? (
                            <img src={getProfilePicUrl(mentor.profilePicture)} alt={mentor.name} className="w-14 h-14 rounded-2xl object-cover text-xl" />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-black text-2xl">
                                {mentor.name[0].toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-black text-white">{mentor.name}</h2>
                            {mentor.avgRating ? (
                                <div className="flex items-center gap-1 mt-1">
                                    <StarRating value={Math.round(mentor.avgRating)} readonly />
                                    <span className="text-yellow-400 text-sm font-bold">{mentor.avgRating}</span>
                                    <span className="text-gray-500 text-xs">({mentor.totalRatings})</span>
                                </div>
                            ) : <span className="text-gray-600 text-xs">No ratings yet</span>}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-2 hover:bg-gray-800 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800">
                    {(['profile', ...(mentor.playlists?.length ? ['playlists'] : []), 'rate'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab as any); setError(''); }}
                            className={`flex-1 py-3 text-sm font-bold capitalize transition-all ${activeTab === tab ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-white'}`}
                        >
                            {tab === 'rate' ? 'Rate Mentor' : tab}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-5">
                            {mentor.bio && (
                                <div className="bg-[#151B2D] rounded-2xl p-4">
                                    <p className="text-gray-300 leading-relaxed text-sm">{mentor.bio}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-3">
                                <InfoRow icon={BookOpen} label="Boards" value={mentor.boards.join(', ')} color="purple" />
                                <InfoRow icon={GraduationCap} label="Standards" value={mentor.standards.map(s => `Std ${s}`).join(', ')} color="cyan" />
                                <InfoRow icon={Globe} label="Languages" value={mentor.languages.join(', ')} color="emerald" />
                                <InfoRow icon={Mail} label="Email" value={mentor.email} color="blue" />
                                {mentor.youtubeChannel && (
                                    <div className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                                        <Youtube size={16} className="text-red-400 flex-shrink-0" />
                                        <a href={`https://youtube.com/@${mentor.youtubeChannel}`} target="_blank" rel="noreferrer" className="text-red-400 hover:text-red-300 text-sm font-medium truncate">
                                            {mentor.youtubeChannel}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Reviews */}
                            {mentor.ratings.length > 0 && (
                                <div>
                                    <h4 className="text-white font-bold mb-3 text-sm">Student Reviews</h4>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {mentor.ratings.map((r: any, i) => (
                                            <div key={i} className="bg-[#151B2D] rounded-xl p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <StarRating value={r.rating} readonly />
                                                </div>
                                                {r.comment && <p className="text-gray-400 text-xs">{r.comment}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Playlists Tab */}
                    {activeTab === 'playlists' && (
                        <div className="space-y-4">
                            {playlistCategories.length > 1 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {playlistCategories.map(cat => (
                                        <button key={cat as string} onClick={() => setPlaylistFilter(cat as string)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${playlistFilter === cat ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'}`}>
                                            {cat as string}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredPlaylists.map((playlist, i) => (
                                    <button key={i} onClick={() => setPlayingVideoUrl(playlist.url)} className="flex flex-col gap-1 p-3 bg-[#151B2D] border border-gray-800 hover:border-cyan-500/50 rounded-xl transition-all group text-left">
                                        <div className="flex justify-between items-start w-full gap-2">
                                            <span className="text-white text-sm font-bold group-hover:text-cyan-400 transition-colors line-clamp-2 flex-1">{playlist.title}</span>
                                            <Youtube size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                                        </div>
                                        {playlist.category && <span className="text-xs text-cyan-500 font-medium px-2 py-0.5 bg-cyan-500/10 rounded-md mt-1 self-start">{playlist.category}</span>}
                                        <span className="text-xs text-gray-500 truncate mt-auto">{playlist.url}</span>
                                    </button>
                                ))}
                                {filteredPlaylists.length === 0 && <p className="text-gray-500 text-sm py-4 col-span-full text-center">No playlists found for this category.</p>}
                            </div>
                        </div>
                    )}
                    {/* Rate Mentor Tab */}
                    {activeTab === 'rate' && (
                        <div className="space-y-4">
                            {ratingDone ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="mx-auto text-emerald-400 mb-3" size={48} />
                                    <h3 className="text-white font-bold text-lg mb-1">Thank you!</h3>
                                    <p className="text-gray-400 text-sm">Your rating for <strong>{mentor.name}</strong> has been saved.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-[#151B2D] rounded-2xl p-5 text-center">
                                        <p className="text-gray-400 text-sm mb-3">Rate your experience with <strong className="text-white">{mentor.name}</strong></p>
                                        <div className="flex justify-center">
                                            <StarRating value={ratingValue} onChange={setRatingValue} />
                                        </div>
                                        <p className="text-gray-600 text-xs mt-2">
                                            {ratingValue === 1 ? 'Poor' : ratingValue === 2 ? 'Fair' : ratingValue === 3 ? 'Good' : ratingValue === 4 ? 'Very Good' : ratingValue === 5 ? 'Excellent!' : 'Tap a star'}
                                        </p>
                                    </div>
                                    <textarea
                                        value={ratingComment}
                                        onChange={e => setRatingComment(e.target.value)}
                                        placeholder="Share your experience (optional)..."
                                        rows={3}
                                        className="w-full bg-[#151B2D] border border-gray-700 rounded-xl p-4 text-white text-sm placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none resize-none"
                                    />
                                    {error && <p className="text-red-400 text-sm">{error}</p>}
                                    <button
                                        onClick={handleRate}
                                        disabled={submittingRating || !ratingValue}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl transition-all disabled:opacity-50"
                                    >
                                        {submittingRating ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
                                        {submittingRating ? 'Submitting...' : 'Submit Rating'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Overlay Player */}
                {playingVideoUrl && (
                    <div className="absolute inset-0 z-50 bg-[#0F1729] rounded-3xl flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0B1120]">
                            <div className="flex items-center gap-2 text-red-500 font-bold">
                                <Youtube size={20} /> Now Playing
                            </div>
                            <button onClick={() => setPlayingVideoUrl(null)} className="text-gray-500 hover:text-white p-2 hover:bg-gray-800 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 bg-black w-full h-full p-0 m-0">
                            <iframe
                                src={`${getYouTubeEmbedUrl(playingVideoUrl)}`}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

function InfoRow({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
    const colors: any = { purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20', cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    return (
        <div className={`flex items-center gap-3 p-3 border rounded-xl ${colors[color]}`}>
            <Icon size={16} className="flex-shrink-0" />
            <div>
                <span className="text-gray-500 text-xs">{label}</span>
                <p className="text-white text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

export default function MentorsPage() {
    const { user } = useAuthStore();
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [filtered, setFiltered] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [search, setSearch] = useState('');
    const [boardFilter, setBoardFilter] = useState('All Boards');
    const [stdFilter, setStdFilter] = useState('All Standards');
    const [langFilter, setLangFilter] = useState('All Languages');

    useEffect(() => {
        fetchMentors();
    }, []);

    useEffect(() => {
        let result = mentors;
        if (search) result = result.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.bio?.toLowerCase().includes(search.toLowerCase()));
        if (boardFilter !== 'All Boards') result = result.filter(m => m.boards.includes(boardFilter));
        if (stdFilter !== 'All Standards') result = result.filter(m => m.standards.includes(stdFilter));
        if (langFilter !== 'All Languages') result = result.filter(m => m.languages.includes(langFilter));
        setFiltered(result);
    }, [mentors, search, boardFilter, stdFilter, langFilter]);

    const fetchMentors = async () => {
        setLoading(true);
        try {
            const data = await getMentors();
            setMentors(data);
            setFiltered(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white">
            <Sidebar />
            <Header />
            <main className="ml-0 lg:ml-64 pt-20 p-6 transition-all">
                {/* Ambient BG */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-bold mb-4">
                            <GraduationCap size={16} />
                            FIND YOUR MENTOR
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
                            Expert <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Mentors</span>
                        </h1>
                        <p className="text-gray-400">Connect with experienced teachers for 1-on-1 guidance.</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-[#151B2D] border border-gray-800 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search mentors..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-[#0B1120] border border-gray-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none"
                            />
                        </div>
                        {/* Board Filter */}
                        <FilterSelect label="Board" value={boardFilter} options={BOARDS} onChange={setBoardFilter} />
                        <FilterSelect label="Standard" value={stdFilter} options={STANDARDS} onChange={setStdFilter} />
                        <FilterSelect label="Language" value={langFilter} options={LANGUAGES} onChange={setLangFilter} />
                    </div>

                    {/* Count */}
                    <p className="text-gray-500 text-sm mb-4">
                        {loading ? 'Loading...' : `${filtered.length} mentor${filtered.length !== 1 ? 's' : ''} found`}
                    </p>

                    {/* Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-[#151B2D] border border-gray-800 rounded-2xl p-6 animate-pulse">
                                    <div className="flex gap-3 mb-4">
                                        <div className="w-14 h-14 bg-gray-800 rounded-2xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-800 rounded w-3/4" />
                                            <div className="h-3 bg-gray-800 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-6 bg-gray-800 rounded-full w-24" />
                                        <div className="h-6 bg-gray-800 rounded-full w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <GraduationCap size={48} className="mx-auto text-gray-700 mb-4" />
                            <h3 className="text-xl font-bold text-gray-500">No mentors found</h3>
                            <p className="text-gray-600 text-sm mt-1">Try adjusting your filters.</p>
                        </div>
                    ) : (
                        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <AnimatePresence>
                                {filtered.map(mentor => (
                                    <MentorCard key={mentor.id} mentor={mentor} onClick={() => setSelectedMentor(mentor)} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Mentor Modal */}
            <AnimatePresence>
                {selectedMentor && (
                    <MentorModal
                        mentor={selectedMentor}
                        onClose={() => setSelectedMentor(null)}
                        currentUserId={user?.id || ''}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="appearance-none bg-[#0B1120] border border-gray-700 rounded-xl py-2.5 pl-3 pr-8 text-sm text-white focus:border-cyan-500/50 focus:outline-none cursor-pointer w-full md:w-auto"
            >
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
    );
}
