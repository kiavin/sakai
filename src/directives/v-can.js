import { useAuthStore } from '@/store/auth';

export const vCan = {
    mounted(el, binding) {
        const authStore = useAuthStore();
        const permission = binding.value;

        // We check if the user has the permission using our store helper
        const hasAccess = authStore.checkPermission(permission);

        if (!hasAccess) {
            // Remove the element from the DOM entirely
            // This is safer than display:none because it prevents
            // users from inspecting element and removing "display:none"
            // oxlint-disable-next-line no-unused-expressions
            el.parentNode && el.parentNode.removeChild(el);
        }
    },
    // Handle dynamic updates (rare in RBAC, but good for reactivity)
    updated(el, binding) {
        const authStore = useAuthStore();
        const permission = binding.value;
        const hasAccess = authStore.checkPermission(permission);

        if (!hasAccess) {
            // oxlint-disable-next-line no-unused-expressions
            el.parentNode && el.parentNode.removeChild(el);
        }
    }
};
