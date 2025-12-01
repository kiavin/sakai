<script setup>
import { useServerDataTable } from '@/composables/useServerDataTable';
import { onUnmounted, ref } from 'vue';

const props = defineProps({
    endpoint: { type: String, required: true },
    title: { type: String, default: 'List' },
    enableSearch: { type: Boolean, default: true },
    rowsPerPage: { type: Array, default: () => [10, 20, 50, 100] }
});

// Destructure columns from the composable
const {
    data,
    columns, // [NEW]
    totalRecords,
    loading,
    lazyParams,
    onPage,
    onSort,
    onFilter,
    refresh
} = useServerDataTable(props.endpoint);

defineExpose({ refresh });

// ... Search Logic (Keep existing code for debouncing) ...
const searchValue = ref(lazyParams.value.filters.global.value || '');
let searchTimeout = null;

const onSearchInput = (event) => {
    const val = event.target.value;
    searchValue.value = val;
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        lazyParams.value.filters.global.value = val;
        onFilter({ filters: lazyParams.value.filters });
    }, 600);
};

const clearSearch = () => {
    searchValue.value = '';
    lazyParams.value.filters.global.value = null;
    onFilter({ filters: lazyParams.value.filters });
};

onUnmounted(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
});
</script>

<template>
    <div class="card p-0 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-0 dark:bg-surface-900 shadow-sm overflow-hidden">
        <!-- HEADER (Keep existing) -->
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
            :rowsPerPageOptions="rowsPerPage"
            :first="lazyParams.first"
            :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
            currentPageReportTemplate="{first} - {last} of {totalRecords}"
            class="p-datatable-sm"
            rowHover
            stripedRows
        >
            <template #loading>
                <div class="flex flex-col gap-3 p-4">
                    <div v-for="i in 5" :key="i"><Skeleton width="100%" height="2rem" class="mb-2" /></div>
                </div>
            </template>

            <template #empty>
                <!-- Keep existing empty state -->
                <div class="text-center p-4">No records found</div>
            </template>

            <!-- [NEW] AUTO-GENERATED COLUMNS LOOP -->
            <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" sortable>
                <!-- DYNAMIC SLOT: Allows parent to override specific cells -->
                <!-- Example: <template #cell-status="{ data }"> -->
                <template #body="slotProps">
                    <slot :name="`cell-${col.field}`" :data="slotProps.data">
                        <!-- Default Text Render -->
                        {{ slotProps.data[col.field] }}
                    </slot>
                </template>
            </Column>

            <!-- ACTIONS COLUMN (Always available at the end) -->
            <slot name="actions"></slot>
        </DataTable>
    </div>
</template>
