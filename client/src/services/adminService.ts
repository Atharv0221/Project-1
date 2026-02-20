import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:5000/api/admin';

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

export const getAdminStats = async () => {
    const response = await api.get('/stats');
    return response.data;
};

export const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const updateUserRole = async (userId: string, role: string) => {
    const response = await api.patch(`/users/${userId}/role`, { role });
    return response.data;
};
