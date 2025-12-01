import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBannerStore = defineStore('banner', () => {
    // STATE
    const active = ref(false);
    const message = ref('');
    const severity = ref('info'); // 'info' | 'warn' | 'error' | 'success'

    // ACTIONS
    function setBanner(data) {
        if (!data) return;
        active.value = data.active ?? false;
        message.value = data.message || '';
        severity.value = data.severity || 'info';
    }

    function hide() {
        active.value = false;
    }

    // Optional: Reset to defaults
    function reset() {
        active.value = false;
        message.value = '';
        severity.value = 'info';
    }

    return {
        active,
        message,
        severity,
        setBanner,
        hide,
        reset
    };
});
