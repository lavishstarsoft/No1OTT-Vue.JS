<template>
  <header class="header" :class="{ 'scrolled': isScrolled }">
    <div class="header-container">
      <!-- Back button -->
      <button 
        v-if="shouldShowBackButton" 
        class="back-btn" 
        aria-label="Go back"
        @click="goBack"
      >
        <i class="fas fa-arrow-left"></i>
      </button>

      <!-- Logo -->
      <div class="logo-container" @click="goToHome">
        <img src="/ott.jpg" alt="Logo" class="h-8">
      </div>

      <!-- Main Navigation -->
      <nav class="main-nav">
        <ul class="nav-list">
          <li class="nav-item" v-for="item in navItems" :key="item.name">
            <router-link 
              :to="item.path" 
              class="nav-link" 
              :class="{ 
                'active': $route.path === item.path || 
                         (item.path === '/regional' && $route.path.startsWith('/regional'))
              }"
            >
              {{ item.name }}
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Auth Container -->
      <div class="auth-container">
        <!-- Mobile Subscribe Button -->
        <router-link v-if="!isUserSubscribed" to="/plans" class="mobile-subscribe-btn">
          <span class="crown-icon">
            <i class="fas fa-crown"></i>
          </span>
          <span class="subscribe-text">Subscribe</span>
        </router-link>

        <button class="search-btn" @click="toggleSearch">
          <i class="fas fa-search"></i>
        </button>
        <template v-if="user">
          <button @click="toggleMenu" class="profile-btn">
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-[#c30059] to-[#ff4d4d] flex items-center justify-center text-white">
              <span class="text-sm font-semibold">{{ userInitials }}</span>
            </div>
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="profile-btn">
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-[#c30059] to-[#ff4d4d] flex items-center justify-center text-white">
              <i class="fas fa-user text-sm"></i>
            </div>
          </router-link>
        </template>
        <router-link v-if="!isUserSubscribed" to="/plans" class="subscribe-btn">Subscribe Now</router-link>
        <button v-if="hasLiveStream" @click="toggleLiveTV" class="live-tv">
          <i class="fas fa-tv"></i>
          <span class="live-dot"></span>
          <span class="live-text">LIVE</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Profile Menu Overlay -->
  <ProfileMenu 
    :is-open="isMenuOpen"
    @close="closeMenu"
  />

  <!-- Live TV Player -->
  <LiveTVPlayer
    :is-open="isLiveTVOpen"
    :video-url="videoUrl"
    :video-title="videoTitle"
    :is-direct-video="false"
    @close="isLiveTVOpen = false"
  />
</template>

<script>
import ProfileMenu from '@/views/ProfileMenu.vue'
import LiveTVPlayer from './LiveTVPlayer.vue'
import axios from 'axios'

// API బేస్ URL ని కాన్స్టెంట్‌గా డిఫైన్ చేయడం
const API_BASE_URL = 'https://ott.no1news.in/'

export default {
  name: 'AppHeader',
  components: {
    ProfileMenu,
    LiveTVPlayer
  },
  emits: ['toggleSearch'],
  props: {
    hideBackButton: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isScrolled: false,
      isMenuOpen: false,
      isLiveTVOpen: false,
      hasLiveStream: false,
      liveStreamUrl: '',
      liveStreamTitle: '',
      navItems: [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Regional Content', path: '/regional' },
        { name: 'News', path: '/news' },
        { name: 'Contact', path: '/contact' }
      ],
      videoUrl: '',
      videoTitle: '',
      showProfileMenu: false,
      showLanguageDropdown: false,
      currentLanguage: 'Telugu',
      languages: ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'English'],
      pollingInterval: null,
      user: null,
      isLoadingUser: true
    }
  },
  computed: {
    showBackButton() {
      // Show back button on detail pages
      return this.$route.name === 'MovieDetails';
    },
    shouldShowBackButton() {
      // Respect the prop override if provided
      return this.showBackButton && !this.hideBackButton;
    },
    userInitials() {
      if (!this.user) return '';
      const firstName = this.user.first_name || '';
      const lastName = this.user.last_name || '';
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || this.user.phone.slice(0, 2);
    },
    isUserSubscribed() {
      if (this.isLoadingUser) return true; // Hide buttons while loading
      if (!this.user) return false;
      return this.user.is_subscribed && new Date(this.user.subscription_end_date) > new Date();
    }
  },
  mounted() {
    this.checkLiveStream()
    this.startPolling()
    window.addEventListener('scroll', this.handleScroll)
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      const profileBtn = document.querySelector('.profile-btn')
      const langBtn = document.querySelector('.language-selector button')
      const profileMenu = document.querySelector('.profile-menu')
      
      // Close profile menu when clicking outside
      if (profileBtn && !profileBtn.contains(e.target) && 
          profileMenu && !profileMenu.contains(e.target) && 
          this.isMenuOpen) {
        this.closeMenu()
      }
      
      if (langBtn && !langBtn.contains(e.target) && this.showLanguageDropdown) {
        this.showLanguageDropdown = false
      }
    })

    // Check for user data in localStorage and fetch fresh data
    this.initializeUser()
  },
  beforeUnmount() {
    this.stopPolling()
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 0
    },
    toggleSearch() {
      this.$router.push('/search')
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
      console.log('Menu toggled:', this.isMenuOpen)
    },
    closeMenu() {
      this.isMenuOpen = false
      console.log('Menu closed')
    },
    toggleLiveTV() {
      if (this.hasLiveStream && this.liveStreamUrl) {
        this.videoUrl = this.liveStreamUrl
        this.videoTitle = this.liveStreamTitle
        this.isLiveTVOpen = !this.isLiveTVOpen
      }
    },
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu
      if (this.showProfileMenu) {
        this.showLanguageDropdown = false
      }
    },
    toggleLanguageDropdown() {
      this.showLanguageDropdown = !this.showLanguageDropdown
      if (this.showLanguageDropdown) {
        this.showProfileMenu = false
      }
    },
    selectLanguage(language) {
      this.currentLanguage = language
      this.showLanguageDropdown = false
    },
    goBack() {
      this.$router.go(-1);
    },
    startPolling() {
      this.pollingInterval = setInterval(() => {
        this.checkLiveStream()
      }, 10000)
    },
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
    },
    async checkLiveStream() {
      try {
        console.log('Checking for live streams...')
        
        // మొదట కేటగిరీలు తెచ్చుకుందాం
        const categoriesResponse = await axios.get(`${API_BASE_URL}/api/frontend/categories/`)
        console.log('Categories Response:', categoriesResponse.data)
        
        let foundImportantStream = false
        
        if (categoriesResponse.data.status === 'success' && categoriesResponse.data.data) {
          // అన్ని కేటగిరీల నుండి లైవ్ స్ట్రీమ్స్ తెచ్చుకుందాం
          for (const category of categoriesResponse.data.data) {
            console.log('Checking category:', category.name, 'ID:', category.id)
            
            try {
              const response = await axios.get(`${API_BASE_URL}/api/live-streams/by_category/?category_id=${category.id}`)
              console.log('Live streams for category', category.id, ':', response.data)
              
              if (response.data && Array.isArray(response.data)) {
                const importantLiveStream = response.data.find(stream => {
                  console.log('Checking stream:', stream)
                  console.log('is_important:', stream.is_important)
                  console.log('is_active:', stream.is_active)
                  return stream.is_important === true && stream.is_active === true
                })
                
                if (importantLiveStream) {
                  console.log('Found important live stream:', importantLiveStream)
                  
                  if (this.liveStreamUrl !== importantLiveStream.live_url || 
                      this.liveStreamTitle !== importantLiveStream.title) {
                    console.log('Live stream details changed, updating...')
                    this.hasLiveStream = true
                    this.liveStreamUrl = importantLiveStream.live_url
                    this.liveStreamTitle = importantLiveStream.title
                    this.videoUrl = importantLiveStream.live_url
                    this.videoTitle = importantLiveStream.title
                  }
                  
                  foundImportantStream = true
                  break
                }
              }
            } catch (streamError) {
              console.error('Error fetching streams for category', category.id, ':', streamError)
              continue
            }
          }
          
          if (!foundImportantStream && this.hasLiveStream) {
            console.log('Important live stream no longer available')
            this.clearLiveStreamData()
          }
        }
      } catch (error) {
        console.error('Error checking live stream:', error)
        if (error.response) {
          console.error('Error response:', error.response.data)
        }
      }
    },
    clearLiveStreamData() {
      this.hasLiveStream = false
      this.liveStreamUrl = ''
      this.liveStreamTitle = ''
      this.videoUrl = ''
      this.videoTitle = ''
    },
    async initializeUser() {
      this.isLoadingUser = true;
      const phone = localStorage.getItem('phone')
      if (!phone) {
        this.user = null;
        this.isLoadingUser = false;
        return;
      }

      try {
        // Fetch fresh user data from API
        const response = await axios.get(`${API_BASE_URL}/users/profile/?phone=${phone}`)
        
        if (response.data && response.data.status === 'success') {
          this.user = response.data.user;
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          throw new Error('Failed to load user data');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Try to load from localStorage as fallback
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            this.user = JSON.parse(userData);
          } catch (e) {
            console.error('Error parsing user data:', e);
            this.user = null;
          }
        }
      } finally {
        this.isLoadingUser = false;
      }
    },
    goToHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.header {
  background: transparent;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  transition: all 0.3s ease;
  height: 70px;
  display: flex;
  align-items: center;
}

.header.scrolled {
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  height: 60px;
}

.header-container {
  width: 100%;
  padding: 0 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.logo-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header img.h-8 {
  height: 40px;
  width: auto;
  transition: transform 0.3s ease;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  max-width: 800px;
}

.nav-list {
  display: flex;
  align-items: center;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  white-space: nowrap;
}

.nav-list::-webkit-scrollbar {
  display: none;
}

.nav-item {
  flex-shrink: 0;
}

.nav-link {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  white-space: nowrap;
}

.nav-link:hover {
  color: #ffffff;
}

.nav-link.active {
  background: none;
  background-image: linear-gradient(to right, #c30059, #ff4d4d);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
}

.auth-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.search-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  transform: scale(1.05);
}

.search-btn i {
  font-size: 1.1rem;
}

.profile-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.profile-btn:hover {
  transform: scale(1.05);
}

.subscribe-btn {
  background: linear-gradient(to right, #c30059, #ff0077);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.8rem;
  color: #ffffff;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(195, 0, 89, 0.3);
}

.subscribe-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(195, 0, 89, 0.4);
}

.live-tv {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  margin-left: 0.5rem;
}

.live-tv:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.live-tv i {
  font-size: 1.2rem;
  color: #ff0077;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: #ff0077;
  border-radius: 50%;
  position: relative;
  animation: pulse 2s infinite;
}

.live-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #ff0077;
  letter-spacing: 0.5px;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media screen and (max-width: 1024px) {
  .header-container {
    padding: 0 1.5rem;
  }

  .main-nav {
    gap: 0.75rem;
  }

  .nav-list {
    gap: 0.75rem;
  }

  .nav-link {
    font-size: 0.8rem;
    padding: 0.35rem 0.5rem;
  }
}

/* iPad Air and Mini specific styles */
@media screen and (min-width: 768px) and (max-width: 1024px) {
  .header-container {
    padding: 0 1rem;
  }

  .nav-list {
    gap: 0.5rem;
  }

  .nav-link {
    font-size: 0.75rem;
    padding: 0.3rem 0.4rem;
  }

  .auth-container {
    gap: 0.5rem;
  }

  .sign-in-btn {
    padding: 0.35rem 0.6rem;
    font-size: 0.75rem;
  }

  .subscribe-btn {
    padding: 0.35rem 0.6rem;
    font-size: 0.75rem;
  }

  .search-btn {
    width: 32px;
    height: 32px;
  }
}

/* Specific styles for screens between 641px and 767px */
@media screen and (min-width: 641px) and (max-width: 767px) {
  .header-container {
    padding: 0 0.75rem;
  }

  .nav-list {
    gap: 0.4rem;
  }

  .nav-link {
    font-size: 0.7rem;
    padding: 0.25rem 0.35rem;
  }

  .auth-container {
    gap: 0.4rem;
  }

  .sign-in-btn {
    padding: 0.3rem 0.5rem;
    font-size: 0.7rem;
  }

  .subscribe-btn {
    padding: 0.3rem 0.5rem;
    font-size: 0.7rem;
  }

  .search-btn {
    width: 30px;
    height: 30px;
  }

  .search-btn i {
    font-size: 0.8rem;
  }
}

@media screen and (max-width: 768px) {
  .header {
    height: 60px;
  }

  .header.scrolled {
    height: 55px;
  }

  .header-container {
    padding: 0 1rem;
  }

  .header img.h-8 {
    height: 32px;
  }

  .nav-list {
    gap: 0.5rem;
  }

  .auth-container {
    gap: 0.5rem;
  }

  .sign-in-btn,
  .subscribe-btn {
    padding: 0.35rem 0.6rem;
    font-size: 0.75rem;
  }

  .search-btn {
    width: 32px;
    height: 32px;
  }
  
  .search-btn i {
    font-size: 0.9rem;
  }
}

@media screen and (max-width: 640px) {
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(18, 18, 18, 0.95);
    backdrop-filter: blur(10px);
    height: 60px;
    z-index: 50;
  }

  .header-container {
    height: 100%;
    padding: 0 1rem;
  }

  .main-nav {
    display: none;
  }

  .auth-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    height: 100%;
  }

  .sign-in-btn,
  .subscribe-btn,
  .search-btn {
    display: none;
  }

  .profile-btn {
    display: none;
  }

  .mobile-subscribe-btn {
    display: flex !important;
    margin-left: auto;
  }

  .live-tv {
    padding: 0.35rem;
  }
  
  .live-tv i {
    font-size: 1rem;
  }
  
  .live-text {
    font-size: 0.7rem;
  }
  
  .live-dot {
    width: 6px;
    height: 6px;
  }
}

.back-btn {
  color: white;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  margin-right: 1rem;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Mobile Subscribe Button Styles */
.mobile-subscribe-btn {
  display: none; /* Hidden by default */
  align-items: center;
  background: linear-gradient(135deg, #c30059, #ff4d4d);
  border-radius: 20px;
  padding: 6px 12px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  gap: 6px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.crown-icon {
  font-size: 0.875rem;
  color: #FFD700;
  filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.5));
}

.subscribe-text {
  color: white;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>

<style>
video {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
  background: #000 !important;
  opacity: 1 !important;
  z-index: 10 !important;
}
</style> 