<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'Business',
        items: [{ label: 'Appointments', icon: 'pi pi-fw pi-calendar', to: '/appointments' }]
    },
    {
        label: 'User Management',
        items: [
            { label: 'Create New User', icon: 'pi pi-fw pi-user-plus', to: '/user/create' },
            { label: 'My Profile', icon: 'pi pi-fw pi-user', to: '/user/profile' }
        ]
    },
    {
        label: 'Administration',
        items: [{ label: 'System Settings', icon: 'pi pi-fw pi-cog', to: '/admin/settings' }]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
