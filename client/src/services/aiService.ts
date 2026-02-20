import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:5000/api/ai';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        // Return a Promise.reject or a custom signal to stop the request
        // But better is to let the component handle it or return empty data
    }
    return config;
});

export const sendChatMessage = async (message: string, userContext?: any) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    const response = await api.post('/chat', { message, userContext });
    return response.data;
};

export const getDailyPlan = async () => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false, plan: null };
    const response = await api.get('/daily-plan');
    return response.data;
};

export const fetchRemediation = async (questionId: string, type: 'UPGRADE' | 'DOWNGRADE') => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    const response = await api.post('/remediation', { questionId, type });
    return response.data;
};
