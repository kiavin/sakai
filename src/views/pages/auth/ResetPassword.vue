<script setup>
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

// Optional: Grab token from URL to send to API
// const token = route.query.token;

const resetPassword = () => {
    if (!password.value || !confirmPassword.value) {
        toast.add({ severity: 'warn', summary: 'Required', detail: 'Please fill in both fields', life: 3000 });
        return;
    }

    if (password.value !== confirmPassword.value) {
        toast.add({ severity: 'error', summary: 'Mismatch', detail: 'Passwords do not match', life: 3000 });
        return;
    }

    loading.value = true;

    // SIMULATE API CALL
    setTimeout(() => {
        loading.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Password reset successfully', life: 3000 });

        // Redirect to login after slight delay
        setTimeout(() => {
            router.push('/auth/login');
        }, 1000);
    }, 1500);
};
</script>

<template>
    <div class="flex items-center justify-center min-h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
        <div class="w-full max-w-md p-6">
            <div class="bg-surface-0 dark:bg-surface-900 p-8 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700">
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                        <i class="pi pi-key text-2xl text-primary"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Set New Password</h1>
                    <p class="text-muted-color mt-2">Your new password must be different from previously used passwords.</p>
                </div>

                <div class="flex flex-col gap-5">
                    <div class="flex flex-col gap-2">
                        <label for="password" class="font-semibold text-surface-900 dark:text-surface-0">Password</label>
                        <Password
                            id="password"
                            v-model="password"
                            toggleMask
                            class="w-full"
                            :inputClass="'w-full'"
                            placeholder="••••••••"
                            promptLabel="Choose a strong password"
                            weakLabel="Too simple"
                            mediumLabel="Average"
                            strongLabel="Secure password"
                        >
                            <template #footer>
                                <div class="p-1 mt-2 text-sm text-muted-color">
                                    <ul class="list-disc list-inside">
                                        <li>At least 8 characters</li>
                                        <li>One uppercase letter</li>
                                        <li>One number</li>
                                    </ul>
                                </div>
                            </template>
                        </Password>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="confirm" class="font-semibold text-surface-900 dark:text-surface-0">Confirm Password</label>
                        <Password id="confirm" v-model="confirmPassword" toggleMask class="w-full" :inputClass="'w-full'" placeholder="••••••••" :feedback="false" />
                    </div>

                    <Button label="Reset Password" class="w-full mt-2" :loading="loading" @click="resetPassword" />
                </div>

                <div class="mt-8 text-center">
                    <router-link to="/auth/login" class="text-surface-500 dark:text-surface-400 hover:text-primary font-semibold transition-colors flex items-center justify-center gap-2">
                        <i class="pi pi-arrow-left text-xs"></i>
                        Back to Login
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>
