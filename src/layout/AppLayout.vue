<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useConfigStore } from '@/store/config';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppFooter from './AppFooter.vue';
import AppSidebar from './AppSidebar.vue';
import AppSystemBanner from './AppSystemBanner.vue';
import AppTopbar from './AppTopbar.vue';

const { layoutConfig, layoutState, isSidebarActive } = useLayout();
const configStore = useConfigStore();
const router = useRouter();

const outsideClickListener = ref(null);

watch(isSidebarActive, (newVal) => {
    if (newVal) {
        bindOutsideClickListener();
    } else {
        unbindOutsideClickListener();
    }
});

// --- AUTO LOGOUT LOGIC ---
let idleTimer = null;

const startIdleTimer = () => {
    // Clear existing
    if (idleTimer) clearTimeout(idleTimer);

    // Safety check: Don't logout if timeout is 0 or undefined
    if (!configStore.sessionTimeout) return;

    // Set new timer (Minutes * 60 * 1000)
    idleTimer = setTimeout(
        () => {
            console.warn('User inactive. Logging out.');
            // Perform Logout Action
            // authStore.logout();
            router.push('/auth/login');
        },
        configStore.sessionTimeout * 60 * 1000
    );
};

onMounted(() => {
    // Reset timer on any user interaction
    window.addEventListener('mousemove', startIdleTimer);
    window.addEventListener('keydown', startIdleTimer);
    window.addEventListener('click', startIdleTimer);

    // Start initial
    startIdleTimer();
});

onUnmounted(() => {
    window.removeEventListener('mousemove', startIdleTimer);
    window.removeEventListener('keydown', startIdleTimer);
    window.removeEventListener('click', startIdleTimer);
    if (idleTimer) clearTimeout(idleTimer);
});

// Watch for changes in the store (e.g. if Admin updates timeout while we are using the app)
watch(
    () => configStore.sessionTimeout,
    () => {
        startIdleTimer();
    }
);
// -------------------------

const containerClass = computed(() => {
    return {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive
    };
});

function bindOutsideClickListener() {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                layoutState.overlayMenuActive = false;
                layoutState.staticMenuMobileActive = false;
                layoutState.menuHoverActive = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
}

function unbindOutsideClickListener() {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
}

function isOutsideClicked(event) {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
}
</script>

<template>
    <div class="layout-wrapper" :class="containerClass">
        <app-topbar></app-topbar>
        <app-sidebar></app-sidebar>
        <div class="layout-main-container">
            <app-system-banner />

            <div class="layout-main">
                <router-view></router-view>
            </div>
            <app-footer></app-footer>
        </div>
        <div class="layout-mask animate-fadein"></div>
    </div>
    <Toast />
</template>
