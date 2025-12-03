<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useBannerStore } from '@/store/banner';
import { useConfigStore } from '@/store/config';
import { useToast } from 'primevue/usetoast';
import { onMounted, reactive, ref, watch } from 'vue';

const configStore = useConfigStore();
const bannerStore = useBannerStore();
const { setBackendTheme } = useLayout();
const toast = useToast();

// --- STATE ---
const activeTab = ref('general');
const loading = ref(false);

const menuItems = [
    { id: 'general', label: 'General', icon: 'pi pi-cog' },
    { id: 'security', label: 'Security', icon: 'pi pi-shield' },
    { id: 'branding', label: 'Branding', icon: 'pi pi-palette' },
    { id: 'announcements', label: 'Announcements', icon: 'pi pi-megaphone' }
];

// --- FORMS ---
// 1. General
const settingsForm = reactive({
    appName: '',
    appDescription: '',
    maintenanceMode: false,
    sessionTimeout: 30
});

// 2. Branding
const brandingForm = reactive({
    primaryHex: '#10b981', // Default Fallback
    surface: 'slate',
    darkTheme: false
});

// 3. Banner
const bannerForm = reactive({
    active: false,
    message: '',
    severity: 'info'
});

const surfaceOptions = [
    { name: 'Slate', value: 'slate' },
    { name: 'Zinc', value: 'zinc' },
    { name: 'Neutral', value: 'neutral' },
    { name: 'Gray', value: 'gray' }
];

const severityOptions = ['info', 'warn', 'error', 'success'];

// --- SYNC LOGIC: Store -> Form ---
const syncForms = () => {
    // General
    settingsForm.appName = configStore.appName;
    settingsForm.appDescription = configStore.appDescription;
    settingsForm.sessionTimeout = configStore.sessionTimeout;

    // Branding
    brandingForm.surface = configStore.themeSettings.surface;
    brandingForm.darkTheme = configStore.themeSettings.darkTheme;
    // Extract Hex (assuming 500 is the seed)
    if (configStore.themeSettings.customPrimaryPalette) {
        brandingForm.primaryHex = configStore.themeSettings.customPrimaryPalette['500'];
    }

    // Banner
    bannerForm.active = bannerStore.active;
    bannerForm.message = bannerStore.message;
    bannerForm.severity = bannerStore.severity;
};

// Initial Load & Watch for changes
onMounted(() => {
    if (!configStore.loading) syncForms();
});

watch(
    () => configStore.loading,
    (isLoading) => {
        if (!isLoading) syncForms();
    }
);

// --- ACTIONS ---

function generatePalette(hex) {
    const adjust = (color, amount) => {
        return '#' + color.replace(/^#/, '').replace(/../g, (color) => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    };
    return {
        50: adjust(hex, 180),
        100: adjust(hex, 150),
        200: adjust(hex, 100),
        300: adjust(hex, 60),
        400: adjust(hex, 30),
        500: hex,
        600: adjust(hex, -20),
        700: adjust(hex, -40),
        800: adjust(hex, -60),
        900: adjust(hex, -80),
        950: adjust(hex, -100)
    };
}

const applyBrandingPreview = () => {
    const customPalette = generatePalette(brandingForm.primaryHex);
    // Applies visually via Layout Engine (Draft Mode)
    setBackendTheme({
        primary: 'admin-preview',
        surface: brandingForm.surface,
        darkTheme: brandingForm.darkTheme,
        customPrimaryPalette: customPalette
    });
};

const saveSettings = () => {
    loading.value = true;
    setTimeout(() => {
        // Commit changes to Config Store
        configStore.appName = settingsForm.appName;
        configStore.sessionTimeout = settingsForm.sessionTimeout;
        configStore.themeSettings.surface = brandingForm.surface;
        configStore.themeSettings.darkTheme = brandingForm.darkTheme;
        configStore.themeSettings.customPrimaryPalette = generatePalette(brandingForm.primaryHex);
        configStore.themeSettings.primary = 'admin-preview'; // Mark as custom

        bannerStore.setBanner(bannerForm);

        // Re-apply to ensure store state matches visual state
        applyBrandingPreview();

        toast.add({ severity: 'success', summary: 'Settings Saved', detail: 'Configuration updated', life: 3000 });
        loading.value = false;
    }, 800);
};
</script>

<template>
    <div class="card p-0 overflow-hidden">
        <div class="flex flex-col md:flex-row min-h-[600px]">
            <!-- SIDEBAR -->
            <div class="w-full md:w-1/4 border-r border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
                <div class="p-6 border-b border-surface-200 dark:border-surface-700">
                    <span class="text-xl font-bold">System Settings</span>
                    <p class="text-sm text-muted-color mt-1">Global Configuration</p>
                </div>
                <div class="flex flex-col">
                    <button
                        v-for="item in menuItems"
                        :key="item.id"
                        @click="activeTab = item.id"
                        class="flex items-center gap-3 p-4 text-left transition-colors border-l-4 hover:bg-surface-100 dark:hover:bg-surface-800 focus:outline-none"
                        :class="[activeTab === item.id ? 'border-primary bg-primary-50 dark:bg-primary-900/20 text-primary font-semibold' : 'border-transparent text-color']"
                    >
                        <i :class="[item.icon, 'text-lg']"></i>
                        <div class="flex flex-col">
                            <span class="text-sm">{{ item.label }}</span>
                        </div>
                    </button>
                </div>
            </div>

            <!-- CONTENT -->
            <div class="w-full md:w-3/4 p-6 md:p-8">
                <!-- GENERAL -->
                <div v-if="activeTab === 'general'" class="fade-in">
                    <h2 class="text-xl font-semibold mb-6">General Settings</h2>
                    <div class="flex flex-col gap-6 max-w-2xl">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold">Application Name</label>
                            <InputText v-model="settingsForm.appName" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold">Description</label>
                            <Textarea v-model="settingsForm.appDescription" rows="3" />
                        </div>
                        <div class="flex items-center gap-3 border p-4 rounded border-surface">
                            <Checkbox v-model="settingsForm.maintenanceMode" :binary="true" inputId="maint" />
                            <label for="maint" class="font-bold cursor-pointer">Maintenance Mode</label>
                        </div>
                    </div>
                </div>

                <!-- SECURITY -->
                <div v-if="activeTab === 'security'" class="fade-in">
                    <h2 class="text-xl font-semibold mb-6">Security Policies</h2>
                    <div class="flex flex-col gap-6 max-w-2xl">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold">Session Timeout</label>
                            <div class="flex items-center gap-4">
                                <Slider v-model="settingsForm.sessionTimeout" :min="5" :max="120" class="w-full" />
                                <span class="font-bold min-w-12 text-right">{{ settingsForm.sessionTimeout }}m</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BRANDING -->
                <div v-if="activeTab === 'branding'" class="fade-in">
                    <h2 class="text-xl font-semibold mb-6">Theme & Branding</h2>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div class="flex flex-col gap-6">
                            <div class="flex flex-col gap-2">
                                <label class="font-bold">Primary Brand Color</label>
                                <div class="flex gap-2">
                                    <input type="color" class="h-10 w-12 p-1 rounded border border-surface cursor-pointer" v-model="brandingForm.primaryHex" @input="applyBrandingPreview" />
                                    <InputText v-model="brandingForm.primaryHex" @blur="applyBrandingPreview" class="w-full" />
                                </div>
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="font-bold">Surface Tone</label>
                                <SelectButton v-model="brandingForm.surface" :options="surfaceOptions" optionLabel="name" optionValue="value" @change="applyBrandingPreview" class="w-full" />
                            </div>
                            <div class="flex items-center justify-between border p-4 rounded border-surface">
                                <span class="font-bold">Dark Mode Default</span>
                                <ToggleSwitch v-model="brandingForm.darkTheme" @change="applyBrandingPreview" />
                            </div>
                        </div>
                        <!-- Preview Box -->
                        <div class="border border-surface rounded-xl p-6 flex flex-col gap-4 bg-surface-50 dark:bg-surface-800/50">
                            <span class="text-xs font-bold text-muted-color uppercase">Preview Elements</span>
                            <div class="flex gap-2">
                                <Button label="Primary" />
                                <Button label="Secondary" severity="secondary" />
                            </div>
                            <div class="card bg-primary text-primary-contrast p-4 rounded shadow-sm">
                                <div class="font-bold">Brand Card</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ANNOUNCEMENTS -->
                <div v-if="activeTab === 'announcements'" class="fade-in">
                    <h2 class="text-xl font-semibold mb-6">System Announcements</h2>
                    <div class="flex flex-col gap-6 max-w-2xl">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold">Message</label>
                            <InputText v-model="bannerForm.message" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold">Severity</label>
                            <div class="flex gap-4">
                                <div v-for="type in severityOptions" :key="type" class="flex items-center">
                                    <RadioButton v-model="bannerForm.severity" :inputId="type" :value="type" />
                                    <label :for="type" class="ml-2 capitalize cursor-pointer">{{ type }}</label>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 border p-4 rounded border-surface mt-2">
                            <ToggleSwitch v-model="bannerForm.active" inputId="bannerActive" />
                            <label for="bannerActive" class="font-bold cursor-pointer">Activate Banner</label>
                        </div>
                    </div>
                </div>

                <!-- SAVE BUTTON -->
                <div class="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700 flex justify-end">
                    <Button label="Save Changes" icon="pi pi-save" :loading="loading" @click="saveSettings" size="large" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.fade-in {
    animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
