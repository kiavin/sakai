<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useConfigStore } from '@/store/config';
import { computed } from 'vue';
import AppMenu from './AppMenu.vue';

const configStore = useConfigStore();
const { isDarkTheme } = useLayout();
const sidebarStyle = computed(() => {
    // If not in dark mode, apply the colored sidebar
    if (!isDarkTheme.value) {
        return {
            backgroundColor: configStore.activePrimaryColor, // The Background
            color: '#ffffff',
            // [NEW] Pass the color to CSS to style the active text/icons
            '--sidebar-active-color': configStore.activePrimaryColor
        };
    }
    return {};
});

const sidebarClass = computed(() => {
    if (!isDarkTheme.value) {
        return {
            // [NEW] Add a specific class to trigger our CSS overrides
            'layout-sidebar-colored': !isDarkTheme.value,
            [`surface-${configStore.themeSettings.surface}`]: isDarkTheme.value
        };
    }
    return {};
});
</script>

<template>
    <div class="layout-sidebar" :class="sidebarClass" :style="sidebarStyle">
        <app-menu></app-menu>
    </div>
</template>

<style lang="scss" scoped>
.layout-sidebar {
    transition: background-color 0.3s ease;
    top: 4rem !important;
    left: 0 !important;
    border-radius: 0 !important;
    height: calc(100vh - 4rem);
}

/* FIX: We target the local root class directly (.layout-sidebar-colored),
   and THEN use :deep() to penetrate the child AppMenu component.
*/
.layout-sidebar-colored {
    :deep(.layout-menu) {
        // 1. Root Headers (e.g., "HOME", "APPS") - Make them visible white
        li.layout-root-menuitem > div.layout-menuitem-root-text {
            color: rgba(255, 255, 255, 0.7) !important;
        }

        // 2. Normal Menu Items (Inactive)
        li {
            a {
                color: rgba(255, 255, 255, 0.9) !important; // Slightly soft white
                transition: all 0.2s;
                border-radius: 12px;
                margin: 4px 10px; // Add spacing so the white box floats

                .layout-menuitem-icon {
                    color: #ffffff !important; // Force white icons
                }

                // Toggle Icon (Chevron for submenus)
                .layout-submenu-toggler {
                    color: #ffffff !important;
                }

                // Hover State (Subtle white overlay)
                &:hover {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    color: #ffffff !important;
                }
            }

            // 3. Active Menu Item (The Inverted Look)
            // Targets multiple variations of active classes used by Sakai/Router
            &.active-menuitem > a,
            // a.router-link-active,
            a.router-link-active-exact {
                background-color: #ffffff !important; // White Card
                color: var(--sidebar-active-color) !important; // Dynamic Primary Text
                font-weight: 700;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); // Nice shadow pop

                // Force inner text and icons to match the brand color
                .layout-menuitem-text {
                    color: var(--sidebar-active-color) !important;
                }

                .layout-menuitem-icon {
                    color: var(--sidebar-active-color) !important;
                }

                .layout-submenu-toggler {
                    color: var(--sidebar-active-color) !important;
                }

                &:hover {
                    background-color: #ffffff !important;
                }
            }
        }

        ul {
            a {
                padding-left: 2.5rem;
            }
        }
    }
}
</style>
