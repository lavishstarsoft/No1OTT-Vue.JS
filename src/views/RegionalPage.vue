<template>
  <div class="min-h-screen bg-[#111] text-white">
    <!-- Mobile Header (no card, just back arrow and title, title wraps if long) -->
    <div class="flex justify-center mt-8 mb-8 sm:hidden relative items-center min-h-[48px]">
            <button 
        @click="handleBack"
        class="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 shadow focus:outline-none"
        aria-label="Back"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
            </button>
      <h1 class="w-full text-center text-lg font-bold flex items-center justify-center whitespace-normal break-words pl-12">
        {{ currentTitle }}
      </h1>
    </div>

    <!-- Desktop Back Arrow (fixed) -->
          <button 
      @click="handleBack"
      class="hidden sm:flex fixed top-6 left-6 z-20 items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 shadow focus:outline-none"
      aria-label="Back"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
          </button>

    <!-- Desktop Header (no card, just title, no icon) -->
    <div class="hidden sm:flex justify-center mt-8 mb-8 items-center min-h-[48px]">
      <h1 class="w-full text-center text-2xl font-bold flex items-center justify-center">
        {{ currentTitle }}
      </h1>
            </div>
            
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="relative">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-pink-600 border-t-transparent"></div>
          <div class="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-ping"></div>
                </div>
        <div class="mt-6 text-xl font-medium text-white/80">Loading...</div>
        <div class="mt-2 text-sm text-white/60">Please wait</div>
            </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
        <div class="bg-red-600/20 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <div class="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 class="text-xl font-bold mb-2">Something went wrong</h3>
          <p class="text-white/70 mb-6">{{ error }}</p>
                  <button 
            @click="retry"
            class="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
            Try Again
                  </button>
              </div>
            </div>

      <!-- Content Grid -->
      <div v-else>
        <!-- Empty State -->
        <div v-if="items.length === 0" class="flex flex-col items-center justify-center py-20">
          <div class="text-white/40 text-8xl mb-6">📭</div>
          <h3 class="text-2xl font-bold mb-2">No Data</h3>
          <p class="text-white/60 text-center max-w-md">
            Nothing found at this level. Please go back and try a different selection.
          </p>
            </div>

        <!-- Items Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <button
            v-for="item in items"
                    :key="item.id"
            @click="selectItem(item)"
            class="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-102 hover:-translate-y-1 border border-white/10 hover:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
          >
            <!-- Image Container -->
            <div class="relative w-full pb-[56.25%] overflow-hidden">
              <!-- Loading Shimmer -->
              <div v-if="!item.imageLoaded" class="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse"></div>
              
              <!-- Image -->
              <img
                v-if="item.image_url"
                :src="item.image_url"
                :alt="item.name"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                @load="item.imageLoaded = true"
                @error="handleImageError(item)"
                loading="lazy"
              />
              
              <!-- Fallback Icon -->
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                <div class="text-4xl text-white/40">
                  <span v-if="!selectedState">🇮🇳</span>
                  <span v-else-if="!selectedDistrict">📍</span>
                  <span v-else-if="!selectedConstituency">🏘️</span>
                  <span v-else-if="!selectedMandal">🏘️</span>
                  <span v-else-if="!selectedVillage">🏡</span>
                  <span v-else>🎥</span>
            </div>
          </div>

              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <!-- Play Button for Videos -->
              <div v-if="selectedVillage" class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                {{ item.name }}
              </h3>
              
              <!-- Video Duration for Videos -->
              <div v-if="selectedVillage && item.duration" class="mt-2 text-center">
                <span class="inline-block px-2 py-1 bg-black/50 rounded text-xs font-medium">
                  {{ item.duration }}
                </span>
      </div>
    </div>

            <!-- Hover Border Effect -->
            <div class="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-pink-500/50 transition-all duration-300"></div>
      </button>
    </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://ott.no1news.in/api/',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

export default {
  name: 'RegionalContent',
  data() {
    return {
      loading: false,
      error: null,
      // Hierarchy
      states: [],
      districts: [],
      constituencies: [],
      mandals: [],
      villages: [],
      videos: [],
      // Selection
      selectedState: null,
      selectedDistrict: null,
      selectedConstituency: null,
      selectedMandal: null,
      selectedVillage: null
    }
  },
  computed: {
    canGoBack() {
      return this.selectedVillage || this.selectedMandal || this.selectedConstituency || this.selectedDistrict || this.selectedState
    },
    currentTitle() {
      if (!this.selectedState) return 'States'
      if (!this.selectedDistrict) return `${this.selectedState.name} Districts`
      if (!this.selectedConstituency) return `${this.selectedDistrict.name} Constituencies`
      if (!this.selectedMandal) return `${this.selectedConstituency.name} Mandals`
      if (!this.selectedVillage) return `${this.selectedMandal.name} Villages`
      return `${this.selectedVillage.name} Videos`
    },
    items() {
      if (!this.selectedState) return this.states
      if (!this.selectedDistrict) return this.districts
      if (!this.selectedConstituency) return this.constituencies
      if (!this.selectedMandal) return this.mandals
      if (!this.selectedVillage) return this.villages
      return this.videos
    }
  },
  methods: {
    handleImageError(item) {
      item.image_url = null
      item.imageLoaded = true
    },
    async fetchData(endpoint, params = {}, errorMessage) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(endpoint, { params })
        if (response.data.status === 'success') {
          return response.data.data.map(item => ({
            ...item,
            image_url: item.image_url || item.thumbnail || null,
            imageLoaded: false
          }))
        } else {
          throw new Error('Invalid response')
        }
      } catch (err) {
        console.error('API Error:', err)
        this.error = errorMessage
        return []
      } finally {
        this.loading = false
      }
    },
    async fetchStates() {
      let states = await this.fetchData(
        'frontend/states/',
        {},
        'Failed to load states data'
      )
      // Ensure image_url is set for each state
      this.states = states.map(s => ({
        ...s,
        image_url: s.image || s.image_url || null
      }))
    },
    async fetchDistricts(state) {
      this.districts = await this.fetchData(
        'frontend/districts/',
        { state_id: state.id },
        'Failed to load districts data'
      )
    },
    async fetchConstituencies(district) {
      this.constituencies = await this.fetchData(
        'frontend/constituencies/',
        { district_id: district.id },
        'Failed to load constituencies data'
      )
    },
    async fetchMandals(constituency) {
      this.mandals = await this.fetchData(
        'frontend/mandals/',
        { constituency_id: constituency.id },
        'Failed to load mandals data'
      )
    },
    async fetchVillages(mandal) {
      this.villages = await this.fetchData(
        'frontend/villages/',
        { mandal_id: mandal.id },
        'Failed to load villages data'
      )
    },
    async fetchVideos(village) {
      this.videos = await this.fetchData(
        'frontend/videos/',
        { village_id: village.id },
        'Failed to load videos data'
      )
    },
    async selectItem(item) {
      try {
        if (!this.selectedState) {
          this.selectedState = item
          this.selectedDistrict = null
      this.selectedConstituency = null
      this.selectedMandal = null
      this.selectedVillage = null
          await this.fetchDistricts(item)
        } else if (!this.selectedDistrict) {
          this.selectedDistrict = item
          this.selectedConstituency = null
      this.selectedMandal = null
      this.selectedVillage = null
          await this.fetchConstituencies(item)
        } else if (!this.selectedConstituency) {
          this.selectedConstituency = item
          this.selectedMandal = null
      this.selectedVillage = null
          await this.fetchMandals(item)
        } else if (!this.selectedMandal) {
          this.selectedMandal = item
          this.selectedVillage = null
          await this.fetchVillages(item)
        } else if (!this.selectedVillage) {
          this.selectedVillage = item
          await this.fetchVideos(item)
        }
      } catch (err) {
        console.error('Selection error:', err)
        this.error = 'Error occurred while selecting'
      }
    },
    async goBack() {
      if (this.selectedVillage) {
        this.selectedVillage = null
        this.videos = []
        if (this.selectedMandal) await this.fetchVillages(this.selectedMandal)
      } else if (this.selectedMandal) {
        this.selectedMandal = null
        this.villages = []
        if (this.selectedConstituency) await this.fetchMandals(this.selectedConstituency)
      } else if (this.selectedConstituency) {
        this.selectedConstituency = null
        this.mandals = []
        if (this.selectedDistrict) await this.fetchConstituencies(this.selectedDistrict)
      } else if (this.selectedDistrict) {
        this.selectedDistrict = null
        this.constituencies = []
        if (this.selectedState) await this.fetchDistricts(this.selectedState)
      } else if (this.selectedState) {
        this.selectedState = null
        this.districts = []
        await this.fetchStates()
      }
    },
    async retry() {
      if (!this.selectedState) {
        await this.fetchStates()
      } else if (!this.selectedDistrict) {
        await this.fetchDistricts(this.selectedState)
      } else if (!this.selectedConstituency) {
        await this.fetchConstituencies(this.selectedDistrict)
      } else if (!this.selectedMandal) {
        await this.fetchMandals(this.selectedConstituency)
      } else if (!this.selectedVillage) {
        await this.fetchVillages(this.selectedMandal)
      } else {
        await this.fetchVideos(this.selectedVillage)
      }
    },
    handleBack() {
      if (!this.selectedState) {
        this.$router.push('/')
        } else {
        this.goBack()
      }
    }
  },
  mounted() {
    this.fetchStates().then(async () => {
    const stateId = this.$route.query.state_id
      if (stateId && this.states.length > 0) {
        const state = this.states.find(s => String(s.id) === String(stateId))
      if (state) {
          this.selectedState = state
          this.selectedDistrict = null
          this.selectedConstituency = null
          this.selectedMandal = null
          this.selectedVillage = null
          await this.fetchDistricts(state)
        }
      }
    })
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style> 