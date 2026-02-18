'use client';

import { useState, useEffect } from 'react';
import { getPosts, createPost } from '../../services/forumService';
import { MessageSquare, Plus, ThumbsUp, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'timeago.js';

export default function ForumPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [subjectId, setSubjectId] = useState('');

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const data = await getPosts();
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
            await createPost({ title, content, subjectId: subjectId || undefined }); // Optional subject
            setShowCreate(false);
            setTitle('');
            setContent('');
            loadPosts();
        } catch (error) {
            alert('Failed to create post');
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
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Community Forum</h1>
                        <p className="text-gray-400">Discuss topics, ask questions, and share knowledge.</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        New Post
                    </button>
                </div>

                {/* Posts List */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading discussions...</div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <Link href={`/forum/${post.id}`} key={post.id} className="block group">
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
                            </Link>
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
                                        placeholder="Describe your question or topic..."
                                        required
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
