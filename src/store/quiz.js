import { defineStore } from 'pinia';
import { quizApi } from '../api/quizApi';

export const useQuizStore = defineStore('quiz', {
    state: () => ({
        sessionId: null,
        studentName: '',
        deviceType: 'desktop',

        currentScreen: 'onboarding',
        currentBlockIndex: 0,
        isTransitioning: false,
        feedbackQuestionId: null,

        answers: {},

        blocks: [],

        scores: null,
        resultAvatar: null,
    }),

    getters: {
        totalBlocks: (state) => state.blocks.length,

        currentBlock: (state) => {
            return state.blocks[state.currentBlockIndex] || null;
        },

        isCurrentBlockComplete: (state) => {
            if (!state.currentBlock) return false;
            return state.currentBlock.questions.every(question =>
                state.answers[question.id]
            );
        },

        firstUnansweredQuestionId: (state) => {
            if (!state.currentBlock) return null;
            const unansweredQuestion = state.currentBlock.questions.find(question =>
                !state.answers[question.id]
            );
            return unansweredQuestion ? unansweredQuestion.id : null;
        },

        canGoBack: (state) => state.currentBlockIndex > 0,

        progress: (state) => {
            if (state.blocks.length === 0) return 0;

            const totalQuestions = state.blocks.reduce((total, block) =>
                total + block.questions.length, 0
            );
            const answeredQuestions = Object.keys(state.answers).length;

            return Math.round((answeredQuestions / totalQuestions) * 100);
        },

        calculatedScores: (state) => {
            const scores = { pcp: 0, ds: 0, ma: 0 };

            Object.values(state.answers).forEach(answer => {
                if (answer.weight_pcp) scores.pcp += answer.weight_pcp;
                if (answer.weight_ds) scores.ds += answer.weight_ds;
                if (answer.weight_ma) scores.ma += answer.weight_ma;
            });

            return scores;
        },
    },

    actions: {
        async initializeQuiz() {
            try {
                const response = await quizApi.getQuestionBlocks();
                this.blocks = this.transformBlocks(response.data);
            } catch (error) {
                console.error('Error loading quiz structure:', error);
                throw error;
            }
        },

        transformBlocks(backendBlocks) {
            return backendBlocks.map(block => ({
                id: block.id,
                title: block.title,
                description: block.description,
                order: block.order,
                questions: block.questions.map(question => ({
                    id: question.id.toString(),
                    text: question.text,
                    order: question.order,
                    alternatives: question.answerOptions.map(option => ({
                        id: this.numberToLetter(option.order),
                        text: option.text,
                        weight_pcp: option.weight_pcp,
                        weight_ds: option.weight_ds,
                        weight_ma: option.weight_ma,
                        answer_option_id: option.id,
                    })),
                })),
            }));
        },

        numberToLetter(num) {
            return String.fromCharCode(97 + num); // 0 -> 'a', 1 -> 'b', etc.
        },

        async startQuiz(studentData) {
            try {
                const response = await quizApi.startQuiz({
                    student_name: studentData.name,
                    device_type: this.deviceType,
                });

                this.sessionId = response.data.session_id;
                this.studentName = response.data.student_name;
                this.currentScreen = 'quiz';

                return response.data;
            } catch (error) {
                console.error('Error starting quiz:', error);
                throw error;
            }
        },

        async selectAnswer(questionId, alternative) {
            try {
                this.answers[questionId] = {
                    id: alternative.id,
                    text: alternative.text,
                    weight_pcp: alternative.weight_pcp,
                    weight_ds: alternative.weight_ds,
                    weight_ma: alternative.weight_ma,
                    answer_option_id: alternative.answer_option_id,
                };

                this.feedbackQuestionId = questionId;

                await quizApi.recordResponse({
                    session_id: this.sessionId,
                    responses: [{
                        question_id: parseInt(questionId),
                        answer_option_id: alternative.answer_option_id,
                    }],
                });

                setTimeout(() => {
                    this.feedbackQuestionId = null;
                }, 2000);

            } catch (error) {
                console.error('Error recording answer:', error);
                delete this.answers[questionId];
                throw error;
            }
        },

        async nextBlock() {
            if (this.isTransitioning) return;

            this.isTransitioning = true;

            try {
                if (this.currentBlockIndex < this.totalBlocks - 1) {
                    this.currentBlockIndex++;
                } else {
                    await this.finishQuiz();
                }
            } finally {
                this.isTransitioning = false;
            }
        },

        previousBlock() {
            if (this.isTransitioning || !this.canGoBack) return;

            this.isTransitioning = true;
            this.currentBlockIndex--;
            this.isTransitioning = false;
        },

        async finishQuiz() {
            try {
                const scores = this.calculatedScores;
                const avatar = await this.calculateAvatar(scores);

                const response = await quizApi.finishQuiz({
                    session_id: this.sessionId,
                    scores: scores,
                    avatar_id: avatar.id,
                });

                this.scores = scores;
                this.resultAvatar = avatar;
                this.currentScreen = 'result';

                return response.data;
            } catch (error) {
                console.error('Error finishing quiz:', error);
                throw error;
            }
        },

        async calculateAvatar(scores) {
            const { pcp, ds, ma } = scores;

            const maxScore = Math.max(pcp, ds, ma);
            const dominantCourses = [];

            if (pcp === maxScore) dominantCourses.push('pcp');
            if (ds === maxScore) dominantCourses.push('ds');
            if (ma === maxScore) dominantCourses.push('ma');

            let avatarId;

            if (dominantCourses.length === 3 ||
                (pcp === ds && ds === ma)) {
                avatarId = 'neutral';
            } else if (dominantCourses.length === 2) {
                if (dominantCourses.includes('ds') && dominantCourses.includes('pcp')) {
                    avatarId = 'ds_pcp';
                } else if (dominantCourses.includes('ma') && dominantCourses.includes('pcp')) {
                    avatarId = 'ma_pcp';
                } else if (dominantCourses.includes('ds') && dominantCourses.includes('ma')) {
                    avatarId = 'ds_ma';
                }
            } else {
                avatarId = dominantCourses[0];
            }

            const avatar = await findAvatarById(avatarId);

            return {
                ...avatar,
                scores
            };
        },

        // Reset quiz
        resetQuiz() {
            this.sessionId = null;
            this.studentName = '';
            this.currentScreen = 'onboarding';
            this.currentBlockIndex = 0;
            this.answers = {};
            this.scores = null;
            this.resultAvatar = null;
            this.feedbackQuestionId = null;
            this.isTransitioning = false;
        },
    },
});

const findAvatarById = async (avatarId) => {
    const response = await quizApi.getAvatars();
    const avatars = response.data;

    const avatarIdUpper = avatarId.toUpperCase();

    if (avatarIdUpper === 'neutral') {
        return avatars.find(a => a.id === 7); // Aqui, usamos o avatar "O Versátil" como fallback (id = 7)
    }

    const courseIds = avatarIdUpper.split('_'); // Ex: 'ds_pcp' → ['ds', 'pcp']

    return avatars.find(a => courseIds.every(course => a.related_courses.includes(course)));
};
