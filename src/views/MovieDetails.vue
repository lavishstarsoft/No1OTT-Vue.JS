<template>
  <div class="movie-details-wrapper bg-[#121212] text-white min-h-screen">
    <!-- Advanced Video Player modal - Full screen when active -->
    <div v-if="isVideoPlaying" class="advanced-video-player-modal" @mousemove="showControlsOnInteraction" @touchstart="showControlsOnInteraction" @click="toggleControlsVisibility">
      <AdvancedVideoPlayer 
        ref="videoPlayer"
        :src="videoUrl"
        :title="movie.title"
        :video-id="movie.id"
        :user-id="currentUserId"
        :streamType="streamType"
        :autoplay="true"
        :isLive="false"
        :drmConfig="drmConfig"
        :controlsVisible="controlsVisible"
        @close="closeVideo"
        @play="onVideoPlay"
        @pause="onVideoPause"
        @interaction="showControlsOnInteraction"
        @error="handleVideoError"
      />
    </div>

    <!-- Desktop header with gradient overlay -->
    <div class="hide-on-mobile header-with-gradient">
      <AppHeader @toggle-search="toggleSearch" :hideBackButton="true" />
    </div>
    
    <div class="movie-detail-container">
      <!-- Hero Banner Section with Backdrop Image -->
      <div class="movie-backdrop">
        <!-- Thumbnail background -->
        <img 
          :src="isMobileDevice && movie.portrait_thumbnail_url ? movie.portrait_thumbnail_url : movie.thumbnail_url" 
          alt="Movie Thumbnail"
          :class="['backdrop-image', {'portrait-mobile': isMobileDevice && movie.portrait_thumbnail_url}]"
          v-show="!isPromoPlaying && !isPromoLoading"
        />
        <!-- Video overlay -->
        <div v-if="movie.promo_hls_url" class="video-container">
          <!-- Loading spinner -->
          <div v-if="isPromoLoading" class="video-loading"></div>
          <video 
            ref="heroVideo"
            class="backdrop-video"
            :poster="movie.thumbnail_url"
            autoplay
            muted
            loop
            playsinline
            preload="auto"
            @loadeddata="onPromoVideoLoaded"
            @ended="handlePromoVideoEnd"
            @error="handlePromoVideoError"
            @waiting="onPromoVideoWaiting"
            @playing="onPromoVideoPlaying"
            @canplay="onPromoVideoCanPlay"
            v-show="isPromoPlaying && !isPromoLoading"
            style="width: 100vw; max-width: 100vw; aspect-ratio: 16/9; object-fit: contain; background: #000; display: block; margin: 0 auto; max-height: 70vh;"
          >
          </video>
        </div>
        <div class="backdrop-gradient"></div>
      </div>

      <!-- Mobile-only back button -->
      <button 
        class="back-btn mobile-only-element"
        @click="goBack"
      >
        <i class="fas fa-arrow-left"></i>
      </button>

      <!-- Movie Info Section -->
      <div class="movie-info-container">
        <!-- Movie Badges -->
        <div class="movie-badges">
          <span v-if="movie.video_type === 'paid'" class="badge premium">
            <i class="fas fa-crown mr-1"></i>
            Premium
          </span>
          <span v-if="movie.is4K" class="badge quality">4K</span>
        </div>

        <!-- Movie Title -->
        <h1 class="movie-title">{{ movie.title }}</h1>
        
        <!-- Movie Meta Info -->
        <div class="movie-meta">
          <span>{{ movieYear }}</span>
          <span class="dot-divider"></span>
          <span>{{ formattedDuration }}</span>
          <span class="dot-divider"></span>
          <span>{{ categoryName }}</span>
          <!-- Rental price display for rental videos (only for free users) -->
          <template v-if="movie.video_type === 'rental' && movie.prices && movie.prices.length && !isUserSubscribed">
            <span class="dot-divider"></span>
            <span class="badge premium">
              <i class="fas fa-ticket-alt mr-1"></i>
              Rental:
              <template v-for="(price, idx) in movie.prices" :key="price.id">
                ₹{{ price.rental_price }} for {{ formatWatchPeriod(price.rental_duration) }}<span v-if="idx < movie.prices.length - 1">, </span>
              </template>
            </span>
          </template>
          <span v-if="movie.video_type === 'paid' && movie.rental_price" class="premium-price ml-2">
            ₹{{ movie.rental_price }}
          </span>
        </div>
        
        <!-- Movie Tags -->
        <div v-if="movie.mood1 || movie.mood2" class="movie-tags">
          <span v-if="movie.mood1" class="tag">{{ movie.mood1 }}</span>
          <span v-if="movie.mood2" class="tag">{{ movie.mood2 }}</span>
        </div>
        
        <!-- Movie Description -->
        <p class="movie-description">
          {{ movie.description }}
        </p>
        
        <!-- Action Buttons - Unified design for both desktop and mobile -->
        <div class="action-buttons">
          <button v-if="shouldShowPromoButton" class="play-button" @click="playPromo">
            <i class="fas fa-film"></i>
            <span>Promo</span>
          </button>

          <button class="play-button" @click="playMovie">
            <i class="fas fa-play"></i>
            <span>Full Video</span>
          </button>
          
          <button 
            class="secondary-button" 
            @click="toggleWatchlist"
            :class="{ 'in-watchlist': isInWatchlist }"
          >
            <i :class="['fas', isInWatchlist ? 'fa-bookmark' : 'fa-bookmark-o']"></i>
            {{ isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist' }}
          </button>
          <button class="action-button" @click="shareMovie">
            <i class="fas fa-share-alt"></i>
            <span class="action-label">Share</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Main content sections with carousel style like Home page -->
    <main class="pl-4 sm:pl-6 md:pl-10 py-4 space-y-8 relative overflow-hidden">
      <!-- Related Videos by Category Section -->
      <section>
        <div class="flex justify-between items-center mb-3 pr-4">
          <h2 class="gradient-text font-semibold text-base md:text-lg">
            {{ categoryName }} 
          </h2>
          <a 
            class="text-white font-semibold text-sm hover:underline whitespace-nowrap cursor-pointer" 
            @click="navigateToCategory"
          >
            View All
          </a>
        </div>
        <div class="relative carousel-container">
          <button
            v-if="canScrollLeft.category"
            aria-label="Previous Category Videos"
            class="scroll-button left-scroll-button"
            @click="scrollLeft('categoryContainer')"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <div
            class="flex gap-4 overflow-x-auto scrollbar-hide scroll-container snap-x snap-mandatory"
            ref="categoryContainer"
            @scroll="checkScrollButtons('categoryContainer', 'category')"
          >
            <div class="flex gap-4 pr-4 carousel-inner-container">
              <div 
                v-for="(video, index) in categoryVideos" 
                :key="index" 
                class="related-movie-card snap-start"
                @click="navigateToMovie(video.id)"
              >
                <div class="relative rounded-md overflow-hidden card-container">
                  <img :src="video.portrait_thumbnail_url || video.thumbnail_url || video.poster_url" :alt="video.title" class="related-movie-image">
                  <!-- Premium badge for paid videos -->
                  <div v-if="video.video_type === 'paid'" class="absolute top-2 right-2">
                    <span class="bg-gradient-to-r from-[#c30059] to-[#ff0062] text-white text-xs px-2 py-1 rounded-full font-semibold">
                      <i class="fas fa-crown mr-1"></i>Premium
                    </span>
                </div>
                  <!-- 4K badge -->
                  <div v-if="video.is4K" class="absolute top-2 left-2">
                    <span class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      4K
                    </span>
                </div>
                </div>
                <p class="related-movie-title mt-1 text-xs font-semibold truncate card-text">
                  {{ capitalizeText(video.title) }}
                </p>
              </div>
            </div>
          </div>
          <button
            v-if="canScrollRight.category"
            aria-label="Next Category Videos"
            class="scroll-button right-scroll-button"
            @click="scrollRight('categoryContainer')"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </section>
      

      <!-- Recently Added Section -->
      <section>
        <div class="flex justify-between items-center mb-3 pr-4">
          <h2 class="gradient-text font-semibold text-base md:text-lg">
            Recently Added
          </h2>
        </div>
        <div class="relative carousel-container">
          <button
            v-if="canScrollLeft.recentlyAdded"
            aria-label="Previous Recently Added"
            class="scroll-button left-scroll-button"
            @click="scrollLeft('recentlyAddedContainer')"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <div
            class="flex gap-4 overflow-x-auto scrollbar-hide scroll-container snap-x snap-mandatory"
            ref="recentlyAddedContainer"
            @scroll="checkScrollButtons('recentlyAddedContainer', 'recentlyAdded')"
          >
            <div class="flex gap-4 pr-4 carousel-inner-container">
              <div 
                v-for="(video, index) in recentlyAddedVideos" 
                :key="index" 
                class="related-movie-card snap-start"
                @click="navigateToMovie(video.id)"
              >
                <div class="relative rounded-md overflow-hidden card-container">
                  <img :src="video.portrait_thumbnail_url || video.thumbnail_url || video.poster_url" :alt="video.title" class="related-movie-image">
                  <!-- Premium badge for paid videos -->
                  <div v-if="video.video_type === 'paid'" class="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#c30059] to-[#ff0062] shadow">
                    <i class="fas fa-crown text-white text-base"></i>
                  </div>
                  <!-- 4K badge -->
                  <div v-if="video.is4K" class="absolute bottom-2 left-2">
                    <span class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      4K
                    </span>
                  </div>
                </div>
                <p class="related-movie-title mt-1 text-xs font-semibold truncate card-text">
                  {{ capitalizeText(video.title) }}
                </p>
              </div>
            </div>
          </div>
          <button
            v-if="canScrollRight.recentlyAdded"
            aria-label="Next Recently Added"
            class="scroll-button right-scroll-button"
            @click="scrollRight('recentlyAddedContainer')"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </section>
    </main>

    <!-- Mobile Search Bar -->
    <div class="mobile-search-bar" :class="{ active: isSearchActive }">
      <input type="text" placeholder="Search movies, shows and more...">
      <button class="text-white" @click="toggleSearch">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Payment Popup -->
    <div v-if="showPaymentPopup" class="payment-popup-overlay">
      <div class="payment-popup">
        <div class="popup-header">
          <div class="flex items-center gap-3">
            <div class="premium-badge">
              <i class="fas fa-crown"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold">Premium Content</h2>
              <p class="text-sm text-white/60">Subscribe to Continue Watching</p>
            </div>
          </div>
          <button @click="closePaymentPopup" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="popup-content">
          <!-- Movie Preview -->
          <div class="movie-preview">
            <img :src="movie.thumbnail_url || movie.poster_url" alt="Movie Thumbnail" class="popup-thumbnail">
            <div class="movie-info">
              <h3 class="movie-title">{{ movie.title }}</h3>
              <div class="flex items-center gap-2 text-sm text-white/60">
                <span v-if="formattedDuration">{{ formattedDuration }}</span>
                <span v-if="formattedDuration && categoryName" class="dot-divider"></span>
                <span>{{ categoryName }}</span>
              </div>
            </div>
          </div>

          <!-- Premium Features -->
          <div class="premium-features">
            <h4 class="text-lg font-semibold mb-4">Premium Benefits</h4>
            <div class="features-grid">
              <div class="feature-item">
                <i class="fas fa-film text-[#c30059]"></i>
                <div>
                  <p class="font-medium">All Premium Content</p>
                  <p class="text-sm text-white/60">Unlimited access to premium movies & shows</p>
                </div>
              </div>
              <div class="feature-item">
                <i class="fas fa-tv text-[#c30059]"></i>
                <div>
                  <p class="font-medium">Watch on Any Device</p>
                  <p class="text-sm text-white/60">TV, laptop, phone, or tablet</p>
                </div>
              </div>
              <div class="feature-item">
                <i class="fas fa-ban text-[#c30059]"></i>
                <div>
                  <p class="font-medium">Ad-Free Experience</p>
                  <p class="text-sm text-white/60">Uninterrupted entertainment</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <button @click="handleSubscribe" class="subscribe-button">
            <span>View Plans & Subscribe</span>
            <i class="fas fa-arrow-right"></i>
          </button>

          <!-- Price Note -->
          <p class="text-center text-sm text-white/60 mt-4">
            Plans start from ₹365/year (₹1/day)
          </p>
        </div>
      </div>
    </div>

    <!-- Add Rental Popup -->
    <div v-if="showRentalPopup" class="payment-popup-overlay">
      <div class="payment-popup">
        <div class="popup-header">
          <div class="flex items-center gap-3">
            <div class="premium-badge">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold">{{ movie.title }}</h2>
              <p class="text-sm text-white/60">
                {{ formatWatchPeriod(movie.prices[0].rental_duration) }} Rental
              </p>
            </div>
          </div>
          <button @click="showRentalPopup = false" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="popup-content">
          <!-- Movie Preview -->
          <div class="movie-preview">
            <img :src="movie.thumbnail_url || movie.poster_url" alt="Movie Thumbnail" class="popup-thumbnail">
            <div class="movie-info">
              <h3 class="movie-title">{{ movie.title }}</h3>
              <div class="flex items-center gap-2 text-sm text-white/60">
                <span v-if="formattedDuration">{{ formattedDuration }}</span>
                <span v-if="formattedDuration && categoryName" class="dot-divider"></span>
                <span>{{ categoryName }}</span>
              </div>
            </div>
          </div>

          <!-- Rental Details -->
          <div class="rental-details bg-white/5 rounded-lg p-4 my-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-white/60">Rental Price</span>
              <span class="text-xl font-bold">₹{{ movie.prices[0].rental_price }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-white/60">Watch Period</span>
              <span>{{ formatWatchPeriod(movie.prices[0].rental_duration) }}</span>
            </div>
          </div>

          <!-- Action Button -->
          <button @click="goToRentalPayment" class="subscribe-button">
            <span>Rent for {{ formatWatchPeriod(movie.prices[0].rental_duration) }} at ₹{{ movie.prices[0].rental_price }}</span>
            <i class="fas fa-arrow-right"></i>
          </button>

          <!-- Terms -->
          <p class="text-center text-sm text-white/60 mt-4">
            Available to watch for {{ formatWatchPeriod(movie.prices[0].rental_duration) }} after payment
          </p>
        </div>
      </div>
    </div>

    <AppFooter />

    <!-- Share Dialog -->
    <div v-if="showShareDialog" class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div class="bg-[#1d1d1d] rounded-xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">Share "{{ movie.title }}"</h3>
          <button @click="showShareDialog = false" class="text-white/60 hover:text-white">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Movie Preview with Image -->
        <div class="flex items-center gap-4 mb-6 p-4 bg-[#121212] rounded-lg">
          <img 
            :src="movie.thumbnail_url || movie.portrait_thumbnail_url || movie.poster_url" 
            :alt="movie.title"
            class="w-16 h-24 object-cover rounded-lg"
          />
          <div class="flex-1">
            <h4 class="font-semibold text-white mb-1">{{ movie.title }}</h4>
            <p class="text-sm text-gray-400 line-clamp-2">{{ movie.description }}</p>
          </div>
        </div>

        <!-- Share Options -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <!-- WhatsApp -->
          <button 
            @click="shareToWhatsAppWithImage"
            class="flex items-center gap-3 bg-[#25D366]/10 p-4 rounded-lg hover:bg-[#25D366]/20 transition-all"
          >
            <i class="fab fa-whatsapp text-[#25D366] text-2xl"></i>
            <span>WhatsApp</span>
          </button>

          <!-- Facebook -->
          <button 
            @click="shareToFacebook"
            class="flex items-center gap-3 bg-[#1877F2]/10 p-4 rounded-lg hover:bg-[#1877F2]/20 transition-all"
          >
            <i class="fab fa-facebook text-[#1877F2] text-2xl"></i>
            <span>Facebook</span>
          </button>

          <!-- Twitter -->
          <button 
            @click="shareToTwitter"
            class="flex items-center gap-3 bg-[#1DA1F2]/10 p-4 rounded-lg hover:bg-[#1DA1F2]/20 transition-all"
          >
            <i class="fab fa-twitter text-[#1DA1F2] text-2xl"></i>
            <span>Twitter</span>
          </button>

          <!-- Copy Link -->
          <button 
            @click="copyShareLink"
            class="flex items-center gap-3 bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-all"
          >
            <i class="fas fa-link text-white text-2xl"></i>
            <span>Copy Link</span>
          </button>
        </div>

        <!-- Test Social Preview Button -->
        <div class="mb-6">
          <button 
            @click="testSocialPreview"
            class="w-full flex items-center justify-center gap-3 bg-[#c30059]/10 p-4 rounded-lg hover:bg-[#c30059]/20 transition-all border border-[#c30059]/20"
          >
            <i class="fas fa-eye text-[#c30059] text-xl"></i>
            <span class="text-[#c30059] font-medium">Test Social Media Preview</span>
          </button>
        </div>

        <!-- Share Link -->
        <div class="relative">
          <input 
            ref="shareLink"
            type="text"
            :value="shareUrl"
            class="w-full bg-[#121212] border border-white/10 rounded-lg h-12 px-4 pr-24 text-white focus:border-[#c30059] focus:outline-none transition-colors"
            readonly
          />
          <button 
            @click="copyShareLink"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[#c30059] hover:text-[#a80048] transition-colors"
          >
            {{ copyStatus }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppHeader from '../components/Header.vue'
import AppFooter from '../components/Footer.vue'
import AdvancedVideoPlayer from '../components/AdvancedVideoPlayer.vue'
import axios from 'axios'
import { watchlistAPI } from '@/utils/api'
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import store from '@/store';

// Define API base URL constant
const API_BASE_URL = 'https://ott.no1news.in'

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getters.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default {
  name: 'MovieDetails',
  components: {
    AppHeader,
    AppFooter,
    AdvancedVideoPlayer
  },
  props: {
    id: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      movie: {},
      inWatchlist: false,
      isSearchActive: false,
      isVideoPlaying: false,
      controlsVisible: true,
      isVideoPaused: false,
      controlsTimeout: null,
      isMobileDevice: false,
      videoInteractionDelay: 2500,
      videoUrl: '',
      streamType: 'hls',
      isUserSubscribed: false,
      promoStartDelay: 3000, // 3 seconds delay before starting promo
      drmConfig: {
        // DRM configuration if needed
        // Example for Widevine:
        servers: {
          'com.widevine.alpha': 'https://license.url/widevine'
        },
        // Example for Clear Key:
        clearKeys: {
          // keyId: 'key' pairs
        }
      },
      playerSettings: {
        defaultQuality: 'auto',
        preferredQualityIndex: 1,
        skipInterval: 10, // seconds
        keyboardShortcutsEnabled: true,
        rememberLastPosition: true,
        autoQualitySwitch: true
      },
      canScrollLeft: {
        category: false,
        related: false,
        recentlyAdded: false
      },
      canScrollRight: {
        category: true,
        related: true,
        recentlyAdded: true
      },
      categoryVideos: [],
      recentlyAddedVideos: [],
      relatedMovies: [
        {
          id: 101,
          title: 'Midnight Mystery',
          thumbnail_url: 'https://i.ibb.co/cDfWsvC/related1.jpg',
          portrait_thumbnail_url: 'https://i.ibb.co/cDfWsvC/related1.jpg',
          video_type: 'free'
        },
        {
          id: 102,
          title: 'The Stranger',
          thumbnail_url: 'https://i.ibb.co/DkFnm7g/related2.jpg',
          portrait_thumbnail_url: 'https://i.ibb.co/DkFnm7g/related2.jpg',
          video_type: 'paid'
        },
        {
          id: 103,
          title: 'Dark Echo',
          thumbnail_url: 'https://i.ibb.co/MRVvFDZ/related3.jpg',
          portrait_thumbnail_url: 'https://i.ibb.co/MRVvFDZ/related3.jpg',
          video_type: 'free'
        },
        {
          id: 104,
          title: 'Silent Night',
          thumbnail_url: 'https://i.ibb.co/5cG2WXF/related4.jpg',
          portrait_thumbnail_url: 'https://i.ibb.co/5cG2WXF/related4.jpg',
          video_type: 'rental'
        },
        {
          id: 105,
          title: 'The Guilty',
          thumbnail_url: 'https://i.ibb.co/mBVR2KM/related5.jpg',
          portrait_thumbnail_url: 'https://i.ibb.co/mBVR2KM/related5.jpg',
          video_type: 'free'
        },
        {
          id: 106,
          title: 'Trance',
          thumbnail_url: 'https://i.ibb.co/hWD1BXg/related6.jpg',
          portrait_thumbnail_url: 'https://i.ibb.co/hWD1BXg/related6.jpg',
          video_type: 'paid'
        },
        {
          id: 107,
          title: 'Haunted House',
          thumbnail_url: 'https://i.ibb.co/k8DQzTF/related7.jpg',
          portrait_thumbnail_url: 'https://i.ibb.co/k8DQzTF/related7.jpg',
          video_type: 'free'
        },
        {
          id: 108,
          title: 'Night Watch',
          thumbnail_url: 'https://i.ibb.co/hyCJTBL/related8.jpg',
          portrait_thumbnail_url: 'https://i.ibb.co/hyCJTBL/related8.jpg',
          video_type: 'rental'
        },
        {
          id: 109,
          title: 'The Missing',
          thumbnail_url: 'https://i.ibb.co/dj8rS0M/related9.jpg',
          portrait_thumbnail_url: 'https://i.ibb.co/dj8rS0M/related9.jpg',
          video_type: 'free'
        },
        {
          id: 110,
          title: 'Fear Factor',
          thumbnail_url: 'https://i.ibb.co/8XvX1fL/related10.jpg',
          portrait_thumbnail_url: 'https://i.ibb.co/8XvX1fL/related10.jpg',
          video_type: 'paid'
        },
        {
          id: 111,
          title: 'Paranormal',
          thumbnail_url: 'https://i.ibb.co/r57Kzc5/related11.jpg',
          portrait_thumbnail_url: 'https://i.ibb.co/r57Kzc5/related11.jpg',
          video_type: 'free'
        },
        {
          id: 112,
          title: 'Last Breath',
          thumbnail_url: 'https://i.ibb.co/B6wS7HK/related12.jpg',
          portrait_thumbnail_url: 'https://i.ibb.co/B6wS7HK/related12.jpg',
          video_type: 'rental'
        }
      ],
      heroVideo: null,
      hls: null,
      showPaymentPopup: false,
      userSubscriptionStatus: null,
      showRentalPopup: false,
      rentalInfo: null,
      isSubscribed: false,
      isPromoLoading: true,
      promoVideoError: null,
      isPlayingPromo: false,
      isInWatchlist: false,
      showShareDialog: false,
      copyStatus: 'Copy',
      promoHasError: false,
      videojsPlayer: null,
      shakaPromoPlayer: null,
      isPromoPlaying: false
    }
  },
  computed: {
    // Get current user ID from localStorage
    currentUserId() {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          return userData.id || 1; // Default to 1 if no user ID
        } catch (e) {
          return 1; // Default to 1 if parsing fails
        }
      }
      return 1; // Default to 1 if no user data
    },
    // Get the appropriate stream type based on the video URL or device capabilities
    computedStreamType() {
      // Check if the URL ends with specific extensions
      if (this.videoUrl.includes('.m3u8')) {
        return 'hls';
      } else if (this.videoUrl.includes('.mpd')) {
        return 'dash';
      } else if (this.videoUrl.includes('.mp4')) {
        // Explicitly handle MP4 files
        return 'mp4';
      }
      // Default fallback
      return 'mp4';
    },
    // Get the year from created_at
    movieYear() {
      if (this.movie && this.movie.created_at) {
        return new Date(this.movie.created_at).getFullYear();
      }
      return new Date().getFullYear(); // Fallback to current year
    },
    // Format duration from seconds to hours and minutes
    formattedDuration() {
      if (!this.movie || !this.movie.duration) return '';
      
      const totalSeconds = parseInt(this.movie.duration);
      if (isNaN(totalSeconds)) return '';
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      
      if (hours === 0) {
        return `${minutes}m`;
      } else if (minutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    },
    // Get category name
    categoryName() {
      if (!this.movie) return '';
      return this.movie.category_name || ''; // Directly use category_name from API
    },
    // Get formatted categories
    formattedCategories() {
      if (!this.movie || !this.movie.categories) return '';
      return this.movie.categories.map(cat => cat.name).join(', ');
    },
    
    shareUrl() {
      if (typeof window !== 'undefined') {
        return window.location.href;
      }
      return '';
    },
    
    // Check if promo button should be shown
    shouldShowPromoButton() {
      return this.movie && 
             this.movie.promo_hls_url && 
             this.movie.promo_hls_url.trim() !== '';
      // Removed promoHasError check - button should show even if CORS error
      // User can still try to play after fixing CORS
    }
  },
  watch: {
    // Watch for route changes to reset scroll position when navigating between movie details pages
    '$route'() {
      window.scrollTo(0, 0);
      this.fetchMovieDetails().then(() => {
        // Initialize hero video after fetching new movie details
        this.$nextTick(() => {
          this.initializeHeroVideo();
        });
      });
    },
    // Update stream type based on the video URL
    videoUrl: {
      immediate: true,
      handler(newUrl) {
        // Update stream type based on the new URL
        if (newUrl) {
          this.streamType = this.computedStreamType;
        }
      }
    },
    // Add watcher for movie data
    movie: {
      immediate: true,
      handler(newMovie) {
        if (newMovie && (newMovie.promo_hls_url || newMovie.promo_video_url)) {
          this.$nextTick(() => {
            this.initializeHeroVideo();
          });
        }
        
        // Update meta tags when movie data changes
        if (newMovie) {
          this.$nextTick(() => {
            this.updateMetaTags();
          });
        }
      }
    },
    // Debug watcher for isPromoPlaying
    isPromoPlaying(val) {
      console.log('isPromoPlaying changed:', val);
    }
  },
  mounted() {
    // Initialize hero video with HLS
    this.initializeHeroVideo();
    
    this.$nextTick(() => {
      this.checkScrollButtons('categoryContainer', 'category')
      this.checkScrollButtons('relatedContainer', 'related')
      this.checkScrollButtons('recentlyAddedContainer', 'recentlyAdded')
      
      // Check if mobile device
      this.checkDeviceType()
      
      // Listen for resize events to update device type
      window.addEventListener('resize', this.checkDeviceType)

      // Add scroll event listener for header background
      window.addEventListener('scroll', this.handleScroll)
      
      // Update meta tags after component is mounted
      if (this.movie) {
        this.updateMetaTags();
      }
    })
  },
  beforeUnmount() {
    // Clean up HLS instance
    if (this.hls) {
      this.hls.destroy();
    }
    
    // Clean up resize listener
    window.removeEventListener('resize', this.checkDeviceType)
    
    // Clean up scroll listener
    window.removeEventListener('scroll', this.handleScroll)
    
    // Clear any active control timeouts
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout)
    }
    if (this.videojsPlayer) {
      this.videojsPlayer.dispose();
      this.videojsPlayer = null;
    }
  },
  created() {
    // Get video URL from route params if available
    if (this.$route.params.videoUrl) {
      this.videoUrl = this.$route.params.videoUrl;
      this.streamType = this.$route.params.videoType || 'hls';
    }
    
    // Check subscription status
    this.checkUserSubscription().then(isSubscribed => {
      this.isUserSubscribed = isSubscribed;
    });
    
    // Fetch movie details
    this.fetchMovieDetails();
    
    // Load any saved player preferences from localStorage
    this.loadPlayerPreferences();
    this.checkWatchlistStatus();
  },
  methods: {
    formatWatchPeriod(days) {
      if (!days) return '';
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    },
    
    loadPlayerPreferences() {
      // Load user preferences from localStorage
      const savedPreferences = localStorage.getItem('player-preferences');
      if (savedPreferences) {
        try {
          const preferences = JSON.parse(savedPreferences);
          // Apply only the properties that exist in our settings object
          Object.keys(this.playerSettings).forEach(key => {
            if (preferences[key] !== undefined) {
              this.playerSettings[key] = preferences[key];
            }
          });
        } catch (e) {
          console.error('Error parsing saved player preferences', e);
        }
      }
    },
    savePlayerPreferences() {
      // Save current player settings to localStorage
      localStorage.setItem('player-preferences', JSON.stringify(this.playerSettings));
    },
    initializeHeroVideo() {
      const video = this.$refs.heroVideo;
      if (!video) {
        console.error('Video element not found');
        return;
      }
      const videoSrc = this.movie.promo_hls_url || this.movie.video_url;
      if (!videoSrc) {
        console.error('No video source available');
        return;
      }

      // Detect format
      const isMPD = videoSrc.toLowerCase().includes('.mpd');
      const isHLS = videoSrc.toLowerCase().includes('.m3u8');

      if (!isMPD && !isHLS) {
        console.error('Unsupported video format. Only HLS (.m3u8) and MPD (.mpd) are supported');
        return;
      }

      // Dispose previous players if they exist
      if (this.videojsPlayer) {
        this.videojsPlayer.dispose();
        this.videojsPlayer = null;
      }
      if (this.shakaPromoPlayer) {
        this.shakaPromoPlayer.destroy();
        this.shakaPromoPlayer = null;
      }

      // Ensure video is muted for autoplay
      video.muted = true;

      if (isMPD) {
        // Use Shaka Player for MPD
        this.initializeShakaPromoPlayer(video, videoSrc);
      } else {
        // Use Video.js for HLS
        this.initializeVideoJsPromoPlayer(video, videoSrc);
      }
    },

    initializeShakaPromoPlayer(video, videoSrc) {
      console.log('🎬 Initializing Shaka Player for promo MPD');
      
      // Import Shaka Player dynamically
      import('shaka-player/dist/shaka-player.ui.js').then((shaka) => {
        // Install polyfills
        shaka.polyfill.installAll();
        
        // Check browser support
        if (!shaka.Player.isBrowserSupported()) {
          console.error('Browser not supported for Shaka Player');
          this.promoHasError = true;
          return;
        }
        
        // Create Shaka player
        this.shakaPromoPlayer = new shaka.Player();
        this.shakaPromoPlayer.attach(video);
        
        // Configure
        this.shakaPromoPlayer.configure({
          streaming: {
            bufferingGoal: 30,
            rebufferingGoal: 2,
            bufferBehind: 15
          },
          abr: {
            enabled: true
          }
        });
        
        // Error handling
        this.shakaPromoPlayer.addEventListener('error', (event) => {
          const error = event.detail;
          console.error('Shaka promo error:', error);
          
          // Don't hide button for CORS errors - user needs to fix S3 config
          // Only hide for critical player errors
          if (error.code !== shaka.util.Error.Code.BAD_HTTP_STATUS && 
              error.code !== shaka.util.Error.Code.HTTP_ERROR) {
            this.promoHasError = true;
          }
          
          this.handlePromoVideoError(error);
        });
        
        // Load manifest
        this.shakaPromoPlayer.load(videoSrc).then(() => {
          console.log('🎬 Promo MPD loaded successfully');
          this.isPromoLoading = false;
          
          // Attempt autoplay
          video.play().catch(err => {
            console.log('Promo autoplay prevented:', err);
            this.isPromoLoading = false;
          });
        }).catch((error) => {
          console.error('Error loading promo MPD:', error);
          
          // Don't hide button for CORS errors
          if (error.code !== shaka.util.Error.Code.BAD_HTTP_STATUS && 
              error.code !== shaka.util.Error.Code.HTTP_ERROR) {
            this.promoHasError = true;
          }
          
          this.isPromoLoading = false;
        });
      }).catch((error) => {
        console.error('Error importing Shaka Player:', error);
        this.promoHasError = true;
        this.isPromoLoading = false;
      });
    },

    initializeVideoJsPromoPlayer(video, videoSrc) {
      console.log('🎬 Initializing Video.js for promo HLS');
      
      this.videojsPlayer = videojs(video, {
        sources: [{
          src: videoSrc,
          type: 'application/x-mpegURL'
        }],
        controls: true,
        autoplay: true, // Enable autoplay
        muted: true,    // Ensure muted for autoplay
        preload: 'auto',
        fluid: true
      });
      this.videojsPlayer.ready(() => {
        this.isPromoLoading = false;
        this.videojsPlayer.muted(true); // Ensure muted
        this.videojsPlayer.play().catch(e => {
          console.error('Auto-play prevented:', e);
        });
      });
      this.videojsPlayer.on('error', () => {
        this.promoVideoError = this.videojsPlayer.error();
        console.error('Video.js error:', this.promoVideoError);
      });
    },
    onPromoVideoCanPlay() {
      console.log('Video can play');
      const video = this.$refs.heroVideo;
      if (video) {
        video.play().catch(error => {
          console.error('Play failed:', error);
        });
      }
    },
    onPromoVideoLoaded() {
      console.log('Promo video loaded successfully');
      this.isPromoLoading = false;
      const video = this.$refs.heroVideo;
      if (video) {
        video.classList.add('playing');
        // Ensure video is muted and playing
        video.muted = true;
        video.play().catch(error => {
          console.error('Play failed:', error);
        });
      }
    },
    onPromoVideoWaiting() {
      console.log('Promo video waiting/buffering');
      this.isPromoLoading = true;
    },
    onPromoVideoPlaying() {
      this.isPromoPlaying = true;
      this.isPromoLoading = false;
      const video = this.$refs.heroVideo;
      if (video) {
        video.classList.add('playing');
      }
    },
    handlePromoVideoError(error) {
      console.error('Promo video error:', error);
      this.promoVideoError = error;
      const video = this.$refs.heroVideo;
      if (video) {
        video.classList.remove('playing');
      }
    },
    async checkUserSubscription() {
      try {
        const phone = localStorage.getItem('phone');
        if (!phone) return false;

        const response = await axios.get(`${API_BASE_URL}/users/profile/?phone=${phone}`);
        console.log('Subscription API response:', response.data); // DEBUG
        if (response.data && response.data.status === 'success') {
          const user = response.data.user;
          console.log('User from API:', user); // DEBUG
          // Check if user has active subscription
          if (user.is_subscribed && user.subscription_end_date) {
            const endDate = new Date(user.subscription_end_date);
            const now = new Date();
            const isActive = endDate > now;
            console.log('is_subscribed:', user.is_subscribed, 'endDate:', endDate, 'now:', now, 'isActive:', isActive); // DEBUG
            return isActive;
          }
        }
        return false;
      } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
      }
    },
    async checkRentalStatus() {
      try {
        const phone = localStorage.getItem('phone');
        if (!phone) return null;

        const response = await axios.get(`${API_BASE_URL}/api/rentals/check/?phone=${phone}&video_id=${this.movie.id}`);
        if (response.data && response.data.status === 'success') {
          return response.data.rental;
        }
        return null;
      } catch (error) {
        console.error('Error checking rental status:', error);
        return null;
      }
    },
    goToRentalPayment() {
      this.showRentalPopup = false;
      this.$router.push(`/movie/${this.movie.id}/rent`);
    },
    async playMovie() {
      try {
        console.log('playMovie() called - checking video URL');
        // First check if we have a valid video URL
        if (!this.movie.hls_url) {
          throw new Error('No video URL available');
        }

        // Check user subscription status first
        const isSubscribed = await this.checkUserSubscription();
        console.log('User subscription status:', isSubscribed);

        // Rental video logic
        if (this.movie.video_type === 'rental') {
          if (isSubscribed) {
            // Premium user: play directly without showing rental popup
            console.log('Premium user - playing directly');
            this.controlsVisible = true;
            this.isVideoPaused = false;
            this.isVideoPlaying = true;
            this.videoUrl = this.movie.hls_url;
            this.streamType = 'hls';
            document.body.style.overflow = 'hidden';
            this.$nextTick(() => {
              if (this.$refs.videoPlayer) {
                this.resetControlsTimer();
              } else {
                console.error('Video player reference not found');
                throw new Error('Video player initialization failed');
              }
            });
          } else {
            // Free user: check rental status
            console.log('Free user - checking rental status');
            const rentalInfo = await this.checkRentalStatus();
            if (rentalInfo && rentalInfo.is_active) {
              // Rental is active, allow playback
              console.log('Active rental found - playing video');
              this.controlsVisible = true;
              this.isVideoPaused = false;
              this.isVideoPlaying = true;
              this.videoUrl = this.movie.hls_url;
              this.streamType = 'hls';
              document.body.style.overflow = 'hidden';
              this.$nextTick(() => {
                if (this.$refs.videoPlayer) {
                  this.resetControlsTimer();
                } else {
                  console.error('Video player reference not found');
                  throw new Error('Video player initialization failed');
                }
              });
            } else {
              // No active rental, redirect to rental page
              console.log('No active rental - redirecting to rental page');
              this.$router.push(`/movie/${this.movie.id}/rent`);
            }
          }
          return;
        }

        // Paid video logic
        if (this.movie.video_type === 'paid') {
          if (!isSubscribed) {
            // If not subscribed, redirect to subscription page
            this.$router.push({
              name: 'SubscriptionPlans',
              query: {
                redirect: this.$route.fullPath,
                video_id: this.movie.id
              }
            });
            return;
          }
        }

        // Free video or user is subscribed, proceed with playback
        console.log('Playing free/paid video');
        this.controlsVisible = true;
        this.isVideoPaused = false;
        this.isVideoPlaying = true;
        this.videoUrl = this.movie.hls_url;
        this.streamType = 'hls';
        document.body.style.overflow = 'hidden';
        this.$nextTick(() => {
          if (this.$refs.videoPlayer) {
            this.resetControlsTimer();
          } else {
            console.error('Video player reference not found');
            throw new Error('Video player initialization failed');
          }
        });
      } catch (error) {
        console.error('Error playing video:', error);
        this.$store.dispatch('showToast', {
          message: 'Sorry, the video is not available at the moment. Please try again later.',
          type: 'error'
        });
        this.isVideoPlaying = false;
        document.body.style.overflow = 'auto';
      }
    },
    closeVideo() {
      this.isVideoPlaying = false;
      this.isPlayingPromo = false;
      
      // Save the player preferences when closing the player
      this.savePlayerPreferences();
      
      // Restore body scrolling
      document.body.style.overflow = '';
    },
    async toggleWatchlist() {
      try {
        // Get authentication state from localStorage
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const token = localStorage.getItem('token');

        if (!isAuthenticated || !token) {
          // Store current path for redirect after login
          const currentPath = this.$route.fullPath;
          // Redirect to login with return URL
          this.$router.push({
            path: '/login',
            query: { redirect: currentPath }
          });
          return;
        }

        // Show loading state
        this.$store.commit('setLoading', true);

        const response = await watchlistAPI.toggle(this.id);

        if (response.data.status === 'success') {
          this.isInWatchlist = response.data.in_watchlist;
          // Show success message
          this.$store.dispatch('showToast', {
            message: response.data.message,
            type: 'success'
          });
        }
      } catch (error) {
        console.error('Error toggling watchlist:', error);
        // Show error message
        this.$store.dispatch('showToast', {
          message: 'Failed to update watchlist. Please try again.',
          type: 'error'
        });
      } finally {
        this.$store.commit('setLoading', false);
      }
    },
    async checkWatchlistStatus() {
      try {
        // Check authentication from localStorage
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const token = localStorage.getItem('token');

        if (!isAuthenticated || !token) return;

        const response = await watchlistAPI.getStatus(this.id);
        this.isInWatchlist = response.data.in_watchlist;
      } catch (error) {
        console.error('Error checking watchlist status:', error);
      }
    },
    shareMovie() {
      // Get the current URL for sharing 
      const shareUrl = this.shareUrl;
      
      // Get the best available image URL
      const imageUrl = this.movie.thumbnail_url || this.movie.portrait_thumbnail_url || this.movie.poster_url;
      
      // Prepare share data with image
      const shareData = {
        title: this.movie.title,
        text: this.movie.description,
        url: shareUrl
      };

      // Add image to share data if available
      if (imageUrl) {
        shareData.files = [imageUrl];
      }

      // Check if Web Share API is supported
      if (typeof navigator !== 'undefined' && navigator.share && this.isMobileDevice) {
        // For mobile devices, try to share with image
        if (imageUrl && navigator.canShare && navigator.canShare(shareData)) {
          navigator.share(shareData)
            .then(() => {
              this.$store.dispatch('showToast', {
                message: 'Shared successfully with image!',
                type: 'success'
              });
            })
            .catch((error) => {
              console.error('Error sharing with image:', error);
              // Fallback to sharing without image
              this.shareWithoutImage(this.shareUrl);
            });
        } else {
          // Fallback to sharing without image
          this.shareWithoutImage(this.shareUrl);
        }
      } else {
        // Fallback for desktop or unsupported browsers
        this.showShareDialog = true;
      }
    },

    shareWithoutImage(shareUrl) {
      const shareData = {
        title: this.movie.title,
        text: this.movie.description,
        url: shareUrl
      };

      navigator.share(shareData)
        .then(() => {
          this.$store.dispatch('showToast', {
            message: 'Shared successfully!',
            type: 'success'
          });
        })
        .catch((error) => {
          console.error('Error sharing:', error);
          this.showShareDialog = true;
        });
    },
    
    updateMetaTags() {
      if (!this.movie) return;
      
      const imageUrl = this.movie.thumbnail_url || this.movie.portrait_thumbnail_url || this.movie.poster_url;
      const shareUrl = this.shareUrl;
      const title = this.movie.title;
      const description = this.movie.description;
      
      console.log('Updating meta tags for:', title);
      console.log('Image URL:', imageUrl);
      console.log('Share URL:', shareUrl);
      
      // Update or create meta tags for Open Graph
      this.updateMetaTag('og:title', title);
      this.updateMetaTag('og:description', description);
      this.updateMetaTag('og:image', imageUrl);
      this.updateMetaTag('og:url', shareUrl);
      this.updateMetaTag('og:type', 'video.movie');
      this.updateMetaTag('og:site_name', 'No1 OTT');
      
      // Update or create meta tags for Twitter Card
      this.updateMetaTag('twitter:card', 'summary_large_image');
      this.updateMetaTag('twitter:title', title);
      this.updateMetaTag('twitter:description', description);
      this.updateMetaTag('twitter:image', imageUrl);
      this.updateMetaTag('twitter:url', shareUrl);
      
      // Update page title
      document.title = `${title} - No1 OTT`;
      
      console.log('Meta tags updated successfully');
    },
    
    updateMetaTag(name, content) {
      if (!content) return;
      
      let meta = document.querySelector(`meta[name="${name}"]`) || 
                 document.querySelector(`meta[property="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (name.startsWith('og:')) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    },
    toggleSearch() {
      this.isSearchActive = !this.isSearchActive;
    },
    navigateToMovie(movieId) {
      // Use full page refresh to ensure all components reinitialize
      window.location.href = `/movie/${movieId}`;
    },
    navigateToCategory() {
      // Navigate to category page with category ID
      console.log('Navigating to category. Movie data:', this.movie);
      console.log('Category ID:', this.movie.category_id);
      console.log('Category:', this.movie.category);
      
      const categoryId = this.movie.category_id || this.movie.category;
      
      if (categoryId) {
        console.log('Navigating to category ID:', categoryId);
        // Use Vue Router for better debugging
      this.$router.push({
          name: 'CategoryVideos',
          params: { id: categoryId }
      });
      } else {
        console.error('No category ID found in movie data');
        // Show error message to user
        this.$store.dispatch('showToast', {
          message: 'Category information not available',
          type: 'error'
        });
      }
    },
    goBack() {
      this.$router.go(-1);
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
    async fetchMovieDetails() {
      try {
        // Make API call to get movie details
        const response = await axios.get(`${API_BASE_URL}/api/videos/${this.id}/`);
        console.log('API Response:', response.data);
        
        if (response.data) {
          // Apply capitalization to title and description
          this.movie = {
            ...response.data,
            title: this.capitalizeText(response.data.title),
            description: this.capitalizeText(response.data.description)
          };
          
          // Update meta tags for social sharing
          this.updateMetaTags();
          
          // Set video URL based on available formats
          if (response.data.hls_url) {
            this.videoUrl = response.data.hls_url;
            this.streamType = 'hls';
          } else {
            throw new Error('No video URL available');
          }
          
          console.log('Set video URL:', this.videoUrl);
          console.log('Stream type:', this.streamType);
          
          // Fetch related videos from same category
          await this.fetchCategoryVideos();
          
          // Fetch recently added videos
          await this.fetchRecentlyAddedVideos();
        } else {
          throw new Error('Invalid response data');
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
        this.$store.dispatch('showToast', {
          message: 'Error loading movie details. Please try again later.',
          type: 'error'
        });
      }
    },
    async fetchCategoryVideos() {
      try {
        console.log('Fetching category videos for movie:', this.movie);
        console.log('Category ID:', this.movie.category_id);
        console.log('Category Name:', this.movie.category_name);
        
        if (!this.movie.category_id && !this.movie.category_name) {
          console.log('No category information available');
          // Use fallback data
          this.categoryVideos = this.relatedMovies.slice(0, 8);
          return;
        }
        
        // Use the correct API endpoint for category videos
        const categoryId = this.movie.category_id || this.movie.category;
        if (!categoryId) {
          console.log('No category ID found');
          this.categoryVideos = this.relatedMovies.slice(0, 8);
          return;
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/videos/category/${categoryId}/?page=1&page_size=12`);
        
        if (response.data && response.data.status === 'success') {
          console.log('Category videos API response:', response.data);
          
          // Filter out current video from the results
          let videos = response.data.data || [];
          videos = videos.filter(video => video.id !== this.movie.id);
          
          this.categoryVideos = videos.slice(0, 12).map(video => ({
            ...video,
            title: this.capitalizeText(video.title)
          }));
          
          console.log('Processed category videos:', this.categoryVideos);
        } else {
          console.log('No API response or invalid status, using fallback data');
          // Use fallback data
          this.categoryVideos = this.relatedMovies.slice(0, 8);
        }
        
        // Update scroll buttons after data loads
        this.$nextTick(() => {
          this.checkScrollButtons('categoryContainer', 'category');
        });
        
      } catch (error) {
        console.error('Error fetching category videos:', error);
        console.log('Using fallback data due to error');
        // Use fallback data on error
        this.categoryVideos = this.relatedMovies.slice(0, 8);
              }
      },
      async fetchRecentlyAddedVideos() {
        try {
          console.log('Fetching recently added videos');
          const response = await axios.get(`${API_BASE_URL}/api/videos/`, {
            params: {
              ordering: '-created_at',
              limit: 20
            }
          });

          let videos = [];
          if (response.data) {
            if (Array.isArray(response.data)) {
              videos = response.data;
            } else if (response.data.results) {
              videos = response.data.results;
            } else if (response.data.data) {
              videos = response.data.data;
            }
          }

          // Filter out current video from the results
          videos = videos.filter(video => video.id !== this.movie.id);

          this.recentlyAddedVideos = videos.slice(0, 12).map(video => ({
            ...video,
            title: this.capitalizeText(video.title)
          }));

          console.log('Processed recently added videos:', this.recentlyAddedVideos);

          // Update scroll buttons after data loads
          this.$nextTick(() => {
            this.checkScrollButtons('recentlyAddedContainer', 'recentlyAdded');
          });

        } catch (error) {
          console.error('Error fetching recently added videos:', error);
          // Use fallback data on error
          this.recentlyAddedVideos = this.relatedMovies.slice(0, 8);
      }
    },
    checkDeviceType() {
      // Check if mobile based on screen width or user agent
      this.isMobileDevice = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Adjust video control timeout based on device type
      this.videoInteractionDelay = this.isMobileDevice ? 3500 : 2500; // Mobile needs longer timeout
    },
    showControlsOnInteraction() {
      // Make controls visible on interaction
      this.controlsVisible = true;
      
      // Reset the timeout when there's interaction
      this.resetControlsTimer();
    },
    resetControlsTimer() {
      // Clear any existing timeout
      if (this.controlsTimeout) {
        clearTimeout(this.controlsTimeout);
      }
      
      // If video is playing (not paused), set a timeout to hide controls
      if (!this.isVideoPaused) {
        this.controlsTimeout = setTimeout(() => {
          this.controlsVisible = false;
        }, this.videoInteractionDelay);
      }
    },
    toggleControlsVisibility(event) {
      // Prevent default behavior
      event.preventDefault();
      
      // Toggle controls visibility on tap/click (common OTT pattern)
      this.controlsVisible = !this.controlsVisible;
      
      if (this.controlsVisible && !this.isVideoPaused) {
        // If showing controls and video is playing, reset the timer
        this.resetControlsTimer();
      }
    },
    onVideoPlay() {
      this.isVideoPaused = false;
      this.resetControlsTimer(); // Start the timer to hide controls
    },
    onVideoPause() {
      this.isVideoPaused = true;
      this.controlsVisible = true; // Always show controls when paused
      
      // Clear any existing timeout
      if (this.controlsTimeout) {
        clearTimeout(this.controlsTimeout);
      }
    },
    handleVideoError(errorMessage) {
      console.error('Video playback error:', errorMessage);
      
      // If DASH format fails, try falling back to MP4
      if (this.streamType === 'dash' && this.videoUrl.includes('.mpd')) {
        this.streamType = 'mp4';
        this.videoUrl = 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8';
        console.log('Falling back to MP4 format');
        
        // Retry with MP4
        if (this.$refs.videoPlayer) {
          this.$refs.videoPlayer.retry();
        }
      }
    },
    checkScrollButtons(containerId, section) {
      const container = this.$refs[containerId]
      if (!container) return
      
      // Check if we can scroll left
      this.canScrollLeft[section] = container.scrollLeft > 0
      
      // Check if we can scroll right
      const maxScroll = container.scrollWidth - container.clientWidth
      this.canScrollRight[section] = container.scrollLeft < maxScroll - 1 // -1 for rounding errors
    },
    scrollLeft(containerId) {
      const container = this.$refs[containerId]
      if (!container) return

      const cardWidth = containerId === 'categoryContainer' || containerId === 'recentlyAddedContainer' ? 160 : 180 // Adjust based on card width
      const visibleWidth = container.clientWidth
      const cardsToScroll = Math.floor(visibleWidth / cardWidth)
      const scrollAmount = cardWidth * cardsToScroll

      const targetScroll = Math.max(0, container.scrollLeft - scrollAmount)
      
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      })
    },
    scrollRight(containerId) {
      const container = this.$refs[containerId]
      if (!container) return

      const cardWidth = containerId === 'categoryContainer' || containerId === 'recentlyAddedContainer' ? 160 : 180 // Adjust based on card width
      const visibleWidth = container.clientWidth
      const cardsToScroll = Math.floor(visibleWidth / cardWidth)
      const scrollAmount = cardWidth * cardsToScroll

      const maxScroll = container.scrollWidth - container.clientWidth
      const targetScroll = Math.min(maxScroll, container.scrollLeft + scrollAmount)
      
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      })
    },
    handleScroll() {
      const header = document.querySelector('.header-with-gradient')
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled')
        } else {
          header.classList.remove('scrolled')
        }
      }
    },
    // Handle subscription payment
    handleSubscribe() {
      // Close the payment popup
      this.showPaymentPopup = false;
      // Redirect to subscription plans page
      this.$router.push({
        name: 'SubscriptionPlans',
        query: { 
          redirect: this.$route.fullPath, // Store current movie page URL
          video_id: this.movie.id // Pass video ID
        }
      });
    },
    // Close payment popup
    closePaymentPopup() {
      this.showPaymentPopup = false;
    },
    handlePromoVideoEnd() {
      console.log('Promo video ended');
      const video = this.$refs.heroVideo;
      if (video) {
        // Reset to beginning and play again
        video.currentTime = 0;
        video.play().catch(error => {
          console.log('Error replaying promo video:', error);
        });
      }
      this.isPromoPlaying = false;
    },
    // Helper to initialize or update video.js player for promo/main video
    initVideoJsPlayer(videoEl, videoSrc) {
      if (!videoEl) return;
      // Only initialize if not already initialized
      if (!videoEl._videojsPlayer) {
        videoEl._videojsPlayer = videojs(videoEl, {
          controls: true,
          autoplay: true,
          muted: true,
          preload: 'auto',
          fluid: true
        });
        videoEl._videojsPlayer.on('error', () => {
          this.promoVideoError = videoEl._videojsPlayer.error();
          console.error('Video.js error:', this.promoVideoError);
        });
      }
      // Only update source if changed
      if (videoEl._videojsPlayer.currentSrc() !== videoSrc) {
        videoEl._videojsPlayer.src({ src: videoSrc, type: 'application/x-mpegURL' });
      }
      // Reset playing state before playback
      this.isPromoPlaying = false;
      videoEl._videojsPlayer.off('playing'); // Remove previous listeners
      videoEl._videojsPlayer.on('playing', () => {
        this.isPromoPlaying = true;
        this.$forceUpdate(); // Ensure Vue reactivity
        console.log('video.js playing event fired, isPromoPlaying set to true');
      });
      videoEl._videojsPlayer.ready(() => {
        videoEl._videojsPlayer.muted(true);
        videoEl._videojsPlayer.play().then(() => {
          console.log('Video should be playing');
          console.log('Player state:', videoEl._videojsPlayer.paused(), videoEl._videojsPlayer.currentSrc());
        }).catch(e => {
          console.error('Auto-play prevented:', e);
        });
      });
      // Add native error event logging
      videoEl.addEventListener('error', (e) => {
        console.error('Native video error:', e);
      });
    },
    async playPromo() {
      try {
        console.log('playPromo() called - checking promo URL');
        
        // Check if we have a valid promo URL
        if (!this.movie.promo_hls_url) {
          throw new Error('No promo video URL available');
        }

        // Set video URL and detect format
        this.videoUrl = this.movie.promo_hls_url;
        
        // Auto-detect stream type based on URL
        if (this.videoUrl.includes('.mpd')) {
          this.streamType = 'dash';
        } else if (this.videoUrl.includes('.m3u8')) {
          this.streamType = 'hls';
        } else {
          this.streamType = 'hls'; // Default to HLS
        }

        console.log('Playing promo with URL:', this.videoUrl);
        console.log('Stream type:', this.streamType);

        // Use AdvancedVideoPlayer (same as full video)
        this.controlsVisible = true;
        this.isVideoPaused = false;
        this.isVideoPlaying = true;
        this.isPlayingPromo = true;
        
        // Hide body scroll
        document.body.style.overflow = 'hidden';
        
        this.$nextTick(() => {
          if (this.$refs.videoPlayer) {
            this.resetControlsTimer();
          } else {
            console.error('Video player reference not found');
            throw new Error('Video player initialization failed');
          }
        });
      } catch (error) {
        console.error('Error playing promo video:', error);
        this.$store.dispatch('showToast', {
          message: 'Sorry, the promo video is not available at the moment. Please try again later.',
          type: 'error'
        });
        this.isVideoPlaying = false;
        this.isPlayingPromo = false;
        document.body.style.overflow = 'auto';
      }
    },
    shareToWhatsApp() {
      const imageUrl = this.movie.thumbnail_url || this.movie.portrait_thumbnail_url || this.movie.poster_url;
      const text = `Check out "${this.movie.title}" on No1 OTT!\n\n${this.movie.description}\n\n${this.shareUrl}`;
      
      // For WhatsApp, we need to use a different approach for image sharing
      if (imageUrl && this.isMobileDevice) {
        // Try to use native sharing with image for mobile devices
        const shareData = {
          title: this.movie.title,
          text: text,
          url: this.shareUrl,
          files: [imageUrl]
        };
        
        if (navigator.canShare && navigator.canShare(shareData)) {
          navigator.share(shareData)
            .then(() => {
              this.$store.dispatch('showToast', {
                message: 'Shared to WhatsApp with image!',
                type: 'success'
              });
            })
            .catch((error) => {
              console.error('WhatsApp share error:', error);
              // Fallback to text-only WhatsApp sharing
              this.shareToWhatsAppTextOnly(text);
            });
        } else {
          // Fallback to text-only WhatsApp sharing
          this.shareToWhatsAppTextOnly(text);
        }
      } else {
        // Desktop or no image available - use text-only sharing
        this.shareToWhatsAppTextOnly(text);
      }
      
      this.showShareDialog = false;
    },

    shareToWhatsAppTextOnly(text) {
      // Use the share URL directly to trigger rich preview
      const shareText = `${text}\n\n${this.shareUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      if (typeof window !== 'undefined') {
        window.open(whatsappUrl, '_blank');
      }
    },

    // Alternative method for WhatsApp image sharing using canvas
    async shareToWhatsAppWithImage() {
      try {
        const imageUrl = this.movie.thumbnail_url || this.movie.portrait_thumbnail_url || this.movie.poster_url;
        
        if (!imageUrl) {
          this.shareToWhatsAppTextOnly(`Check out "${this.movie.title}" on No1 OTT!\n\n${this.movie.description}\n\n${this.shareUrl}`);
          return;
        }

        // Create a canvas with the image and text overlay
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 600;
        canvas.height = 400;
        
        // Load the image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          // Draw the image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Add a semi-transparent overlay for text readability
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
          
          // Add text
          ctx.fillStyle = 'white';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(this.movie.title, canvas.width / 2, canvas.height - 80);
          
          ctx.font = '16px Arial';
          ctx.fillText('Watch on No1 OTT', canvas.width / 2, canvas.height - 50);
          
          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (blob) {
              // Create a file from the blob
              const file = new File([blob], 'movie-share.jpg', { type: 'image/jpeg' });
              
              // Try to share with the generated image
              const shareData = {
                title: this.movie.title,
                text: `Check out "${this.movie.title}" on No1 OTT!\n\n${this.shareUrl}`,
                files: [file]
              };
              
              if (navigator.canShare && navigator.canShare(shareData)) {
                navigator.share(shareData)
                  .then(() => {
                    this.$store.dispatch('showToast', {
                      message: 'Shared to WhatsApp with image!',
                      type: 'success'
                    });
                  })
                  .catch((error) => {
                    console.error('WhatsApp share error:', error);
                    this.shareToWhatsAppTextOnly(`Check out "${this.movie.title}" on No1 OTT!\n\n${this.movie.description}\n\n${this.shareUrl}`);
                  });
              } else {
                this.shareToWhatsAppTextOnly(`Check out "${this.movie.title}" on No1 OTT!\n\n${this.movie.description}\n\n${this.shareUrl}`);
              }
            }
          }, 'image/jpeg', 0.8);
        };
        
        img.onerror = () => {
          // If image fails to load, fallback to text-only
          this.shareToWhatsAppTextOnly(`Check out "${this.movie.title}" on No1 OTT!\n\n${this.movie.description}\n\n${this.shareUrl}`);
        };
        
        img.src = imageUrl;
        
      } catch (error) {
        console.error('Error creating WhatsApp image share:', error);
        this.shareToWhatsAppTextOnly(`Check out "${this.movie.title}" on No1 OTT!\n\n${this.movie.description}\n\n${this.shareUrl}`);
      }
    },
    shareToFacebook() {
      const imageUrl = this.movie.thumbnail_url || this.movie.portrait_thumbnail_url || this.movie.poster_url;
      let facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareUrl)}`;
      
      // Add image URL to Facebook share if available
      if (imageUrl) {
        facebookUrl += `&picture=${encodeURIComponent(imageUrl)}`;
      }
      
      if (typeof window !== 'undefined') {
        window.open(facebookUrl, '_blank');
      }
      this.showShareDialog = false;
    },
    shareToTwitter() {
      const imageUrl = this.movie.thumbnail_url || this.movie.portrait_thumbnail_url || this.movie.poster_url;
      const text = `Check out "${this.movie.title}" on No1 OTT!`;
      let twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(this.shareUrl)}`;
      
      // Add image URL to Twitter share if available
      if (imageUrl) {
        twitterUrl += `&image=${encodeURIComponent(imageUrl)}`;
      }
      
      if (typeof window !== 'undefined') {
        window.open(twitterUrl, '_blank');
      }
      this.showShareDialog = false;
    },
    async copyShareLink() {
      if (typeof navigator === 'undefined') return;
      
      try {
        await navigator.clipboard.writeText(this.shareUrl);
        this.copyStatus = 'Copied!';
        
        // Show success toast
        this.$store.dispatch('showToast', {
          message: 'Link copied to clipboard!',
          type: 'success'
        });

        // Reset copy status after 2 seconds
        setTimeout(() => {
          this.copyStatus = 'Copy';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        
        // Fallback for older browsers
        if (this.$refs.shareLink) {
          this.$refs.shareLink.select();
          document.execCommand('copy');
          
          this.copyStatus = 'Copied!';
          setTimeout(() => {
            this.copyStatus = 'Copy';
          }, 2000);
        }
      }
    },
    
    // Test social media preview
    testSocialPreview() {
      const testUrl = `${window.location.origin}/movie/${this.movie.id}?test=true`;
      console.log('Testing social preview with URL:', testUrl);
      
      // Open in new tab for testing
      window.open(testUrl, '_blank');
      
      this.$store.dispatch('showToast', {
        message: 'Social preview test opened in new tab!',
        type: 'info'
      });
    }
  }
};
</script>

<style scoped>
/* Advanced Video Player modal - Full screen */
.advanced-video-player-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  z-index: 100;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Remove overflow: hidden to allow centering */
}

:deep(.video-element) {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw;
  max-height: 100vh;
  aspect-ratio: 16 / 9;
  object-fit: contain !important;
  background: #000;
  display: block;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .advanced-video-player-modal {
    padding: 0;
    width: 100vw;
    height: 100vh;
    min-width: 100vw;
    min-height: 100vh;
  }
  :deep(.video-element) {
    width: 100vw !important;
    height: 100vh !important;
    aspect-ratio: 16 / 9;
    object-fit: contain !important;
    background: #000;
  }
}

/* Container fix for horizontal scrolling */
.movie-details-wrapper {
  position: relative;
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}

/* Header gradient overlay to blend with movie backdrop */
.header-with-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  background: linear-gradient(to bottom, 
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 60%,
    rgba(0, 0, 0, 0.4) 80%,
    rgba(0, 0, 0, 0) 100%);
  height: 120px;
  transition: background 0.3s ease;
}

.header-with-gradient.scrolled {
  background: #121212;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Make the header background transparent by default */
.header-with-gradient :deep(.header) {
  background: transparent !important;
  transition: background 0.3s ease;
}

.header-with-gradient.scrolled :deep(.header) {
  background: #121212 !important;
  backdrop-filter: blur(10px);
}

.movie-detail-container {
  position: relative;
  height: 100vh;
  min-height: 600px;
  max-height: 800px;
  padding-top: 0;
  overflow: hidden;
  width: 100%;
}

/* Back button styling */
.back-btn {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 20;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: none; /* Hidden by default (desktop) */
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

/* Unified action buttons styling inspired by major OTT platforms */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}

.play-button {
  background: linear-gradient(45deg, #c30059, #ff0062);
  color: white;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(195, 0, 89, 0.3);
  position: relative;
  overflow: hidden;
  white-space: nowrap;    
  width: auto;             
  min-width: unset;        
  max-width: unset;         
  display: inline-flex;     
  align-items: center;
  justify-content: center;
  padding: 8px 16px;        
  gap: 8px;
}

.play-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
  transform: translateX(-100%) rotate(45deg);
  transition: transform 0.6s ease;
}

.play-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(195, 0, 89, 0.4);
}

.play-button:hover::before {
  transform: translateX(100%) rotate(45deg);
}

.play-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(195, 0, 89, 0.3);
}

.play-button i {
  font-size: 1.1rem;
}

/* Promo button with glass effect */
button[class*="play-button"]:first-child {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

button[class*="play-button"]:first-child:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

button[class*="play-button"]:first-child:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .action-buttons {
    gap: 0.75rem;
    margin: 1rem 0;
  }

  .play-button {
    padding: 0.75rem 1.5rem;
    min-width: 120px;
    font-size: 0.9rem;
  }

  .play-button i {
    font-size: 1rem;
  }

  /* Stack buttons on very small screens */
  @media (max-width: 360px) {
    .action-buttons {
      flex-direction: column;
      width: 100%;
    }

    .play-button {
      width: 100%;
      justify-content: center;
    }
  }
}

/* Add shine animation for play button */
@keyframes shine {
  0% {
    background-position: 200% center;
  }
  100% {
    background-position: -200% center;
  }
}

.play-button.main-play {
  background: linear-gradient(45deg, #c30059, #ff0062, #c30059);
  background-size: 200% auto;
  animation: shine 8s linear infinite;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 0.25rem;
  width: 60px;
  height: 60px;
  padding: 0.75rem 0;
  transition: all 0.2s;
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.action-button i {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.action-label {
  font-size: 0.7rem;
}

/* Section carousel styling to match Home page */
.scroll-container {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Main content section fixes */
main {
  position: relative;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
}

/* Gradient text style for section headings */
.gradient-text {
  background: linear-gradient(45deg, #fff 30%, rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Scroll buttons */
.scroll-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #c30059;
  color: white;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s;
}

.scroll-button:hover {
  transform: translateY(-50%) scale(1.1);
  background-color: #a80048;
}

.left-scroll-button {
  left: -18px;
}

.right-scroll-button {
  right: 0;
}

@media (min-width: 768px) {
  .scroll-button {
    display: flex;
  }
}

/* Scroll button container fix */
section {
  position: relative;
  width: 100%;
  overflow-x: hidden;
}

/* Cast card styling */
.cast-card {
  min-width: 150px;
  max-width: 150px;
  flex-shrink: 0;
}

.cast-image {
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.cast-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cast-card:hover img {
  transform: scale(1.05);
}

.cast-name {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.cast-role {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Related movie card styling */
.related-movie-card {
  min-width: 160px;
  max-width: 160px;
  flex-shrink: 0;
  cursor: pointer;
}

.card-container {
  width: 100%;
  max-width: 160px;
  height: 240px;
  transition: transform 0.3s ease;
  cursor: pointer;
  background-color: #1d1d1d;
}

.related-movie-card:hover .card-container {
  transform: translateY(-8px) scale(1.05);
  z-index: 10;
}

.related-movie-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-text {
  transition: transform 0.3s ease;
}

.related-movie-card:hover .card-text {
  transform: scale(1.1);
}

/* Mobile-only elements */
.mobile-only-element {
  display: none; /* Hidden by default */
}

/* Hide elements on mobile */
.hide-on-mobile {
  display: block;
}

/* Media query for mobile devices */
@media (max-width: 768px) {
  .mobile-only-element {
    display: flex; /* Show on mobile */
  }
  
  .hide-on-mobile {
    display: none; /* Hide on mobile */
  }
  
  .movie-detail-container {
    padding-top: 0; /* Remove padding since header is hidden */
  }
  
  /* Additional mobile-specific styles */
  .movie-backdrop {
    height: 70vh; /* Increase height for portrait view */
  }

  /* Mobile action buttons styling */
  .action-buttons {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }
  
  .play-button, .promo-button {
    flex: 1;
    padding: 0.75rem 1rem;
  }
  
  .action-button {
    width: 48px;
    height: 48px;
  }
  
  .action-label {
    display: none; /* Hide labels on mobile for cleaner UI */
  }

  main {
    padding-top: 0;
    padding-bottom: 0;
  }

  section {
    margin-bottom: 0.25rem;
  }

  .movie-info-container {
    padding: 0.75rem;
    padding-top: calc(40vh);
  }

  .movie-description {
    margin-bottom: 0.5rem;
  }

  .movie-meta {
    margin-bottom: 0.25rem;
  }

  .movie-tags {
    margin-bottom: 0.25rem;
  }

  .movie-badges {
    margin-bottom: 0.25rem;
  }

  .movie-title {
    margin-bottom: 0.25rem;
  }
}

.movie-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background: #121212;
  
  @media (max-width: 768px) {
    height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000;
  }
}

.backdrop-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.1);
  opacity: 1;
  transition: opacity 0.5s ease;
  will-change: opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.backdrop-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scale(1.1);
  opacity: 0;
  transition: opacity 0.5s ease;
  will-change: opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.backdrop-video.playing {
  opacity: 1;
}

/* When video is playing, fade out the thumbnail */
.backdrop-video.playing + .backdrop-image {
  opacity: 0;
}

/* Loading spinner for video */
.video-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.backdrop-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(18, 18, 18, 0.3) 0%,
    rgba(18, 18, 18, 0.7) 50%,
    rgba(18, 18, 18, 1) 100%
  );
  z-index: 2;
  pointer-events: none;
}

.movie-info-container {
  position: relative;
  z-index: 10;
  padding: 2rem;
  padding-top: calc(50vh);
  max-width: 800px;
}

.movie-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
}

.premium {
  background: linear-gradient(45deg, #c30059, #ff0062);
  padding: 0.4rem 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(195, 0, 89, 0.3);
  transition: all 0.3s ease;
}

.premium:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(195, 0, 89, 0.4);
}

.premium i {
  font-size: 0.9rem;
  color: #FFD700;
}

.premium-price {
  color: #c30059;
  font-weight: 600;
  background: rgba(195, 0, 89, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

.quality {
  background-color: #0066cc;
}

.movie-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.movie-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.dot-divider {
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
}

.movie-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.movie-description {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 700px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .movie-description {
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 0.5rem;
  }
}

/* Mobile Search Bar */
.mobile-search-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #121212;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  transform: translateY(-100%);
  transition: transform 0.3s ease;
}

.mobile-search-bar.active {
  transform: translateY(0);
}

.mobile-search-bar input {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 4px;
}

.mobile-search-bar input:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.15);
}

.mobile-search-bar button {
  padding: 0.5rem;
  margin-left: 0.5rem;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .movie-detail-container {
    height: auto;
    max-height: none;
    padding-bottom: 20px; /* Reduced bottom padding */
  }
  
  .movie-title {
    font-size: 1.75rem;
  }
}

/* Additional responsive fixes */
@media (min-width: 769px) {
  main {
    padding-right: 10px;
    padding-left: 10px;
    max-width: 100vw;
  }
  
  .scroll-button {
    z-index: 20;
  }
  
  .right-scroll-button {
    right: 10px;
  }
  
  .left-scroll-button {
    left: -10px;
  }
  
  .carousel-container {
    padding-right: 10px;
  }
}

/* Fix for the carousel to prevent overflow */
section > div:first-child {
  padding-right: 1rem;
  box-sizing: border-box;
  width: 100%;
}

/* Fix for the last visible elements in carousels */
.scroll-container > div {
  padding-right: 1rem;
  box-sizing: border-box;
}

/* Carousel container fixes */
.carousel-container {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.carousel-inner-container {
  width: fit-content;
  padding-bottom: 1rem; /* Add space for potential scrollbar */
}

/* Payment Popup */
.payment-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(8px);
}

.payment-popup {
  background-color: #1a1a1a;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.popup-header {
  padding: 1.5rem;
  background: linear-gradient(to right, #c30059, #7c1d44);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.premium-badge {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.premium-badge i {
  font-size: 1.25rem;
  color: white;
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.popup-content {
  padding: 1.5rem;
}

.movie-preview {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.popup-thumbnail {
  width: 120px;
  height: 68px;
  object-fit: cover;
  border-radius: 8px;
}

.movie-info {
  flex: 1;
}

.movie-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white;
}

.premium-features {
  background: rgba(195, 0, 89, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.features-grid {
  display: grid;
  gap: 1rem;
}

.feature-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.feature-item i {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(195, 0, 89, 0.1);
  border-radius: 6px;
}

.subscribe-button {
  width: 100%;
  background: linear-gradient(to right, #c30059, #7c1d44);
  color: white;
  font-weight: 600;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.subscribe-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -10px rgba(195, 0, 89, 0.5);
}

.subscribe-button:active {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .payment-popup {
    max-height: 90vh;
    overflow-y: auto;
  }

  .popup-content {
    padding: 1rem;
  }

  .movie-preview {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .popup-thumbnail {
    width: 100%;
    height: auto;
    aspect-ratio: 16/9;
  }

  .premium-features {
    padding: 1rem;
  }
}

/* Add these new styles for portrait mobile */
.backdrop-image.portrait-mobile {
  @media (max-width: 768px) {
    object-fit: contain;
    object-position: center;
    height: 100%;
    width: 100%;
    background-color: #000;
  }
}

.secondary-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.secondary-button.in-watchlist {
  background: rgba(255, 119, 0, 0.2);
  border-color: rgba(255, 119, 0, 0.4);
}

.secondary-button.in-watchlist:hover {
  background: rgba(255, 119, 0, 0.3);
  border-color: rgba(255, 119, 0, 0.5);
}

/* Add these new styles for share dialog */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}

/* Debug: Force video to be visible and sized correctly */
.backdrop-video {
  display: block !important;
  opacity: 1 !important;
  height: 100vh !important;
  width: 100vw !important;
  z-index: 1000 !important;
}

/* Remove video.js fluid aspect ratio padding */
.vjs-fluid {
  padding-top: 0 !important;
  height: 100% !important;
  min-height: 0 !important;
}

/* Hide video.js text information but keep controls */
:deep(.video-js) {
  .vjs-time-control,
  .vjs-remaining-time,
  .vjs-duration,
  .vjs-current-time,
  .vjs-time-divider {
    display: none !important;
  }

  .vjs-progress-control {
    height: 3px !important;
    opacity: 0.5;
    transition: all 0.3s;
  }

  .vjs-progress-control:hover {
    height: 6px !important;
    opacity: 1;
  }

  .vjs-control-bar {
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent) !important;
    height: 60px !important;
    padding-bottom: 10px !important;
  }
}

/* Video container and video element styles */
.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.backdrop-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  background: #000;
}

/* Desktop specific styles */
@media (min-width: 769px) {
  .video-container {
    height: 100vh !important;
    max-height: 100vh !important;
  }

  .backdrop-video {
    height: 100vh !important;
    max-height: 100vh !important;
  }

  :deep(.video-js) {
    width: 100% !important;
    height: 100vh !important;
    max-height: 100vh !important;
  }

  :deep(.vjs-tech) {
    height: 100vh !important;
    max-height: 100vh !important;
    object-fit: contain !important;
  }
}
</style>