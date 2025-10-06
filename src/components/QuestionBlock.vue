<template>
    <div class="block" ref="blockRef">
        <div class="block__header">
            <h2 class="block__title">{{ block.title }}</h2>
            <p v-if="block.description" class="block__description">
                {{ block.description }}
            </p>
        </div>

        <div class="block__questions">
            <QuestionItem
                v-for="question in block.questions"
                :key="question.id"
                :question="question"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import QuestionItem from "./QuestionItem.vue";

const props = defineProps({
    block: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["block-mounted"]);

const blockRef = ref(null);

onMounted(() => {
    if (blockRef.value) {
        emit("block-mounted", blockRef.value);
    }
});
</script>

<style lang="scss" scoped>
.block {
    &__header {
        margin-bottom: 2rem;
    }

    &__title {
        font-size: 1.75rem;
        font-weight: 700;
        color: $text-dark;
        margin-bottom: 0.5rem;

        @media (max-width: 480px) {
            font-size: 1.5rem;
        }
    }

    &__description {
        font-size: 1rem;
        color: $text-medium;
        line-height: 1.5;
    }

    &__questions {
    }
}
</style>
