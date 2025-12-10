import api from '@/utils/axios';
import { onMounted, ref, shallowRef } from 'vue';

export function useServerDataTable(endpoint) {
    // 1. STATE
    const data = shallowRef([]);
    const columns = ref([]);
    const totalRecords = ref(0);
    const loading = ref(false);

    // 2. PARAMS (Defaults only, no URL hydration)
    const lazyParams = ref({
        first: 0,
        rows: 10,
        sortField: null,
        sortOrder: null,
        filters: {
            global: { value: null, matchMode: 'contains' }
        }
    });

    // 3. FETCH LOGIC
    const loadData = async () => {
        // Guard: Prevent concurrent fetches
        if (loading.value) return;

        loading.value = true;

        try {
            const page = Math.floor(lazyParams.value.first / lazyParams.value.rows) + 1;

            const apiParams = {
                page: page,
                'per-page': lazyParams.value.rows
            };

            const searchQuery = lazyParams.value.filters?.global?.value;
            if (searchQuery && searchQuery.trim() !== '') {
                apiParams['_q'] = searchQuery;
            }

            if (lazyParams.value.sortField) {
                apiParams['sort'] = lazyParams.value.sortField;
                apiParams['order'] = lazyParams.value.sortOrder === 1 ? 'asc' : 'desc';
            }

            const response = await api.get(endpoint, { params: apiParams });

            const rawData = response.data;
            const payload = rawData.dataPayload || rawData || {};

            let incomingRows = [];
            if (payload.data) {
                if (Array.isArray(payload.data)) {
                    incomingRows = payload.data;
                } else if (typeof payload.data === 'object') {
                    incomingRows = Object.values(payload.data);
                }
            } else if (Array.isArray(payload)) {
                incomingRows = payload;
            }

            // Assign Data
            data.value = incomingRows;

            // Assign Totals
            const newTotal = payload.totalCount || payload.total || data.value.length || 0;
            if (totalRecords.value !== newTotal) {
                totalRecords.value = newTotal;
            }

            // Auto-Generate Columns (ONLY ONCE)
            if (columns.value.length === 0 && data.value.length > 0) {
                const firstItem = data.value[0];
                const ignoredKeys = ['id', 'uuid', 'password', 'deleted_at', 'paginationLinks', 'meta', 'links'];

                columns.value = Object.keys(firstItem)
                    .filter((key) => !ignoredKeys.includes(key))
                    .map((key) => ({
                        field: key,
                        header: key
                            .replace(/_/g, ' ')
                            .replace(/([a-z])([A-Z])/g, '$1 $2')
                            .replace(/\b\w/g, (l) => l.toUpperCase())
                    }));
            }
        } catch (error) {
            console.error('DataTable API Failed:', error);
            data.value = [];
            totalRecords.value = 0;
        } finally {
            loading.value = false;
        }
    };

    // 4. EVENT HANDLERS - FIXED TO PREVENT INFINITE LOOPS

    const onPage = (event) => {
        // Guard: Strict Equality Check
        if (lazyParams.value.first === event.first && lazyParams.value.rows === event.rows) {
            return;
        }

        // CRITICAL FIX: Create new object reference instead of mutating
        lazyParams.value = {
            ...lazyParams.value,
            first: event.first,
            rows: event.rows
        };

        loadData();
    };

    const onSort = (event) => {
        // Guard: Strict Equality Check
        if (lazyParams.value.sortField === event.sortField && lazyParams.value.sortOrder === event.sortOrder) {
            return;
        }

        // CRITICAL FIX: Create new object reference instead of mutating
        lazyParams.value = {
            ...lazyParams.value,
            sortField: event.sortField,
            sortOrder: event.sortOrder
        };

        loadData();
    };

    const onFilter = (event) => {
        // CRITICAL FIX: Compare actual values instead of JSON stringify
        const currentGlobalValue = lazyParams.value.filters?.global?.value;
        const newGlobalValue = event.filters?.global?.value;

        // Guard: Prevent unnecessary updates
        if (currentGlobalValue === newGlobalValue) {
            return;
        }

        // CRITICAL FIX: Create new object reference instead of mutating
        lazyParams.value = {
            ...lazyParams.value,
            filters: event.filters,
            first: 0 // Reset to page 1 on filter change
        };

        loadData();
    };

    // 5. INITIALIZE ON MOUNT
    onMounted(() => {
        loadData();
    });

    // 6. RETURN API
    return {
        data,
        columns,
        totalRecords,
        loading,
        lazyParams,
        onPage,
        onSort,
        onFilter,
        refresh: loadData
    };
}
