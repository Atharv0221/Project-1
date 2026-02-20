'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, Zap, BookOpen, Loader2 } from 'lucide-react';
import { getDailyPlan } from '../../services/aiService';
import { useAuthStore } from '../../store/authStore';

interface Task {
    subject: string;
    topic: string;
    duration: string;
    type: string;
}

export default function DailyPlan() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = useAuthStore.getState().token;
        if (!token) {
            setLoading(false);
            return;
        }

        const fetchPlan = async () => {
            try {
                const data = await getDailyPlan();
                if (data.success && data.plan?.tasks) {
                    setTasks(data.plan.tasks);
                }
            } catch (error: any) {
                if (error.response?.status !== 401) {
                    console.error('Failed to fetch daily plan:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPlan();
    }, [useAuthStore.getState().token]);

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'weak topic':
            case 'focus':
                return <TrendingDown size={24} className="text-orange-500" />;
            case 'revision':
                return <Zap size={24} className="text-cyan-400" />;
            default:
                return <BookOpen size={24} className="text-purple-400" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'weak topic':
            case 'focus':
                return 'bg-orange-500/10';
            case 'revision':
                return 'bg-cyan-500/10';
            default:
                return 'bg-purple-500/10';
        }
    };

    const getLabelColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'weak topic':
            case 'focus':
                return 'text-orange-500';
            case 'revision':
                return 'text-cyan-400';
            default:
                return 'text-purple-400';
        }
    };

    if (loading) {
        return (
            <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">Generating Your Daily Plan...</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-[#151B2D] p-5 rounded-2xl border border-gray-800 animate-pulse h-40"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (tasks.length === 0) {
        return null; // Don't show if no tasks generated
    }

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-lg font-bold text-white">Adaptive Daily Plan</h3>
                </div>
                <span className="text-xs text-gray-500 font-medium">Suggested by AI Mentor</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((task, index) => (
                    <div key={index} className="bg-[#151B2D] p-5 rounded-2xl border border-gray-800 hover:border-gray-700 transition group cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl transition-colors duration-300 ${getBgColor(task.type)}`}>
                                {getIcon(task.type)}
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-white">{task.duration}</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest">EST. TIME</span>
                            </div>
                        </div>
                        <div>
                            <span className={`text-xs font-bold uppercase tracking-wider mb-1 block ${getLabelColor(task.type)}`}>
                                {task.type}
                            </span>
                            <h4 className="text-lg font-bold text-white mb-1">{task.subject}: {task.topic}</h4>
                            <p className="text-sm text-gray-400">Personalized for your progress</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
