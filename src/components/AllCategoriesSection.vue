<template>
  <section class="mb-8">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-medium gradient-text">{{ title }}</h2>
    </div>
    
    <div class="relative">
      <button 
        @click="scroll('left')" 
        class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70 nav-button"
        v-show="canScrollLeft"
        v-spatial-nav
        tabindex="0"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      
      <div 
        ref="containerRef"
        class="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        @scroll="checkScroll"
      >
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="flex-shrink-0 relative group cursor-pointer category-card"
          @click="selectCategory(category)"
          @keydown.enter="selectCategory(category)"
          v-spatial-nav
          tabindex="0"
        >
          <div 
            class="w-[256px] aspect-[16/9] bg-gray-800 rounded-lg overflow-hidden relative category-inner"
          >
            <img 
              :src="category.image || '/images/placeholder.png'" 
              :alt="category.name"
              class="w-full h-full object-cover transition-transform duration-300"
              @error="handleImageError"
            >
            
            <!-- Category badges -->
            <div class="absolute top-2 left-2 flex gap-2">
              <span v-if="category.is_premium" class="flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-sm" style="background: rgba(195, 0, 89, 0.8); border: 1px solid rgba(255, 255, 255, 0.2);">
                <i class="fas fa-crown text-yellow-400"></i>
              </span>
            </div>
            
            <!-- Hover/Focus overlay with gradient -->
            <div 
              class="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent transition-opacity flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100"
            >
              <div class="text-center w-full px-4 py-2">
                <h3 class="text-white text-lg font-bold mb-1 drop-shadow-lg capitalize">{{ category.name }}</h3>
                <p class="text-white/80 text-xs font-medium drop-shadow-lg line-clamp-2">{{ category.description }}</p>
              </div>
            </div>
          </div>
          <!-- Category title below image -->
          <div class="mt-2 text-center">
            <h3 
              class="text-white text-sm font-medium truncate px-2 transition-colors duration-200"
            >
              {{ category.name }}
            </h3>
          </div>
        </div>
      </div>
      
      <button 
        @click="scroll('right')" 
        class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70 nav-button"
        v-show="canScrollRight"
        v-spatial-nav
        tabindex="0"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE_URL = 'https://ott.no1news.in'
const DEFAULT_IMAGE = '/images/placeholder.png'

export default {
  name: 'AllCategoriesSection',
  props: {
    title: {
      type: String,
      default: 'Browse By Categories'
    }
  },
  setup() {
    const router = useRouter()
    const categories = ref([])
    const containerRef = ref(null)
    const canScrollLeft = ref(false)
    const canScrollRight = ref(true)

    const handleImageError = (event) => {
      event.target.src = DEFAULT_IMAGE
      event.target.removeEventListener('error', handleImageError)
    }

    const capitalizeText = (text) => {
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
    }

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`/api/categories/active/`)
        categories.value = response.data
          .filter(category => ![19].includes(category.id)) // Hide LIVE CHANNELS and HOT SEAT WITH MSR
          .map(category => ({
            ...category,
            name: capitalizeText(category.name),
            description: capitalizeText(category.description),
            image: category.image ? 
              (category.image.startsWith('http') ? category.image : `${API_BASE_URL}${category.image}`)
              : DEFAULT_IMAGE
          }))
      } catch (error) {
        console.error('Error fetching categories:', error)
        categories.value = []
      }
    }

    const scroll = (direction) => {
      if (!containerRef.value) return
      const scrollAmount = 300
      containerRef.value.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount
    }

    const checkScroll = () => {
      if (!containerRef.value) return
      canScrollLeft.value = containerRef.value.scrollLeft > 0
      canScrollRight.value = containerRef.value.scrollLeft < (containerRef.value.scrollWidth - containerRef.value.clientWidth)
    }

    const selectCategory = (category) => {
      router.push({
        name: 'CategoryVideos',
        params: { id: category.id }
      })
    }

    onMounted(() => {
      fetchCategories()
    })

    return {
      categories,
      containerRef,
      canScrollLeft,
      canScrollRight,
      scroll,
      checkScroll,
      selectCategory,
      handleImageError
    }
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

.category-card {
  position: relative;
  transition: all 0.3s ease;
}

.category-card:focus {
  outline: none;
}

.category-card.is-focused {
  z-index: 10;
}

.category-card.is-focused .category-inner {
  transform: scale(1.05);
  box-shadow: 0 0 0 4px #007bff, 0 0 20px rgba(0, 123, 255, 0.5);
  border-radius: 8px;
}

.category-card.is-focused .category-inner::after {
  content: '';
  position: absolute;
  inset: -2px;
  border: 2px solid #4da3ff;
  border-radius: 10px;
  animation: pulse 2s infinite;
}

/* Hide hover effects on mobile */
@media (max-width: 768px) {
  .group-hover\:opacity-100 {
    opacity: 0 !important;
  }
  
  /* Always show category title below image on mobile */
  .category-card .text-sm {
    opacity: 1 !important;
    color: white !important;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
}

.nav-button.spatial-nav-focus {
  background-color: rgba(0, 0, 0, 0.8);
  box-shadow: 0 0 0 3px #007bff, 0 0 15px rgba(0, 123, 255, 0.5);
}
</style> 