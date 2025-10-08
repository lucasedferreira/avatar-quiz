import { defineStore } from 'pinia';
import { quizApi } from '../api/quizApi';

const THRESHOLD_STRONG_SINGLE = 55;      // Mínimo para curso dominante
const THRESHOLD_STRONG_GAP = 12;         // Diferença mínima entre 1º e 2º
const THRESHOLD_CLOSE_COMBINED = 7;      // Diferença máxima para avatar combinado
const THRESHOLD_THREE_WAY_TIE = 10;      // Faixa máxima para empate triplo

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
            return String.fromCharCode(97 + num);
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

        // substitua/atualize calculateAvatar por esta versão (usa o parâmetro scores quando passado)
        async calculateAvatar(scoresParam) {
            console.log('Scores:', scoresParam);

            // 1) obter scores brutos: usa scoresParam se fornecido, senão soma a partir de this.answers
            let S_pcp = 0, S_ds = 0, S_ma = 0;

            if (scoresParam && (typeof scoresParam.pcp !== 'undefined' || typeof scoresParam.PCP !== 'undefined')) {
                // aceitar tanto pcp/ds/ma (minúsculo) quanto PCP/DS/MA
                S_pcp = Number(scoresParam.pcp ?? scoresParam.PCP) || 0;
                S_ds = Number(scoresParam.ds ?? scoresParam.DS) || 0;
                S_ma = Number(scoresParam.ma ?? scoresParam.MA) || 0;
            } else {
                // calcular a partir das respostas armazenadas (compatível com versão 1)
                Object.values(this.answers).forEach(a => {
                    S_pcp += Number(a.weight_pcp || 0);
                    S_ds += Number(a.weight_ds || 0);
                    S_ma += Number(a.weight_ma || 0);
                });
            }

            // 2) normalizar para [0,100]
            const min = Math.min(S_pcp, S_ds, S_ma);
            const max = Math.max(S_pcp, S_ds, S_ma);
            let norm = { PCP: S_pcp, DS: S_ds, MA: S_ma };

            if (max === min) {
                norm = { PCP: 50, DS: 50, MA: 50 };
            } else {
                norm.PCP = ((S_pcp - min) / (max - min)) * 100;
                norm.DS = ((S_ds - min) / (max - min)) * 100;
                norm.MA = ((S_ma - min) / (max - min)) * 100;
            }

            // ordenar por score normalizado (desc)
            const sorted = Object.entries(norm).sort((a, b) => b[1] - a[1]);
            console.log('Normalized Scores:', sorted);
            const [top, second, third] = sorted;
            const S_top = top[1], S_second = second[1], S_third = third[1];
            const S_range = S_top - S_third;

            // 3) buscar lista de avatares no backend
            const avatarsResp = await quizApi.getAvatars();
            const avatars = avatarsResp.data || [];

            // helpers de matching (normaliza related_courses)
            const normalizeCourses = arr => (Array.isArray(arr) ? arr.map(x => String(x).toLowerCase()) : []);
            const findSingleAvatar = (courseLower) => avatars.find(a => {
                const rc = normalizeCourses(a.related_courses);
                return rc.length === 1 && rc[0] === courseLower;
            });
            const findComboAvatar = (courseA, courseB) => {
                const wanted = [courseA, courseB].map(c => c.toLowerCase()).sort().join('_');
                // tentativa 1: campo id/combo
                const byId = avatars.find(a => String(a.id).toLowerCase() === wanted || String(a.id).toLowerCase() === `${wanted}`);
                if (byId) return byId;
                // tentativa 2: related_courses contém ambos
                return avatars.find(a => {
                    const rc = normalizeCourses(a.related_courses);
                    if (rc.length !== 2) return false;
                    return [courseA.toLowerCase(), courseB.toLowerCase()].every(c => rc.includes(c));
                });
            };
            const findNeutral = () => avatars.find(a =>
                a.id === 7 ||
                String(a.id).toLowerCase() === 'neutral' ||
                (Array.isArray(a.related_courses) && a.related_courses.length === 3) ||
                (a.related_courses && normalizeCourses(a.related_courses).includes('neutral'))
            );

            const topCourse = top[0].toLowerCase();
            const secondCourse = second[0].toLowerCase();

            // Regra 1: forte single
            if (S_top >= THRESHOLD_STRONG_SINGLE && (S_top - S_second) >= THRESHOLD_STRONG_GAP) {
                const single = findSingleAvatar(topCourse);
                if (single) return single;
            }

            // Regra 2: empate triplo -> neutro
            if (S_range <= THRESHOLD_THREE_WAY_TIE) {
                const n = findNeutral();
                if (n) return n;
            }

            // Regra 3: dois próximos -> avatar combinado
            if (Math.abs(S_top - S_second) <= THRESHOLD_CLOSE_COMBINED &&
                S_third <= (S_top - THRESHOLD_STRONG_GAP)) {
                const combo = findComboAvatar(topCourse, secondCourse);
                if (combo) return combo;
                const n = findNeutral();
                if (n) return n;
            }

            // Caso ambíguo: tentar retorno combinado quando gap pequeno
            if ((S_top - S_second) <= 11) {
                const combo = findComboAvatar(topCourse, secondCourse);
                if (combo) return combo;
                const single = findSingleAvatar(topCourse);
                if (single) return single;
            }

            // Fallback: avatar do top course (single) ou neutro ou primeiro avatar
            const fallbackSingle = findSingleAvatar(topCourse);
            if (fallbackSingle) return fallbackSingle;

            const n = findNeutral();
            if (n) return n;

            return avatars[0] || { id: null, name: 'fallback' };
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
