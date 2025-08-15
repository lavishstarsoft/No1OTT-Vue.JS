import { createStore } from 'vuex'

// Initial state
const getDefaultState = () => {
  return {
    user: null,
    isAuthenticated: false,
    token: null,
    subscription: null,
    isLoading: false,
    toast: {
      show: false,
      message: '',
      type: 'info', // 'success', 'error', 'info', 'warning'
      duration: 3000
    },
    homePageData: null
  };
};

// Load user data from localStorage safely
const loadUserData = () => {
  try {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (user && token && isAuthenticated) {
      return {
        user: JSON.parse(user),
        isAuthenticated: true,
        token: token
      };
    }
  } catch (error) {
    console.error('Error loading user data from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
  }
  
  return {
    user: null,
    isAuthenticated: false,
    token: null
  };
};

export default createStore({
  state: {
    ...getDefaultState(),
    ...loadUserData()
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
      // Sync with localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
    },
    setAuthenticated(state, value) {
      state.isAuthenticated = value;
      localStorage.setItem('isAuthenticated', value.toString());
    },
    setToken(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },
    setLoading(state, value) {
      state.isLoading = value;
    },
    setSubscription(state, subscription) {
      state.subscription = subscription;
    },
    logout(state) {
      // Clear all localStorage items
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear specific items to be sure
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
      localStorage.removeItem('subscription');
      localStorage.removeItem('csrfToken');
      localStorage.removeItem('pending_payment');
      localStorage.removeItem('registrationSuccess');
      localStorage.removeItem('registrationMessage');
      localStorage.removeItem('loginSuccess');
      localStorage.removeItem('loginMessage');
      localStorage.removeItem('hasCompletedRegistration');
      localStorage.removeItem('app_version');
      
      // Reset state
      Object.assign(state, getDefaultState());
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    },
    RESET_STATE(state) {
      Object.assign(state, getDefaultState());
    },
    showToast(state, { message, type = 'info', duration = 3000 }) {
      state.toast = {
        show: true,
        message,
        type,
        duration
      };
    },
    hideToast(state) {
      state.toast.show = false;
    },
    setHomePageData(state, data) {
      state.homePageData = data
    },
    clearHomePageData(state) {
      state.homePageData = null
    }
  },
  actions: {
    initializeStore({ commit }) {
      // Load user data from localStorage on app start
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      if (user && token) {
        commit('setUser', user);
        commit('setToken', token);
      }
    },
    logout({ commit }) {
      commit('logout');
    },
    resetState({ commit }) {
      return new Promise((resolve) => {
        commit('RESET_STATE');
        resolve();
      });
    },
    setLoading({ commit }, value) {
      commit('setLoading', value);
    },
    showToast({ commit }, { message, type, duration }) {
      commit('showToast', { message, type, duration });
      setTimeout(() => {
        commit('hideToast');
      }, duration || 3000);
    }
  },
  getters: {
    isLoading: state => state.isLoading,
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    hasActiveSubscription: state => !!state.subscription,
    subscriptionDetails: state => state.subscription,
    token: state => state.token,
    toast: state => state.toast,
    homePageData: state => state.homePageData
  }
}) 