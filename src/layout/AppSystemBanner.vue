<script setup>
import { useBannerStore } from '@/store/banner'; // <--- UPDATED IMPORT

const bannerStore = useBannerStore();

const getClasses = () => {
    switch (bannerStore.severity) {
        case 'warn':
            return 'bg-orange-500 text-white';
        case 'error':
            return 'bg-red-500 text-white';
        case 'success':
            return 'bg-green-500 text-white';
        case 'info':
            return 'bg-blue-500 text-white';
        default:
            return 'bg-blue-500 text-white';
    }
};

const getIcon = () => {
    switch (bannerStore.severity) {
        case 'warn':
            return 'pi pi-exclamation-triangle';
        case 'error':
            return 'pi pi-times-circle';
        case 'success':
            return 'pi pi-check-circle';
        case 'info':
            return 'pi pi-info-circle';
        default:
            return 'pi pi-info-circle';
    }
};
</script>

<template>
    <Transition name="layout-banner">
        <div v-if="bannerStore.active" class="flex items-center justify-between px-4 py-2 text-sm font-bold shadow-md relative z-9999" :class="getClasses()">
            <div class="w-6"></div>

            <div class="flex items-center justify-center">
                <i :class="['mr-2 text-lg', getIcon()]"></i>
                <span>{{ bannerStore.message }}</span>
            </div>

            <button @click="bannerStore.hide()" class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer">
                <i class="pi pi-times text-xs"></i>
            </button>
        </div>
    </Transition>
</template>

<style scoped>
.layout-banner-enter-active,
.layout-banner-leave-active {
    transition: all 0.3s ease;
    max-height: 50px;
    opacity: 1;
}

.layout-banner-enter-from,
.layout-banner-leave-to {
    max-height: 0;
    opacity: 0;
    padding: 0;
}
</style>
