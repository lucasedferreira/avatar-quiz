import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const quizApi = {
    async startQuiz(studentData) {
        const response = await api.post('/quiz/start', studentData);
        return response.data;
    },

    async recordResponse(responseData) {
        const response = await api.post('/quiz/response', responseData);
        return response.data;
    },

    async finishQuiz(finishData) {
        const response = await api.post('/quiz/finish', finishData);
        return response.data;
    },

    async getQuestionBlocks() {
        const response = await api.get('/structure');
        return response.data;
    },

    async getAvatars() {
        const response = await api.get('/structure/avatars');
        return response.data;
    },
};

export default api;
