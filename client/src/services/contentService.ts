import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/content`;

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

export const getStandards = async () => {
    const response = await api.get('/standards');
    return response.data;
};

export const getSubjects = async (standard?: string) => {
    const url = standard ? `/subjects?standard=${standard}` : '/subjects';
    const response = await api.get(url);
    return response.data;
};

export const getQuestionsBySubtopic = async (subtopicId: string) => {
    const token = useAuthStore.getState().token;
    if (!token) return [];
    const response = await api.get(`/questions/${subtopicId}`);
    return response.data;
};
