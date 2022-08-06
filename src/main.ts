import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from '@/router';
import './style.css';
import App from './App.vue';

// material icons
// https://github.com/robcresswell/vue-material-design-icons
// https://materialdesignicons.com/

// slider
// https://github.com/vueform/slider
// https://refreshless.com/nouislider/behaviour-option/

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.mount('#app');
