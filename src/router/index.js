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
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/admin/settings',
                    name: 'adminSettings',
                    component: () => import('@/views/pages/admin/AdminSettings.vue')
                },
                {
                    path: '/user/profile',
                    name: 'userProfile',
                    component: () => import('@/views/pages/UserProfile.vue')
                },
                {
                    path: '/user/create',
                    name: 'createUser',
                    component: () => import('@/views/pages/CreateUser.vue')
                }
            ]
        },

        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/forgot-password',
            name: 'forgotPassword',
            component: () => import('@/views/pages/auth/ForgotPassword.vue')
        },
        {
            path: '/auth/reset-password',
            name: 'resetPassword',
            component: () => import('@/views/pages/auth/ResetPassword.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

export default router;
