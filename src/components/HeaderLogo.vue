<template>
    <header class="header">
        <div class="header__container">
            <div class="header__logo">
                <img class="header__logo-image" src="/src/assets/images/senai-logo-4k.png" alt="Logo Senai" />
            </div>
        </div>
    </header>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.header {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    // padding: .5rem;
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60px;

    &__container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    &__logo {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &__logo-image {
        height: 2.5rem;
    }
}
</style>
