<template>
    <div class="question" ref="questionRef" :id="`question-${question.id}`">
        <h3 class="question__text">{{ question.text }}</h3>

        <div class="question__alternatives">
            <button
                v-for="alternative in question.alternatives"
                :key="alternative.id"
                class="alternative"
                :class="{
                    'alternative--selected': isSelected(alternative),
                    'alternative--feedback':
                        showFeedback && isSelected(alternative),
                }"
                @click="handleSelect($event, alternative)"
                ref="alternativeRefs"
            >
                <span class="alternative__letter">{{
                    alternative.id.toUpperCase()
                }}</span>
                <span class="alternative__text">{{ alternative.text }}</span>

                <transition name="fade">
                    <span
                        v-if="showFeedback && isSelected(alternative)"
                        class="alternative__badge"
                    >
                        ✓ Registrado
                    </span>
                </transition>
            </button>
        </div>

        <div ref="particlesContainer" class="question__particles"></div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useQuizStore } from "../store/quiz";
import { gsap } from "gsap";

const props = defineProps({
    question: {
        type: Object,
        required: true,
    },
});

const quizStore = useQuizStore();
const questionRef = ref(null);
const alternativeRefs = ref([]);
const particlesContainer = ref(null);

const selectedAnswer = computed(() => quizStore.answers[props.question.id]);
const showFeedback = computed(
    () => quizStore.feedbackQuestionId === props.question.id
);

const isSelected = (alternative) => {
    return selectedAnswer.value?.id === alternative.id;
};

const createCelebrationParticles = (clickX, clickY) => {
    if (!particlesContainer.value) return;

    const colors = ["#0047B6", "#42A5F5", "#FFD700", "#4CAF50"];
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "celebration-particle";

        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4;

        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            left: ${clickX}px;
            top: ${clickY}px;
            pointer-events: none;
            z-index: 1000;
        `;

        particlesContainer.value.appendChild(particle);

        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = Math.random() * 80 + 40;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        gsap.to(particle, {
            x: tx,
            y: ty,
            opacity: 0,
            scale: 0,
            duration: 0.8 + Math.random() * 0.4,
            ease: "power2.out",
            onComplete: () => {
                particle.remove();
            },
        });
    }

    for (let i = 0; i < 4; i++) {
        const star = document.createElement("div");
        star.className = "celebration-star";
        star.textContent = "✨";

        star.style.cssText = `
            position: absolute;
            left: ${clickX}px;
            top: ${clickY}px;
            font-size: 16px;
            pointer-events: none;
            z-index: 1001;
        `;

        particlesContainer.value.appendChild(star);

        const angle = (Math.PI * 2 * i) / 4 + Math.PI / 4;
        const distance = Math.random() * 60 + 30;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        gsap.to(star, {
            x: tx,
            y: ty,
            opacity: 0,
            rotation: 360,
            scale: 1.5,
            duration: 1,
            ease: "power2.out",
            onComplete: () => {
                star.remove();
            },
        });
    }
};

const scrollToNextQuestion = () => {
    nextTick(() => {
        const currentQuestionEl = questionRef.value;
        if (!currentQuestionEl) return;

        if (quizStore.isCurrentBlockComplete) {
            const actionsElement = document.querySelector(".wizard__actions");
            if (actionsElement) {
                const offset = 100;
                const elementPosition =
                    actionsElement.getBoundingClientRect().top;
                const offsetPosition =
                    elementPosition + window.pageYOffset - offset;

                setTimeout(() => {
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    });
                }, 400);
            }
            return;
        }

        const nextQuestionEl = currentQuestionEl.nextElementSibling;

        if (nextQuestionEl) {
            const offset = 120;
            const elementPosition = nextQuestionEl.getBoundingClientRect().top;
            const offsetPosition =
                elementPosition + window.pageYOffset - offset;

            setTimeout(() => {
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                });
            }, 150);
        } else {
            setTimeout(() => {
                const actionsElement =
                    document.querySelector(".wizard__actions");
                if (actionsElement) {
                    const offset = 100;
                    const elementPosition =
                        actionsElement.getBoundingClientRect().top;
                    const offsetPosition =
                        elementPosition + window.pageYOffset - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    });
                }
            }, 400);
        }
    });
};

const handleSelect = (event, alternative) => {
    const rect = questionRef.value.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    createCelebrationParticles(clickX, clickY);

    quizStore.selectAnswer(props.question.id, alternative);

    const button = alternativeRefs.value.find((el) =>
        el?.textContent.includes(alternative.text)
    );

    if (button) {
        gsap.timeline()
            .to(button, {
                scale: 1.05,
                duration: 0.15,
                ease: "back.out(3)",
            })
            .to(button, {
                scale: 1,
                duration: 0.15,
                ease: "power2.out",
            });
    }

    scrollToNextQuestion();
};

watch(showFeedback, (show) => {
    if (show) {
        const selectedButton = alternativeRefs.value.find((el) => {
            const letter = el?.querySelector(
                ".alternative__letter"
            )?.textContent;
            return letter?.toLowerCase() === selectedAnswer.value?.id;
        });

        if (selectedButton) {
            const badge = selectedButton.querySelector(".alternative__badge");
            if (badge) {
                gsap.from(badge, {
                    scale: 0,
                    opacity: 0,
                    rotation: -180,
                    duration: 0.4,
                    ease: "back.out(2)",
                });
            }
        }
    }
});
</script>

<style lang="scss" scoped>
.question {
    margin-bottom: 2.5rem;
    scroll-margin-top: 120px;
    position: relative;
    transition: background-color 0.3s ease;
    padding: 1rem;
    margin: 0 -1rem 2.5rem -1rem;
    border-radius: 12px;

    &:last-child {
        margin-bottom: 0;
    }

    &__text {
        font-size: 1.125rem;
        font-weight: 600;
        color: $text-dark;
        margin-bottom: 1rem;
        line-height: 1.4;

        @media (max-width: 480px) {
            font-size: 1rem;
        }
    }

    &__alternatives {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    &__particles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: visible;
    }
}

.alternative {
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 16px;
    padding: 1rem 1.25rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 1rem;
    text-align: left;
    position: relative;
    overflow: hidden;

    &:hover {
        border-color: lighten($primary-color, 20%);
        background: lighten($primary-color, 45%);
        transform: translateX(4px);
    }

    &--selected {
        border-color: $primary-color;
        background: lighten($primary-color, 42%);
        box-shadow: 0 4px 12px rgba(0, 71, 182, 0.15);
    }

    &--feedback {
        animation: pulse 0.6s ease;
    }

    &__letter {
        width: 32px;
        height: 32px;
        background: $primary-color;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.875rem;
        flex-shrink: 0;
    }

    &__text {
        flex: 1;
        color: $text-dark;
        font-size: 0.9375rem;
        line-height: 1.5;
    }

    &__badge {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        background: #4caf50;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 50px;
        font-size: 0.75rem;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }
}

@keyframes pulse {
    0%,
    100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.02);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
