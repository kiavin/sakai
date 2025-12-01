import api from '@/utils/axios';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export function useServerDataTable(endpoint) {
    const route = useRoute();
    const router = useRouter();

    // 1. STATE
    const data = ref([]);
    const columns = ref([]); // [NEW] Stores the auto-detected column definitions
    const totalRecords = ref(0);
    const loading = ref(false);

    // 2. PARAMS (Hydrate from URL or Defaults)
    const lazyParams = ref({
        first: Number(route.query.first) || 0,
        rows: Number(route.query['per-page']) || 10,
        sortField: route.query.sortField || null,
        sortOrder: Number(route.query.sortOrder) || null,
        filters: {
            global: { value: route.query['_q'] || null, matchMode: 'contains' }
        }
    });

    // 3. FETCH LOGIC
    const loadData = async () => {
        loading.value = true;

        try {
            // Calculation: Convert "First Row Index" to "Page Number"
            const page = Math.floor(lazyParams.value.first / lazyParams.value.rows) + 1;

            // Construct API Params
            const apiParams = {
                page: page,
                'per-page': lazyParams.value.rows
            };

            // Add Search Query ONLY if it exists
            const searchQuery = lazyParams.value.filters?.global?.value;
            if (searchQuery && searchQuery.trim() !== '') {
                apiParams['_q'] = searchQuery;
            }

            // Add Sort/Order ONLY if active
            if (lazyParams.value.sortField) {
                apiParams['sort'] = lazyParams.value.sortField;
                apiParams['order'] = lazyParams.value.sortOrder === 1 ? 'asc' : 'desc';
            }

            const response = await api.get(endpoint, { params: apiParams });

            // 4. MAP RESPONSE
            // Adjust this path based on your specific API structure (e.g., response.data.dataPayload)
            const payload = response.data.dataPayload || response.data;

            data.value = payload.data || [];
            totalRecords.value = payload.totalCount || 0;

            // 5. [NEW] AUTO-GENERATE COLUMNS logic
            // We only run this if columns aren't defined yet and we have data to inspect
            if (columns.value.length === 0 && data.value.length > 0) {
                const firstItem = data.value[0];

                // Keys we generally don't want to show in the UI by default
                const ignoredKeys = ['id', 'uuid', 'password', 'deleted_at', 'paginationLinks', 'meta', 'links'];

                columns.value = Object.keys(firstItem)
                    .filter((key) => !ignoredKeys.includes(key))
                    .map((key) => ({
                        field: key,
                        // Formats "rule_name" -> "Rule Name"
                        header: key
                            .replace(/_/g, ' ')
                            .replace(/([a-z])([A-Z])/g, '$1 $2') // Splits camelCase
                            .replace(/\b\w/g, (l) => l.toUpperCase()) // Capitalize Words
                    }));
            }

            // 6. SYNC TO BROWSER URL
            const queryParams = {
                ...route.query,
                first: lazyParams.value.first,
                'per-page': lazyParams.value.rows
            };

            // Only update URL with params that exist
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
