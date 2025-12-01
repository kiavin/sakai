import axios from 'axios'; // Or import your custom api wrapper: import api from '@/utils/api';
import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = defineStore('auth', () => {
    const router = useRouter();

    // --------------------------------------------------
    // 1. STATE
    // Combined Auth state (Tokens) and Profile state (Bio, Name)
    // --------------------------------------------------
    const user = reactive({
        // Auth Data (Initialized from Storage)
        token: localStorage.getItem('user.token') || null,
        isAuthenticated: !!localStorage.getItem('user.token'),
        username: localStorage.getItem('user.username') || '',

        // Profile Data (Default to empty, filled after fetchProfile)
        id: null,
        name: '',
        email: '',
        role: '',
        avatar: null,
        bio: '',
        phone: ''
    });

    // --------------------------------------------------
    // 2. GETTERS
    // --------------------------------------------------
    const hasRole = (roleName) => user.role === roleName;

    // --------------------------------------------------
    // 3. INTERNAL HELPERS
    // --------------------------------------------------
    const setToken = (token) => {
        user.token = token;
        user.isAuthenticated = !!token;
        if (token) {
            localStorage.setItem('user.token', token);
        } else {
            localStorage.removeItem('user.token');
        }
    };

    // --------------------------------------------------
    // 4. ACTIONS
    // --------------------------------------------------

    // A. Session Management
    const validateSession = async () => {
        if (!user.token) return;

        try {
            // Attempt to refresh or validate the token
            const response = await axios.post(`${API_URL}/v1/iam/auth/refresh`, null, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            const newToken = response.data?.dataPayload?.data?.access_token;

            if (newToken) {
                setToken(newToken);
                // Optional: Fetch fresh profile data here if needed
                // await fetchProfile();
            }
        } catch (error) {
            console.error('Session invalid, logging out...', error);
            logout();
        }
    };

    const logout = () => {
        // 1. Clear State
        setToken(null);
        user.username = '';
        user.name = '';
        user.role = '';

        // 2. Clear Storage
        localStorage.clear();

        // 3. Redirect
        // Prefer router.push for SPA, fallback to window.location if router isn't ready
        if (router) {
            router.push('/auth/login');
        } else {
            window.location.href = '/auth/login';
        }
    };

    // B. User Profile Actions

    // Call this after login to populate the dashboard
    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/v1/iam/user/profile`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            // Merge response data into user state
            Object.assign(user, response.data);
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    };

    const updateProfile = async (formData) => {
        try {
            // API Call
            // const response = await axios.put(`${API_URL}/v1/iam/user/profile`, formData);

            // Mock Simulation for now
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Optimistically update local state
            Object.assign(user, formData);
            return true;
        } catch (error) {
            throw error; // Let the component handle the error toast
        }
    };

    const changePassword = async (currentPass, newPass) => {
        try {
            // API Call
            // await axios.post(`${API_URL}/v1/iam/user/change-password`, { currentPass, newPass });

            // Mock Simulation
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log(`Password changed`);
            return true;
        } catch (error) {
            throw error;
        }
    };

    return {
        user,
        hasRole,
        validateSession,
        fetchProfile,
        updateProfile,
        changePassword,
        logout,
        setToken // Exported in case Login page needs to set it manually
    };
});
