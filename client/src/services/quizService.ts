import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = useAuthStore.getState().token;
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const startQuiz = async (levelId: string) => {
    const response = await axios.post(`${API_URL}/quiz/start`, { levelId }, getAuthHeader());
    return response.data;
};

export const getQuizQuestions = async (levelId: string) => {
    // We might need to adjust API to accept levelId in query params for GET /quiz/questions
    // My backend `contentRoutes` has `router.get('/quiz/questions', ...)`
    const response = await axios.get(`${API_URL}/content/quiz/questions?levelId=${levelId}`, getAuthHeader());
    return response.data;
};

export const submitAnswer = async (data: { sessionId: string, questionId: string, selectedOptionId: number, timeTaken: number }) => {
    const response = await axios.post(`${API_URL}/quiz/submit`, data, getAuthHeader());
    return response.data;
};

export const completeQuiz = async (sessionId: string) => {
    const response = await axios.post(`${API_URL}/quiz/complete`, { sessionId }, getAuthHeader());
    return response.data;
};
