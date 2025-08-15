<template>
  <div class="min-w-[160px] flex-shrink-0" @click="navigateToDetails">
    <div 
      class="relative rounded-md overflow-hidden card-container"
      :class="{
        'w-[160px] h-[240px]': !isWebSeries,
        'w-[280px] h-[157.5px]': isWebSeries
      }"
    >
      <div v-if="loading" class="absolute inset-0 bg-[#1d1d1d] flex items-center justify-center">
        <div class="w-8 h-8 border-2 border-[#c30059] border-t-transparent rounded-full animate-spin"></div>
      </div>
      <img
        :alt="title"
        class="w-full h-full object-cover"
        :src="portraitImage || image"
        @load="loading = false"
        @error="handleImageError"
      />
      <div v-if="imageError" class="absolute inset-0 bg-[#1d1d1d] flex items-center justify-center flex-col p-2">
        <i class="fas fa-image text-2xl text-[#c30059] mb-2"></i>
        <p class="text-xs text-center text-white/70">{{ title }}</p>
      </div>
      <div
        v-if="is4K"
        class="absolute top-1 right-1 badge-4k text-[10px] font-semibold uppercase px-1 rounded-sm flex items-center space-x-1"
      >
        <span>4K</span>
        <i class="fas fa-check-circle text-xs"></i>
      </div>
      <div
        v-if="isPremium"
        class="absolute bottom-1 right-1 badge-premium flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-sm"
      >
        <i class="fas fa-crown text-yellow-400"></i>
      </div>
    </div>
    <div :class="{
      'w-[160px]': !isWebSeries,
      'w-[280px]': isWebSeries
    }">
      <p class="mt-1 text-xs font-semibold truncate card-text">
        {{ title }}
        <i v-if="hasClosedCaptioning" class="fas fa-closed-captioning text-[9px]"></i>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MovieCard',
  props: {
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    portraitImage: {
      type: String,
      default: ''
    },
    isNewEpisode: {
      type: Boolean,
      default: false
    },
    is4K: {
      type: Boolean,
      default: false
    },
    isPremium: {
      type: Boolean,
      default: false
    },
    premiumText: {
      type: String,
      default: 'Premium'
    },
    hasClosedCaptioning: {
      type: Boolean,
      default: false
    },
    isWebSeries: {
      type: Boolean,
      default: false
    },
    id: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      loading: true,
      imageError: false
    }
  },
  methods: {
    handleImageError() {
      this.loading = false
      this.imageError = true
    },
    navigateToDetails() {
      this.$router.push({
        name: 'MovieDetails',
        params: { id: this.id }
      })
    }
  }
}
</script>

<style scoped>
.card-container {
  transition: transform 0.3s ease;
  cursor: pointer;
  background-color: #1d1d1d;
}

.card-container:hover {
  transform: translateY(-8px) scale(1.05);
  z-index: 10;
}

.card-text {
  transition: transform 0.3s ease;
  height: 1.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.card-container:hover + .card-text {
  transform: scale(1.1);
}

.badge-new-episode,
.badge-premium,
.badge-4k {
  background-color: #c30059 !important;
}

.badge-premium {
  background: rgba(195, 0, 89, 0.8); /* Changed to pink color */
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style> 