<script setup>
import BaseDataTable from '@/components/BaseDataTable.vue';
import { ref } from 'vue';

const tableRef = ref(null);

const handleView = (data) => {
    console.log('View:', data);
};

const handleEdit = (data) => {
    console.log('Edit:', data);
};

const handleDelete = (data) => {
    console.log('Delete:', data);
};
</script>

<template>
    <BaseDataTable ref="tableRef" endpoint="/v1/iam/rbac/permission" title="Permissions Management" :freeze-id="true" :freeze-actions="true" @view="handleView" @edit="handleEdit" @delete="handleDelete">
        <!-- Custom header actions -->
        <template #header-actions>
            <Button label="New" icon="pi pi-plus" size="small" />
            <Button icon="pi pi-refresh" text rounded @click="tableRef.refresh()" />
        </template>

        <!-- Customize specific column -->
        <template #cell-ruleName="{ data }">
            <span class="font-bold text-primary">{{ data.ruleName || 'N/A' }}</span>
        </template>

        <!-- Add extra action buttons -->
        <template #actions="{ data }">
            <Button icon="pi pi-cog" text rounded severity="secondary" @click="console.log('Config:', data)" />
        </template>
    </BaseDataTable>
</template>
