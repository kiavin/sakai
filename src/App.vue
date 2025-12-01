<script setup>
import { useConfigStore } from '@/store/config';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { onMounted, onUnmounted } from 'vue';

const toast = useToast();

const handleApiError = (event) => {
    const message = event.detail?.message || 'An unexpected error occurred';
    toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 5000
    });
};

const configStore = useConfigStore();
// Use storeToRefs for reactive state variables (loading), but not for actions
const { loading } = storeToRefs(configStore);

onMounted(() => {
    // This runs every time the browser refreshes
    configStore.fetchConfig();
    // Listen for the custom event dispatched from api.js
    window.addEventListener('api-error', handleApiError);
});

onUnmounted(() => {
    window.removeEventListener('api-error', handleApiError);
});
</script>

<template>
    <Toast />
    <DynamicDialog />
    <div v-if="loading" class="flex flex-col gap-4 items-center justify-center h-screen w-screen bg-surface-0 dark:bg-surface-900">
        <i class="pi pi-spin pi-spinner text-6xl text-primary"></i>
        <div class="text-xl font-semibold text-surface-600 dark:text-surface-400">Loading System Config...</div>
    </div>
    <router-view v-else />
</template>
