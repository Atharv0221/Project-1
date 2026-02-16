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
    }
    return config;
});

export const sendChatMessage = async (message: string, userContext?: any) => {
    const response = await api.post('/chat', { message, userContext });
    return response.data;
};

export const getDailyPlan = async () => {
    const response = await api.get('/daily-plan');
    return response.data;
};
