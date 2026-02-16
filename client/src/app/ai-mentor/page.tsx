'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { sendChatMessage } from '../../services/aiService';
import { Send, Sparkles, BookOpen, TrendingUp, Lightbulb } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function AIMentorPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hello! I'm your AI Learning Mentor. I'm here to help you with your studies, answer questions, and provide personalized guidance. What would you like to learn about today?",
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const userContext = {
                weakTopics: ['Organic Chemistry', 'Calculus'],
                recentSubjects: ['Mathematics', 'Chemistry'],
                level: 14
            };

            const response = await sendChatMessage(inputMessage, userContext);

            const assistantMessage: Message = {
                role: 'assistant',
                content: response.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: "I'm sorry, I encountered an error. Please make sure you've added your Gemini API key to the server .env file.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickPrompts = [
        { icon: BookOpen, text: "Explain Organic Chemistry basics", color: "orange" },
        { icon: TrendingUp, text: "Help me improve in Calculus", color: "cyan" },
        { icon: Lightbulb, text: "Give me study tips", color: "yellow" },
    ];

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0B1120] text-white">
            <Sidebar />
            <Header />

            <main className="ml-64 pt-16 p-8">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                                <Sparkles className="text-purple-400" size={24} />
                            </div>
                            <h1 className="text-3xl font-bold">AI Learning Mentor</h1>
                        </div>
                        <p className="text-gray-400">Get personalized help with your studies</p>
                    </div>

                    {/* Chat Container */}
                    <div className="bg-[#151B2D] rounded-3xl border border-gray-800 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl p-4 ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                : 'bg-[#1A2333] border border-gray-700'
                                            }`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles size={16} className="text-purple-400" />
                                                <span className="text-xs font-bold text-purple-400">AI MENTOR</span>
                                            </div>
                                        )}
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                        <span className="text-[10px] text-gray-500 mt-2 block">
                                            {message.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-[#1A2333] border border-gray-700 rounded-2xl p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Prompts */}
                        {messages.length === 1 && (
                            <div className="px-6 pb-4">
                                <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">Quick Start</p>
                                <div className="flex gap-2 flex-wrap">
                                    {quickPrompts.map((prompt, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setInputMessage(prompt.text)}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#1A2333] hover:bg-[#232D42] border border-gray-700 rounded-lg text-sm transition-all group"
                                        >
                                            <prompt.icon size={16} className={`text-${prompt.color}-400`} />
                                            <span>{prompt.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-800">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Ask me anything about your studies..."
                                    className="flex-1 bg-[#0B1120] border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !inputMessage.trim()}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all flex items-center gap-2"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
}
