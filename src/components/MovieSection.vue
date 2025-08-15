<template>
  <section>
    <div class="flex justify-between items-center mb-3 pr-4">
      <div class="flex items-center gap-2">
        <h2 class="gradient-text font-semibold text-base md:text-lg">
          {{ title }}
        </h2>
        <span v-if="badge" class="badge px-2 py-1 text-xs font-bold rounded-full">
          {{ badge }}
        </span>
      </div>
      <a
        v-if="showViewAll"
        class="text-white font-semibold text-sm hover:underline whitespace-nowrap cursor-pointer"
        @click="handleViewAll"
      >
        View All
      </a>
    </div>
    <div class="relative">
      <button
        v-if="canScrollLeft"
        :aria-label="'Previous ' + title"
        :id="'prev' + sectionId"
        class="absolute -left-4 top-1/2 -translate-y-1/2 z-10 rounded-full hidden md:flex items-center justify-center p-2 text-white shadow-lg"
        style="background-color: #c30059"
        @click="scrollLeft"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <div
        :id="sectionId"
        class="flex gap-4 overflow-x-auto scrollbar-hide scroll-container snap-x snap-mandatory"
        ref="scrollContainer"
      >
        <div class="flex gap-4 pr-4">
        <MovieCard
          v-for="movie in movies"
          :key="movie.id"
          v-bind="movie"
            :isWebSeries="sectionId === 'trendingWebSeries'"
            class="snap-start"
        />
        </div>
      </div>
      <button
        v-if="canScrollRight"
        :aria-label="'Next ' + title"
        :id="'next' + sectionId"
        class="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full hidden md:flex items-center justify-center p-2 text-white shadow-lg"
        style="background-color: #c30059"
        @click="scrollRight"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </section>
</template>

<script>
import MovieCard from './MovieCard.vue'

export default {
  name: 'MovieSection',
  components: {
    MovieCard
  },
  props: {
    title: {
      type: String,
      required: true
    },
    sectionId: {
      type: String,
      required: true
    },
    movies: {
      type: Array,
      required: true
    },
    showViewAll: {
      type: Boolean,
      default: true
    },
    badge: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      canScrollLeft: false,
      canScrollRight: true
    }
  },
  mounted() {
    this.checkScrollButtons()
    this.$refs.scrollContainer?.addEventListener('scroll', this.checkScrollButtons)
  },
  beforeUnmount() {
    this.$refs.scrollContainer?.removeEventListener('scroll', this.checkScrollButtons)
  },
  methods: {
    handleViewAll() {
      // Navigate to appropriate page based on section
      if (this.sectionId === 'paidVideos') {
        this.$router.push('/premium-videos')
      } else if (this.sectionId === 'freeVideos') {
        this.$router.push('/free-videos')
      }
      // Add more conditions for other sections as needed
    },
    checkScrollButtons() {
      const container = this.$refs.scrollContainer
      if (!container) return
      
      // Check if we can scroll left
      this.canScrollLeft = container.scrollLeft > 0
      
      // Check if we can scroll right
      const maxScroll = container.scrollWidth - container.clientWidth
      this.canScrollRight = container.scrollLeft < maxScroll - 1 // -1 for rounding errors
    },
    scrollLeft() {
      const container = this.$refs.scrollContainer
      if (!container) return

      const cardWidth = 180 // Base card width + gap
      const visibleWidth = container.clientWidth
      const cardsToScroll = Math.floor(visibleWidth / cardWidth)
      const scrollAmount = cardWidth * cardsToScroll

      const targetScroll = Math.max(0, container.scrollLeft - scrollAmount)
      
      container.scrollTo({
        left: targetScroll,
          behavior: 'smooth'
        })
    },
    scrollRight() {
      const container = this.$refs.scrollContainer
      if (!container) return

      const cardWidth = 180 // Base card width + gap
      const visibleWidth = container.clientWidth
      const cardsToScroll = Math.floor(visibleWidth / cardWidth)
      const scrollAmount = cardWidth * cardsToScroll

      const maxScroll = container.scrollWidth - container.clientWidth
      const targetScroll = Math.min(maxScroll, container.scrollLeft + scrollAmount)
      
      container.scrollTo({
        left: targetScroll,
          behavior: 'smooth'
        })
    }
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.gradient-text {
  background: linear-gradient(45deg, #fff 30%, rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.scroll-container {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.badge {
  background: linear-gradient(45deg, #c30059, #ff6b9d);
  color: white;
  box-shadow: 0 2px 4px rgba(195, 0, 89, 0.3);
}
</style> 