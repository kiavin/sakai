Sakai Enterprise - Developer Documentation

Sakai Enterprise is an API-first, opinionated Vue 3 admin template designed for scalability and performance. Unlike standard templates, it relies on the backend for configuration, validation, and theming, minimizing frontend boilerplate.

📚 Table of Contents

Core Architecture

API Wrapper (Axios)

Authentication Store

Dynamic Configuration & Theming

UI Components

BaseDataTable (Server-Side)

Global Command Palette

System Banners & Alerts

Utilities

Form Error Handling

Binary File Downloads

1. Core Architecture

API Wrapper

File: src/utils/api.js

A centralized Axios instance that acts as the gateway for all HTTP requests. It handles authentication, global error notifications, and loading states automatically.

Key Features

Token Injection: Automatically attaches Authorization: Bearer <token> from the Auth Store.

Refresh Token Queue: If a 401 Unauthorized occurs, requests are paused and queued while the app attempts to refresh the token. Once refreshed, queued requests are retried seamlessly.

Global Loader: Triggers the top-bar progress indicator (useLoaderStore) for every request.

Unified Notifications: Listens for alertifyPayload in API responses to trigger global Toasts or Modals.

Usage

import api from '@/utils/api';

// GET Request (Loader shows automatically)
const response = await api.get('/users');

// GET Request (Background - No Loader)
const response = await api.get('/notifications', { headers: { 'X-No-Loader': true } });

// POST Request
await api.post('/users', userData);

Authentication Store

File: src/store/auth.js

Manages user sessions, profile data, and login/logout lifecycles.

Key Features

Unified State: Holds both Session data (Tokens) and Profile data (Name, Role, Permissions).

Async Logout: Calls the backend /logout endpoint first, then strictly cleans up LocalStorage and Pinia state in the finally block to prevent "zombie" sessions.

RBAC Helper: hasRole('Admin') for permission checks.

Usage

import { useAuthStore } from '@/store/auth';

const auth = useAuthStore();

// Login
await auth.login({ username: 'admin', password: '...' });

// Check Permission
if (auth.hasRole('Editor')) { ... }

// Logout (Redirects to /login automatically)
await auth.logout();

Dynamic Configuration & Theming

Files: src/store/config.js, src/layout/composables/layout.js

The application theme is controlled by the Backend API.

Fetching Config: On app load, configStore.fetchConfig() hits the API.

Applying Theme: layout.js receives the configuration (e.g., Primary Hex Color). It generates a 11-shade palette (50-950) dynamically and injects them as CSS variables (--p-primary-500, etc.).

Real-time Preview: The Admin Settings page allows live previewing of colors without saving.

2. UI Components

BaseDataTable

File: src/components/BaseDataTable.vue
Composable: src/composables/useServerDataTable.js

A high-performance wrapper around PrimeVue's DataTable designed for Server-Side operations. It solves common issues like duplicate fetching and reactivity loops.

Capabilities

Server-Side Logic: Pagination, Sorting, and Filtering are executed by the API.

Auto-Columns: Can automatically generate columns from the API response keys if no columns are defined.

Performance: Uses shallowRef and markRaw to handle large datasets without freezing the UI.

Utilities: Built-in Text Truncation, Tooltips, and Row Counter.

Usage Example

Minimal (Auto-Columns):

<BaseDataTable 
    endpoint="/v1/users" 
    title="User Management" 
/>

Customized (Manual Columns & Actions):

<script setup>
import BaseDataTable from '@/components/BaseDataTable.vue';
</script>

<template>
    <BaseDataTable 
        endpoint="/v1/products" 
        title="Inventory"
        :freeze-actions="true"
    >
        <!-- Custom Header Buttons -->
        <template #header-actions>
            <Button label="Export" icon="pi pi-download" />
        </template>

        <!-- Custom Column Rendering -->
        <template #cell-price="{ data }">
            <span class="text-green-500 font-bold">${{ data.price }}</span>
        </template>

        <!-- Extra Row Actions -->
        <template #actions="{ data }">
            <Button icon="pi pi-cog" text rounded @click="configure(data)" />
        </template>
    </BaseDataTable>

</template>

Global Command Palette

File: src/components/GlobalCommandPalette.vue

A "Spotlight-style" search modal triggered by Ctrl+K. It scrapes the Vue Router configuration to build a searchable index of pages.

Trigger: Ctrl + K (or Cmd + K)

Navigation: Uses Arrow keys + Enter.

Configuration: Add meta: { breadcrumb: [...] } to routes in router/index.js to include them in the search results.

System Banners & Alerts

File: src/layout/AppSystemBanner.vue

A global communication bar that sits at the top of the layout.

Trigger: Backend response includes alertifyPayload.

Types:

type: 'toast' -> Shows a PrimeVue Toast notification.

type: 'alert' -> Shows a SweetAlert-style blocking modal.

3. Utilities

Form Error Handling

File: src/utils/form.js

Maps backend 422 Unprocessable Entity responses directly to VeeValidate fields. This eliminates the need for duplicated frontend validation logic (regex, etc.).

Usage

import { useForm } from 'vee-validate';
import { setApiErrors } from '@/utils/form';
import api from '@/utils/api';

const { defineField, handleSubmit, setErrors } = useForm();
const [email] = defineField('email');

const submit = handleSubmit(async (values) => {
try {
await api.post('/login', values);
} catch (error) {
// Automatically highlights the 'email' input in red
// with the message returned by the server
setApiErrors(error, setErrors);
}
});

Binary File Downloads

File: src/utils/download.js

A wrapper to safely download binary files (PDF, Excel) from the API. It handles the Blob conversion and extracts the filename from the Content-Disposition header.

Usage

import { downloadFile } from '@/utils/download';

const exportData = async () => {
// Downloads 'report.pdf' automatically
await downloadFile('/v1/reports/export/pdf');
};
