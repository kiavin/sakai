<script setup>
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const toast = useToast();

const email = ref('');
const loading = ref(false);
const submitted = ref(false); // To toggle between form and "Check email" message

const sendResetLink = async () => {
    if (!email.value) {
        toast.add({ severity: 'warn', summary: 'Required', detail: 'Please enter your email address', life: 3000 });
        return;
    }

    loading.value = true;

    // SIMULATE API CALL
    setTimeout(() => {
        // success
        loading.value = false;
        submitted.value = true;
        toast.add({ severity: 'success', summary: 'Email Sent', detail: 'Check your inbox for instructions.', life: 3000 });
    }, 1500);
};
</script>

<template>
    <div class="flex items-center justify-center min-h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
        <div class="w-full max-w-md p-6">
            <div class="bg-surface-0 dark:bg-surface-900 p-8 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700">
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                        <i class="pi pi-lock text-2xl text-primary"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Forgot Password?</h1>
                    <p class="text-muted-color mt-2">No worries, we'll send you reset instructions.</p>
                </div>

                <div v-if="!submitted">
                    <div class="flex flex-col gap-4">
                        <div class="flex flex-col gap-2">
                            <label for="email" class="font-semibold text-surface-900 dark:text-surface-0">Email</label>
                            <InputText id="email" v-model="email" type="email" placeholder="name@company.com" class="w-full" />
                        </div>

                        <Button label="Send Reset Link" class="w-full mt-2" :loading="loading" @click="sendResetLink" />
                    </div>
                </div>

                <div v-else class="text-center fade-in">
                    <div class="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-lg mb-6">
                        <i class="pi pi-check-circle text-xl mb-2"></i>
                        <p class="font-medium">Email sent to {{ email }}</p>
                    </div>
                    <p class="text-sm text-muted-color mb-6">
                        Didn't receive the email? Check your spam folder or
                        <a href="#" @click.prevent="sendResetLink" class="text-primary font-bold hover:underline">resend</a>.
                    </p>
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

<style scoped>
.fade-in {
    animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
