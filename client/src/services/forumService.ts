import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = useAuthStore.getState().token;
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getPosts = async (filters: any = {}) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return [];

    const params = new URLSearchParams();
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.standard) params.append('standard', filters.standard);
    if (filters.board) params.append('board', filters.board);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const response = await axios.get(`${API_URL}/forum/posts?${params.toString()}`, authHeader);
    return response.data;
};

export const createPost = async (data: any) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return null;

    const response = await axios.post(`${API_URL}/forum/posts`, data, {
        headers: {
            ...authHeader.headers,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getPost = async (id: string) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return null;

    const response = await axios.get(`${API_URL}/forum/posts/${id}`, authHeader);
    return response.data;
};

export const createReply = async (postId: string, content: string) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return null;

    const response = await axios.post(`${API_URL}/forum/posts/${postId}/reply`, { postId, content }, authHeader);
    return response.data;
};

export const likePost = async (id: string) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return null;

    const response = await axios.post(`${API_URL}/forum/posts/${id}/like`, {}, authHeader);
    return response.data;
};
