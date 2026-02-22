'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, Loader2, Mic, MicOff } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { useAuthStore } from '../../store/authStore';
import { sendChatMessage, getChatHistory, getConversationMessages, clearChatHistory } from '../../services/aiService';
import { Trash2 } from 'lucide-react';

export default function AIMentorPage() {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    const toggleListening = () => {
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Your browser does not support speech recognition.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
            setInput(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const historyData = await getChatHistory();
                if (historyData.success && historyData.conversations.length > 0) {
                    const latestConv = historyData.conversations[0];
                    const msgData = await getConversationMessages(latestConv.id);
                    if (msgData.success && msgData.messages.length > 0) {
                        setMessages(msgData.messages.map((m: any) => ({
                            role: m.role,
                            content: m.content
                        })));
                    } else {
                        // Empty conversation found, show welcome
                        setMessages([{ role: 'assistant', content: "Hi! I'm Yatsya, your AI Mentor. I can help with study plans, explanations, or just motivation. What's on your mind?" }]);
                    }
                } else {
                    // No conversations, show welcome
                    setMessages([{ role: 'assistant', content: "Hi! I'm Yatsya, your AI Mentor. I can help with study plans, explanations, or just motivation. What's on your mind?" }]);
                }
            } catch (error) {
                console.error('Failed to load history', error);
                setMessages([{ role: 'assistant', content: "Hi! I'm Yatsya, your AI Mentor. I can help with study plans, explanations, or just motivation. What's on your mind?" }]);
            } finally {
                setInitialLoading(false);
            }
        };
        loadHistory();
    }, []);

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input;
        setInput('');

        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
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

    const handleClearChat = async () => {
        if (!confirm('Are you sure you want to clear your chat history?')) return;
        try {
            await clearChatHistory();
            setMessages([{ role: 'assistant', content: "Hi! I'm Yatsya, your AI Mentor. I can help with study plans, explanations, or just motivation. What's on your mind?" }]);
        } catch (error) {
            console.error('Failed to clear chat', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white">
            <Sidebar />
            <Header />

            <main className="ml-0 lg:ml-64 pt-16 h-screen flex flex-col transition-all">
                {/* Chat Header */}
                <div className="px-4 py-3 md:px-8 border-b border-gray-800 flex justify-between items-center bg-[#0B1120]/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                            <Bot className="text-cyan-400" size={20} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-sm md:text-base">AI Mentor</h2>
                            <p className="text-xs text-cyan-500/60 font-medium">Always Active</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClearChat}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex items-center gap-2 text-xs md:text-sm"
                        title="Clear History"
                    >
                        <Trash2 size={16} />
                        <span className="hidden md:inline">Clear Chat</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                    {initialLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 text-gray-500">
                            <Loader2 className="animate-spin text-cyan-500" size={32} />
                            <p className="text-sm font-medium">Loading your conversation...</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
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
                        )))}
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
                            placeholder={isListening ? "Listening..." : "Ask me anything..."}
                            className="w-full bg-[#151B2D] border border-gray-700 rounded-full py-4 pl-6 pr-24 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-lg"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={toggleListening}
                            className={`absolute right-14 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-400 hover:text-cyan-400'}`}
                            title={isListening ? "Stop listening" : "Start voice command"}
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
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
