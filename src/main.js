import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// Import CSS files
import './assets/main.css'

// Import Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css'

// ==== APP VERSIONING & CACHE CLEAR LOGIC ====
const APP_VERSION = '1.0.10'; // Change this on every new deployment
const cachedVersion = localStorage.getItem('app_version');

// Only clear cache if version is different AND user is not authenticated
const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
const hasUser = localStorage.getItem('user');

if (cachedVersion !== APP_VERSION && !isAuthenticated && !hasUser) {
  console.log('App version changed, clearing cache for non-authenticated user');
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('app_version', APP_VERSION);
  // Only redirect if not already on login page
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
} else if (cachedVersion !== APP_VERSION) {
  // Just update version without clearing data for authenticated users
  localStorage.setItem('app_version', APP_VERSION);
  console.log('App version updated, keeping user data');
}

// Configure axios
axios.defaults.baseURL = 'https://ott.no1news.in/'
axios.defaults.withCredentials = true

const app = createApp(App)

// Use Vuex store and router
app.use(store)
app.use(router)

app.mount('#app')
