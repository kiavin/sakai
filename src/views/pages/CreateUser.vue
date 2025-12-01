<!-- use this as a reference to creating a form
with vee-validate and primevue components
and handling api errors -->

<script setup>
import api from '@/utils/axios';
import { setApiErrors } from '@/utils/form';
// import { toTypedSchema } from '@vee-validate/zod';
import { useToast } from 'primevue/usetoast';
import { useForm } from 'vee-validate';
import { ref } from 'vue';
// import * as z from 'zod';

const toast = useToast();
const loading = ref(false);

// 1. DEFINE VALIDATION SCHEMA (Client Side)
// This runs immediately as the user types or blurs
// const validationSchema = toTypedSchema(
//     z.object({
//         name: z.string().min(2, 'Name is too short'),
//         email: z.string().email('Invalid email format'),
//         role: z.string().min(1, 'Role is required')
//     })
// );

// 2. INITIALIZE FORM
// 'defineField' creates the bindings for PrimeVue v-model
// 'handleSubmit' wraps your function in validation logic
// 'setErrors' is what we use to inject backend errors
// const { defineField, handleSubmit, errors, setErrors } = useForm({
//     validationSchema
// }); if you wanna use zod schema i.e frontend validation

const { defineField, handleSubmit, errors, setErrors } = useForm({}); // if you wanna skip frontend validation

// 3. BIND FIELDS
const [name, nameProps] = defineField('name');
const [email, emailProps] = defineField('email');
const [role] = defineField('role'); // Selects work slightly differently

// 4. SUBMIT HANDLER
const onSubmit = handleSubmit(async (values) => {
    loading.value = true;

    try {
        // Send clean data to API
        await api.post('/users', values);

        toast.add({ severity: 'success', summary: 'Success', detail: 'User created' });
        // Optional: resetForm();
    } catch (error) {
        // --- THE MAGIC LINE ---
        // If 422, this puts red text under the specific fields
        setApiErrors(error, setErrors);

        // If 500 or network error, your Global Axios Interceptor
        // handles the Toast/Alert, so we don't need to do anything else here.
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="card max-w-lg mx-auto mt-10 p-6">
        <h2 class="text-xl font-bold mb-4">Create New User</h2>

        <form @submit="onSubmit" class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <label for="name" class="font-bold">Full Name</label>
                <InputText id="name" v-model="name" v-bind="nameProps" :class="{ 'p-invalid': errors.name }" />
                <small class="text-red-500" v-if="errors.name">{{ errors.name }}</small>
            </div>

            <div class="flex flex-col gap-2">
                <label for="email" class="font-bold">Email Address</label>
                <InputText id="email" v-model="email" v-bind="emailProps" :class="{ 'p-invalid': errors.email }" />
                <small class="text-red-500" v-if="errors.email">{{ errors.email }}</small>
            </div>

            <div class="flex flex-col gap-2">
                <label for="role" class="font-bold">Role</label>
                <Dropdown id="role" v-model="role" :options="['Admin', 'Editor', 'Viewer']" placeholder="Select a Role" :class="{ 'p-invalid': errors.role }" />
                <small class="text-red-500" v-if="errors.role">{{ errors.role }}</small>
            </div>

            <Button label="Create User" type="submit" :loading="loading" />
        </form>
    </div>
</template>
