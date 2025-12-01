<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const visible = ref(false);
const searchQuery = ref('');
const activeIndex = ref(0);
const searchInput = ref(null);

// 1. GENERATE SEARCHABLE ITEMS
// We map your router routes into a flat list.
// Filter out login/error pages or routes without a label.
const routes = router
    .getRoutes()
    .filter((r) => r.name && r.meta && r.meta.breadcrumb)
    .map((r) => ({
        label: r.meta.breadcrumb[0].label || r.name,
        to: r.path,
        icon: r.meta.icon || 'pi pi-link',
        category: 'Pages'
    }));

// You can add static actions too
const actions = [
    {
        label: 'Log Out',
        command: () => {
            /* logout logic */
        },
        icon: 'pi pi-sign-out',
        category: 'Actions'
    },
    {
        label: 'Toggle Dark Mode',
        command: () => {
            /* toggle logic */
        },
        icon: 'pi pi-moon',
        category: 'Actions'
    }
];

const allItems = [...routes, ...actions];

// 2. FILTER LOGIC
const filteredItems = computed(() => {
    if (!searchQuery.value) return allItems.slice(0, 5); // Show top 5 recent/default

    return allItems.filter((item) => item.label.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

// 3. NAVIGATION LOGIC
const selectItem = (item) => {
    if (item.to) {
        router.push(item.to);
    } else if (item.command) {
        item.command();
    }
    close();
};

const close = () => {
    visible.value = false;
    searchQuery.value = '';
    activeIndex.value = 0;
};

// 4. KEYBOARD SHORTCUTS
const onKeydown = (e) => {
    // Open: Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyK') {
        e.preventDefault(); // Stop Browser Search Bar
        e.stopPropagation(); // Stop bubbling

        visible.value = !visible.value;
    }

    if (!visible.value) return;

    // Navigation inside the list
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex.value = (activeIndex.value + 1) % filteredItems.value.length;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex.value = (activeIndex.value - 1 + filteredItems.value.length) % filteredItems.value.length;
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filteredItems.value[activeIndex.value];
        if (item) selectItem(item);
    }
};

// Focus input when opened
const onShow = () => {
    setTimeout(() => searchInput.value?.focus(), 50);
};
onMounted(() => {
    console.log('Command Palette: Listener Attached'); // Check your console for this!
    window.addEventListener('keydown', onKeydown);
});
onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :dismissableMask="true"
        :showHeader="false"
        :closeOnEscape="true"
        @show="onShow"
        contentClass="p-0 rounded-xl overflow-hidden shadow-2xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900"
        style="width: 100%; max-width: 600px; margin-top: 10vh; vertical-align: top"
        position="top"
    >
        <div class="flex flex-col">
            <div class="flex items-center border-b border-surface-200 dark:border-surface-700 px-4 py-4">
                <i class="pi pi-search text-xl text-muted-color mr-4"></i>
                <input ref="searchInput" v-model="searchQuery" class="w-full bg-transparent border-none outline-none text-lg text-surface-900 dark:text-surface-0 placeholder-surface-400" placeholder="Search pages or actions..." autocomplete="off" />
                <span class="text-xs font-bold border border-surface-300 dark:border-surface-600 rounded px-2 py-1 text-muted-color">ESC</span>
            </div>

            <ul class="list-none m-0 p-2 max-h-[400px] overflow-y-auto">
                <li
                    v-for="(item, index) in filteredItems"
                    :key="index"
                    @click="selectItem(item)"
                    @mousemove="activeIndex = index"
                    class="flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors"
                    :class="index === activeIndex ? 'bg-primary-50 dark:bg-primary-900/20' : ''"
                >
                    <div class="flex items-center justify-center w-8 h-8 rounded mr-4" :class="index === activeIndex ? 'bg-primary text-primary-contrast' : 'bg-surface-100 dark:bg-surface-800 text-muted-color'">
                        <i :class="item.icon"></i>
                    </div>

                    <div class="flex flex-col">
                        <span class="font-medium" :class="index === activeIndex ? 'text-primary' : 'text-surface-700 dark:text-surface-200'">{{ item.label }}</span>
                        <span class="text-xs text-muted-color">{{ item.category }}</span>
                    </div>

                    <i v-if="index === activeIndex" class="pi pi-arrow-left ml-auto text-primary text-sm"></i>
                </li>

                <li v-if="filteredItems.length === 0" class="p-8 text-center text-muted-color flex flex-col items-center">
                    <i class="pi pi-inbox text-4xl mb-2 opacity-50"></i>
                    <span>No results found for "{{ searchQuery }}"</span>
                </li>
            </ul>

            <div class="bg-surface-50 dark:bg-surface-950 px-4 py-2 text-xs text-muted-color flex justify-between border-t border-surface-200 dark:border-surface-700">
                <span><strong class="font-bold">↑↓</strong> to navigate</span>
                <span><strong class="font-bold">Enter</strong> to select</span>
            </div>
        </div>
    </Dialog>
</template>
