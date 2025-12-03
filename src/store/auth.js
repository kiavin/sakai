import api from '@/utils/axios';
import axios from 'axios'; // Or import your custom api wrapper
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
        avatar: null,
        bio: '',
        phone: '',
        role: '',
        permissions: ['user.delete'] // Example permission for testing
    });

    // --------------------------------------------------
    // 2. GETTERS
    // --------------------------------------------------
    const hasRole = (roleName) => user.role === roleName;

    const checkPermission = (requiredPermission) => {
        if (Array.isArray(requiredPermission)) {
            return requiredPermission.some((p) => user.permissions.includes(p));
        }

        return user.permissions.includes(requiredPermission);
    };

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

    const login = async (credentials) => {
        try {
            const response = await api.post('/v1/iam/auth/login', credentials);

            if (response.data && response.data.dataPayload) {
                const token = response.data.dataPayload.data.access_token;
                setToken(token);

                // Update user state
                user.username = credentials.username;
                user.isAuthenticated = true;
            }
        } catch (error) {
            console.error('Login failed', error);
            // 2. CRITICAL: Throw it again!
            // If you don't do this, the Login.vue component will think login succeeded.
            throw error;
        }
    };
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

    const logout = async () => {
        try {
            // 1. Call Backend to invalidate token
            // We do this BEFORE clearing the token so the API wrapper can send the Authorization header
            await api.post('/v1/iam/auth/logout');
            console.log('Backend session invalidated');
        } catch (error) {
            // We log it but don't stop the logout process
            console.warn('Backend logout failed, forcing local logout', error);
        } finally {
            // 2. Clear Local State & Storage (Always runs)
            setToken(null);
            user.username = '';
            user.name = '';
            user.role = '';

            // Be careful with localStorage.clear() if you store Theme/Settings there
            // Safe approach: Remove specific auth keys
            localStorage.removeItem('user.token');
            localStorage.removeItem('user_session');

            // 3. Redirect
            if (router) {
                router.push('/auth/login');
            } else {
                window.location.href = '/auth/login';
            }
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
            console.warn(error);
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
            console.log(`Current: ${currentPass}, New: ${newPass}`);
            return true;
        } catch (error) {
            console.warn('Failed to change password', error);
            throw error;
        }
    };

    return {
        user,
        hasRole,
        checkPermission,
        validateSession,
        fetchProfile,
        updateProfile,
        changePassword,
        logout,
        setToken,
        login
    };
});
