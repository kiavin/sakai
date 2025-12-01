import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: {
                        breadcrumb: [{ label: 'Dashboard' }],
                        icon: 'pi pi-home' // Used by Command Palette
                    }
                },
                {
                    path: '/admin/settings',
                    name: 'adminSettings',
                    component: () => import('@/views/pages/admin/AdminSettings.vue'),
                    meta: {
                        breadcrumb: [{ label: 'Admin' }, { label: 'System Settings' }],
                        icon: 'pi pi-cog'
                    }
                },
                {
                    path: '/user/profile',
                    name: 'userProfile',
                    component: () => import('@/views/pages/UserProfile.vue'),
                    meta: {
                        breadcrumb: [{ label: 'User' }, { label: 'My Profile' }],
                        icon: 'pi pi-user'
                    }
                },
                {
                    path: '/user/create',
                    name: 'createUser',
                    component: () => import('@/views/pages/CreateUser.vue'),
                    meta: {
                        breadcrumb: [{ label: 'User' }, { label: 'Create New User' }],
                        icon: 'pi pi-user-plus'
                    }
                },
                {
                    path: '/appointments',
                    name: 'appointments',
                    component: () => import('@/views/pages/Appointments.vue'),
                    meta: {
                        breadcrumb: [{ label: 'Appointments' }],
                        icon: 'pi pi-calendar'
                    }
                }
            ]
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue'),
            meta: {
                title: 'Not Found'
                // No breadcrumb/icon needed as we don't want this in the search palette
            }
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue'),
            meta: { title: 'Login' }
        },
        {
            path: '/auth/forgot-password',
            name: 'forgotPassword',
            component: () => import('@/views/pages/auth/ForgotPassword.vue'),
            meta: { title: 'Forgot Password' }
        },
        {
            path: '/auth/reset-password',
            name: 'resetPassword',
            component: () => import('@/views/pages/auth/ResetPassword.vue'),
            meta: { title: 'Reset Password' }
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue'),
            meta: { title: 'Access Denied' }
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue'),
            meta: { title: 'Error' }
        }
    ]
});

// ----------------------------------------------------------------
// GLOBAL NAVIGATION GUARDS
// ----------------------------------------------------------------

// 1. Start the Progress Bar on navigation start
// router.beforeEach((to, from, next) => {
//     const loader = useLoaderStore();
//     loader.startLoading();

//     // Optional: Update browser tab title
//     // document.title = to.meta.breadcrumb ? `${to.meta.breadcrumb[0].label} - Sakai` : 'Sakai Enterprise';

//     next();
// });

// // 2. Stop the Progress Bar when navigation finishes
// router.afterEach(() => {
//     const loader = useLoaderStore();
//     loader.stopLoading();
// });

export default router;
