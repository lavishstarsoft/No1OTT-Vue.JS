<template>
  <div v-if="shouldShowOnThisPage && showPopup" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Simple dark overlay -->
    <div 
      class="absolute inset-0 bg-[#000000E8] bg-opacity-95"
      @click="closePopup"
    ></div>
    
    <!-- Popup card with plain background -->
    <div 
      class="relative w-auto h-auto max-w-full max-h-full transform transition-all duration-300 scale-100 rounded-xl p-0"
      :class="{'scale-100 opacity-100': showPopup, 'scale-95 opacity-0': !showPopup}"
    >
      <!-- Minimal close button -->
      <button 
        v-if="popupConfig.popupSettings?.dismissible"
        @click="closePopup"
        class="absolute -top-6 right-5 w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
        title="Close popup"
        aria-label="Close popup"
        style="margin-left: 8%"
         >
        <svg class="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 6l12 12M6 18L18 6" stroke-linecap="round" />
        </svg>
      </button>
      <!-- Content with Android modal style -->
      <div class="p-0 flex flex-col items-center justify-center">
        <!-- Image at the top center if available -->
        <div v-if="popupConfig.popupContent?.imageUrl && !imageError" class="flex justify-center mb-4 mt-2">
          <img 
            :src="popupConfig.popupContent.imageUrl" 
            :alt="popupConfig.popupContent.title" 
            :style="{
              width: typeof popupConfig.popupContent.imageWidth === 'string'
                ? popupConfig.popupContent.imageWidth
                : (popupConfig.popupContent.imageWidth || 80) + 'px',
              height: typeof popupConfig.popupContent.imageHeight === 'string'
                ? popupConfig.popupContent.imageHeight
                : (popupConfig.popupContent.imageHeight || 80) + 'px'
            }"
            class="object-cover rounded-none max-w-full h-auto" 
            @error="handleImageError" 
          />
        </div>
        <!-- Title with mixed typography -->
        <h2 v-if="popupConfig.popupContent?.title" class="text-center mb-4">
          <span class="block text-3xl font-light tracking-wide text-white mb-1">{{ popupConfig.popupContent.title.split(' ')[0] }}</span>
          <span class="block text-3xl font-black italic text-white" style="font-family: 'Arial Black', sans-serif;">{{ popupConfig.popupContent.title.split(' ').slice(1).join(' ') }}</span>
        </h2>
        <!-- Clean message text -->
        <p v-if="popupConfig.popupContent?.message" class="text-white/90 text-center mb-6 text-base leading-relaxed">
          {{ popupConfig.popupContent.message }}
        </p>
        <!-- Simple action buttons -->
        <div class="flex flex-col gap-3 w-full">
          <button 
            v-if="popupConfig.popupContent?.buttonText"
            @click="handleAction"
            class="w-full bg-white text-indigo-700 py-3 rounded-lg font-semibold text-base hover:bg-gray-100 transition-colors duration-200 shadow"
          >
            {{ popupConfig.popupContent.buttonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import popupManager from '@/utils/popupManager.js';

export default {
  name: 'PopupModal',
  data() {
    return {
      showPopup: false,
      popupConfig: {
        showPopup: false,
        popupContent: {},
        popupSettings: {}
      },
      imageError: false,
      hasShownPopup: false,
      currentDevice: 'desktop'
    }
  },
  async mounted() {
    this.detectDevice();
    await this.loadPopupConfig();
    this.checkAndShowPopup();
  },
  computed: {
    shouldShowOnThisPage() {
      const pages = this.popupConfig.popupSettings?.showOnPages;
      // If showOnPages not set, show everywhere. Else, only show if current route name is in array.
      return !pages || pages.includes(this.$route?.name);
    }
  },
  watch: {
    showPopup(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  },
  beforeUnmount() {
    document.body.style.overflow = '';
  },
  methods: {
    async loadPopupConfig() {
      try {
        this.popupConfig = await popupManager.loadConfig();
      } catch (error) {
        console.error('Error loading popup config:', error);
        this.popupConfig = popupManager.getDefaultConfig();
      }
    },
    detectDevice() {
      this.currentDevice = popupManager.isMobileDevice() ? 'mobile' : 'desktop';
      console.log('Current device detected:', this.currentDevice);
    },
    checkAndShowPopup() {
      if (popupManager.shouldShowPopup()) {
        const delay = popupManager.getPopupDelay();
        setTimeout(() => {
          this.showPopup = true;
          this.hasShownPopup = true;
          this.playPopupSound(); // Play sound when popup opens
        }, delay);
      } else {
        console.log('Popup not shown. Device type:', this.currentDevice, 'Config device type:', this.popupConfig.popupSettings?.deviceType);
      }
    },
    playPopupSound() {
      const url = this.popupConfig.popupContent?.soundUrl;
      if (url) {
        const audio = new Audio(url);
        audio.play();
      }
    },
    closePopup() {
      this.showPopup = false;
      popupManager.markPopupAsShown();
    },
    handleAction() {
      this.closePopup();
      this.$emit('popup-action');
    },
    handleImageError() {
      this.imageError = true;
    },
    showPopupManually() {
      this.showPopup = true;
    },
    resetPopup() {
      popupManager.resetPopupState();
      this.hasShownPopup = false;
      this.showPopup = false;
    }
  }
}
</script>

<style scoped>
/* Simple animations */
.popup-enter-active, .popup-leave-active {
  transition: all 0.3s ease;
}

.popup-enter-from, .popup-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Clean button focus state */
button:focus-visible {
  outline: 2px solid #000000FF;
  outline-offset: 2px;
}

/* Simple hover effect */
button {
  position: relative;
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .popup-container {
    margin: 1rem;
  }
  
  h2 {
    font-size: 1.75rem;
  }
  
  p {
    font-size: 1rem;
  }
}

/* Android style shadow */
.shadow-2xl {
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
</style> 