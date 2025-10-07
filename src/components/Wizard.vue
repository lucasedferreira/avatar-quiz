<template>
    <div class="wizard">
        <div class="wizard__container" ref="containerRef">
            <ProgressBar
                :current-block="quizStore.currentBlockIndex + 1"
                :total-blocks="quizStore.totalBlocks"
                :progress="quizStore.progress"
            />

            <div class="wizard__block-container" ref="blockContainerRef">
                <QuestionBlock
                    :key="quizStore.currentBlockIndex"
                    :block="quizStore.currentBlock"
                    @block-mounted="onBlockMounted"
                />
            </div>

            <div class="wizard__actions">
                <button
                    v-if="quizStore.canGoBack"
                    class="wizard__button wizard__button--secondary"
                    @click="handleBack"
                    :disabled="quizStore.isTransitioning"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    <span>Voltar</span>
                </button>

                <button
                    class="wizard__button wizard__button--primary"
                    :class="{
                        'wizard__button--disabled': quizStore.isTransitioning,
                    }"
                    :disabled="quizStore.isTransitioning"
                    @click="handleNext"
                    ref="nextButtonRef"
                >
                    <span>{{ isLastBlock ? "Finalizar" : "Próximo" }}</span>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>

            <p class="wizard__privacy">🔒 Seus dados não são coletados.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useQuizStore } from "../store/quiz";
import { gsap } from "gsap";
import ProgressBar from "./ProgressBar.vue";
import QuestionBlock from "./QuestionBlock.vue";

const quizStore = useQuizStore();
const nextButtonRef = ref(null);
const containerRef = ref(null);
const blockContainerRef = ref(null);
const currentBlockElement = ref(null);

const isLastBlock = computed(() => {
    return quizStore.currentBlockIndex === quizStore.totalBlocks - 1;
});

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};

const scrollToQuestion = (questionId) => {
    nextTick(() => {
        const questionElement = document.getElementById(
            `question-${questionId}`
        );
        if (questionElement) {
            const offset = 100;
            const elementPosition = questionElement.getBoundingClientRect().top;
            const offsetPosition =
                elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });

            gsap.fromTo(
                questionElement,
                { scale: 1, backgroundColor: "transparent" },
                {
                    scale: 1.02,
                    backgroundColor: "rgba(0, 71, 182, 0.05)",
                    duration: 0.4,
                    yoyo: true,
                    repeat: 2,
                    ease: "power2.inOut",
                    onComplete: () => {
                        gsap.to(questionElement, {
                            backgroundColor: "transparent",
                            duration: 0.3,
                        });
                    },
                }
            );
        }
    });
};

const animateBlockTransition = async (direction = "forward") => {
    if (!currentBlockElement.value) return;

    const timeline = gsap.timeline();
    const xOffset = direction === "forward" ? -50 : 50;
    const xEnter = direction === "forward" ? 50 : -50;

    timeline.to(currentBlockElement.value, {
        opacity: 0,
        x: xOffset,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in",
    });

    await timeline.then();

    await nextTick();

    const newBlockElement = blockContainerRef.value?.querySelector(".block");
    if (newBlockElement) {
        currentBlockElement.value = newBlockElement;

        gsap.fromTo(
            newBlockElement,
            {
                opacity: 0,
                x: xEnter,
                scale: 0.95,
            },
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.4,
                ease: "power2.out",
            }
        );
    }
};

const handleNext = async () => {
    if (quizStore.isTransitioning) return;

    if (!quizStore.isCurrentBlockComplete) {
        const unansweredId = quizStore.firstUnansweredQuestionId;
        if (unansweredId) {
            scrollToQuestion(unansweredId);
        }
        return;
    }

    if (nextButtonRef.value) {
        gsap.to(nextButtonRef.value, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
        });
    }

    // await animateBlockTransition("forward");
    await quizStore.nextBlock();
    scrollToTop();
};

const handleBack = async () => {
    if (quizStore.isTransitioning) return;

    // await animateBlockTransition("backward");
    await quizStore.previousBlock();
    scrollToTop();
};

const onBlockMounted = (element) => {
    currentBlockElement.value = element;
};

watch(
    () => quizStore.currentBlockIndex,
    () => {
        nextTick(() => {
            const blockElement =
                blockContainerRef.value?.querySelector(".block");
            if (blockElement) {
                currentBlockElement.value = blockElement;
            }
        });
    },
    { immediate: true }
);
</script>

<style lang="scss" scoped>
.wizard {
    min-height: 100vh;
    padding: 2rem 1rem;

    @media (max-width: 768px) {
        padding: 1.5rem 1rem;
    }

    &__container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        border-radius: 24px;
        padding: 2.5rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);

        @media (max-width: 768px) {
            padding: 2rem 1.5rem;
        }

        @media (max-width: 480px) {
            padding: 1.5rem 1rem;
            border-radius: 16px;
        }
    }

    &__block-container {
        position: relative;
        min-height: 400px;
    }

    &__actions {
        display: flex;
        gap: 1rem;
        margin-top: 2.5rem;
        justify-content: space-between;

        @media (max-width: 480px) {
            flex-direction: column-reverse;
        }
    }

    &__button {
        padding: 1rem 2rem;
        border-radius: 50px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        border: none;
        flex: 1;
        justify-content: center;

        @media (max-width: 480px) {
            width: 100%;
        }

        &--primary {
            background: $primary-color;
            color: white;
            box-shadow: 0 4px 16px rgba(0, 71, 182, 0.3);

            &:hover:not(&--disabled):not(:disabled) {
                background: darken($primary-color, 8%);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 71, 182, 0.4);
            }

            &--disabled,
            &:disabled {
                background: #bdbdbd;
                cursor: not-allowed;
                box-shadow: none;
            }
        }

        &--secondary {
            background: white;
            color: $primary-color;
            border: 2px solid $primary-color;

            &:hover:not(:disabled) {
                background: lighten($primary-color, 45%);
                transform: translateY(-2px);
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }

        &:active:not(:disabled):not(&--disabled) {
            transform: translateY(0);
        }
    }

    &__privacy {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.75rem;
        color: $text-light;
    }
}
</style>
