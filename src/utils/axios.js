import router from '@/router';
import { useAuthStore } from '@/store/auth.js';
import axios from 'axios';

// const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    // baseURL,
    withCredentials: true,
    timeout: 30000
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const getStores = () => {
    return {
        auth: useAuthStore()
    };
};

const handleAlertify = (response) => {
    // Check if response exists and has the specific payload
    const payload = response?.data?.alertifyPayload;

    if (payload) {
        window.dispatchEvent(
            new CustomEvent('api-notification', {
                detail: payload
            })
        );
    }
};

// =========================
// Request Interceptor
// =========================
api.interceptors.request.use(
    (config) => {
        if (config.headers['X-Exclude-Interceptor']) return config;

        const { auth } = getStores();
        const token = auth.user.token;

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// =========================
// Response Interceptor
// =========================
api.interceptors.response.use(
    (response) => {
        // [NEW] Check for Success Alerts (e.g., "Saved Successfully")
        handleAlertify(response);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const { auth } = getStores();

        // [NEW] 4. Handle Network Errors (Server down / Offline)
        if (!error.response) {
            // We emit a custom event so App.vue can show a Toast
            // (See "How to Handle Toasts" below)
            window.dispatchEvent(
                new CustomEvent('api-error', {
                    detail: { message: 'Network Error: Please check your connection.' }
                })
            );
            return Promise.reject(error);
        }

        if (error.response) {
            handleAlertify(error.response);
        }

        // [NEW] 5. Handle 500 Server Errors Globaly
        if (error.response.status >= 500) {
            window.dispatchEvent(
                new CustomEvent('api-error', {
                    detail: { message: 'Server Error: Something went wrong on our end.' }
                })
            );
        }

        // 401 Logic (Existing Strong Logic)
        if (error.response.status === 401 && !originalRequest._retry) {
            if (originalRequest.url.includes('/refresh') || originalRequest.url.includes('/login')) {
                auth.removeToken();
                localStorage.clear();
                router.push('/auth/login');
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // [MODIFICATION] Use baseURL explicitly to avoid relative path issues
                const response = await axios.post(`/v1/iam/auth/refresh`, null, {
                    withCredentials: true
                });

                const newToken = response.data?.dataPayload?.data?.access_token;

                if (newToken) {
                    auth.setToken(newToken);
                    processQueue(null, newToken);
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return api(originalRequest);
                } else {
                    throw new Error('No token in refresh response');
                }
            } catch (err) {
                processQueue(err, null);
                auth.removeToken();
                localStorage.clear();
                router.push('/auth/login');
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
