<template>
  <div class="min-h-screen bg-[#121212] text-white py-6">
    <div class="w-full px-2 md:px-4">
      <!-- Back Button and Header -->
      <div class="flex items-center mb-8 relative px-2 md:px-6">
        <button 
          @click="$router.back()" 
          class="text-white hover:text-gray-300 transition-colors absolute left-2 md:left-6 z-10"
        >
          <i class="fas fa-arrow-left text-2xl"></i>
        </button>
        <div class="w-full text-center">
          <h1 class="text-3xl font-bold relative inline-block px-4">
            Free Videos
            <div class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-500 to-green-800"></div>
          </h1>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>

      <!-- Videos Grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 px-2 md:px-6 mt-16 md:mt-0">
        <!-- Show Coming Soon message if no videos -->
        <div v-if="freeVideos.length === 0" class="col-span-full flex flex-col items-center justify-center py-16">
          <i class="fas fa-play-circle text-6xl text-gray-600 mb-4"></i>
          <h2 class="text-2xl font-bold text-gray-400 mb-2">No Free Videos</h2>
          <p class="text-gray-500 text-center">Free videos will be available soon.</p>
        </div>
        
        <!-- Show videos if available -->
        <div 
          v-else
          v-for="video in freeVideos" 
          :key="video.id"
          class="cursor-pointer group transform hover:scale-105 transition-transform duration-200"
          @click="playVideo(video)"
        >
          <!-- 16:9 Aspect Ratio Container -->
          <div class="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden mb-2">
            <img 
              :src="video.thumbnail_url" 
              :alt="video.title"
              class="w-full h-full object-cover"
            >
            
            <!-- Video badges -->
            <div class="absolute top-1 left-1 flex gap-1">
              <span v-if="isNewVideo(video.created_at)" class="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                NEW
              </span>
              <span class="bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                FREE
              </span>
            </div>
            
            <!-- Duration badge -->
            <div class="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-white">
              {{ formatDuration(video.duration) }}
            </div>
            
            <!-- Play button overlay -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
              <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <i class="fas fa-play text-sm text-white"></i>
              </div>
            </div>
          </div>

          <!-- Video Info -->
          <div class="px-1">
            <h3 class="text-sm font-medium mb-0.5 line-clamp-2">{{ video.title }}</h3>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMoreVideos" class="mt-6 text-center">
        <button 
          @click="loadMoreVideos" 
          class="bg-white/10 hover:bg-white/20 text-white px-5 py-1.5 rounded-full text-sm"
        >
          Load More
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'FreeVideos',
  setup() {
    const router = useRouter()
    const freeVideos = ref([])
    const currentPage = ref(1)
    const hasMoreVideos = ref(true)
    const loading = ref(true)
    const pageSize = 20

    const fetchFreeVideos = async (page = 1) => {
      try {
        loading.value = true
        // Fetch all videos and filter client-side to ensure we get free videos
        const response = await axios.get(`https://ott.no1news.in/api/videos/?page=${page}&page_size=${pageSize * 2}&ordering=-created_at`)
        
        if (response.data) {
          // Filter for free videos only (including videos without video_type set)
          const filtered = response.data.filter(video => 
            video.video_type === 'free' || 
            !video.video_type || 
            video.video_type === null
          )
          
          const processedVideos = filtered.map(video => ({
            ...video,
            title: capitalizeText(video.title),
            description: capitalizeText(video.description)
          }))

          if (page === 1) {
            freeVideos.value = processedVideos
          } else {
            freeVideos.value = [...freeVideos.value, ...processedVideos]
          }

          // Check if there are more videos
          hasMoreVideos.value = response.data.length === pageSize * 2
          currentPage.value = page
        }
      } catch (error) {
        console.error('Error fetching free videos:', error)
      } finally {
        loading.value = false
      }
    }

    const loadMoreVideos = () => {
      if (hasMoreVideos.value) {
        fetchFreeVideos(currentPage.value + 1)
      }
    }

    const playVideo = (video) => {
      router.push({
        name: 'MovieDetails',
        params: { 
          id: video.id,
          videoUrl: video.video_url,
          videoType: 'hls'
        }
      })
    }

    const capitalizeText = (text) => {
      if (!text) return '';
      return text.split(/[\s-]+/).map(word => {
        const specialWords = ['HD', 'UHD', '4K', 'TV', 'II', 'III', 'IV', 'SPY'];
        if (specialWords.includes(word.toUpperCase())) {
          return word.toUpperCase();
        }
        const minorWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'in', 'to', 'on', 'at', 'by', 'of'];
        if (minorWords.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(' ');
    }

    const isNewVideo = (createdAt) => {
      const videoDate = new Date(createdAt)
      const now = new Date()
      const diffDays = Math.ceil((now - videoDate) / (1000 * 60 * 60 * 24))
      return diffDays <= 7
    }

    const formatDuration = (seconds) => {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    onMounted(() => {
      fetchFreeVideos()
    })

    return {
      freeVideos,
      hasMoreVideos,
      loading,
      loadMoreVideos,
      playVideo,
      isNewVideo,
      formatDuration
    }
  }
}
</script>

<style scoped>
.aspect-video {
  aspect-ratio: 16/9;
}

/* Add gradient text effect */
h1 {
  background: linear-gradient(to right, #ffffff, #cccccc);
  -webkit-background-clip: text;
  background-clip: text;
  display: inline-block;
  padding-bottom: 4px;
  margin: 0 auto;
}

/* Add hover effect on back button */
button:hover i {
  transform: translateX(-3px);
  transition: transform 0.2s ease;
}

/* Add line clamp for title */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 