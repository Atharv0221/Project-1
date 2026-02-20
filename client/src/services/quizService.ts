import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = useAuthStore.getState().token;
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const startQuiz = async (levelId: string) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return null;
    const response = await axios.post(`${API_URL}/quiz/start`, { levelId }, authHeader);
    return response.data;
};

export const getQuizQuestions = async (levelId: string) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return [];
    const response = await axios.get(`${API_URL}/content/quiz/questions?levelId=${levelId}`, authHeader);
    return response.data;
};

export const submitAnswer = async (data: { sessionId: string, questionId: string, selectedOptionId: number, timeTaken: number }) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return null;
    const response = await axios.post(`${API_URL}/quiz/submit`, data, authHeader);
    return response.data;
};

export const completeQuiz = async (sessionId: string) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return null;
    const response = await axios.post(`${API_URL}/quiz/complete`, { sessionId }, authHeader);
    return response.data;
};

export const getQuizReports = async () => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return [];
    const response = await axios.get(`${API_URL}/quiz/reports`, authHeader);
    return response.data;
};

export const getAdaptiveQuestion = async (query: { difficulty: string, chapterId: string, sessionId: string }) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return null;
    const response = await axios.get(`${API_URL}/content/adaptive-question`, {
        ...authHeader,
        params: query
    });
    return response.data;
};

export const getQuizSession = async (sessionId: string) => {
    const authHeader = getAuthHeader();
    if (!authHeader.headers) return null;
    const response = await axios.get(`${API_URL}/quiz/session/${sessionId}`, authHeader);
    return response.data;
};
