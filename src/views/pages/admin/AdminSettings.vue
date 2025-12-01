<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useBannerStore } from '@/store/banner';
import { useConfigStore } from '@/store/config';
import { useToast } from 'primevue/usetoast';
import { reactive, ref } from 'vue';

const configStore = useConfigStore();
const bannerStore = useBannerStore();
const { setBackendTheme } = useLayout();
const toast = useToast();

// --- STATE ---
const activeTab = ref('general');
const loading = ref(false);

// --- MENU ITEMS ---
const menuItems = [
    { id: 'general', label: 'General', icon: 'pi pi-cog', description: 'App details & maintenance' },
    { id: 'security', label: 'Security', icon: 'pi pi-shield', description: 'Session & access control' },
    { id: 'branding', label: 'Branding', icon: 'pi pi-palette', description: 'Look & feel' },
    { id: 'announcements', label: 'Announcements', icon: 'pi pi-megaphone', description: 'Global system banners' }
];

// --- FORMS (Synced with Stores) ---

// 1. General & Security Settings
const settingsForm = reactive({
    appName: configStore.appName,
    appDescription: 'Enterprise Dashboard Environment', // Mock description
    maintenanceMode: false,
    sessionTimeout: configStore.sessionTimeout
});

// 2. Banner Settings
const bannerForm = reactive({
    active: bannerStore.active,
    message: bannerStore.message,
    severity: bannerStore.severity
});

// 3. Branding Settings
const brandingForm = reactive({
    primaryHex: '#6366f1', // Default Seed
    surface: 'slate',
    darkTheme: false
});

const surfaceOptions = [
    { name: 'Slate', value: 'slate' },
    { name: 'Zinc', value: 'zinc' },
    { name: 'Neutral', value: 'neutral' },
    { name: 'Gray', value: 'gray' }
];

// --- ACTIONS ---

// Helper: Palette Generator
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

// Live Preview for Branding
const applyBrandingPreview = () => {
    const customPalette = generatePalette(brandingForm.primaryHex);
    setBackendTheme({
        primary: 'admin-preview',
        surface: brandingForm.surface,
        darkTheme: brandingForm.darkTheme,
        customPrimaryPalette: customPalette
    });
};

// Save All Settings
const saveSettings = () => {
    loading.value = true;

    setTimeout(() => {
        // 1. Update Config Store
        configStore.appName = settingsForm.appName;
        configStore.sessionTimeout = settingsForm.sessionTimeout;

        // 2. Update Banner Store
        bannerStore.setBanner(bannerForm);

        // 3. Update Branding (Ensure it sticks)
        applyBrandingPreview();

        toast.add({ severity: 'success', summary: 'Settings Saved', detail: 'System configuration updated', life: 3000 });
        loading.value = false;
    }, 800);
};

const severityOptions = ['info', 'warn', 'error', 'success', 'info'];
</script>

<template>
    <div class="card p-0 overflow-hidden">
        <div class="flex flex-col md:flex-row min-h-[600px]">
            <div class="w-full md:w-1/4 border-r border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
                <div class="p-6 border-b border-surface-200 dark:border-surface-700">
                    <span class="text-xl font-bold">System Settings</span>
                    <p class="text-sm text-muted-color mt-1">Manage global configuration</p>
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

            <div class="w-full md:w-3/4 p-6 md:p-8">
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
                            <div class="flex flex-col">
                                <label for="maint" class="font-bold cursor-pointer">Maintenance Mode</label>
                                <span class="text-sm text-muted-color">Prevent non-admin users from logging in.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="activeTab === 'security'" class="fade-in">
                    <h2 class="text-xl font-semibold mb-6">Security Policies</h2>
                    <div class="flex flex-col gap-6 max-w-2xl">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold">Session Timeout</label>
                            <div class="flex items-center gap-4">
                                <Slider v-model="settingsForm.sessionTimeout" :min="5" :max="120" class="w-full" />
                                <span class="font-bold min-w-12 text-right">{{ settingsForm.sessionTimeout }}m</span>
                            </div>
                            <small class="text-muted-color">Auto-logout after inactivity.</small>
                        </div>
                        <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 flex items-start gap-3">
                            <i class="pi pi-lock text-xl mt-1"></i>
                            <div class="text-sm">
                                <span class="font-bold block mb-1">Audit Policy</span>
                                Changing security settings will be logged in the system audit trail. Please ensure compliance with organization standards.
                            </div>
                        </div>
                    </div>
                </div>

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
                        <div class="border border-surface rounded-xl p-6 flex flex-col gap-4 bg-surface-50 dark:bg-surface-800/50">
                            <span class="text-xs font-bold text-muted-color uppercase tracking-wider">Preview Elements</span>
                            <div class="flex gap-2">
                                <Button label="Save" icon="pi pi-check" />
                                <Button label="Cancel" severity="secondary" />
                            </div>
                            <div class="card bg-primary text-primary-contrast p-4 rounded shadow-sm">
                                <div class="font-bold">Brand Card</div>
                                <div class="text-sm opacity-90">This tests contrast readability.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="activeTab === 'announcements'" class="fade-in">
                    <h2 class="text-xl font-semibold mb-6">System Announcements</h2>
                    <div class="flex flex-col gap-6 max-w-2xl">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold">Banner Message</label>
                            <InputText v-model="bannerForm.message" placeholder="e.g. System maintenance scheduled for..." />
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
