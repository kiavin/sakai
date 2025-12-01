<script setup>
import BaseDataTable from '@/components/BaseDataTable.vue';
import { ref } from 'vue';

const tableRef = ref(null);

const handleReload = () => {
    tableRef.value.refresh();
};
</script>

<template>
    <BaseDataTable endpoint="/v1/iam/rbac/permission" title="Appointment Schedule">
        <!-- ACTIONS HEADER SLOT (Optional) -->
        <template #header-actions>
            <Button label="New" icon="pi pi-plus" size="small" />
            <Button icon="pi pi-refresh" text rounded @click="handleReload" />
        </template>
        <!-- OPTIONAL: Customize 'ruleName' column -->
        <template #cell-ruleName="{ data }">
            <span class="font-bold text-primary">{{ data.ruleName || 'N/A' }}</span>
        </template>

        <!-- OPTIONAL: Add Edit Buttons at the end -->
        <template #actions>
            <!-- <Column header="Actions" alignFrozen="right" frozen style="width: 5rem">
                <template #body>
                    <Button icon="pi pi-pencil" text rounded severity="secondary" />
                </template>
            </Column> -->
        </template>
    </BaseDataTable>
</template>
