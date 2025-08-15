import axios from 'axios';
import store from '../store';
import router from '../router';

// Clear all types of storage
const clearAllStorage = () => {
  // Clear localStorage
  const preservedKeys = ['theme']; // Keys to preserve if any
  Object.keys(localStorage).forEach(key => {
    if (!preservedKeys.includes(key)) {
      localStorage.removeItem(key);
    }
  });

  // Clear sessionStorage
  sessionStorage.clear();

  // Clear cookies
  document.cookie.split(";").forEach(cookie => {
    const name = cookie.split("=")[0].trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
};

// Reset Vuex store
const resetStore = async () => {
  await store.dispatch('resetState');
};

// Logout from backend
const logoutFromBackend = async () => {
  try {
    await axios.post('/users/logout/');
  } catch (error) {
    console.error('Logout API error:', error);
    // Continue with frontend logout even if backend fails
  }
};

// Main logout function
export const handleLogout = async () => {
  try {
    // 1. Logout from backend first
    await logoutFromBackend();
    
    // 2. Clear all storage
    clearAllStorage();
    
    // 3. Reset Vuex store
    await resetStore();
    
    // 4. Use Vue Router for navigation (replace instead of push)
    await router.replace('/login');
    
  } catch (error) {
    console.error('Logout error:', error);
    // Force redirect to login even if there's an error
    await router.replace('/login');
  }
}; 