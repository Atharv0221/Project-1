import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = useAuthStore.getState().token;
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getPosts = async (filters: any = {}) => {
    const params = new URLSearchParams();
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.standard) params.append('standard', filters.standard);
    if (filters.board) params.append('board', filters.board);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const response = await axios.get(`${API_URL}/forum/posts?${params.toString()}`, getAuthHeader());
    return response.data;
};

export const createPost = async (data: any) => {
    // console.log('Creating post with data:', data);
    const response = await axios.post(`${API_URL}/forum/posts`, data, {
        headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getPost = async (id: string) => {
    const response = await axios.get(`${API_URL}/forum/posts/${id}`, getAuthHeader());
    return response.data;
};

export const createReply = async (postId: string, content: string) => {
    const response = await axios.post(`${API_URL}/forum/posts/${postId}/reply`, { postId, content }, getAuthHeader());
    return response.data;
};

export const likePost = async (id: string) => {
    const response = await axios.post(`${API_URL}/forum/posts/${id}/like`, {}, getAuthHeader());
    return response.data;
};
