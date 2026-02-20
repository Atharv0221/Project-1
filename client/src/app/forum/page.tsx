'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPosts, createPost } from '../../services/forumService';
import { getSubjects } from '../../services/contentService';
import { MessageSquare, Plus, ThumbsUp, MessageCircle, ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { format } from 'timeago.js';

export default function ForumPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filter State
    const [filterStandard, setFilterStandard] = useState('');
    const [filterBoard, setFilterBoard] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [subjects, setSubjects] = useState<any[]>([]);
    const [allSubjects, setAllSubjects] = useState<any[]>([]);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        loadPosts();
        // Load all subjects once on mount
        getSubjects().then((data) => {
            setAllSubjects(data);
            setSubjects(data);
        }).catch(console.error);
    }, []);

    // Re-run loadPosts when filters change
    useEffect(() => {
        loadPosts();
    }, [filterStandard, filterBoard, filterSubject, sortBy]);

    useEffect(() => {
        // Filter subjects by selected standard (client-side)
        if (filterStandard) {
            const filtered = allSubjects.filter(
                (s) => String(s.standard) === String(filterStandard)
            );
            setSubjects(filtered.length > 0 ? filtered : allSubjects);
        } else {
            setSubjects(allSubjects);
        }
        setFilterSubject(''); // reset subject when standard changes
    }, [filterStandard, allSubjects]);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const filters = {
                standard: filterStandard,
                board: filterBoard,
                subjectId: filterSubject,
                sortBy
            };
            const data = await getPosts(filters);
            setPosts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            if (subjectId) formData.append('subjectId', subjectId);
            if (file) formData.append('file', file);

            await createPost(formData);
            setShowCreate(false);
            setTitle('');
            setContent('');
            setFile(null);
            loadPosts();
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Failed to create post';
            alert(msg);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white p-8 pt-24 pl-0 lg:pl-72">
            <div className="max-w-5xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6 transition-colors">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Community Forum</h1>
                        <p className="text-gray-400">Discuss topics, ask questions, and share knowledge.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 border transition-all ${showFilters ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-[#151B2D] border-gray-700 text-gray-400 hover:text-white'}`}
                        >
                            <Filter size={20} />
                            Filters
                        </button>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                        >
                            <Plus size={20} />
                            New Post
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                {showFilters && (
                    <div className="bg-[#151B2D] border border-gray-700 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Standard</label>
                            <select
                                value={filterStandard}
                                onChange={(e) => setFilterStandard(e.target.value)}
                                className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none"
                            >
                                <option value="">All Standards</option>
                                <option value="8">8th Standard</option>
                                <option value="9">9th Standard</option>
                                <option value="10">10th Standard</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Board</label>
                            <select
                                value={filterBoard}
                                onChange={(e) => setFilterBoard(e.target.value)}
                                className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none"
                            >
                                <option value="">All Boards</option>
                                <option value="Maharashtra State Board">Maharashtra State Board</option>
                                <option value="CBSE">CBSE</option>
                                <option value="ICSE">ICSE</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Subject</label>
                            <select
                                value={filterSubject}
                                onChange={(e) => setFilterSubject(e.target.value)}
                                className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none"
                            >
                                <option value="">All Subjects</option>
                                {subjects.map(sub => (
                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="popular">Most Popular</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Posts List */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading discussions...</div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div key={post.id} className="block group cursor-pointer" onClick={() => router.push(`/forum/${post.id}`)}>
                                <div className="bg-[#151B2D] border border-gray-800 rounded-2xl p-6 transition-all group-hover:border-cyan-500/50 group-hover:bg-[#1A2333]">
                                    <div className="flex gap-4">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                            {post.user?.profilePhoto ? (
                                                <img src={post.user.profilePhoto} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                                    {post.user?.name?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">{post.title}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{post.user?.name || 'Unknown User'}</span>
                                                        <span>•</span>
                                                        <span>{format(post.createdAt)}</span>
                                                        {post.subject && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{post.subject.name}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-gray-400 text-sm line-clamp-2 mb-4">{post.content}</p>

                                            {post.fileUrl && (
                                                <div className="mb-4">
                                                    {post.fileUrl.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                                        <img src={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000'}${post.fileUrl}`} className="max-h-64 rounded-xl border border-gray-700" alt="Attachment" />
                                                    ) : (
                                                        <a
                                                            href={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000'}${post.fileUrl}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 p-3 bg-[#1A2333] border border-gray-700 rounded-xl text-cyan-400 hover:text-cyan-300 transition-colors w-max"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <div className="w-8 h-8 bg-red-500/10 rounded flex items-center justify-center text-red-500">
                                                                PDF
                                                            </div>
                                                            <span className="text-sm font-medium">View Attachment</span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex gap-6 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <ThumbsUp size={16} />
                                                    <span>{post.upvotes}</span>
                                                </div>
                                                <div className="flex items-center gap-1 group-hover:text-cyan-400">
                                                    <MessageCircle size={16} />
                                                    <span>{post._count?.replies || 0} Replies</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {posts.length === 0 && (
                            <div className="text-center py-20 bg-[#151B2D] rounded-3xl border border-gray-800">
                                <MessageSquare size={40} className="mx-auto text-gray-600 mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">No discussions yet</h3>
                                <p className="text-gray-600">Be the first to start a conversation!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Create Modal */}
                {showCreate && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm p-4">
                        <div className="bg-[#151B2D] p-8 rounded-3xl border border-gray-700 w-full max-w-2xl shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6">Create New Post</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                                        placeholder="What's on your mind?"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Content</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full h-32 bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Attachment (Image or PDF)</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="w-full bg-[#0B1120] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                                        accept="image/*,.pdf"
                                    />
                                </div>
                                {/* Subject Select could go here if I fetched subjects */}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreate(false)}
                                        className="flex-1 py-3 bg-[#1A2333] hover:bg-[#232D42] text-white font-bold rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
                                    >
                                        Post Discussion
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
