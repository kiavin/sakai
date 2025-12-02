import api from '@/utils/axios';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export function useServerDataTable(endpoint) {
    const route = useRoute();
    const router = useRouter();

    // 1. STATE
    const data = ref([]);
    const columns = ref([]);
    const totalRecords = ref(0);
    const loading = ref(false);

    // 2. PARAMS
    // src/composables/useServerDataTable.js

    // ...
    const lazyParams = ref({
        first: Number(route.query.first) || 0,
        rows: Number(route.query['per-page']) || 10,
        sortField: route.query.sortField || null,
        sortOrder: Number(route.query.sortOrder) || null,
        filters: {
            // CHANGE THIS: Ensure 'value' is undefined, not null, if empty
            global: { value: route.query['_q'] || null, matchMode: 'contains' }
        }
    });
    // ...

    // 3. FETCH LOGIC
    const loadData = async () => {
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

            // 4. MAP RESPONSE
            // Safely locate the payload wrapper
            const rawData = response.data;
            const payload = rawData.dataPayload || rawData || {};

            console.groupCollapsed(`[DataTable] Loaded Page ${page}`);
            console.log('Raw Payload:', payload);

            // --- SAFEFGUARDED ASSIGNMENT ---
            let incomingRows = [];

            // Check payload.data first
            if (payload.data) {
                if (Array.isArray(payload.data)) {
                    // Standard Array
                    incomingRows = payload.data;
                } else if (typeof payload.data === 'object') {
                    // FIX: API returned Object (e.g. {10: {...}, 11: {...}}) instead of Array
                    // We force convert it back to an Array
                    incomingRows = Object.values(payload.data);
                }
            }
            // Fallback: Payload itself is the list
            else if (Array.isArray(payload)) {
                incomingRows = payload;
            }

            // Use spread syntax to ensure we create a fresh array reference
            data.value = [...incomingRows];

            // Extract totals
            totalRecords.value = payload.totalCount || payload.total || data.value.length || 0;

            console.log('Assigned Rows:', data.value.length);
            console.groupEnd();

            // 5. AUTO-GENERATE COLUMNS
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

            // 6. SYNC TO BROWSER URL
            const queryParams = {
                ...route.query,
                page: page,
                'per-page': lazyParams.value.rows
            };

            if (apiParams['_q']) queryParams['_q'] = apiParams['_q'];
            else delete queryParams['_q'];

            if (apiParams['sort']) {
                queryParams.sortField = lazyParams.value.sortField;
                queryParams.sortOrder = lazyParams.value.sortOrder;
            } else {
                delete queryParams.sortField;
                delete queryParams.sortOrder;
            }

            router.replace({ query: queryParams });
        } catch (error) {
            console.error('DataTable Error:', error);
            data.value = [];
            totalRecords.value = 0;
        } finally {
            loading.value = false;
        }
    };

    // 7. EVENT HANDLERS
    const onPage = (event) => {
        lazyParams.value.first = event.first;
        lazyParams.value.rows = event.rows;
        loadData();
    };

    const onSort = (event) => {
        lazyParams.value.sortField = event.sortField;
        lazyParams.value.sortOrder = event.sortOrder;
        loadData();
    };

    const onFilter = (event) => {
        lazyParams.value.filters = event.filters;
        lazyParams.value.first = 0;
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
