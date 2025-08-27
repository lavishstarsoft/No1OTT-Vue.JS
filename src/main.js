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
const APP_VERSION = '1.0.13'; // Change this on every new deployment
const cachedVersion = localStorage.getItem('app_version');

// Clear cache and logout all users if version is different
if (cachedVersion && cachedVersion !== APP_VERSION) {
  console.log('App version changed, clearing all data and logging out users');
  
  // Get current pathname before clearing
  const currentPath = window.location.pathname;
  
  // Save important data before clearing
  const tempVersion = APP_VERSION;
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const phone = localStorage.getItem('phone');
  
  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Restore important data if user was logged in
  if (isAuthenticated === 'true' && token && user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', user);
    localStorage.setItem('isAuthenticated', isAuthenticated);
    if (phone) localStorage.setItem('phone', phone);
  }
  
  // Always restore new version
  localStorage.setItem('app_version', tempVersion);
  
  // Only logout and redirect if version actually changed
  if (!isAuthenticated || !token || !user) {
    // Clear Vuex store if available
    if (store && store.dispatch) {
      store.dispatch('logout');
    }
    
    // Redirect to login only if not already there
    if (currentPath !== '/login') {
      window.location.replace('/login');
    }
  }
}

// Configure axios
axios.defaults.baseURL = 'https://ott.no1news.in/'
axios.defaults.withCredentials = true

const app = createApp(App)

// Use Vuex store and router
app.use(store)
app.use(router)

app.mount('#app')
