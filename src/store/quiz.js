import { defineStore } from 'pinia'
import { BLOCO_QUESTOES } from '../data/questions'
import { AVATARS } from '../data/avatars'

const THRESHOLD_STRONG_SINGLE = 55      // Minimum normalized score for strong single course
const THRESHOLD_STRONG_GAP = 12         // Minimum gap between top and second for single course
const THRESHOLD_CLOSE_COMBINED = 6      // Maximum difference for two-course combined avatar
const THRESHOLD_THREE_WAY_TIE = 10      // Maximum range for three-way tie (neutral avatar)

/**
 * Calculate which avatar matches the user's answers
 * Uses normalized scoring (0-100) to determine affinity
 * 
 * Algorithm steps:
 * 1. Sum raw weights for PCP, DS, MA
 * 2. Normalize using min-max scaling to [0, 100]
 * 3. Apply decision rules based on thresholds
 * 4. Return matching avatar object
 */
function calculateAvatar(answersArray) {
    // Step 1: Accumulate raw scores from all selected alternatives
    let S_pcp = 0
    let S_ds = 0
    let S_ma = 0

    answersArray.forEach(alternative => {
        S_pcp += alternative.weights.PCP
        S_ds += alternative.weights.DS
        S_ma += alternative.weights.MA
    })

    // Step 2: Normalize scores to [0, 100] range
    const min = Math.min(S_pcp, S_ds, S_ma)
    const max = Math.max(S_pcp, S_ds, S_ma)

    let scores = { PCP: S_pcp, DS: S_ds, MA: S_ma }

    // Handle edge case: all scores equal
    if (max === min) {
        scores = { PCP: 50, DS: 50, MA: 50 }
    } else {
        // Min-max normalization formula: (value - min) / (max - min) * 100
        scores.PCP = ((S_pcp - min) / (max - min)) * 100
        scores.DS = ((S_ds - min) / (max - min)) * 100
        scores.MA = ((S_ma - min) / (max - min)) * 100
    }

    // Step 3: Sort courses by normalized score (descending)
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const [top, second, third] = sorted

    const S_top = top[1]
    const S_second = second[1]
    const S_third = third[1]
    const S_range = S_top - S_third

    // Step 4: Apply decision rules

    // Rule 1: Strong single course avatar
    // Top score is high enough AND gap to second is significant
    if (S_top >= THRESHOLD_STRONG_SINGLE && (S_top - S_second) >= THRESHOLD_STRONG_GAP) {
        return AVATARS.find(a => a.courses.length === 1 && a.courses[0] === top[0])
    }

    // Rule 2: Three-way tie (neutral avatar)
    // All three scores are very close
    if (S_range <= THRESHOLD_THREE_WAY_TIE) {
        return AVATARS.find(a => a.id === 'neutral')
    }

    // Rule 3: Two close courses, third significantly lower
    // Show combined avatar for top two
    if (Math.abs(S_top - S_second) <= THRESHOLD_CLOSE_COMBINED &&
        S_third <= (S_top - THRESHOLD_STRONG_GAP)) {
        const combo = [top[0], second[0]].sort().join('_').toLowerCase()
        return AVATARS.find(a => a.id === combo) || AVATARS.find(a => a.id === 'neutral')
    }

    if (S_top - S_second <= 11) {
        const combo = [top[0], second[0]].sort().join('_').toLowerCase()
        return AVATARS.find(a => a.id === combo) || AVATARS.find(a => a.courses.length === 1 && a.courses[0] === top[0])
    }

    return AVATARS.find(a => a.courses.length === 1 && a.courses[0] === top[0])
}

export const useQuizStore = defineStore('quiz', {
    state: () => ({
        currentScreen: 'onboarding', // 'onboarding' | 'quiz' | 'result'
        currentBlockIndex: 0,
        answers: {},
        resultAvatar: null,
        feedbackQuestionId: null,
        isTransitioning: false
    }),

    getters: {
        totalBlocks: () => BLOCO_QUESTOES.length,

        currentBlock: (state) => BLOCO_QUESTOES[state.currentBlockIndex],

        progress: (state) => {
            if (state.currentScreen === 'result') return 100
            return (state.currentBlockIndex / BLOCO_QUESTOES.length) * 100
        },

        isCurrentBlockComplete: (state) => {
            const block = BLOCO_QUESTOES[state.currentBlockIndex]
            if (!block) return false
            return block.questions.every(q => state.answers[q.id])
        },

        canGoBack: (state) => state.currentBlockIndex > 0,

        canGoNext: (state) => {
            const block = BLOCO_QUESTOES[state.currentBlockIndex]
            if (!block) return false
            return block.questions.every(q => state.answers[q.id])
        },

        firstUnansweredQuestionId: (state) => {
            const block = BLOCO_QUESTOES[state.currentBlockIndex]
            if (!block) return null
            const unanswered = block.questions.find(q => !state.answers[q.id])
            return unanswered ? unanswered.id : null
        }
    },

    actions: {
        startQuiz() {
            this.currentScreen = 'quiz'
        },

        selectAnswer(questionId, alternative) {
            this.answers[questionId] = alternative

            this.feedbackQuestionId = questionId
            setTimeout(() => {
                this.feedbackQuestionId = null
            }, 600)
        },

        async nextBlock() {
            if (this.isTransitioning) return

            this.isTransitioning = true

            if (this.currentBlockIndex < BLOCO_QUESTOES.length - 1) {
                this.currentBlockIndex++
                await new Promise(resolve => setTimeout(resolve, 50))
            } else {
                this.finishQuiz()
            }

            this.isTransitioning = false
        },

        async previousBlock() {
            if (this.isTransitioning) return

            this.isTransitioning = true

            if (this.currentBlockIndex > 0) {
                this.currentBlockIndex--
                await new Promise(resolve => setTimeout(resolve, 50))
            }

            this.isTransitioning = false
        },

        finishQuiz() {
            const answersArray = Object.values(this.answers)

            this.resultAvatar = calculateAvatar(answersArray)

            this.currentScreen = 'result'
        },

        resetQuiz() {
            this.currentScreen = 'onboarding'
            this.currentBlockIndex = 0
            this.answers = {}
            this.resultAvatar = null
            this.feedbackQuestionId = null
            this.isTransitioning = false
        }
    }
})
