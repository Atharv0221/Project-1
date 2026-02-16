import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:5000/api/content';

// Setup axios instance with interceptor for auth token
const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token} `;
    }
    return config;
});

export const getSubjects = async () => {
    const response = await api.get('/subjects');
    return response.data;
};

export const getQuestionsBySubtopic = async (subtopicId: string) => {
    const response = await api.get(`/questions/${subtopicId}`);
    return response.data;
};
