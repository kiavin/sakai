<script setup>
import { useSweetAlert } from '@/composables/useSweetAlert';
import { onMounted, ref } from 'vue';
import AccessControlPickList from '../components/AccessControlPickList.vue';

import UserProfile from '@/views/pages/UserProfile.vue'; // Import the component
import { useDialog } from 'primevue/usedialog';
const showAlert = useSweetAlert();
const dialog = useDialog();

const openEditModal = (user) => {
    dialog.open(UserProfile, {
        props: {
            header: 'Edit User',
            style: { width: '50vw' },
            breakpoints: { '960px': '75vw', '640px': '90vw' },
            modal: true
        },
        data: {
            userId: user.id // Passes this to the component
        }
        // onClose: (options) => {
        //     // Callback when modal closes (e.g., refresh table)
        //     if (options.data?.saved) {
        //         refreshTable();
        //     }
        // }
    });
};

const deleteUser = () => {
    showAlert.confirmAction('Are you sure?', `You are about to delete admin. This cannot be undone.`);
};

const showSuccess = () => {
    showAlert.success('Deleted!', 'User has been removed.');
};

const showError = () => {
    showAlert.error('Error', 'Could not delete user.');
};

// Mock Data State
const availableRoles = ref([]);
const availablePerms = ref([]);
const assignedRoles = ref([]);
const assignedPerms = ref([]);

onMounted(async () => {
    // 1. Fetch your data
    // const res = await axios.get('/api/access-control');

    // 2. Populate the 4 arrays
    availableRoles.value = [
        { id: 1, name: 'Editor' },
        { id: 2, name: 'Viewer' }
    ];
    availablePerms.value = [
        { id: 10, name: 'user.edit' },
        { id: 11, name: 'user.view' }
    ];
    assignedRoles.value = [{ id: 3, name: 'Admin' }];
    assignedPerms.value = [];
});

const saveToBackend = (payload) => {
    // Payload automatically comes separated
    console.log('Roles to save:', payload.roles);
    console.log('Permissions to save:', payload.permissions);

    // axios.post('/api/save', payload);
};
</script>

<template>
    <!-- rbac picklist component -->
    <div class="p-4">
        <AccessControlPickList :available-roles="availableRoles" :available-permissions="availablePerms" :assigned-roles="assignedRoles" :assigned-permissions="assignedPerms" @save="saveToBackend" />
    </div>

    <!-- open modal -->
    <div class="p-4">
        <Button label="Edit User" @click="openEditModal({ id: 123 })" />
    </div>

    <!-- trigger toast  -->
    <div class="p-4 d-flex">
        <Button label="Delete User" icon="pi pi-trash" class="m-4" @click="deleteUser" v-can="'user.delete'" />
        <Button label="Show Success Toast" icon="pi pi-check" class="p-button-success m-4" @click="$toast.add({ severity: 'success', summary: 'Success', detail: 'Operation completed successfully.', life: 3000 })" />
        <Button label="show error alert" class="m-4" @click="showError" />
        <Button label="show success alert" class="m-4" @click="showSuccess" />
    </div>
</template>
