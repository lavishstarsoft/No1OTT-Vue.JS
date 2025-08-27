<template>
  <div class="regional-content-page min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <!-- Video Player Modal -->
    <div v-if="showPlayer" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <AdvancedVideoPlayer
        :src="selectedVideo?.video_url"
        :poster="selectedVideo?.thumbnail_url || selectedVideo?.thumbnail || defaultVideoImg"
        :title="selectedVideo?.title"
        :video-id="selectedVideo?.id"
        :user-id="userId"
        :autoplay="true"
        @close="closePlayer"
      />
      <button @click="closePlayer" class="absolute top-4 right-4 text-white text-3xl font-bold">&times;</button>
    </div>
    <!-- Back Button -->
    <div class="container mx-auto px-4 pt-6 pb-2 flex items-center">
      <button @click="goBack" class="flex items-center gap-2 px-3 py-1 bg-gray-800 text-white rounded-full text-sm font-medium hover:bg-purple-600 shadow transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        <span>Back</span>
      </button>
      <div class="flex-1"></div>
    </div>
    <!-- Step-by-step Guide -->

    <!-- Breadcrumb with Images -->
    <div class="container mx-auto px-4 mb-4">
      <div class="flex flex-wrap items-center gap-2">
        <button @click="resetFilters" class="flex items-center gap-1 px-3 py-1 bg-gray-700 text-white rounded-full text-sm font-medium hover:bg-blue-600">
          <span>All Regions</span>
          </button>
        <template v-for="(item, idx) in breadcrumbItems" :key="idx">
          <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
          <button @click="navigateToBreadcrumb(idx)" class="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white rounded-full text-sm font-medium hover:bg-purple-600">
            
            <span>{{ item.name }}</span>
            </button>
          </template>
      </div>
    </div>

    <!-- States Grid (when no state is selected) -->
    <div v-if="!selectedState" class="container mx-auto px-4 mb-8">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-white mb-4 text-center">Select Your State</h2>
        <p class="text-gray-300 text-center mb-6">Choose your state to find regional videos</p>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <button 
          v-for="state in states" 
          :key="state.id"
          @click="selectState(state)"
          class="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-white/10 hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          <!-- Image Container -->
          <div class="relative w-full pb-[100%] overflow-hidden">
            <!-- Loading Shimmer -->
            <div v-if="!state.imageLoaded" class="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse"></div>
            
            <!-- Image -->
            <img
              :src="state.image || defaultStateImg"
              :alt="state.name"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              @load="state.imageLoaded = true"
              @error="handleStateImageError"
              loading="lazy"
            />

            <!-- Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <!-- Selection Indicator -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="w-12 h-12 bg-blue-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-blue-400/50">
                <svg class="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-3">
            <h3 class="font-bold text-sm text-center line-clamp-2 group-hover:text-blue-300 transition-colors duration-200">
              {{ state.name }}
            </h3>
          </div>

          <!-- Hover Border Effect -->
          <div class="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-500/50 transition-all duration-300"></div>
        </button>
      </div>
    </div>

    <!-- Districts Grid (when state is selected but no district) -->
    <div v-else-if="selectedState && !selectedDistrict" class="container mx-auto px-4 mb-8">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-white mb-4 text-center">Select Your District</h2>
        <p class="text-gray-300 text-center mb-6">Choose your district in {{ selectedStateObj?.name }}</p>
      </div>
      
      <!-- Loading Districts Animation -->
      <div v-if="loadingDistricts">
        <!-- Loading Spinner -->
        <div class="flex flex-col items-center justify-center py-8 mb-6">
          <div class="relative">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
            <div class="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-ping"></div>
          </div>
          <div class="mt-6 text-xl font-medium text-white/80">Loading Districts...</div>
          <div class="mt-2 text-sm text-white/60">Please wait while we fetch district data</div>
        </div>
        
        <!-- Loading Skeleton Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          <div v-for="n in 8" :key="n" class="loading-skeleton-card">
            <div class="w-full pb-[100%] bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse rounded-t-xl"></div>
            <div class="p-3">
              <div class="h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Error Districts -->
      <div v-else-if="errorDistricts" class="flex flex-col items-center justify-center py-12">
        <div class="bg-red-600/20 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <div class="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 class="text-xl font-bold mb-2">Error Loading Districts</h3>
          <p class="text-white/70 mb-6">{{ errorDistricts }}</p>
          <button 
            @click="retryLoadDistricts"
            class="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
      
      <!-- Districts Grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <button 
          v-for="district in districts" 
          :key="district.id"
          @click="selectDistrict(district)"
          class="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-white/10 hover:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/30"
        >
          <!-- Image Container -->
          <div class="relative w-full pb-[100%] overflow-hidden">
            <!-- Loading Shimmer -->
            <div v-if="!district.imageLoaded" class="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse"></div>
            
            <!-- Image -->
            <img
              :src="district.image || defaultDistrictImg"
              :alt="district.name"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              @load="district.imageLoaded = true"
              @error="handleDistrictImageError"
              loading="lazy"
            />

            <!-- Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <!-- Selection Indicator -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-green-400/50">
                <svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-3">
            <h3 class="font-bold text-sm text-center line-clamp-2 group-hover:text-green-300 transition-colors duration-200">
              {{ district.name }}
            </h3>
          </div>

          <!-- Hover Border Effect -->
          <div class="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-green-500/50 transition-all duration-300"></div>
        </button>
      </div>
    </div>
        
    <!-- Filters as Cards with Inline Search (when district is selected) -->
    <div v-else-if="selectedDistrict" class="container mx-auto px-4 mb-8">
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <!-- Constituency Card -->
        <div class="filter-card-mobile">
          <img :src="selectedConstituencyObj && selectedConstituencyObj.image ? selectedConstituencyObj.image : defaultConstituencyImg" class="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-yellow-400 shadow mb-2" alt="Constituency Image" />
          <select v-model="selectedConstituency" @change="onConstituencyChange" class="filter-select-mobile" :disabled="!constituencies.length">
                <option value="">Select Constituency</option>
            <option v-for="constituency in constituencies" :key="constituency.id" :value="constituency.id">{{ constituency.name }}</option>
              </select>
              </div>
        <!-- Mandal Card -->
        <div class="filter-card-mobile">
          <img :src="selectedMandalObj && selectedMandalObj.image ? selectedMandalObj.image : defaultMandalImg" class="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-purple-400 shadow mb-2" alt="Mandal Image" />
          <select v-model="selectedMandal" @change="onMandalChange" class="filter-select-mobile" :disabled="!mandals.length">
                <option value="">Select Mandal</option>
            <option v-for="mandal in mandals" :key="mandal.id" :value="mandal.id">{{ mandal.name }}</option>
              </select>
              </div>
        <!-- Village Card - Full width on mobile -->
        <div class="filter-card-mobile col-span-2 sm:col-span-1">
          <img :src="selectedVillageObj && selectedVillageObj.image ? selectedVillageObj.image : defaultVillageImg" class="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-pink-400 shadow mb-2" alt="Village Image" />
          <select v-model="selectedVillage" @change="fetchVideos" class="filter-select-mobile" :disabled="!villages.length">
                <option value="">Select Village</option>
            <option v-for="village in villages" :key="village.id" :value="village.id">{{ village.name }}</option>
              </select>
            </div>
          </div>
        </div>

    <!-- Videos Section -->
    <div v-if="selectedDistrict && !loadingVideos && videos.length" class="container mx-auto px-4 pb-20 md:pb-8">
      <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        <button v-for="video in videos" 
          :key="video.id" 
          @click="playVideo(video)"
          class="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-102 hover:-translate-y-1 border border-white/10 hover:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
        >
          <!-- Image Container -->
          <div class="relative w-full pb-[56.25%] overflow-hidden">
            <!-- Loading Shimmer -->
            <div v-if="!video.imageLoaded" class="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse"></div>
            
            <!-- Image -->
            <img
              v-if="video.thumbnail_url || video.thumbnail"
              :src="video.thumbnail_url || video.thumbnail || defaultVideoImg"
              :alt="video.title"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              @load="video.imageLoaded = true"
              @error="handleImageError"
              loading="lazy"
            />

            <!-- Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <!-- Play Button -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-4">
            <h3 class="font-bold text-lg text-center line-clamp-2 group-hover:text-pink-300 transition-colors duration-200">
              {{ video.title }}
            </h3>
          </div>

          <!-- Hover Border Effect -->
          <div class="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-pink-500/50 transition-all duration-300"></div>
        </button>
      </div>
    </div>

    <!-- Loading Videos Section -->
    <div v-if="selectedDistrict && loadingVideos" class="container mx-auto px-4 pb-20 md:pb-8">
      <div class="flex flex-col items-center justify-center py-12">
        <div class="relative">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-8 h-8 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p class="mt-4 text-gray-400 text-lg">Loading videos...</p>
      </div>
    </div>

    <!-- Error Videos Section -->
    <div v-if="selectedDistrict && errorVideos" class="container mx-auto px-4 pb-20 md:pb-8">
      <div class="flex flex-col items-center justify-center py-12">
        <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 class="text-lg font-semibold text-red-400 mb-2">Error</h3>
          <p class="text-gray-300 mb-4">{{ errorVideos }}</p>
          <button @click="fetchVideos" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Try Again</button>
        </div>
      </div>
    </div>

    <!-- No Videos Section -->
    <div v-if="selectedDistrict && !loadingVideos && !videos.length && !errorVideos" class="container mx-auto px-4 pb-20 md:pb-8">
      <div class="flex flex-col items-center justify-center py-16">
        <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 max-w-md text-center">
          <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
                     <h3 class="text-xl font-semibold text-gray-300 mb-2">No Videos Found</h3>
          <p class="text-gray-400 mb-4">No videos found for the selected criteria. Please try selecting a different region.</p>
          <button @click="resetFilters" class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">View All Videos</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import AdvancedVideoPlayer from '@/components/AdvancedVideoPlayer.vue'

const api = axios.create({
  baseURL: 'https://ott.no1news.in/api/',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

export default {
  name: 'RegionalContent',
  data() {
    return {
      // Filters and region data
      states: [],
      districts: [],
      constituencies: [],
      mandals: [],
      villages: [],
      videos: [],
      selectedState: '',
      selectedDistrict: '',
      selectedConstituency: '',
      selectedMandal: '',
      selectedVillage: '',
      // Loading and error states
      loadingVideos: false,
      loadingDistricts: false,
      loadingConstituencies: false,
      loadingMandals: false,
      loadingVillages: false,
      errorVideos: null,
      errorDistricts: null,
      errorConstituencies: null,
      errorMandals: null,
      errorVillages: null,
      // Images
      defaultStateImg: 'https://i.pinimg.com/736x/e4/26/4a/e4264af50836a4d71345ad3c6362a1bc.jpg',
      defaultDistrictImg: 'https://i.pinimg.com/736x/e4/26/4a/e4264af50836a4d71345ad3c6362a1bc.jpg',
      defaultConstituencyImg: 'https://i.pinimg.com/736x/e4/26/4a/e4264af50836a4d71345ad3c6362a1bc.jpg',
      defaultMandalImg: 'https://i.pinimg.com/736x/e4/26/4a/e4264af50836a4d71345ad3c6362a1bc.jpg',
      defaultVillageImg: 'https://i.pinimg.com/736x/e4/26/4a/e4264af50836a4d71345ad3c6362a1bc.jpg',
      defaultVideoImg: 'https://i.pinimg.com/736x/e4/26/4a/e4264af50836a4d71345ad3c6362a1bc.jpg',
      // Video player modal state
      showPlayer: false,
      selectedVideo: null,
      userId: 1, // Replace with actual user id if available
    }
  },
  computed: {
    selectedStateObj() {
      return this.states.find(s => s.id === this.selectedState) || null
    },
    selectedDistrictObj() {
      return this.districts.find(d => d.id === this.selectedDistrict) || null
    },
    selectedConstituencyObj() {
      return this.constituencies.find(c => c.id === this.selectedConstituency) || null
    },
    selectedMandalObj() {
      return this.mandals.find(m => m.id === this.selectedMandal) || null
    },
    selectedVillageObj() {
      return this.villages.find(v => v.id === this.selectedVillage) || null
    },
    breadcrumbItems() {
      const items = []
      if (this.selectedStateObj) items.push({ name: this.selectedStateObj.name, image: this.selectedStateObj.image || this.defaultStateImg })
      if (this.selectedDistrictObj) items.push({ name: this.selectedDistrictObj.name, image: this.selectedDistrictObj.image || this.defaultDistrictImg })
      if (this.selectedConstituencyObj) items.push({ name: this.selectedConstituencyObj.name, image: this.selectedConstituencyObj.image || this.defaultConstituencyImg })
      if (this.selectedMandalObj) items.push({ name: this.selectedMandalObj.name, image: this.selectedMandalObj.image || this.defaultMandalImg })
      if (this.selectedVillageObj) items.push({ name: this.selectedVillageObj.name, image: this.selectedVillageObj.image || this.defaultVillageImg })
      return items
    }
  },
  watch: {
    // Watch for route changes to handle state_id parameter updates
    '$route.query.state_id': {
      handler: async function(newStateId) {
        if (newStateId && this.states.length > 0) {
          const state = this.states.find(s => String(s.id) === String(newStateId))
          if (state && this.selectedState !== state.id) {
            console.log('🗺️ Route changed, auto-selecting state:', state.name)
            this.selectedState = state.id
            await this.onStateChange()
          }
        } else if (!newStateId && this.selectedState) {
          // If state_id is removed from URL, reset selection
          this.resetFilters()
        }
      },
      immediate: false
    }
  },
  async created() {
    await this.fetchStates()
    
    // Check if state_id is provided in query parameters after states are loaded
    const stateId = this.$route.query.state_id
    if (stateId && this.states.length > 0) {
      const state = this.states.find(s => String(s.id) === String(stateId))
      if (state) {
        console.log('🗺️ Auto-selecting state from URL:', state.name)
        this.selectedState = state.id
        await this.onStateChange()
        return // Exit early since onStateChange handles video fetching
      }
    }
    
    // Only fetch videos if no state was auto-selected
    this.fetchVideos()
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    async fetchData(endpoint, params = {}, errorMessage) {
      this.loadingVideos = true
      this.errorVideos = null
      try {
        const response = await api.get(endpoint, { params })
        if (response.data.status === 'success') {
          return response.data.data.map(item => ({
            ...item,
            image: item.image || item.image_url || null
          }))
        } else {
          throw new Error('Invalid response')
        }
      } catch (err) {
        console.error('API Error:', err)
        this.errorVideos = errorMessage
        return []
      } finally {
        this.loadingVideos = false
      }
    },
    async fetchStates() {
      try {
        const response = await api.get('frontend/states/')
        if (response.data.status === 'success') {
          this.states = response.data.data.map(item => ({
            ...item,
            image: item.image || item.image_url || null,
            imageLoaded: false
          }))
          console.log('🗺️ States loaded:', this.states.length)
        } else {
          throw new Error('Invalid response')
        }
      } catch (err) {
        console.error('States API Error:', err)
        this.errorVideos = 'States load చేయడంలో లోపం'
      }
    },
    async onStateChange() {
      this.selectedDistrict = ''
      this.selectedConstituency = ''
      this.selectedMandal = ''
      this.selectedVillage = ''
      this.districts = []
      this.constituencies = []
      this.mandals = []
      this.villages = []
      this.errorDistricts = null
      
      if (this.selectedState) {
        this.loadingDistricts = true
        console.log('🏛️ Loading districts for state:', this.selectedStateObj?.name)
        try {
          const response = await api.get('frontend/districts/', { 
            params: { state_id: this.selectedState } 
          })
          if (response.data.status === 'success') {
            this.districts = response.data.data.map(item => ({
              ...item,
              image: item.image || item.image_url || null,
              imageLoaded: false
            }))
            console.log('🏛️ Districts loaded:', this.districts.length)
          } else {
            throw new Error('Invalid response')
          }
        } catch (err) {
          console.error('Districts API Error:', err)
          this.errorDistricts = 'Districts load చేయడంలో లోపం. దయచేసి మళ్లీ ప్రయత్నించండి.'
        } finally {
          this.loadingDistricts = false
        }
      }
      this.fetchVideos()
    },
    async onDistrictChange() {
      this.selectedConstituency = ''
      this.selectedMandal = ''
      this.selectedVillage = ''
      this.constituencies = []
      this.mandals = []
      this.villages = []
      if (this.selectedDistrict) {
        this.constituencies = await this.fetchData('frontend/constituencies/', { district_id: this.selectedDistrict }, 'Constituencies load చేయడంలో లోపం')
      }
      this.fetchVideos()
    },
    async onConstituencyChange() {
      this.selectedMandal = ''
      this.selectedVillage = ''
      this.mandals = []
      this.villages = []
      if (this.selectedConstituency) {
        this.mandals = await this.fetchData('frontend/mandals/', { constituency_id: this.selectedConstituency }, 'Mandals load చేయడంలో లోపం')
      }
      this.fetchVideos()
    },
    async onMandalChange() {
      this.selectedVillage = ''
      this.villages = []
      if (this.selectedMandal) {
        this.villages = await this.fetchData('frontend/villages/', { mandal_id: this.selectedMandal }, 'Villages load చేయడంలో లోపం')
      }
      this.fetchVideos()
    },
    async fetchVideos() {
      this.loadingVideos = true
      this.errorVideos = null
      try {
        let url = 'https://ott.no1news.in/api/regional-videos/by_location/?'
        if (this.selectedVillage) {
          url += `village_id=${this.selectedVillage}&`
        } else if (this.selectedMandal) {
          url += `mandal_id=${this.selectedMandal}&`
        } else if (this.selectedConstituency) {
          url += `constituency_id=${this.selectedConstituency}&`
        } else if (this.selectedDistrict) {
          url += `district_id=${this.selectedDistrict}&`
        } else if (this.selectedState) {
          url += `state_id=${this.selectedState}&`
        }
        const res = await axios.get(url)
        this.videos = res.data?.data || res.data || []
      } catch (err) {
        this.errorVideos = err.response?.data?.message || 'వీడియోలు లొడింగ్ లో లోపం. దయచేసి మళ్లీ ప్రయత్నించండి.'
      } finally {
        this.loadingVideos = false
      }
    },
    resetFilters() {
      this.selectedState = ''
      this.selectedDistrict = ''
      this.selectedConstituency = ''
      this.selectedMandal = ''
      this.selectedVillage = ''
      this.districts = []
      this.constituencies = []
      this.mandals = []
      this.villages = []
      this.stateSearch = ''
      this.districtSearch = ''
      this.constituencySearch = ''
      this.mandalSearch = ''
      this.villageSearch = ''
      this.fetchVideos()
    },
    navigateToBreadcrumb(index) {
      if (index === 0) {
        this.selectedDistrict = ''
        this.selectedConstituency = ''
        this.selectedMandal = ''
        this.selectedVillage = ''
        this.onStateChange()
      } else if (index === 1) {
        this.selectedConstituency = ''
        this.selectedMandal = ''
        this.selectedVillage = ''
        this.onDistrictChange()
      } else if (index === 2) {
        this.selectedMandal = ''
        this.selectedVillage = ''
        this.onConstituencyChange()
      } else if (index === 3) {
        this.selectedVillage = ''
        this.onMandalChange()
      }
    },
    handleImageError(event) {
      event.target.src = this.defaultVideoImg
      const video = this.videos.find(v => v.thumbnail_url === event.target.src || v.thumbnail === event.target.src)
      if (video) {
        video.imageLoaded = true
      }
    },
    handleStateImageError(event) {
      event.target.src = this.defaultStateImg
      const state = this.states.find(s => s.image === event.target.src || s.image_url === event.target.src)
      if (state) {
        state.imageLoaded = true
      }
    },
    handleDistrictImageError(event) {
      event.target.src = this.defaultDistrictImg
      const district = this.districts.find(d => d.image === event.target.src || d.image_url === event.target.src)
      if (district) {
        district.imageLoaded = true
      }
    },
    async selectState(state) {
      console.log('🗺️ State selected:', state.name)
      this.selectedState = state.id
      this.selectedDistrict = ''
      this.selectedConstituency = ''
      this.selectedMandal = ''
      this.selectedVillage = ''
      this.districts = []
      this.constituencies = []
      this.mandals = []
      this.villages = []
      await this.onStateChange()
    },
    selectDistrict(district) {
      this.selectedDistrict = district.id
      this.selectedConstituency = ''
      this.selectedMandal = ''
      this.selectedVillage = ''
      this.constituencies = []
      this.mandals = []
      this.villages = []
      this.onDistrictChange()
    },
    formatDuration(duration) {
      if (!duration) return ''
      if (typeof duration === 'number') {
        const min = Math.floor(duration / 60)
        const sec = duration % 60
        return `${min}:${sec.toString().padStart(2, '0')}`
      }
      if (typeof duration === 'string' && duration.includes(':')) {
        const parts = duration.split(':').map(Number)
        let sec = 0
        if (parts.length === 3) {
          sec = parts[0] * 3600 + parts[1] * 60 + parts[2]
        } else if (parts.length === 2) {
          sec = parts[0] * 60 + parts[1]
        } else {
          sec = Number(parts[0])
        }
        const min = Math.floor(sec / 60)
        const remSec = sec % 60
        return `${min}:${remSec.toString().padStart(2, '0')}`
      }
      return duration
    },
    playVideo(video) {
      this.selectedVideo = video
      this.showPlayer = true
    },
    closePlayer() {
      this.showPlayer = false
      this.selectedVideo = null
    },
    
    // Retry methods for different data types
    async retryLoadDistricts() {
      if (this.selectedState) {
        await this.onStateChange()
      }
    }
  },
  components: {
    AdvancedVideoPlayer
  }
}
</script>

<style scoped>
.regional-content-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
}

/* Mobile margin bottom */
@media (max-width: 768px) {
  .regional-content-page {
    margin-bottom: 5rem;
  }
}

/* Mobile-first filter card */
.filter-card-mobile {
  background: #23233b;
  border-radius: 1rem;
  box-shadow: 0 2px 8px 0 rgba(44, 62, 80, 0.08);
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 120px;
}

/* Village card specific styles for mobile */
@media (max-width: 640px) {
  .filter-card-mobile.col-span-2 {
    background: linear-gradient(135deg, #23233b 0%, #2a2a4a 100%);
    border: 2px solid rgba(236, 72, 153, 0.3);
    box-shadow: 0 4px 15px rgba(236, 72, 153, 0.2);
  }
  
  .filter-card-mobile.col-span-2:hover {
    border-color: rgba(236, 72, 153, 0.5);
    box-shadow: 0 6px 20px rgba(236, 72, 153, 0.3);
  }
}

@media (min-width: 640px) {
  .filter-card-mobile {
    min-height: 180px;
    padding: 1.5rem 1rem;
  }
}
/* Mobile-first input/select */
.filter-search-mobile {
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid #4c1d95;
  background: #18181b;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
}
.filter-select-mobile {
  width: 100%;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid #4c1d95;
  background: #18181b;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
}

.video-card {
  background: #23233b;
  border-radius: 1rem;
  box-shadow: 0 2px 8px 0 rgba(44, 62, 80, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: auto;
}

/* State and District Grid Cards */
.state-district-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.state-district-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  border-color: rgba(59, 130, 246, 0.5);
}

.state-district-card:active {
  transform: translateY(-2px);
}

/* Loading Shimmer Animation */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.shimmer {
  background: linear-gradient(90deg, #2a2a3e 25%, #3a3a4e 50%, #2a2a3e 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}

/* Selection Indicator Animation */
.selection-indicator {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* Responsive Grid Adjustments */
@media (max-width: 640px) {
  .state-district-card {
    min-height: 120px;
  }
  
  .state-district-card h3 {
    font-size: 0.875rem;
    line-height: 1.2;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .state-district-card {
    min-height: 140px;
  }
}

@media (min-width: 1025px) {
  .state-district-card {
    min-height: 160px;
  }
}

/* Loading Skeleton Card */
.loading-skeleton-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: skeleton-pulse 1.5s ease-in-out infinite alternate;
}

@keyframes skeleton-pulse {
  0% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

/* Enhanced Shimmer Animation */
@keyframes enhanced-shimmer {
  0% {
    background-position: -200px 0;
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    background-position: calc(200px + 100%) 0;
    opacity: 0.6;
  }
}

.enhanced-shimmer {
  background: linear-gradient(90deg, #2a2a3e 25%, #4a4a6e 50%, #2a2a3e 75%);
  background-size: 200px 100%;
  animation: enhanced-shimmer 2s infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-card {
    min-height: 140px;
    padding: 0.75rem 0.25rem;
  }
  .video-card {
    min-height: 180px;
  }
  .filter-search, .filter-select {
    font-size: 0.85rem;
    padding: 0.4rem 0.7rem;
  }
  
  .loading-skeleton-card {
    min-height: 120px;
  }
}
</style> 