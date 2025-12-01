<script setup>
import GlobalCommandPalette from '@/components/GlobalCommandPalette.vue';
import { useSweetAlert } from '@/composables/useSweetAlert';
import { useConfigStore } from '@/store/config';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { onMounted, onUnmounted } from 'vue';

const toast = useToast();
const swal = useSweetAlert();

const handleApiNotification = (event) => {
    const { message, theme, type } = event.detail;

    // 1. Map Backend Theme to Frontend Severity
    // Backend: 'success', 'error', 'warning', 'info'
    // PrimeVue: 'success', 'error', 'warn', 'info'
    const severity = theme === 'warning' ? 'warn' : theme;

    // Capitalize for Titles (e.g. 'success' -> 'Success')
    const title = theme.charAt(0).toUpperCase() + theme.slice(1);

    // 2. ROUTING LOGIC
    if (type === 'toast') {
        // Option A: Toast (Top Right)
        toast.add({
            severity: severity,
            summary: title,
            detail: message,
            life: 4000
        });
    } else if (type === 'alert') {
        // Option B: SweetAlert (Center Modal)
        // We dynamically call swal.success(), swal.error(), etc.
        // If theme is 'info', fallback to simple alert logic

        if (theme === 'success') swal.success(title, message);
        else if (theme === 'error') swal.error(title, message);
        else if (theme === 'warning') swal.warning(title, message);
        else {
            // Fallback for generic info
            swal.confirmAction(title, message, () => {}, { showCancelButton: false });
        }
    }
};

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
    window.addEventListener('api-notification', handleApiNotification);
});

onUnmounted(() => {
    window.removeEventListener('api-error', handleApiError);
    window.removeEventListener('api-notification', handleApiNotification);
});
</script>

<template>
    <Toast />
    <DynamicDialog />
    <ConfirmDialog group="sweetalert">
        <template #container="{ message, acceptCallback, rejectCallback }">
            <div class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded-2xl shadow-2xl w-[90vw] max-w-[400px] border border-surface-100 dark:border-surface-700">
                <div
                    class="rounded-full p-4 mb-5 flex items-center justify-center border-4 fade-in-scale"
                    :class="{
                        'border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-900/20 text-green-500': message.icon.includes('check'),
                        'border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-900/20 text-red-500': message.icon.includes('times'),
                        'border-orange-100 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/20 text-orange-500': message.icon.includes('exclamation'),
                        'border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 text-blue-500': message.icon.includes('info')
                    }"
                >
                    <i :class="[message.icon, 'text-5xl']"></i>
                </div>

                <span class="font-bold text-2xl block mb-2 text-surface-900 dark:text-surface-0 text-center">
                    {{ message.header }}
                </span>

                <p class="mb-8 text-muted-color text-center leading-relaxed">
                    {{ message.message }}
                </p>

                <div class="flex items-center gap-3 w-full justify-center">
                    <Button v-if="message.rejectLabel" :label="message.rejectLabel" @click="rejectCallback" severity="secondary" text class="w-full" />

                    <Button :label="message.acceptLabel || 'OK'" @click="acceptCallback" :class="[message.acceptClass, 'w-full']" />
                </div>
            </div>
        </template>
    </ConfirmDialog>
    <GlobalCommandPalette />

    <div v-if="loading" class="flex flex-col gap-4 items-center justify-center h-screen w-screen bg-surface-0 dark:bg-surface-900">
        <i class="pi pi-spin pi-spinner text-6xl text-primary"></i>
        <div class="text-xl font-semibold text-surface-600 dark:text-surface-400">Loading System Config...</div>
    </div>
    <router-view v-else />
</template>
<style scoped>
/* Simple 'Pop' animation like SweetAlert */
.fade-in-scale {
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
    0% {
        transform: scale(0.5);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
</style>
