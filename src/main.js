import { createApp } from 'vue';
import { Quasar, Notify } from 'quasar';
import { createPinia } from 'pinia';
import { router } from './routes/routes.js';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import axios from 'axios'; 
import './style.css';

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

axios.defaults.baseURL = "https://restafy-backend.onrender.com/";
// axios.defaults.baseURL = "http://localhost:4500/";

const pinia = (createPinia())
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(Quasar, {
    plugins: {
        Notify
    }
})

app.mount('#app')