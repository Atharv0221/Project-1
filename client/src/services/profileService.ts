import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/profile`;

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

export const getProfile = async () => {
    const response = await api.get('/');
    return response.data;
};

export const updateProfile = async (data: any) => {
    const response = await api.put('/', data);
    return response.data;
};

export const uploadPhotoBase64 = async (photoData: string) => {
    const token = useAuthStore.getState().token;
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/upload-photo-base64`, {
        photoData
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const upgradeToPro = async () => {
    const response = await api.post('/upgrade');
    return response.data;
};
