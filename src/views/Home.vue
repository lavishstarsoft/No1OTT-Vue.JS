<template>
  <div class="bg-[#121212] text-white min-h-screen overflow-x-hidden">
    <AppHeader @toggle-search="toggleSearch" />
    
    <!-- Add top padding for mobile -->
    <div class="pt-[60px] md:pt-0">
      <HeroSection />
      
      <main class="pl-4 sm:pl-6 md:pl-10 py-6 space-y-12 relative overflow-hidden">
      
       <AllCategoriesSection title="Categories" />
        
        <MovieSection
          v-if="recentlyAdded.length > 0"
          title="Recently Added"
          section-id="recentlyAdded"
          :movies="recentlyAdded"
          :show-view-all="false"
        />
        <div v-else class="loading-skeleton">
          <!-- Add loading skeleton here -->
        </div>

        <!-- Paid Videos Section -->
        <MovieSection
          v-if="paidVideos.length > 0"
          title="Premium Videos"
          section-id="paidVideos"
          :movies="paidVideos"
          :show-view-all="true"
          badge="PAID"
        />
        <div v-else-if="!dataLoaded" class="loading-skeleton">
          <!-- Add loading skeleton here -->
        </div>

        <!-- Free Videos Section -->
        <MovieSection
          v-if="freeVideos.length > 0"
          title="Free Videos"
          section-id="freeVideos"
          :movies="freeVideos"
          :show-view-all="true"
          badge="FREE"
        />
        <div v-else-if="!dataLoaded" class="loading-skeleton">
          <!-- Add loading skeleton here -->
        </div>

        <!-- Rental Videos Section -->
        <MovieSection
          v-if="rentalVideos.length > 0"
          title="Rental Videos"
          section-id="rentalVideos"
          :movies="rentalVideos"
          :show-view-all="false"
          badge="RENTAL"
        />
        <div v-else-if="!dataLoaded" class="loading-skeleton">
          <!-- Add loading skeleton here -->
        </div>

        <CategorySection title="Live Channels" />

        <StatesSection />
      </main>
    </div>

    <!-- Mobile Search Bar -->
    <div class="mobile-search-bar" :class="{ active: isSearchActive }">
      <input type="text" placeholder="Search movies, shows and more...">
      <button class="text-white" @click="toggleSearch">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <AppFooter />
    
    <!-- Router View for Sub Pages -->
    <router-view />
  </div>
</template>

<script>
import AppHeader from '../components/Header.vue'
import HeroSection from '../components/Hero.vue'
import MovieSection from '../components/MovieSection.vue'
import AppFooter from '../components/Footer.vue'
import CategorySection from '@/components/CategorySection.vue'
import StatesSection from '@/components/StatesSection.vue'
import AllCategoriesSection from '@/components/AllCategoriesSection.vue'
import axios from 'axios'

export default {
  name: 'HomePage',
  components: {
    AppHeader,
    HeroSection,
    MovieSection,
    AppFooter,
    CategorySection,
    StatesSection,
    AllCategoriesSection
  },
  data() {
    return {
      isSearchActive: false,
      recentlyAdded: [],
      canScrollLeft: false,
      canScrollRight: true,
      dataLoaded: false
    }
  },
  computed: {
    freeVideos() {
      return this.recentlyAdded.filter(video => video.video_type === 'free')
    },
    paidVideos() {
      return this.recentlyAdded.filter(video => video.video_type === 'paid')
    },
    rentalVideos() {
      return this.recentlyAdded.filter(video => video.video_type === 'rental')
    }
  },
  created() {
    // Check if we have cached data
    const cachedData = this.$store.state.homePageData
    if (cachedData && cachedData.recentlyAdded) {
      this.recentlyAdded = cachedData.recentlyAdded
      this.dataLoaded = true
    } else {
      this.fetchRecentlyAdded()
    }
  },
  mounted() {
    this.checkScrollButtons();
    // Add scroll event listener
    this.$refs.scrollContainer?.addEventListener('scroll', this.checkScrollButtons);
  },
  beforeUnmount() {
    // Remove scroll event listener
    this.$refs.scrollContainer?.removeEventListener('scroll', this.checkScrollButtons);
  },
  methods: {
    capitalizeText(text) {
      if (!text) return '';
      // Split by spaces and special characters
      return text.split(/[\s-]+/).map(word => {
        // Don't change case for special words
        const specialWords = ['HD', 'UHD', '4K', 'TV', 'II', 'III', 'IV', 'SPY'];
        if (specialWords.includes(word.toUpperCase())) {
          return word.toUpperCase();
        }
        // Don't change case for articles and conjunctions in middle of title
        const minorWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'in', 'to', 'on', 'at', 'by', 'of'];
        if (minorWords.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(' ');
    },
    async fetchRecentlyAdded() {
      if (this.dataLoaded) return // Skip if data is already loaded
      
      try {
        const response = await axios.get('https://ott.no1news.in/api/videos/?limit=15&ordering=-created_at')
        if (response.data) {
          const transformedData = response.data.map(video => ({
            id: video.id,
            title: this.capitalizeText(video.title),
            image: video.thumbnail_url,
            portraitImage: video.portrait_thumbnail_url,
            isNewEpisode: this.isNewVideo(video.created_at),
            is4K: video.is_4k || false,
            isPremium: video.is_premium || false,
            video_type: video.video_type || 'free',
            description: this.capitalizeText(video.description),
            created_at: video.created_at
          }))
          
          // Sort by created_at to ensure latest videos first
          transformedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          
          this.recentlyAdded = transformedData
          this.dataLoaded = true
          
          // Cache the data in Vuex store
          this.$store.commit('setHomePageData', {
            recentlyAdded: transformedData,
            timestamp: Date.now()
          })
        }
      } catch (error) {
        console.error('Error fetching recently added videos:', error)
      }
    },
    isNewVideo(createdAt) {
      const videoDate = new Date(createdAt);
      const now = new Date();
      const diffDays = Math.ceil((now - videoDate) / (1000 * 60 * 60 * 24));
      return diffDays <= 7; // Consider videos within last 7 days as new
    },
    toggleSearch() {
      this.isSearchActive = !this.isSearchActive;
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    scrollContent(direction) {
      const container = this.$refs.scrollContainer;
      if (!container) return;
      
      const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of container width
      
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    },
    checkScrollButtons() {
      const container = this.$refs.scrollContainer;
      if (!container) return;
      
      // Check if we can scroll left
      this.canScrollLeft = container.scrollLeft > 0;
      
      // Check if we can scroll right
      this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);
    }
  },
  // Add activated hook for keep-alive
  activated() {
    // Check if cached data is older than 5 minutes
    const cachedData = this.$store.state.homePageData
    if (!cachedData || !cachedData.timestamp || Date.now() - cachedData.timestamp > 300000) {
      this.dataLoaded = false
      this.fetchRecentlyAdded()
    }
  }
}
</script>

<style scoped>
/* Mobile Search Bar */
.mobile-search-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #121212;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transform: translateY(-100%);
  transition: transform 0.3s ease;
  z-index: 1001;
}

.mobile-search-bar.active {
  transform: translateY(0);
}

.mobile-search-bar input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: white;
  font-size: 0.9rem;
}

.mobile-search-bar input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.mobile-search-bar button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
}

/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}

/* Ensure the scroll container takes full width */
.overflow-x-auto {
  width: 100%;
  position: relative;
}

/* Fix for horizontal scroll */
.overflow-x-hidden {
  overflow-x: hidden;
}

/* Ensure scroll containers don't cause page overflow */
.overflow-x-auto {
  max-width: 100vw;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

/* Ensure content stays within bounds */
main {
  width: 100%;
  max-width: 100vw;
  position: relative;
}

/* Prevent overflow from flex items */
.flex {
  flex-wrap: nowrap;
  width: max-content;
  min-width: 100%;
}

/* Ensure scrollbar is hidden but functionality remains */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  overflow: -moz-scrollbars-none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
  width: 0 !important;
}

/* Arrow Button Styles */
button.absolute {
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
}

button.absolute:hover {
  border-color: #c30059;
  transform: translateY(-50%) scale(1.1);
}

button.absolute i {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  button.absolute {
    width: 36px;
    height: 36px;
  }
  
  button.absolute i {
    width: 16px;
    height: 16px;
  }
}

.loading-skeleton {
  height: 240px;
  background: linear-gradient(90deg, #1d1d1d 25%, #2d2d2d 50%, #1d1d1d 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style> 