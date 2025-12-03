import { useLayout } from '@/layout/composables/layout';
import { useBannerStore } from '@/store/banner';
import api from '@/utils/axios'; // Import your API wrapper
import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';

export const useConfigStore = defineStore('config', () => {
    const { setBackendTheme } = useLayout();
    const bannerStore = useBannerStore();

    // State
    const loading = ref(true);
    const appName = ref('Sakai App');
    const appDescription = ref('Loading...');
    const sessionTimeout = ref(30);

    const themeSettings = reactive({
        primary: 'emerald',
        surface: 'slate',
        darkTheme: false,
        customPrimaryPalette: null
    });

    const activePrimaryColor = computed(() => {
        if (themeSettings.customPrimaryPalette) {
            return themeSettings.customPrimaryPalette['500'];
        }
        return 'var(--p-primary-500)';
    });

    // Actions
    const fetchConfig = async () => {
        loading.value = true;
        try {
            console.log('Store: Fetching configuration...');
            const response = await api.get('/v1/iam/config'); // Replace with actual endpoint
            const data = response.data?.dataPayload || response.data; // Adjust based on your API

            appName.value = data.appName;
            appDescription.value = data.appDescription;
            sessionTimeout.value = data.sessionTimeout;

            themeSettings.primary = data.theme.primary;
            themeSettings.surface = data.theme.surface;
            themeSettings.darkTheme = data.theme.darkTheme;
            themeSettings.customPrimaryPalette = data.theme.customPrimaryPalette;

            bannerStore.setBanner(data.systemBanner);

            setBackendTheme({
                primary: themeSettings.primary,
                surface: themeSettings.surface,
                darkTheme: themeSettings.darkTheme,
                customPrimaryPalette: themeSettings.customPrimaryPalette
            });
        } catch (error) {
            console.error('Failed to load config', error);
            // Fallback mock for development if API fails
            setBackendTheme({ primary: 'emerald', surface: 'slate', darkTheme: false });
        } finally {
            loading.value = false;
        }
    };

    // [NEW] Action for Real-time Preview (No API Call)
    const previewTheme = (previewSettings) => {
        // 1. Update Store State (Syncs Sidebar & Topbar)
        if (previewSettings.theme) {
            themeSettings.primary = previewSettings.theme.primary;
            themeSettings.surface = previewSettings.theme.surface;
            themeSettings.darkTheme = previewSettings.theme.darkTheme;
            themeSettings.customPrimaryPalette = previewSettings.theme.customPrimaryPalette;

            // 2. Update Layout Engine (Syncs Buttons & Inputs)
            setBackendTheme(previewSettings.theme);
        }
    };

    // [NEW] Action for Saving (API Call)
    const updateConfig = async (newSettings) => {
        try {
            // 1. Prepare Payload
            const payload = {
                appName: newSettings.appName,
                appDescription: newSettings.appDescription,
                sessionTimeout: newSettings.sessionTimeout,
                theme: newSettings.theme,
                systemBanner: newSettings.systemBanner
            };

            // 2. Call API
            await api.post('/v1/iam/config', payload);

            // 3. Commit Local Changes (Just in case preview wasn't called)
            appName.value = newSettings.appName;
            appDescription.value = newSettings.appDescription;
            sessionTimeout.value = newSettings.sessionTimeout;

            previewTheme({ theme: newSettings.theme });

            return true; // Success
        } catch (error) {
            console.error('Failed to save config', error);
            throw error;
        }
    };

    return {
        loading,
        appName,
        appDescription,
        sessionTimeout,
        themeSettings,
        activePrimaryColor,
        fetchConfig,
        previewTheme, // Export for live updates
        updateConfig // Export for saving
    };
});
