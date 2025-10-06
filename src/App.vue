<template>
    <div id="app">
        <HeaderLogo v-if="quizStore.currentScreen !== 'onboarding'" />

        <transition name="fade" mode="out-in">
            <component :is="currentComponent" />
        </transition>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { useQuizStore } from "./store/quiz";
import HeaderLogo from "./components/HeaderLogo.vue";
import OnboardingScreen from "./components/OnboardingScreen.vue";
import Wizard from "./components/Wizard.vue";
import ResultAvatar from "./components/ResultAvatar.vue";

const quizStore = useQuizStore();

const currentComponent = computed(() => {
    switch (quizStore.currentScreen) {
        case "onboarding":
            return OnboardingScreen;
        case "quiz":
            return Wizard;
        case "result":
            return ResultAvatar;
        default:
            return OnboardingScreen;
    }
});
</script>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
