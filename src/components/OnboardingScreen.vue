<template>
    <div class="onboarding">
        <div class="onboarding__container">
            <div class="onboarding__card" ref="cardRef">
                <div class="onboarding__icon">
                    <span class="onboarding__emoji">🎯</span>
                </div>

                <h1 class="onboarding__title">Descubra seu Avatar!</h1>

                <p class="onboarding__description">
                    Responda algumas perguntas e vamos criar um avatar único que
                    representa você. É rápido, divertido e vai te surpreender!
                </p>

                <button
                    class="onboarding__button"
                    @click="handleStart"
                    ref="buttonRef"
                >
                    <span>Começar</span>
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

                <p class="onboarding__privacy">
                    🔒 Nenhum dado é coletado ou enviado.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuizStore } from "../store/quiz";
import { gsap } from "gsap";

const quizStore = useQuizStore();
const cardRef = ref(null);
const buttonRef = ref(null);

onMounted(() => {
    // Entrance animation
    gsap.from(cardRef.value, {
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
    });
});

const handleStart = () => {
    // Exit animation before transitioning
    gsap.to(buttonRef.value, {
        scale: 0.95,
        duration: 0.1,
        onComplete: () => {
            gsap.to(cardRef.value, {
                scale: 1.05,
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    quizStore.startQuiz();
                },
            });
        },
    });
};
</script>

<style lang="scss" scoped>
.onboarding {
    min-height: 100vh;
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;

    &__container {
        max-width: 480px;
        width: 100%;
    }

    &__card {
        background: white;
        border-radius: 24px;
        box-shadow: 0 20px 60px rgba(0, 71, 182, 0.15);
        padding: 2.5rem 2rem;
        text-align: center;
    }

    &__icon {
        width: 80px;
        height: 80px;
        background: linear-gradient(
            135deg,
            $primary-color 0%,
            darken($primary-color, 15%) 100%
        );
        border-radius: 50%;
        margin: 0 auto 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(0, 71, 182, 0.25);
    }

    &__emoji {
        font-size: 2.5rem;
    }

    &__title {
        font-size: 2rem;
        font-weight: 700;
        color: $text-dark;
        margin-bottom: 1rem;
        line-height: 1.2;

        @media (max-width: 480px) {
            font-size: 1.75rem;
        }
    }

    &__description {
        color: $text-medium;
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 2rem;
    }

    &__button {
        width: 100%;
        background: $primary-color;
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-size: 1.125rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 16px rgba(0, 71, 182, 0.3);

        &:hover {
            background: darken($primary-color, 8%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 71, 182, 0.4);
        }

        &:active {
            transform: translateY(0);
        }
    }

    &__privacy {
        margin-top: 1.5rem;
        font-size: 0.75rem;
        color: $text-light;
        line-height: 1.4;
    }
}
</style>
