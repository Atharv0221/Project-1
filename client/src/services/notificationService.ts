import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:5000/api/notifications';

const getAuthHeader = () => {
    const token = useAuthStore.getState().token;
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getNotifications = async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
};

export const syncNotifications = async () => {
    const response = await axios.post(`${API_URL}/sync`, {}, getAuthHeader());
    return response.data;
};

export const markAsRead = async (id: string) => {
    const response = await axios.put(`${API_URL}/${id}/read`, {}, getAuthHeader());
    return response.data;
};
