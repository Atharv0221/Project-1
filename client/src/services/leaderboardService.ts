import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = useAuthStore.getState().token;
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getGlobalLeaderboard = async (limit = 50) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return [];
    const response = await axios.get(`${API_URL}/leaderboard/global?limit=${limit}`, authHeader);
    return response.data;
};

export const getStandardLeaderboard = async (standard: string, limit = 50) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return [];
    const response = await axios.get(`${API_URL}/leaderboard/standard/${standard}?limit=${limit}`, authHeader);
    return response.data;
};

export const getSubjectLeaderboard = async (subjectId: string, limit = 50) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return [];
    const response = await axios.get(`${API_URL}/leaderboard/subject/${subjectId}?limit=${limit}`, authHeader);
    return response.data;
};

export const getUserRank = async (userId: string) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return null;
    const response = await axios.get(`${API_URL}/leaderboard/user/${userId}/rank`, authHeader);
    return response.data;
};
