import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = useAuthStore.getState().token;
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getGlobalLeaderboard = async (limit = 50) => {
    const response = await axios.get(`${API_URL}/leaderboard/global?limit=${limit}`, getAuthHeader());
    return response.data;
};

export const getStandardLeaderboard = async (standard: string, limit = 50) => {
    const response = await axios.get(`${API_URL}/leaderboard/standard/${standard}?limit=${limit}`, getAuthHeader());
    return response.data;
};

export const getSubjectLeaderboard = async (subjectId: string, limit = 50) => {
    const response = await axios.get(`${API_URL}/leaderboard/subject/${subjectId}?limit=${limit}`, getAuthHeader());
    return response.data;
};

export const getUserRank = async (userId: string) => {
    const response = await axios.get(`${API_URL}/leaderboard/user/${userId}/rank`, getAuthHeader());
    return response.data;
};
