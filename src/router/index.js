import { createRouter, createWebHistory } from 'vue-router'
import RentalPayment from '@/views/RentalPayment.vue'
import store from '../store'
import Home from '../views/Home.vue'
import LoginPage from '../components/LoginPage.vue'
import MiniRegistration from '../components/MiniRegistration.vue'
import SubscriptionPlans from '../views/SubscriptionPlans.vue'
import VideoPlayer from '../views/VideoPlayer.vue'
import MovieDetails from '../views/MovieDetails.vue'
import RegionalContent from '../views/RegionalContent.vue'
import SearchPage from '@/views/SearchPage.vue'
import RegionalPage from '../views/RegionalPage.vue'
import RegistrationPage from '../components/RegistrationPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import ProfileUpdate from '../components/ProfileUpdate.vue'
import ReferralCard from '../components/ReferralCard.vue'
import ReferralDetailsPage from '../components/ReferralDetailsPage.vue'
import PaymentPage from '../components/Payment.vue'
import WalletDashboard from '@/components/wallet/WalletDashboard.vue'
import CategoryVideos from '../views/CategoryVideos.vue'
import WatchList from '@/views/WatchList.vue'
import PrivacyPolicy from '../views/PrivacyPolicy.vue'
import TermsOfService from '../views/TermsOfService.vue'
import CookiePolicy from '../views/CookiePolicy.vue'
import PaymentVerification from '../views/PaymentVerification.vue'
import TestVideoTracking from '../views/TestVideoTracking.vue'
import TestVideoPlayer from '../views/TestVideoPlayer.vue'
import DeviceActivation from '../views/DeviceActivation.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegistrationPage
  },
  {
    path: '/plans',
    name: 'SubscriptionPlans',
    component: SubscriptionPlans,
    meta: { requiresAuth: true }
  },
  {
    path: '/activate',
    name: 'DeviceActivation',
    component: DeviceActivation
  },
  {
    path: '/player',
    name: 'VideoPlayer',
    component: VideoPlayer,
    meta: { requiresAuth: true }
  },
  {
    path: '/movie/:id',
    name: 'MovieDetails',
    component: MovieDetails,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/movie/:id/rent',
    name: 'RentalPayment',
    component: RentalPayment,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/regional',
    name: 'RegionalContent',
    component: RegionalContent,
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/regional/:stateId',
    name: 'RegionalState',
    component: RegionalPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/update',
    name: 'ProfileUpdate',
    component: ProfileUpdate,
    meta: { requiresAuth: true }
  },
  {
    path: '/referral',
    name: 'Referral',
    component: ReferralCard,
    meta: { requiresAuth: true }
  },
  {
    path: '/referral/details',
    name: 'ReferralDetails',
    component: ReferralDetailsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/downloads',
    name: 'Downloads',
    component: () => import('../views/Downloads.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payment',
    name: 'Payment',
    component: PaymentPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: WalletDashboard,
    meta: {
      requiresAuth: true,
      title: 'Wallet'
    }
  },
  {
    path: '/category/:id',
    name: 'CategoryVideos',
    component: CategoryVideos,
    meta: { requiresAuth: true }
  },
  {
    path: '/premium-videos',
    name: 'PremiumVideos',
    component: () => import('../views/PremiumVideos.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/free-videos',
    name: 'FreeVideos',
    component: () => import('../views/FreeVideos.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/watchlist',
    name: 'WatchList',
    component: WatchList,
    meta: { requiresAuth: true }
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicy,
    meta: { requiresAuth: true }
  },
  {
    path: '/terms-of-service',
    name: 'TermsOfService',
    component: TermsOfService,
    meta: { requiresAuth: true }
  },
  {
    path: '/cookie-policy',
    name: 'CookiePolicy',
    component: CookiePolicy,
    meta: { requiresAuth: true }
  },
  {
    path: '/mini-register',
    name: 'MiniRegister',
    component: MiniRegistration,
    meta: { requiresAuth: true }
  },
  {
    path: '/payment/verify',
    name: 'PaymentVerification',
    component: PaymentVerification,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/test-video-tracking',
    name: 'TestVideoTracking',
    component: TestVideoTracking,
    meta: { requiresAuth: true }
  },
  {
    path: '/test-video-player',
    name: 'TestVideoPlayer',
    component: TestVideoPlayer,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  // Get fresh values from store/localStorage
  const isAuthenticated = store.state.isAuthenticated || localStorage.getItem('isAuthenticated') === 'true'
  let user = null
  let token = localStorage.getItem('token')
  let phone = localStorage.getItem('phone')
  
  // Safely parse user data
  try {
    const userData = localStorage.getItem('user')
    if (userData) {
      user = JSON.parse(userData)
    }
  } catch (error) {
    console.error('Error parsing user data:', error)
    // Clear corrupted user data
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('phone')
    store.dispatch('logout')
    next('/login')
    return
  }
  
  // Update registration check to only verify required fields for mini registration
  const hasCompletedRegistration = user && user.first_name && user.address
  
  // Debug log
  console.log('Navigation:', { 
    from: from.path,
    to: to.path,
    isAuthenticated,
    hasCompletedRegistration,
    user: user ? 'exists' : 'null',
    hasToken: !!token,
    hasPhone: !!phone
  })
  
  // Allow access to login page always
  if (to.path === '/login') {
    if (isAuthenticated && token && phone && user) {
      // If user is already logged in and has basic details, go to home
      if (hasCompletedRegistration) {
        next('/')
      } else {
        next('/mini-register')
      }
    } else {
      next()
    }
    return
  }

  // Handle auth required routes
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated || !token || !phone || !user) {
      console.log('Authentication failed, redirecting to login')
      // Clear any invalid session data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('phone')
      store.dispatch('logout')
      
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else if (!hasCompletedRegistration && to.path !== '/mini-register') {
      // If no basic details, force mini-register
      next('/mini-register')
    } else if (hasCompletedRegistration && to.path === '/mini-register') {
      // If has basic details and trying to access mini-register, redirect to home
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router 