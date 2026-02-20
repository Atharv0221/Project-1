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
        // console.log('Attaching token to request:', config.url);
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn('No token found in store for request:', config.url);
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
    const response = await api.get(`/questions/${subtopicId}`);
    return response.data;
};
