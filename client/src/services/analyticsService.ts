import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:5000/api/analytics';

// Setup axios instance with interceptor for auth token
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

export const getTimeSpentAnalytics = async (subjectId?: string) => {
    const token = useAuthStore.getState().token;
    if (!token) return [];
    const response = await api.get('/time-spent', {
        params: { subjectId }
    });
    return response.data;
};

export const getAccuracyTrend = async () => {
    const token = useAuthStore.getState().token;
    if (!token) return [];
    const response = await api.get('/accuracy-trend');
    return response.data;
};

export const getDifficultyMastery = async (subjectId?: string, chapterId?: string) => {
    const token = useAuthStore.getState().token;
    if (!token) return [];
    const response = await api.get('/difficulty-mastery', {
        params: { subjectId, chapterId }
    });
    return response.data;
};

export const getRankProgression = async () => {
    const token = useAuthStore.getState().token;
    if (!token) return [];
    const response = await api.get('/rank-progression');
    return response.data;
};

export const getZenRevisionData = async () => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    const response = await api.get('/zen-revision');
    return response.data;
};
