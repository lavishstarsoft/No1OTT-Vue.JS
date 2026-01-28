import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import * as Sentry from "@sentry/vue";


// Import CSS files
import './assets/main.css'

// Import Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css'

// ==== APP VERSIONING & CACHE CLEAR LOGIC ====
const APP_VERSION = '1.0.17'; // Change this on every new deployment
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

Sentry.init({
  app,
  dsn: "https://e6f292aaa19cacde602aa50369c85b18@o4510787676733440.ingest.de.sentry.io/4510787680469072",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost"],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when an error occurs.
});


// Use Vuex store and router
app.use(store)
app.use(router)

app.mount('#app')
