import api from '@/utils/axios';
import { onMounted, ref, shallowRef, toRaw } from 'vue';

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

            // Auto-Generate Columns
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

            // Removed URL Sync logic entirely
        } catch (error) {
            console.error('DataTable API Failed:', error);
            data.value = [];
            totalRecords.value = 0;
        } finally {
            loading.value = false;
        }
    };

    // 7. EVENT HANDLERS

    const onPage = (event) => {
        // Guard: Strict Equality Check
        if (lazyParams.value.first === event.first && lazyParams.value.rows === event.rows) {
            return;
        }
        lazyParams.value.first = event.first;
        lazyParams.value.rows = event.rows;
        loadData();
    };

    const onSort = (event) => {
        // Guard: Strict Equality Check
        if (lazyParams.value.sortField === event.sortField && lazyParams.value.sortOrder === event.sortOrder) {
            return;
        }
        lazyParams.value.sortField = event.sortField;
        lazyParams.value.sortOrder = event.sortOrder;
        loadData();
    };

    const onFilter = (event) => {
        // Guard: Deep Check for Filters
        const currentFilters = JSON.stringify(toRaw(lazyParams.value.filters));
        const newFilters = JSON.stringify(event.filters);

        if (currentFilters === newFilters) {
            return;
        }

        lazyParams.value.filters = event.filters;
        lazyParams.value.first = 0; // Reset to page 1
        loadData();
    };

    onMounted(() => {
        loadData();
    });

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
