'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { useAuthStore } from '../../store/authStore';
import { sendChatMessage } from '../../services/aiService';

export default function AIMentorPage() {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: "Hi! I'm Yatsya, your AI Mentor. I can help with study plans, explanations, or just motivation. What's on your mind?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        setLoading(true);

        try {
            const botResponseData = await sendChatMessage(userMessage, {
                level: user?.classStandard || 8,
                weakTopics: [], // TODO: Fetch from analytics
            });
            const botResponse = botResponseData.response;
            setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white">
            <Sidebar />
            <Header />

            <main className="ml-0 lg:ml-64 pt-16 h-screen flex flex-col transition-all">
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/50">
                                    <Bot size={16} />
                                </div>
                            )}
                            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                                : 'bg-[#151B2D] border border-gray-800 text-gray-300 rounded-tl-none'
                                }`}>
                                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{msg.content}</p>
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                    <User size={16} />
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/50">
                                <Bot size={16} />
                            </div>
                            <div className="bg-[#151B2D] border border-gray-800 rounded-2xl p-4 rounded-tl-none flex items-center gap-2 text-gray-400">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm">Yatsya is thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-8 bg-[#0B1120] border-t border-gray-800">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            className="w-full bg-[#151B2D] border border-gray-700 rounded-full py-4 pl-6 pr-14 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-lg"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-500 mt-2">Yatsya can make mistakes. Consider checking important information.</p>
                </div>
            </main>
        </div>
    );
}
