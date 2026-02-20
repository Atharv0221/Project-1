import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:5000/api/notifications';

const getAuthHeader = () => {
    const token = useAuthStore.getState().token;
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getNotifications = async () => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return [];
    const response = await axios.get(API_URL, authHeader);
    return response.data;
};

export const syncNotifications = async () => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return [];
    const response = await axios.post(`${API_URL}/sync`, {}, authHeader);
    return response.data;
};

export const markAsRead = async (id: string) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return null;
    const response = await axios.put(`${API_URL}/${id}/read`, {}, authHeader);
    return response.data;
};
