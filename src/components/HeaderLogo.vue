<template>
    <header class="header">
        <div class="header__container">
            <div class="header__title">✨ Start Tec</div>
            <div class="header__logo">
                <img
                    class="header__logo-image"
                    src="/src/assets/images/senai-logo-4k.png"
                    alt="Logo Senai"
                />
            </div>
        </div>
    </header>
</template>

<script setup></script>

<style lang="scss" scoped>
.header {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60px;
    animation: intro 0.7s ease-in-out;

    &__container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 0 1rem;
        gap: 2rem;
    }

    &__title {
        font-family: "Arial", sans-serif;
        font-size: 1rem;
        font-weight: bold;
        color: #0c2d6a;
        text-transform: uppercase;
        letter-spacing: 3px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        position: relative;

        &::after {
            content: "";
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(
                90deg,
                transparent,
                #0c2d6a,
                transparent
            );
            animation: shimmer 2.5s ease-in-out infinite;
        }
    }

    &__logo {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &__logo-image {
        height: 2rem;
    }
}

@keyframes intro {
    0% {
        transform: translateY(-60px);
    }
    100% {
        transform: translateY(0);
    }
}

@keyframes shimmer {
    0%,
    100% {
        opacity: 0.5;
    }
    50% {
        opacity: 1;
    }
}
</style>
