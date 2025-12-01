import { useLayout } from '@/layout/composables/layout';
import { useBannerStore } from '@/store/banner';
import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export const useConfigStore = defineStore('config', () => {
    // 1. Get access to the Theme Engine we built earlier
    const { setBackendTheme } = useLayout();
    const bannerStore = useBannerStore();
    // 2. State (Default values to prevent crashes before API loads)
    const loading = ref(true);
    const appName = ref('Sakai App');
    const appDescription = ref('Loading...');
    const sessionTimeout = ref(30); // minutes

    // We keep a local copy of the theme settings for the Admin Form
    const themeSettings = reactive({
        primary: 'emerald',
        surface: 'slate',
        darkTheme: false,
        customPrimaryPalette: null
    });

    // 3. Actions
    const fetchConfig = async () => {
        loading.value = true;
        try {
            console.log('Store: Fetching configuration...');

            // SIMULATED API CALL
            // const { data } = await axios.get('/api/config');

            // MOCK RESPONSE
            const data = await new Promise((resolve) =>
                setTimeout(
                    () =>
                        resolve({
                            appName: 'Bank of Vue',
                            appDescription: 'Enterprise Dashboard Environment',
                            sessionTimeout: 10,
                            theme: {
                                primary: 'royal-admin', // Custom brand
                                surface: 'zinc',
                                darkTheme: false,
                                customPrimaryPalette: {
                                    50: '#eff4ff',
                                    100: '#e0e7ff',
                                    200: '#c7d2fe',
                                    300: '#a5b4fc',
                                    400: '#818cf8',
                                    500: '#6366f1',
                                    600: '#4f46e5',
                                    700: '#4338ca',
                                    800: '#3730a3',
                                    900: '#312e81',
                                    950: '#1e1b4b'
                                }
                            },
                            systemBanner: {
                                active: false,
                                message:
                                    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum',
                                severity: 'info'
                            }
                        }),
                    800
                )
            );

            // 4. Update Store State
            appName.value = data.appName;
            appDescription.value = data.appDescription;
            sessionTimeout.value = data.sessionTimeout;

            themeSettings.primary = data.theme.primary;
            themeSettings.surface = data.theme.surface;
            themeSettings.darkTheme = data.theme.darkTheme;
            themeSettings.customPrimaryPalette = data.theme.customPrimaryPalette;

            // Update Global Banner if active
            bannerStore.setBanner(data.systemBanner);

            // 5. Trigger the Visual Changes in layout.js
            setBackendTheme({
                primary: themeSettings.primary,
                surface: themeSettings.surface,
                darkTheme: themeSettings.darkTheme,
                customPrimaryPalette: themeSettings.customPrimaryPalette
            });
        } catch (error) {
            console.error('Failed to load config', error);
            // Fallback to default theme if API fails
            setBackendTheme({ primary: 'emerald', surface: 'slate', darkTheme: false });
        } finally {
            loading.value = false;
        }
    };

    const updateConfig = async (newSettings) => {
        // Logic to POST changes to your backend
        // await axios.post('/api/config', newSettings);

        // Optimistically update local state
        appName.value = newSettings.appName;
        // ... update other values ...

        // Re-apply theme
        if (newSettings.theme) {
            setBackendTheme(newSettings.theme);
        }
    };

    return {
        loading,
        appName,
        appDescription,
        sessionTimeout,
        themeSettings,
        fetchConfig,
        updateConfig
    };
});
