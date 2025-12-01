import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
//pinia
import { createPinia } from 'pinia';
const pinia = createPinia();

//primevue

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import ToastService from 'primevue/toastservice';

//directives
import { vCan } from '@/directives/v-can';

//nprogess styles
import '@/assets/styles.scss';
import '@/assets/tailwind.css';

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(DialogService);
app.use(ConfirmationService);
app.directive('can', vCan); // Usage: v-can="..."

app.mount('#app');
