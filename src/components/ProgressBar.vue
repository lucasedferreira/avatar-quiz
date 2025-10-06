<template>
    <div class="progress">
        <div class="progress__info">
            <span class="progress__label"
                >Bloco {{ currentBlock }} de {{ totalBlocks }}</span
            >
            <span class="progress__percentage"
                >{{ Math.round(progress) }}%</span
            >
        </div>
        <div class="progress__bar" ref="barContainerRef">
            <div
                class="progress__fill"
                ref="fillRef"
                :style="{ width: `${progress}%` }"
            ></div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { gsap } from "gsap";

const props = defineProps({
    currentBlock: {
        type: Number,
        required: true,
    },
    totalBlocks: {
        type: Number,
        required: true,
    },
    progress: {
        type: Number,
        required: true,
    },
});

const fillRef = ref(null);

watch(
    () => props.progress,
    (newProgress) => {
        if (fillRef.value) {
            gsap.to(fillRef.value, {
                width: `${newProgress}%`,
                duration: 0.6,
                ease: "power2.out",
            });
        }
    }
);

onMounted(() => {
    // Initial animation
    if (fillRef.value) {
        gsap.from(fillRef.value, {
            width: 0,
            duration: 0.8,
            ease: "power2.out",
        });
    }
});
</script>

<style lang="scss" scoped>
.progress {
    margin-bottom: 2rem;

    &__info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }

    &__label {
        font-size: 0.875rem;
        font-weight: 600;
        color: $text-medium;
    }

    &__percentage {
        font-size: 0.875rem;
        font-weight: 700;
        color: $primary-color;
    }

    &__bar {
        height: 8px;
        background: #e0e0e0;
        border-radius: 50px;
        overflow: hidden;
        position: relative;
    }

    &__fill {
        height: 100%;
        background: linear-gradient(
            90deg,
            $primary-color 0%,
            lighten($primary-color, 10%) 100%
        );
        border-radius: 50px;
        transition: width 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 71, 182, 0.3);
    }
}
</style>
