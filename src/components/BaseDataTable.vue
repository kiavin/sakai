<script setup>
import { useServerDataTable } from '@/composables/useServerDataTable';
import { onUnmounted, ref } from 'vue';

// 1. PROPS
const props = defineProps({
    endpoint: { type: String, required: true },
    title: { type: String, default: 'List' },
    enableSearch: { type: Boolean, default: true },
    rowsPerPage: { type: Array, default: () => [10, 20, 50, 100] },
    // Action Configuration
    showActions: { type: Boolean, default: true },
    showView: { type: Boolean, default: true },
    showEdit: { type: Boolean, default: true },
    showDelete: { type: Boolean, default: true },
    // Row Config
    showId: { type: Boolean, default: true },
    textMaxLength: { type: Number, default: 60 },
    freezeId: { type: Boolean, default: false },
    freezeActions: { type: Boolean, default: true }
});

// 2. EMITS
const emit = defineEmits(['view', 'edit', 'delete']);

// 3. COMPOSABLE
const { data, columns, totalRecords, loading, lazyParams, onPage, onSort, onFilter, refresh } = useServerDataTable(props.endpoint);

defineExpose({ refresh });

// ... Search Logic ...
const searchValue = ref('');
let searchTimeout = null;

const onSearchInput = (event) => {
    const val = event.target.value;
    searchValue.value = val;
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        // FIXED: Update lazyParams and call loadData directly
        lazyParams.value.filters.global.value = val;
        lazyParams.value.first = 0; // Reset to page 1
        refresh(); // Call loadData directly instead of onFilter
    }, 600);
};

const clearSearch = () => {
    searchValue.value = '';
    // FIXED: Update lazyParams and call loadData directly
    lazyParams.value.filters.global.value = null;
    lazyParams.value.first = 0;
    refresh(); // Call loadData directly instead of onFilter
};

// Truncation Helper
const truncateText = (value) => {
    if (!value) return '';
    const str = String(value);
    if (str.length > props.textMaxLength) {
        return str.substring(0, props.textMaxLength) + '...';
    }
    return str;
};

// Tooltip Helper
const getTooltip = (value) => {
    if (!value) return null;
    const str = String(value);
    return str.length > props.textMaxLength ? str : null;
};

onUnmounted(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
});
</script>

<template>
    <div class="card p-0 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-0 dark:bg-surface-900 shadow-sm overflow-hidden">
        <!-- HEADER -->
        <div class="p-4 border-b border-surface-200 dark:border-surface-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h5 class="m-0 text-xl font-semibold text-surface-900 dark:text-surface-0">{{ title }}</h5>
            <div v-if="enableSearch" class="flex items-center gap-2 w-full sm:w-auto">
                <div class="relative w-full sm:w-64">
                    <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 z-10" />
                    <InputText :modelValue="searchValue" @input="onSearchInput" placeholder="Search..." class="pl-10 w-full p-inputtext-sm rounded-lg border-surface-300 dark:border-surface-600 focus:border-primary-500" />
                    <i v-if="searchValue" class="pi pi-times absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 cursor-pointer" @click="clearSearch" />
                </div>
                <slot name="header-actions"></slot>
            </div>
        </div>

        <DataTable
            :value="data"
            :lazy="true"
            :paginator="true"
            :rows="lazyParams.rows"
            :totalRecords="totalRecords"
            :loading="loading"
            @page="onPage"
            @sort="onSort"
            @filter="onFilter"
            dataKey="name"
            :rowsPerPageOptions="rowsPerPage"
            :first="lazyParams.first"
            :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
            currentPageReportTemplate="{first} - {last} of {totalRecords}"
            class="p-datatable-sm"
            rowHover
            stripedRows
            scrollable
            scrollHeight="630px"
        >
            <template #loading>
                <div class="flex flex-col gap-3 p-4">
                    <div v-for="i in 5" :key="i"><Skeleton width="100%" height="2rem" class="mb-2" /></div>
                </div>
            </template>

            <template #empty>
                <div class="text-center p-4">No records found</div>
            </template>

            <!-- ROW ID COLUMN -->
            <Column v-if="showId" header="#" headerStyle="width: 3rem" :frozen="freezeId" alignFrozen="left" :class="{ 'font-bold bg-surface-50 dark:bg-surface-800': freezeId }">
                <template #body="slotProps">
                    <span class="text-muted-color text-sm">
                        {{ lazyParams.first + slotProps.index + 1 }}
                    </span>
                </template>
            </Column>

            <!-- DYNAMIC COLUMNS -->
            <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" sortable>
                <template #body="slotProps">
                    <slot :name="`cell-${col.field}`" :data="slotProps.data">
                        <span v-tooltip.top="getTooltip(slotProps.data[col.field])" :class="{ 'cursor-help border-b border-dashed border-surface-300': getTooltip(slotProps.data[col.field]) }">
                            {{ truncateText(slotProps.data[col.field]) }}
                        </span>
                    </slot>
                </template>
            </Column>

            <!-- ACTIONS COLUMN -->
            <Column v-if="showActions" header="Actions" :frozen="freezeActions" alignFrozen="right" style="min-width: 120px; width: 1%; white-space: nowrap">
                <template #body="{ data }">
                    <div class="flex items-center justify-end gap-2">
                        <Button v-if="showView" icon="pi pi-eye" text rounded severity="info" @click="emit('view', data)" aria-label="View" />
                        <Button v-if="showEdit" icon="pi pi-pencil" text rounded severity="success" @click="emit('edit', data)" aria-label="Edit" />
                        <Button v-if="showDelete" icon="pi pi-trash" text rounded severity="danger" @click="emit('delete', data)" aria-label="Delete" />
                        <slot name="actions" :data="data"></slot>
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>
:deep(.p-paginator) {
    border-top: 1px solid var(--surface-border);
    justify-content: flex-end;
    padding: 0.75rem 1rem;
}
:deep(.p-datatable-loading-overlay) {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(2px);
}
:deep(.dark .p-datatable-loading-overlay) {
    background: rgba(0, 0, 0, 0.6);
}
</style>
