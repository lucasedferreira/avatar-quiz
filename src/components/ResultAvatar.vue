<template>
    <div class="result">
        <div class="result__container" ref="containerRef">
            <div class="result__header">
                <div class="result__icon">🎉</div>
                <h1 class="result__title">Seu Avatar está pronto!</h1>
            </div>

            <div class="result__avatar" ref="avatarRef">
                <div class="result__avatar-image">
                    <div class="result__avatar-placeholder">
                        <span class="result__avatar-emoji">{{
                            getAvatarEmoji()
                        }}</span>
                    </div>
                </div>

                <h2 class="result__avatar-name">{{ avatar.name }}</h2>
                <p class="result__avatar-description">
                    {{ avatar.description }}
                </p>

                <!-- <div class="result__avatar-tags">
                    <span
                        v-for="tag in avatar.tags.split(', ')"
                        :key="tag"
                        class="result__tag"
                    >
                        {{ tag }}
                    </span>
                </div> -->
            </div>

            <div class="result__actions">
                <a
                    href="https://www.senai.br/cursos"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="result__button result__button--primary"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                        ></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    <span>Quero dar uma olhada nos cursos</span>
                </a>

                <WhatsAppShareButton :avatar="avatar" />
            </div>

            <div class="result__info">
                <p class="result__privacy">
                    🔒 <strong>Privacidade garantida:</strong> Nenhum dado foi
                    coletado ou enviado.
                </p>

                <button class="result__restart" @click="handleRestart">
                    Refazer o quiz
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuizStore } from "../store/quiz";
import { gsap } from "gsap";
import confetti from "canvas-confetti";
import WhatsAppShareButton from "./WhatsAppShareButton.vue";

const quizStore = useQuizStore();
const containerRef = ref(null);
const avatarRef = ref(null);

const avatar = quizStore.resultAvatar;

const getAvatarEmoji = () => {
    const emojiMap = {
        pcp: "⚙️",
        ds: "💻",
        ma: "🔧",
        ds_pcp: "📊",
        ma_pcp: "🏭",
        ds_ma: "🤖",
        neutral: "🧭",
    };
    return emojiMap[avatar.id] || "🎯";
};

const launchConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // left
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ["#0047B6", "#42A5F5", "#FFD700", "#FF6B6B", "#4CAF50"],
        });

        // Right
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ["#0047B6", "#42A5F5", "#FFD700", "#FF6B6B", "#4CAF50"],
        });
    }, 250);

    setTimeout(() => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#0047B6", "#42A5F5", "#FFD700", "#FF6B6B", "#4CAF50"],
        });
    }, 500);
};

const handleRestart = () => {
    gsap.to(containerRef.value, {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        onComplete: () => {
            quizStore.resetQuiz();
        },
    });
};

onMounted(() => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });

    gsap.from(containerRef.value, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power2.out",
    });

    gsap.from(avatarRef.value, {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: "back.out(1.7)",
    });

    setTimeout(() => {
        launchConfetti();
    }, 500);
});
</script>

<style lang="scss" scoped>
.result {
    min-height: 100vh;
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
    padding: 2rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
        padding: 1.5rem 1rem;
    }

    &__container {
        max-width: 700px;
        width: 100%;
        background: white;
        border-radius: 32px;
        padding: 3rem 2.5rem;
        box-shadow: 0 20px 60px rgba(0, 71, 182, 0.2);

        @media (max-width: 768px) {
            padding: 2.5rem 2rem;
        }

        @media (max-width: 480px) {
            padding: 2rem 1.5rem;
            border-radius: 24px;
        }
    }

    &__header {
        text-align: center;
        margin-bottom: 2rem;
    }

    &__icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: bounce 1s ease infinite;
    }

    &__title {
        font-size: 2rem;
        font-weight: 700;
        color: $text-dark;
        margin-bottom: 0.5rem;

        @media (max-width: 480px) {
            font-size: 1.75rem;
        }
    }

    &__avatar {
        text-align: center;
        padding: 2rem;
        background: linear-gradient(
            135deg,
            lighten($primary-color, 45%) 0%,
            lighten($primary-color, 48%) 100%
        );
        border-radius: 24px;
        margin-bottom: 2rem;
    }

    &__avatar-image {
        margin-bottom: 1.5rem;
    }

    &__avatar-placeholder {
        width: 160px;
        height: 160px;
        background: linear-gradient(
            135deg,
            $primary-color 0%,
            darken($primary-color, 10%) 100%
        );
        border-radius: 50%;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 12px 40px rgba(0, 71, 182, 0.25);

        @media (max-width: 480px) {
            width: 120px;
            height: 120px;
        }
    }

    &__avatar-emoji {
        font-size: 5rem;

        @media (max-width: 480px) {
            font-size: 3.5rem;
        }
    }

    &__avatar-name {
        font-size: 2rem;
        font-weight: 700;
        color: $primary-color;
        margin-bottom: 1rem;

        @media (max-width: 480px) {
            font-size: 1.75rem;
        }
    }

    &__avatar-description {
        font-size: 1.125rem;
        color: $text-medium;
        line-height: 1.6;
        margin-bottom: 1.5rem;

        @media (max-width: 480px) {
            font-size: 1rem;
        }
    }

    &__avatar-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: center;
    }

    &__tag {
        background: white;
        color: $primary-color;
        padding: 0.375rem 0.875rem;
        border-radius: 50px;
        font-size: 0.75rem;
        font-weight: 600;
        border: 1px solid rgba(0, 71, 182, 0.2);
    }

    &__actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    &__button {
        padding: 1rem 1.5rem;
        border-radius: 50px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        text-decoration: none;
        border: none;

        &--primary {
            background: $primary-color;
            color: white;
            box-shadow: 0 4px 16px rgba(0, 71, 182, 0.3);

            &:hover {
                background: darken($primary-color, 8%);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 71, 182, 0.4);
            }
        }

        &:active {
            transform: translateY(0);
        }
    }

    &__info {
        text-align: center;
    }

    &__privacy {
        font-size: 0.875rem;
        color: $text-medium;
        line-height: 1.6;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 12px;
        margin-bottom: 1rem;

        strong {
            color: $text-dark;
        }
    }

    &__restart {
        background: none;
        border: none;
        color: $primary-color;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
        transition: opacity 0.3s ease;

        &:hover {
            opacity: 0.7;
        }
    }
}

@keyframes bounce {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}
</style>
