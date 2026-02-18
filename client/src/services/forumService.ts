import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = useAuthStore.getState().token;
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getPosts = async (subjectId?: string) => {
    const url = subjectId ? `${API_URL}/forum/posts?subjectId=${subjectId}` : `${API_URL}/forum/posts`;
    const response = await axios.get(url, getAuthHeader());
    return response.data;
};

export const createPost = async (data: { title: string, content: string, subjectId?: string, fileUrl?: string }) => {
    const response = await axios.post(`${API_URL}/forum/posts`, data, getAuthHeader());
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
