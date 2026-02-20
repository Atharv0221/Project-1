'use client';

import { useState, useEffect } from 'react';
import { Bell, Flame, Bird, Info, Check } from 'lucide-react';
import { getNotifications, syncNotifications, markAsRead } from '../../services/notificationService';

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const data = await syncNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling every 5 minutes
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'STREAK': return <Flame className="text-orange-500" size={18} />;
            case 'NUDGE': return <Bird className="text-cyan-400" size={18} />;
            case 'REMINDER': return <Bell className="text-blue-400" size={18} />;
            default: return <Info className="text-gray-400" size={18} />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-cyan-400 transition relative p-2 rounded-full hover:bg-gray-800"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border border-[#0B1120] text-[10px] flex items-center justify-center text-white font-bold">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-[#151B2D] border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#1A2333]">
                            <h3 className="text-sm font-bold text-white">Notifications</h3>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{unreadCount} Unread</span>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-xs">All caught up!</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`p-4 border-b border-gray-800/50 hover:bg-[#1A2333] transition-colors group relative ${!n.isRead ? 'bg-[#1A2333]/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1 shrink-0">{getIcon(n.type)}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h4 className={`text-xs font-bold ${!n.isRead ? 'text-white' : 'text-gray-400'}`}>{n.title}</h4>
                                                    {!n.isRead && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(n.id)}
                                                            className="text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">{n.message}</p>
                                                <span className="text-[9px] text-gray-600 mt-2 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-3 bg-[#1A2333] border-t border-gray-800 text-center">
                            <button className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition uppercase tracking-widest">
                                View Activity Log
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
