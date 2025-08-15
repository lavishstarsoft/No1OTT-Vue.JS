<template>
  <section>
    <!-- Section Header -->
    <div class="flex items-center justify-between mb-4 px-2">
      <div class="flex items-center gap-3">
        <h2 class="text-lg font-medium">Regional Content (Comming Soon)</h2>
      </div>
      <button class="text-white hover:text-purple-400 flex items-center space-x-2 text-sm">
        <span>View All</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-[184px]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="flex justify-center items-center h-[184px]">
      <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-red-500">{{ error }}</p>
      </div>
    </div>

    <!-- States Horizontal Scroll -->
    <div v-if="!loading && !error" class="relative group">
      <!-- Scroll Container -->
      <div class="overflow-x-auto hide-scrollbar">
        <div class="flex gap-3 px-2">
          <!-- State Card - Clickable -->
          <div v-for="state in states" 
               :key="state.id" 
               class="group/card flex-shrink-0 w-[184px] relative rounded-lg overflow-hidden cursor-pointer"
               @click="goToRegionalPage(state)">
            <div class="aspect-[184/201] relative">
              <!-- State Image -->
              <img 
                :src="state.image || 'https://via.placeholder.com/184x201?text=State'" 
                :alt="state.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-110"
              >
              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover/card:opacity-70 transition-opacity"></div>
              
              <!-- State Info -->
              <div class="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover/card:translate-y-0 transition-transform">
                <h3 class="text-white font-semibold text-base mb-1 drop-shadow-lg line-clamp-1">{{ state.name }}</h3>
                <div class="flex items-center text-gray-300 text-xs space-x-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{{ state.districts_count }} Districts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Gradient -->
      <div class="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
    </div>
  </section>
</template>

<script>
import axios from 'axios'

export default {
  name: 'StatesSection',
  data() {
    return {
      states: [],
      loading: true,
      error: null
    }
  },
  methods: {
    // Function to navigate to regional page when state is clicked
    goToRegionalPage(state) {
      // Navigate to regional page with state ID as query parameter
      this.$router.push({
        path: '/regional',
        query: {
          state_id: state.id
        }
      })
    }
  },
  async created() {
    try {
      const response = await axios.get('https://ott.no1news.in/api/frontend/states/')
      if (response.data.status === 'success') {
        this.states = response.data.data
      } else {
        this.error = response.data.message || 'Failed to load states'
      }
    } catch (err) {
      console.error('Error fetching states:', err)
      this.error = 'Error loading states. Please try again later.'
    } finally {
      this.loading = false
    }
  }
}
</script>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style> 