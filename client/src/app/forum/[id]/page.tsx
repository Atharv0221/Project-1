'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPost, createReply, likePost } from '../../../services/forumService';
import { format } from 'timeago.js';
import { ArrowLeft, MessageSquare, ThumbsUp, Send } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../../../store/authStore';

export default function ThreadPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.id as string;
    const { user } = useAuthStore();

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');

    useEffect(() => {
        if (postId) loadPost();
    }, [postId]);

    const loadPost = async () => {
        try {
            const data = await getPost(postId);
            setPost(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createReply(postId, replyContent);
            setReplyContent('');
            loadPost(); // Refresh
        } catch (error) {
            alert('Failed to post reply');
        }
    };

    const handleLike = async () => {
        try {
            await likePost(postId);
            // Optimistic update
            setPost((prev: any) => ({ ...prev, upvotes: prev.upvotes + 1 }));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="text-center py-20 bg-[#0B1120] text-gray-500 min-h-screen pt-24 pl-0 lg:pl-72">Loading discussion...</div>;
    if (!post) return <div className="text-center py-20 bg-[#0B1120] text-gray-500 min-h-screen pt-24 pl-0 lg:pl-72">Post not found</div>;

    return (
        <div className="min-h-screen bg-[#0B1120] text-white p-8 pt-24 pl-0 lg:pl-72">
            <div className="max-w-4xl mx-auto">
                <Link href="/forum" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6 transition-colors">
                    <ArrowLeft size={18} />
                    Back to Forum
                </Link>

                {/* Main Post */}
                <div className="bg-[#151B2D] border border-gray-800 rounded-3xl p-8 mb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden">
                                {post.user?.profilePhoto ? (
                                    <img src={post.user.profilePhoto} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                                        {post.user?.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">{post.title}</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span className="text-cyan-400 font-medium">{post.user?.name}</span>
                                    <span>•</span>
                                    <span>{format(post.createdAt)}</span>
                                    {post.subject && (
                                        <>
                                            <span>•</span>
                                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 text-xs">{post.subject.name}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none text-gray-300 mb-8 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                    </div>

                    <div className="flex items-center gap-6 pt-6 border-t border-gray-800">
                        <button
                            onClick={handleLike}
                            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
                        >
                            <ThumbsUp size={20} />
                            <span className="font-bold">{post.upvotes} Upvotes</span>
                        </button>
                        <div className="flex items-center gap-2 text-gray-400">
                            <MessageSquare size={20} />
                            <span className="font-bold">{post.replies.length} Replies</span>
                        </div>
                    </div>
                </div>

                {/* Replies Section */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        Replies <span className="bg-gray-800 text-sm px-2 py-1 rounded-full text-gray-400">{post.replies.length}</span>
                    </h3>

                    <div className="space-y-6">
                        {post.replies.map((reply: any) => (
                            <div key={reply.id} className="flex gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-700">
                                    {reply.user?.profilePhoto ? (
                                        <img src={reply.user.profilePhoto} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                            {reply.user?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-[#1A2333] border border-gray-800 rounded-2xl p-4 rounded-tl-none">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-sm text-cyan-400">{reply.user?.name}</span>
                                            <span className="text-xs text-gray-500">{format(reply.createdAt)}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{reply.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reply Form */}
                <div className="bg-[#151B2D] border border-gray-800 rounded-3xl p-6 sticky bottom-6 shadow-2xl">
                    <form onSubmit={handleReply} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0 hidden md:block">
                            {user?.profilePhoto ? (
                                <img src={user.profilePhoto} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full bg-[#0B1120] border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-white focus:outline-none focus:border-cyan-500 transition-all"
                                required
                            />
                            <button
                                type="submit"
                                disabled={!replyContent.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg disabled:opacity-50 disabled:bg-gray-700 transition-all"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
