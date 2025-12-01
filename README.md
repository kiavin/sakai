# Sakai Enterprise - Dynamic Admin Template

**Sakai Enterprise** is a robust, backend-driven Vue 3 admin dashboard built on top of PrimeVue. It extends the standard Sakai template with enterprise-grade features including RBAC permission management, resilient authentication, automated error handling, and a dynamic theming engine.

---

## 🚀 Key Features

* **Backend-Driven Theming:** The API controls the primary color, dark mode, font family, and favicon. Includes an 11-shade palette generator for custom admin branding.

* **Resilient Authentication:** Custom Axios wrapper with a "Refresh Token Queue" to handle concurrent 401 errors without race conditions.

* **Dynamic Access Control:** Specialized "PickList" component for managing Roles & Permissions assignment with complex UI requirements (distinct icons, search, grouping).

* **Automated Form Validation:** Zod + VeeValidate integration that automatically maps backend `422` JSON errors to UI input fields.

* **Global Systems:**
    * **System Banner:** Global announcement bar (Warn/Info/Error) controlled by admin settings.
    * **Native Loader:** Indeterminate progress bar integrated with all API calls (replacing NProgress).
    * **Auto-Logout:** Idle timer based on backend configuration.

* **Master-Detail Settings:** A vertical tab interface for managing system configurations.

---

## 📂 Project Architecture

### State Management (Pinia)

We utilize the **Setup Store** pattern. Stores are centralized in `src/stores/`.

| Store Name | Purpose |
| :--- | :--- |
| **`config.js`** | **The Orchestrator.** Fetches system config on app load. Distributes data to Layout, Banner, and Auth stores. |
| **`auth.js`** | Manages User Profile (`user`), Session (`token`), and Actions (`login`, `logout`, `validateSession`). |
| **`banner.js`** | Controls the global announcement bar state (`active`, `message`, `severity`). |
| **`loader.js`** | Simple counter-based store to manage the global HTTP progress bar. |

### Core Utilities (`src/utils/`)

#### 1. API Wrapper (`api.js`)

A customized Axios instance located at `src/utils/api.js`.

* **Header Injection:** Automatically adds `Authorization: Bearer <token>`.
* **Refresh Queue:** If a 401 occurs, requests are paused/queued while a new token is fetched, then retried automatically.
* **Global Error Event:** Dispatches `window.dispatchEvent('api-error')` for 500/Network errors (handled by `App.vue`).
* **Loader Integration:** Automatically triggers the Global Progress Bar.

**Usage:**
```javascript
import api from '@/utils/api';

// Standard call (Loader shows automatically)
const res = await api.get('/users');

// Call without triggering the Global Loader (e.g., polling)
const res = await api.get('/notifications', { headers: { 'X-No-Loader': true } });
```

#### 2. Form Error Mapper (`form.js`)

Maps backend validation errors (Laravel/Node style) to VeeValidate fields.
```javascript
import { setApiErrors } from '@/utils/form';

// Inside your form submit catch block:
catch (error) {
    // Automatically sets red text on inputs based on 422 response
    setApiErrors(error, setErrors);
}
```

### Components

#### 1. Access Control PickList

**File:** `src/components/AccessControlPickList.vue`

A specialized dual-list component for assigning Roles and Permissions.

* **Visuals:** Distinguishes items with specific icons (ID Card for Roles, Key for Permissions) and color badges.
* **Logic:** Accepts 4 separate arrays from the API (availableRoles, availablePermissions, etc.), merges them for the UI, and separates them back out upon saving.
* **Events:** `@save(payload)` emits `{ roles: [...], permissions: [...] }`.

#### 2. System Banner

**File:** `src/layout/AppSystemBanner.vue`

A dismissible alert bar that sits at the very top of the layout (above the Topbar).

* **Controlled by:** `useBannerStore()`
* **Severity:** Info (Blue), Warn (Orange), Error (Red), Success (Green).
* **Behavior:** Pushes the application layout down when active.

#### 3. Admin Settings Page

**File:** `src/views/pages/AdminSettings.vue`

A Master-Detail layout for global system configuration.

* **Branding Tab:** Includes a "Live Preview" where admins can pick one HEX color, and the system generates the 11 PrimeVue CSS variables dynamically.
* **Security Tab:** Configures the Session Timeout slider.
* **Announcements Tab:** Live controls for the System Banner.

#### 4. User Profile

**File:** `src/views/pages/UserProfile.vue`

* **Features:** Avatar upload simulation with hover overlay, Password Strength meter, Read-only Role display.

---

## 🎨 Dynamic Theming Engine

The theming logic resides in `src/layout/composables/layout.js`.

Unlike standard Sakai, this version exports a `setBackendTheme(config)` function.

**Expected Backend JSON Payload:**
```json
{
    "primary": "custom-brand",
    "surface": "slate",
    "darkTheme": true,
    "customPrimaryPalette": {
        "50": "#fbfcfc",
        "500": "#your-brand-color",
        "950": "#0c1920"
    }
}
```

> **Note:** If `customPrimaryPalette` is present, it injects the colors into PrimeVue's Design Token system instantly.

---

## 🛠 Setup & Installation

### 1. Install Dependencies
```bash
npm install
npm install zod vee-validate @vee-validate/zod pinia axios primevue primeicons
```

> **Note:** NProgress was removed in favor of native PrimeVue ProgressBar to avoid strict-mode errors.

### 2. Configure Environment

Create a `.env` file in the root:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Register Global Services

Ensure `src/main.js` registers the required PrimeVue services:
```javascript
import ToastService from 'primevue/toastservice';
import DialogService from 'primevue/dialogservice';

app.use(ToastService);
app.use(DialogService);
```

### 4. Router Integration

Ensure `src/router/index.js` handles Loader visual cues on route change:
```javascript
import { useLoaderStore } from '@/stores/loader';

router.beforeEach((to, from, next) => {
    const loader = useLoaderStore();
    loader.startLoading();
    next();
});

router.afterEach(() => {
    const loader = useLoaderStore();
    loader.stopLoading();
});
```

---

## 📝 Developer Guidelines

### Adding a New Page

1. Create the view in `src/views/pages/`.
2. Add the route in `src/router/index.js`.
3. Do not fetch data in `App.vue`. Fetch data inside the page `onMounted` or use a specific store.

### Handling Forms

1. Define a schema using `toTypedSchema` and `zod`.
2. Use `useForm` from `vee-validate`.
3. Bind inputs using `defineField`.
4. Always include `setApiErrors` in your error handling.

### Handling Modals

Do not use `<Dialog>` directly inside components if possible.

Use the `useDialog()` composable for opening modals programmatically to keep the DOM light.
```javascript
import { useDialog } from 'primevue/usedialog';
const dialog = useDialog();
dialog.open(MyComponent, { header: 'Edit Item' });
```

---

## 🔒 Security

* **XSS Protection:** Zod sanitation handles basic input validation.
* **CSRF:** Axios `withCredentials: true` is enabled by default.
* **RBAC:** Use the `user.role` from `authStore` to conditionally render UI elements.

**Example:**
```vue
<Button v-if="authStore.hasRole('Admin')" />
```

---
