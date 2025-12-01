<script setup>
import { computed, onMounted, ref, watch } from 'vue';

// 1. PROPS: Accept the 4 separate arrays directly from your API response
const props = defineProps({
    availableRoles: { type: Array, default: () => [] },
    availablePermissions: { type: Array, default: () => [] },
    assignedRoles: { type: Array, default: () => [] },
    assignedPermissions: { type: Array, default: () => [] },
    isLoading: { type: Boolean, default: false }
});

// 2. EMITS: Send back separated arrays when changes happen
const emit = defineEmits(['save', 'update:modelValue']);

// 3. STATE
// PrimeVue PickList needs a structure of [ [SourceItems], [TargetItems] ]
const pickListData = ref([[], []]);
const sourceFilter = ref('');
const targetFilter = ref('');

// 4. MERGE LOGIC: Combine arrays and tag them with a 'type'
const initializeData = () => {
    // Merge Available
    const source = [...props.availableRoles.map((r) => ({ ...r, type: 'role' })), ...props.availablePermissions.map((p) => ({ ...p, type: 'permission' }))];

    // Merge Assigned
    const target = [...props.assignedRoles.map((r) => ({ ...r, type: 'role' })), ...props.assignedPermissions.map((p) => ({ ...p, type: 'permission' }))];

    pickListData.value = [source, target];
};

// Watch for prop updates (e.g. when API data loads)
watch(() => [props.availableRoles, props.availablePermissions], initializeData, { deep: true });
onMounted(initializeData);

// 5. SPLIT LOGIC: When items move, separate them back out and emit
const handleMove = () => {
    const targetList = pickListData.value[1]; // The right side list

    const payload = {
        roles: targetList.filter((item) => item.type === 'role'),
        permissions: targetList.filter((item) => item.type === 'permission')
    };

    // Emit the separated data for your API
    emit('save', payload);
};

// 6. FILTER LOGIC: Custom search to match the image design
const displayList = computed({
    get: () => {
        const source = pickListData.value[0].filter((i) => i.name.toLowerCase().includes(sourceFilter.value.toLowerCase()));
        const target = pickListData.value[1].filter((i) => i.name.toLowerCase().includes(targetFilter.value.toLowerCase()));
        return [source, target];
    },
    set: (val) => {
        // When PrimeVue updates the model, it gives us the *filtered* results.
        // We need to be careful not to lose hidden items.
        // Ideally, we rely on the @move events to update our main data store.
        pickListData.value = val;
    }
});
</script>

<template>
    <div class="card rounded-lg overflow-hidden bg-white dark:bg-surface-900">
        <div v-if="isLoading" class="p-8 flex justify-center">
            <i class="pi pi-spin pi-spinner text-2xl text-primary"></i>
        </div>

        <PickList
            v-else
            v-model="displayList"
            dataKey="id"
            breakpoint="1024px"
            stripedRows
            :showSourceControls="false"
            :showTargetControls="false"
            :moveAllToTargetProps="{ severity: 'success', class: 'w-10' }"
            :moveToTargetProps="{ severity: 'success', class: 'w-10' }"
            :moveAllToSourceProps="{ severity: 'danger', class: 'w-10' }"
            :moveToSourceProps="{ severity: 'danger', class: 'w-10' }"
            @move-to-target="handleMove"
            @move-all-to-target="handleMove"
            @move-to-source="handleMove"
            @move-all-to-source="handleMove"
        >
            <template #sourceheader>
                <div class="flex flex-col gap-2 p-1 mb-2">
                    <span class="font-bold text-lg">Available Items</span>
                    <span class="relative">
                        <!-- <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color pointer-events-none z-10" /> -->

                        <InputText v-model="sourceFilter" placeholder="Search Roles or Permissions..." class="w-full pl-10 p-inputtext-sm" />
                    </span>
                </div>
            </template>

            <template #targetheader>
                <div class="flex flex-col gap-2 p-1 mb-2">
                    <span class="font-bold text-lg">Assigned Items</span>
                    <span class="relative">
                        <!-- <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-color" /> -->
                        <InputText v-model="targetFilter" placeholder="Search Assigned..." class="w-full pl-8 p-inputtext-sm" />
                    </span>
                </div>
            </template>

            <template #item="slotProps">
                <div class="flex items-center gap-3 w-full p-1 group">
                    <div
                        class="flex items-center justify-center w-8 h-8 rounded shrink-0 transition-colors"
                        :class="slotProps.item.type === 'role' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'"
                    >
                        <i :class="slotProps.item.type === 'role' ? 'pi pi-id-card' : 'pi pi-key'"></i>
                    </div>

                    <div class="flex flex-col">
                        <span class="font-medium text-surface-900 dark:text-surface-0">{{ slotProps.item.name }}</span>
                        <span class="text-xs text-muted-color uppercase font-semibold tracking-wider">{{ slotProps.item.type }}</span>
                    </div>
                </div>
            </template>
        </PickList>
    </div>
</template>

<style scoped>
/* Adjust the internal list height to match the design */
:deep(.p-picklist-list) {
    height: 400px;
    background: var(--surface-50);
}
:deep(.dark .p-picklist-list) {
    background: var(--surface-900);
}

/* Hide default filters if PrimeVue adds them automatically */
:deep(.p-picklist-filter-container) {
    display: none;
}
</style>
