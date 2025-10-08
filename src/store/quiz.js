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
            return String.fromCharCode(96 + num);
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
                // usa os scores calculados pelo getter (mantive esse comportamento)
                const scores = this.calculatedScores;

                // calculateAvatar agora aceita e usa o objeto scores quando passado
                const avatar = await this.calculateAvatar(scores);

                // garantir que temos um avatar válido com id (fallback robusto)
                let avatarId = avatar && (avatar.id ?? avatar._id ?? avatar.avatar_id);
                if (!avatarId) {
                    // busca avatares e tenta achar um "neutro" ou usa o primeiro disponível
                    const avatarsResp = await quizApi.getAvatars();
                    const avatars = avatarsResp.data || [];
                    const neutral = avatars.find(a =>
                        a.id === 7 ||
                        a.id === 'neutral' ||
                        (Array.isArray(a.related_courses) && a.related_courses.length === 3) ||
                        (a.related_courses && a.related_courses.map(rc => String(rc).toLowerCase()).includes('neutral'))
                    );
                    avatarId = (neutral && neutral.id) || (avatars[0] && avatars[0].id) || null;
                }

                const response = await quizApi.finishQuiz({
                    session_id: this.sessionId,
                    scores: scores,
                    avatar_id: avatarId,
                });

                // preencher resultAvatar com objeto completo quando possível
                if (avatar && (avatar.id || avatar._id || avatar.avatar_id)) {
                    this.resultAvatar = avatar;
                } else if (avatarId) {
                    const avatarsResp2 = await quizApi.getAvatars();
                    this.resultAvatar = (avatarsResp2.data || []).find(a => a.id === avatarId) || { id: avatarId };
                } else {
                    this.resultAvatar = { id: null };
                }

                this.scores = scores;
                this.currentScreen = 'result';

                return response.data;
            } catch (error) {
                console.error('Error finishing quiz:', error);
                throw error;
            }
        },

        async calculateAvatar(scoresParam) {
            // thresholds
            const STRONG_SINGLE_PCT = 42;   // top >= 42%
            const STRONG_GAP_PCT = 15;      // gap >= 15% -> dominante
            const THREE_WAY_TIE_PCT = 10;   // top - third <= 10% -> neutro
            const COMBINED_TOP_MIN = 35;    // top >= 35% and
            const COMBINED_SECOND_MIN = 30; // second >= 30% -> combo
            const COMBINED_MAX_GAP = 20;    // or gap <= 20% -> combo

            // extrair brutos
            const S_pcp = Number(scoresParam?.pcp ?? 0);
            const S_ds = Number(scoresParam?.ds ?? 0);
            const S_ma = Number(scoresParam?.ma ?? 0);

            const sum = S_pcp + S_ds + S_ma;
            if (sum === 0) {
                // fallback neutral
                const avatarsResp = await quizApi.getAvatars();
                return avatarsResp.data.find(a => a.id === 7) || avatarsResp.data[0] || { id: null };
            }

            const pct = {
                PCP: (S_pcp / sum) * 100,
                DS: (S_ds / sum) * 100,
                MA: (S_ma / sum) * 100
            };

            const sorted = Object.entries(pct).sort((a, b) => b[1] - a[1]);
            console.log(`sorted`, sorted);
            const [top, second, third] = sorted;
            const topCourse = top[0].toLowerCase();
            const secondCourse = second[0].toLowerCase();
            const topPct = top[1], secondPct = second[1], thirdPct = third[1];

            // buscar avatares
            const avatarsResp = await quizApi.getAvatars();
            const avatars = avatarsResp.data || [];
            const normalizeCourses = arr => (Array.isArray(arr) ? arr.map(x => String(x).toLowerCase()) : []);
            const findSingle = (c) => avatars.find(a => {
                const rc = normalizeCourses(a.related_courses);
                return rc.length === 1 && rc[0] === c;
            });
            const findCombo = (a, b) => avatars.find(av => {
                const rc = normalizeCourses(av.related_courses).sort();
                return rc.length === 2 && [a, b].map(x => x.toLowerCase()).sort().every((v, i) => v === rc[i]);
            });
            const findNeutral = () => avatars.find(a => a.id === 7);

            // regras (proporção)
            if (topPct >= STRONG_SINGLE_PCT && (topPct - secondPct) >= STRONG_GAP_PCT) {
                return findSingle(topCourse) || findNeutral() || avatars[0];
            }

            if ((topPct - thirdPct) <= THREE_WAY_TIE_PCT) {
                return findNeutral() || avatars[0];
            }

            if ((topPct >= COMBINED_TOP_MIN && secondPct >= COMBINED_SECOND_MIN) ||
                ((topPct - secondPct) <= COMBINED_MAX_GAP)) {
                // combo
                const combo = findCombo(topCourse, secondCourse);
                if (combo) return combo;
                // fallback: if no exact combo avatar, fallback to top single then neutral
                return findSingle(topCourse) || findNeutral() || avatars[0];
            }

            // fallback single
            return findSingle(topCourse) || findNeutral() || avatars[0];
        },

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
