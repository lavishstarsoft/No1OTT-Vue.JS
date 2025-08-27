# Create a new CategorySection component
<template>
  <section class="mb-8">
    <!-- Add ViewAllModal component -->
    <div v-if="showViewAllModal" class="fixed inset-0 z-50 overflow-y-auto bg-black/90">
      <div class="min-h-screen px-4 py-6">
        <div class="relative max-w-7xl mx-auto">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white">{{ selectedCategory?.name }}</h2>
            <button @click="closeViewAllModal" class="text-white hover:text-gray-300">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <!-- Videos Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div 
              v-for="video in categoryVideos[selectedCategory?.id]?.data" 
              :key="video.id"
              class="cursor-pointer group"
              @click="playVideo(video)"
            >
              <div class="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden relative">
                <img 
                  :src="video.portrait_thumbnail_url || video.thumbnail_url" 
                  :alt="video.title"
                  class="w-full h-full object-cover"
                >
                
                <!-- Video badges -->
                <div class="absolute top-0 left-0 right-0 flex justify-between items-start p-2 bg-gradient-to-b from-black/70 to-transparent">
                  <div class="flex gap-2">
                    <span 
                      v-if="video.is_premium" 
                      class="badge-premium flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-sm"
                    >
                      <i class="fas fa-crown text-yellow-400"></i>
                    </span>
                    <span 
                      v-if="video.video_type === 'rental'" 
                      class="badge-rental flex items-center text-[10px] font-medium px-2 py-1 rounded backdrop-blur-sm"
                    >
                      <i class="fas fa-ticket mr-1"></i>
                      RENTAL
                    </span>
                  </div>
                </div>
                
                <!-- Duration badge -->
                <div class="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs text-white">
                  {{ formatDuration(video.duration) }}
                </div>
                
                <!-- Play button overlay -->
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                  <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <i class="fas fa-play text-white"></i>
                  </div>
                </div>
              </div>
              <div class="mt-2">
                <h4 class="text-white text-sm font-medium truncate w-full">{{ video.title }}</h4>
                <p class="text-gray-400 text-xs">{{ formatViews(video.views_count) }} Views</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add LiveTVPlayer component -->
    <LiveTVPlayer
      :is-open="isPlayerOpen"
      :video-url="selectedVideoUrl"
      :video-title="selectedVideoTitle"
      :is-direct-video="false"
      @close="closePlayer"
    />
    
    <!-- Categories with their videos -->
    <div v-for="category in categories" :key="category.id" class="mb-8">
      <div class="flex items-center justify-between mb-4 pr-4">
        <h2 class="text-lg font-medium gradient-text">{{ category.name }}</h2>
        <div class="flex items-center gap-2">
          <router-link
            :to="{ name: 'CategoryVideos', params: { id: category.id }}"
            class="text-white font-semibold text-sm hover:underline whitespace-nowrap"
          >
            View All
          </router-link>
          <button 
            @click="loadMoreVideos(category.id)"
            v-if="categoryVideos[category.id]?.pagination?.has_next"
            class="text-sm text-blue-500 hover:text-blue-400"
          >
            View More
          </button>
        </div>
      </div>
      
      <div class="relative">
        <button 
          @click="scroll('left', category.id)" 
          class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70"
          v-show="scrollStates[category.id]?.canScrollLeft"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div 
          :ref="el => setContainerRef(el, category.id)"
          class="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          @scroll="checkScroll(category.id)"
        >
          <!-- Live Streams -->
          <div 
            v-for="stream in categoryLiveStreams[category.id] || []" 
            :key="'live-' + stream.id"
            class="flex-shrink-0 relative group cursor-pointer"
            @click="playLiveStream(stream)"
          >
            <div class="w-[200px] h-[120px] bg-gray-800 rounded-lg overflow-hidden relative">
              <img 
                :src="stream.thumbnail || 'https://via.placeholder.com/200x120'" 
                :alt="stream.title"
                class="w-full h-full object-cover"
              >
              
              <!-- Live Stream Badge -->
              <div class="absolute top-2 left-2 flex gap-2">
                <span class="bg-red-600 text-white text-xs px-2 py-0.5 rounded animate-pulse">
                  LIVE
                </span>
                <span v-if="stream.is_premium" class="bg-purple-600 text-white text-xs px-2 py-0.5 rounded">
                  PREMIUM
                </span>
              </div>
            </div>
            <div class="mt-2 w-[200px]">
              <h4 class="text-white text-sm font-medium truncate">{{ stream.title }}</h4>
            </div>
          </div>

          <!-- Regular Videos -->
          <div 
            v-for="video in categoryVideos[category.id]?.data || []" 
            :key="video.id"
            class="flex-shrink-0 relative group cursor-pointer"
            @click="playVideo(video)"
          >
            <div class="w-[200px] h-[120px] bg-gray-800 rounded-lg overflow-hidden relative">
              <img 
                :src="video.thumbnail_url || 'https://via.placeholder.com/200x120'" 
                :alt="video.title"
                class="w-full h-full object-cover"
              >
              
              <!-- Video badges -->
              <div class="absolute top-0 left-0 right-0 flex justify-between items-start p-2 bg-gradient-to-b from-black/70 to-transparent">
                <div class="flex gap-2">
                  <span 
                    v-if="video.is_premium" 
                    class="badge-premium flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-sm"
                  >
                    <i class="fas fa-crown text-yellow-400"></i>
                  </span>
                  <span 
                    v-if="video.video_type === 'rental'" 
                    class="badge-rental flex items-center text-[10px] font-medium px-2 py-1 rounded backdrop-blur-sm"
                  >
                    <i class="fas fa-ticket mr-1"></i>
                    RENTAL
                  </span>
                </div>
              </div>
              
              <!-- Play button overlay -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <i class="fas fa-play text-white"></i>
                </div>
              </div>
            </div>
            <!-- Video title and views -->
            <div class="mt-2 w-[200px]">
              <h4 class="text-white text-sm font-medium truncate">{{ video.title }}</h4>
            </div>
          </div>
        </div>
        
        <button 
          @click="scroll('right', category.id)" 
          class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70"
          v-show="scrollStates[category.id]?.canScrollRight"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import { ref, reactive } from 'vue'
import LiveTVPlayer from './LiveTVPlayer.vue'

// API బేస్ URL ని కాన్స్టెంట్‌గా డిఫైన్ చేయడం
const API_BASE_URL = 'https://ott.no1news.in'

export default {
  name: 'CategorySection',
  components: {
    LiveTVPlayer
  },
  props: {
    title: {
      type: String,
      default: 'Categories'
    }
  },
  setup() {
    const categories = ref([])
    const categoryVideos = reactive({})
    const categoryLiveStreams = reactive({})
    const scrollStates = reactive({})
    const containerRefs = reactive({})
    const isPlayerOpen = ref(false)
    const selectedVideoUrl = ref('')
    const selectedVideoTitle = ref('')
    const pollingInterval = ref(null)
    const showViewAllModal = ref(false)
    const selectedCategory = ref(null)

    const setContainerRef = (el, categoryId) => {
      if (el) {
        containerRefs[categoryId] = el
      }
    }

    return {
      categories,
      categoryVideos,
      categoryLiveStreams,
      scrollStates,
      containerRefs,
      setContainerRef,
      isPlayerOpen,
      selectedVideoUrl,
      selectedVideoTitle,
      pollingInterval,
      showViewAllModal,
      selectedCategory
    }
  },
  mounted() {
    this.fetchCategories()
    // Start polling for updates every 5 seconds
    this.startPolling()
  },
  beforeUnmount() {
    // Clean up polling when component is destroyed
    this.stopPolling()
  },
  methods: {
    startPolling() {
      this.pollingInterval = setInterval(() => {
        if (this.categories.length > 0) {
          this.categories.forEach(category => {
            this.fetchLiveStreams(category.id)
          })
        }
      }, 5000)
    },
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
    },
    async fetchCategories() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/frontend/categories/`)
        if (response.data.status === 'success') {
          this.categories = response.data.data
          // Initialize scroll states for each category
          this.categories.forEach(category => {
            this.scrollStates[category.id] = {
              canScrollLeft: false,
              canScrollRight: true
            }
            // Fetch videos for each category
            this.fetchCategoryVideos(category.id)
            this.fetchLiveStreams(category.id)
          })
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    },
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
    async fetchCategoryVideos(categoryId, page = 1) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/videos/category/${categoryId}/?page=${page}&page_size=10`)
        if (response.data.status === 'success') {
          console.log('API Response Videos:', response.data.data.map(video => ({
            id: video.id,
            video_url: video.video_url,
            promo_url: video.promo_video_url,
            hls_url: video.promo_hls_url
          })));

          const processedVideos = response.data.data.map(video => ({
            ...video,
            title: this.capitalizeText(video.title),
            description: this.capitalizeText(video.description),
            is_live: false
          }));

          if (page === 1) {
            this.categoryVideos[categoryId] = {
              ...response.data,
              data: processedVideos
            }
          } else {
            this.categoryVideos[categoryId] = {
              ...response.data,
              data: [...(this.categoryVideos[categoryId]?.data || []), ...processedVideos]
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching videos for category ${categoryId}:`, error)
      }
    },
    async fetchLiveStreams(categoryId) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/live-streams/by_category/?category_id=${categoryId}`)
        const streams = response.data.map(stream => ({
          ...stream,
          title: this.capitalizeText(stream.title),
          description: this.capitalizeText(stream.description),
          is_live: true
        }))
        this.categoryLiveStreams[categoryId] = streams.sort((a, b) => a.order - b.order)
      } catch (error) {
        console.error(`Error fetching live streams for category ${categoryId}:`, error)
      }
    },
    async loadMoreVideos(categoryId) {
      const currentPage = this.categoryVideos[categoryId]?.pagination?.current_page || 1
      if (this.categoryVideos[categoryId]?.pagination?.has_next) {
        await this.fetchCategoryVideos(categoryId, currentPage + 1)
      }
    },
    scroll(direction, categoryId) {
      const container = this.containerRefs[categoryId]
      if (!container) return
      
      const scrollAmount = 300
      if (direction === 'left') {
        container.scrollLeft -= scrollAmount
      } else {
        container.scrollLeft += scrollAmount
      }
    },
    checkScroll(categoryId) {
      const container = this.containerRefs[categoryId]
      if (!container) return
      
      this.scrollStates[categoryId] = {
        canScrollLeft: container.scrollLeft > 0,
        canScrollRight: container.scrollLeft < (container.scrollWidth - container.clientWidth)
      }
    },
    playVideo(video) {
      // For regular videos, navigate to MovieDetails
      if (!video.live_url) {
        // Log the video URL we are using
        console.log('Playing video with URL:', {
          id: video.id,
          video_url: video.video_url,
          is_hls: video.video_url?.includes('.m3u8')
        });

        // Only use HLS URL
        const videoUrl = video.video_url;
        
        // Check if it's a valid HLS URL
        if (!videoUrl || !videoUrl.includes('.m3u8')) {
          console.error('Invalid or missing HLS URL:', video);
          return;
        }

        this.$router.push({
          name: 'MovieDetails',
          params: { 
            id: video.id,
            videoUrl: videoUrl,
            videoType: 'hls'
          }
        });
      }
    },
    playLiveStream(stream) {
      if (stream.live_url) {
        this.selectedVideoUrl = stream.live_url;
        this.selectedVideoTitle = stream.title;
        this.isPlayerOpen = true;
      }
    },
    closePlayer() {
      this.isPlayerOpen = false
      this.selectedVideoUrl = ''
      this.selectedVideoTitle = ''
    },
    isNewVideo(createdAt) {
      const videoDate = new Date(createdAt)
      const now = new Date()
      const diffDays = Math.ceil((now - videoDate) / (1000 * 60 * 60 * 24))
      return diffDays <= 7 // 7 days or newer
    },
    formatViews(views) {
      if (views >= 1000000) {
        return `${(views / 1000000).toFixed(1)}M`
      } else if (views >= 1000) {
        return `${(views / 1000).toFixed(1)}K`
      }
      return views.toString()
    },
    showAllVideos(category) {
      this.selectedCategory = category;
      this.showViewAllModal = true;
      // Fetch all videos for this category if not already loaded
      this.fetchCategoryVideos(category.id, 1, 100);
    },
    closeViewAllModal() {
      this.showViewAllModal = false;
      this.selectedCategory = null;
    },
  }
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Add these new styles */
.grid {
  display: grid;
  gap: 1rem;
}

/* Title styles */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

/* Modal animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.badge-new {
  background: rgba(220, 38, 38, 0.8);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-premium {
  background: rgba(195, 0, 89, 0.8); /* Changed to pink color */
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-rental {
  background: rgba(234, 179, 8, 0.8);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style> 