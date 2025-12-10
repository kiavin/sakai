# 🚀 Sakai - Developer Documentation

**Sakai** is an API-first, opinionated Vue 3 admin template designed for scalability and performance. Unlike standard templates, it relies on the backend for configuration, validation, and theming, minimizing frontend boilerplate.

---

## 📚 Table of Contents

- [Core Architecture](#core-architecture)
  - [API Wrapper (Axios)](#api-wrapper-axios)
  - [Authentication Store](#authentication-store)
  - [Dynamic Configuration & Theming](#dynamic-configuration--theming)
- [UI Components](#ui-components)
  - [BaseDataTable (Server-Side)](#basedatatable-server-side)
  - [Global Command Palette](#global-command-palette)
  - [System Banners & Alerts](#system-banners--alerts)
- [Utilities](#utilities)
  - [Form Error Handling](#form-error-handling)
  - [Binary File Downloads](#binary-file-downloads)

---

## 🏗️ Core Architecture

### API Wrapper (Axios)

**File:** `src/utils/api.js`

A centralized Axios instance that acts as the gateway for all HTTP requests. It handles authentication, global error notifications, and loading states automatically.

#### ✨ Key Features

- **Token Injection**: Automatically attaches `Authorization: Bearer <token>` from the Auth Store
- **Refresh Token Queue**: If a `401 Unauthorized` occurs, requests are paused and queued while the app attempts to refresh the token. Once refreshed, queued requests are retried seamlessly
- **Global Loader**: Triggers the top-bar progress indicator (`useLoaderStore`) for every request
- **Unified Notifications**: Listens for `alertifyPayload` in API responses to trigger global Toasts or Modals

#### 📖 Usage

```javascript
import api from '@/utils/api';

// GET Request (Loader shows automatically)
const response = await api.get('/users');

// GET Request (Background - No Loader)
const response = await api.get('/notifications', { 
  headers: { 'X-No-Loader': true } 
});

// POST Request
await api.post('/users', userData);
```

---

### Authentication Store

**File:** `src/store/auth.js`

Manages user sessions, profile data, and login/logout lifecycles.

#### ✨ Key Features

- **Unified State**: Holds both Session data (Tokens) and Profile data (Name, Role, Permissions)
- **Async Logout**: Calls the backend `/logout` endpoint first, then strictly cleans up LocalStorage and Pinia state in the `finally` block to prevent "zombie" sessions
- **RBAC Helper**: `hasRole('Admin')` for permission checks

#### 📖 Usage

```javascript
import { useAuthStore } from '@/store/auth';

const auth = useAuthStore();

// Login
await auth.login({ username: 'admin', password: '...' });

// Check Permission
if (auth.hasRole('Editor')) { 
  // User has Editor role
}

// Logout (Redirects to /login automatically)
await auth.logout();
```

---

### Dynamic Configuration & Theming

**Files:** `src/store/config.js`, `src/layout/composables/layout.js`

The application theme is controlled by the Backend API.

#### 🎨 How It Works

1. **Fetching Config**: On app load, `configStore.fetchConfig()` hits the API
2. **Applying Theme**: `layout.js` receives the configuration (e.g., Primary Hex Color). It generates an 11-shade palette (50-950) dynamically and injects them as CSS variables (`--p-primary-500`, etc.)
3. **Real-time Preview**: The Admin Settings page allows live previewing of colors without saving

---

## 🎨 UI Components

### BaseDataTable (Server-Side)

**File:** `src/components/BaseDataTable.vue`  
**Composable:** `src/composables/useServerDataTable.js`

A high-performance wrapper around PrimeVue's DataTable designed for **Server-Side** operations. It solves common issues like duplicate fetching and reactivity loops.

#### ✨ Capabilities

- **Server-Side Logic**: Pagination, Sorting, and Filtering are executed by the API
- **Auto-Columns**: Can automatically generate columns from the API response keys if no columns are defined
- **Performance**: Uses `shallowRef` and `markRaw` to handle large datasets without freezing the UI
- **Utilities**: Built-in Text Truncation, Tooltips, and Row Counter

#### 📖 Usage Examples

**Minimal (Auto-Columns):**

```vue
<BaseDataTable 
  endpoint="/v1/users" 
  title="User Management" 
/>
```

**Customized (Manual Columns & Actions):**

```vue
<script setup>
import BaseDataTable from '@/components/BaseDataTable.vue';

const configure = (data) => {
  console.log('Configure:', data);
};
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
```

---

### Global Command Palette

**File:** `src/components/GlobalCommandPalette.vue`

A "Spotlight-style" search modal triggered by `Ctrl+K`. It scrapes the Vue Router configuration to build a searchable index of pages.

#### ⌨️ Features

- **Trigger**: `Ctrl + K` (or `Cmd + K` on Mac)
- **Navigation**: Uses Arrow keys + Enter
- **Configuration**: Add `meta: { breadcrumb: [...] }` to routes in `router/index.js` to include them in the search results

---

### System Banners & Alerts

**File:** `src/layout/AppSystemBanner.vue`

A global communication bar that sits at the top of the layout.

#### 🔔 How It Works

- **Trigger**: Backend response includes `alertifyPayload`
- **Types**:
  - `type: 'toast'` → Shows a PrimeVue Toast notification
  - `type: 'alert'` → Shows a SweetAlert-style blocking modal

---

## 🛠️ Utilities

### Form Error Handling

**File:** `src/utils/form.js`

Maps backend `422 Unprocessable Entity` responses directly to VeeValidate fields. This eliminates the need for duplicated frontend validation logic (regex, etc.).

#### 📖 Usage

```javascript
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
```

---

### Binary File Downloads

**File:** `src/utils/download.js`

A wrapper to safely download binary files (PDF, Excel) from the API. It handles the Blob conversion and extracts the filename from the `Content-Disposition` header.

#### 📖 Usage

```javascript
import { downloadFile } from '@/utils/download';

const exportData = async () => {
  // Downloads 'report.pdf' automatically
  await downloadFile('/v1/reports/export/pdf');
};
```

---

## 📝 Summary

Sakai Enterprise provides a comprehensive, production-ready architecture that:

- ✅ Minimizes frontend boilerplate through API-first design
- ✅ Handles authentication, theming, and configuration dynamically
- ✅ Includes powerful, reusable components like BaseDataTable
- ✅ Provides utilities for common tasks (form validation, file downloads)
- ✅ Maintains high performance with optimized reactivity patterns

**Ready to build something amazing? Start with the [BaseDataTable](#basedatatable-server-side) component!** 🚀
