<script setup>
import { useAuthStore } from '@/store/auth';
import { useToast } from 'primevue/usetoast';
import { reactive, ref } from 'vue';

const authStore = useAuthStore();
const toast = useToast();

const loading = ref(false);
const activeTab = ref('profile'); // 'profile' | 'security' | 'notifications'

// --- FORMS ---
// Clone data so we don't mutate store directly until save
const profileForm = reactive({ ...authStore.user });

const passwordForm = reactive({
    current: '',
    new: '',
    confirm: ''
});

// --- ACTIONS ---

const onAvatarUpload = (event) => {
    const file = event.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        profileForm.avatar = e.target.result;
    };
    reader.readAsDataURL(file);
    toast.add({ severity: 'info', summary: 'Success', detail: 'Avatar updated locally', life: 3000 });
};

const saveProfile = async () => {
    loading.value = true;
    await authStore.updateProfile(profileForm);
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Profile details updated', life: 3000 });
    loading.value = false;
};

const savePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'New passwords do not match', life: 3000 });
        return;
    }

    loading.value = true;
    await authStore.changePassword(passwordForm.current, passwordForm.new);

    // Reset form
    passwordForm.current = '';
    passwordForm.new = '';
    passwordForm.confirm = '';

    toast.add({ severity: 'success', summary: 'Success', detail: 'Password changed successfully', life: 3000 });
    loading.value = false;
};
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="md:col-span-1">
            <div class="card p-6 flex flex-col items-center text-center gap-4">
                <div class="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-4 border-surface-200 dark:border-surface-700">
                    <img :src="profileForm.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" alt="Profile" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FileUpload mode="basic" name="avatar" accept="image/*" :maxFileSize="1000000" @select="onAvatarUpload" auto customUpload class="p-button-rounded p-button-text text-white!" chooseLabel=" " chooseIcon="pi pi-camera" />
                    </div>
                </div>

                <div>
                    <h2 class="text-xl font-bold">{{ authStore.user.name }}</h2>
                    <span class="text-muted-color text-sm">{{ authStore.user.role }}</span>
                </div>

                <div class="w-full border-t border-surface-200 dark:border-surface-700 my-2"></div>

                <div class="flex flex-col w-full gap-2">
                    <button
                        @click="activeTab = 'profile'"
                        class="flex items-center gap-3 p-3 rounded-md transition-colors text-left"
                        :class="activeTab === 'profile' ? 'bg-primary text-primary-contrast' : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-muted-color'"
                    >
                        <i class="pi pi-user"></i>
                        <span class="font-medium">Profile Details</span>
                    </button>

                    <button
                        @click="activeTab = 'security'"
                        class="flex items-center gap-3 p-3 rounded-md transition-colors text-left"
                        :class="activeTab === 'security' ? 'bg-primary text-primary-contrast' : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-muted-color'"
                    >
                        <i class="pi pi-shield"></i>
                        <span class="font-medium">Security</span>
                    </button>

                    <button
                        @click="activeTab = 'notifications'"
                        class="flex items-center gap-3 p-3 rounded-md transition-colors text-left"
                        :class="activeTab === 'notifications' ? 'bg-primary text-primary-contrast' : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-muted-color'"
                    >
                        <i class="pi pi-bell"></i>
                        <span class="font-medium">Notifications</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="md:col-span-3">
            <div class="card p-6 min-h-[500px]">
                <div v-if="activeTab === 'profile'" class="fade-in">
                    <h3 class="text-xl font-semibold mb-1">Personal Information</h3>
                    <p class="text-muted-color mb-6 text-sm">Update your public profile and contact details.</p>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="flex flex-col gap-2">
                            <label for="name" class="font-bold">Full Name</label>
                            <InputText id="name" v-model="profileForm.name" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="email" class="font-bold">Email Address</label>
                            <InputText id="email" v-model="profileForm.email" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="phone" class="font-bold">Phone Number</label>
                            <InputText id="phone" v-model="profileForm.phone" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="role" class="font-bold">Role (Read Only)</label>
                            <InputText id="role" v-model="profileForm.role" disabled class="bg-surface-100 dark:bg-surface-800" />
                        </div>
                        <div class="col-span-1 md:col-span-2 flex flex-col gap-2">
                            <label for="bio" class="font-bold">Bio</label>
                            <Textarea id="bio" v-model="profileForm.bio" rows="4" autoResize />
                        </div>
                    </div>

                    <div class="flex justify-end mt-8">
                        <Button label="Save Profile" icon="pi pi-save" :loading="loading" @click="saveProfile" />
                    </div>
                </div>

                <div v-if="activeTab === 'security'" class="fade-in">
                    <h3 class="text-xl font-semibold mb-1">Security & Password</h3>
                    <p class="text-muted-color mb-6 text-sm">Ensure your account is secure with a strong password.</p>

                    <div class="flex flex-col gap-6 max-w-lg">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold">Current Password</label>
                            <Password v-model="passwordForm.current" toggleMask :feedback="false" />
                        </div>

                        <div class="border-t border-surface-200 dark:border-surface-700 my-2"></div>

                        <div class="flex flex-col gap-2">
                            <label class="font-bold">New Password</label>
                            <Password v-model="passwordForm.new" toggleMask promptLabel="Choose a strong password" weakLabel="Too simple" mediumLabel="Average" strongLabel="Secure password">
                                <template #footer>
                                    <div class="p-1 mt-2 text-sm text-muted-color">
                                        <ul class="list-disc list-inside">
                                            <li>At least 8 characters</li>
                                            <li>One number</li>
                                            <li>One uppercase</li>
                                        </ul>
                                    </div>
                                </template>
                            </Password>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold">Confirm New Password</label>
                            <Password v-model="passwordForm.confirm" toggleMask :feedback="false" />
                        </div>
                    </div>

                    <div class="flex justify-start mt-8">
                        <Button label="Update Password" icon="pi pi-check" severity="primary" :loading="loading" @click="savePassword" />
                    </div>
                </div>

                <div v-if="activeTab === 'notifications'" class="fade-in">
                    <h3 class="text-xl font-semibold mb-6">Notification Preferences</h3>
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center justify-between border p-4 rounded border-surface">
                            <div class="flex flex-col">
                                <span class="font-bold">Email Alerts</span>
                                <span class="text-sm text-muted-color">Receive a daily summary of task activity.</span>
                            </div>
                            <ToggleSwitch modelValue="true" />
                        </div>
                        <div class="flex items-center justify-between border p-4 rounded border-surface">
                            <div class="flex flex-col">
                                <span class="font-bold">Security Alerts</span>
                                <span class="text-sm text-muted-color">Notify me of login attempts from new devices.</span>
                            </div>
                            <ToggleSwitch modelValue="true" />
                        </div>
                    </div>
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
