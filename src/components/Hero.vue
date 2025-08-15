<template>
  <section id="heroContainer">
    <div class="hero-content">
      <div class="hero-content-wrapper">
        <div class="hero-badges">
          <span v-if="currentVideo?.video_type === 'paid'" class="hero-badge premium">Premium</span>
        </div>
        
        <h1 class="hero-title">{{ capitalizeText(currentVideo?.title) }}</h1>
        
        <div class="hero-meta">
          <span>{{ getYear(currentVideo?.release_date) }}</span>
          <span class="meta-dot"></span>
          <span>{{ formatDuration(currentVideo?.duration) }}</span>
          <span class="meta-dot"></span>
          <span>{{ currentVideo?.category_name }}</span>
        </div>
        
        <p class="hero-description">{{ formatDescription(currentVideo?.description) }}</p>
        
        <div class="hero-actions">
          <button class="hero-button primary" @click="navigateToMovie(currentVideo?.id)">
            <i class="fas fa-play"></i>
            Watch Now
          </button>
          <button class="hero-button secondary">
            <i class="fas fa-plus"></i>
            Add to Watchlist
          </button>
        </div>
        
        <div class="hero-thumbnails">
          <button class="thumbnail-nav" aria-label="Previous" @click="prevSlide">
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div 
            v-for="(slide, index) in slides" 
            :key="index"
            class="hero-thumbnail"
            :class="{ active: currentSlide === index }"
            @click="showSlide(index)"
          >
            <img :src="slide.thumbnail_url" :alt="slide.title" />
          </div>
          
          <button class="thumbnail-nav" aria-label="Next" @click="nextSlide">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="hero-media-container">
      <div 
        v-for="(slide, index) in slides" 
        :key="index"
        class="carousel-slide"
        :class="{ active: currentSlide === index }"
      >
        <!-- Clickable container for mobile -->
        <div 
          class="mobile-video-click-area"
          @click="handleMobileVideoClick(slide)"
        >
          <!-- Thumbnail Image -->
          <img
            :src="slide.thumbnail_url"
            :alt="slide.title"
            class="hero-media"
            v-show="!isVideoPlaying || currentSlide !== index"
          />
          <!-- Video Element -->
          <div 
            class="video-wrapper"
            @click="handleMobileVideoClick(slide)"
          >
            <video
              ref="videos"
              class="video-js vjs-default-skin hero-media"
              playsinline
              :muted="isMuted"
              v-show="currentSlide === index"
              @playing="handleVideoPlaying(index)"
              @ended="handleVideoEnded(index)"
              @error="handleVideoError(index)"
            ></video>
          </div>
        </div>
      </div>
      
      <div class="carousel-dots">
        <span 
          v-for="(slide, index) in slides" 
          :key="index"
          class="carousel-dot"
          :class="{ active: currentSlide === index }"
          :data-index="index"
          @click="showSlide(index)"
        ></span>
      </div>
      
      <div id="heroGradient"></div>
    </div>

    <!-- Mute/Unmute Button -->
    <button 
      @click="toggleMute"
      class="mute-button"
      :aria-label="isMuted ? 'Unmute' : 'Mute'"
    >
      <i :class="['fas', isMuted ? 'fa-volume-mute' : 'fa-volume-up']"></i>
    </button>
  </section>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default {
  name: 'HeroSection',
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      currentSlide: 0,
      isMuted: true,
      isVideoPlaying: false,
      videoTimeout: null,
      touchStartX: null,
      touchEndX: null,
      touchStartY: 0,
      touchEndY: 0,
      touchStartTime: 0,
      isDragging: false,
      dragOffset: 0,
      minDragDistance: 20,
      activeVideo: null,
      isManualNavigation: false,
      slides: [],
      loading: false,
      error: null,
      videojsPlayers: []
    }
  },
  computed: {
    currentVideo() {
      return this.slides[this.currentSlide] || null;
    }
  },
  async created() {
    await this.fetchHeroVideos();
  },
  mounted() {
    // Fetch hero videos when component mounts
    this.fetchHeroVideos();

    // Add event listeners for touch events
    const heroContainer = document.getElementById('heroContainer');
    if (heroContainer) {
      heroContainer.addEventListener('touchstart', this.handleTouchStart);
      heroContainer.addEventListener('touchmove', this.handleTouchMove);
      heroContainer.addEventListener('touchend', this.handleTouchEnd);
    }
  },
  beforeUnmount() {
    this.cleanup()
  },
  methods: {
    async fetchHeroVideos() {
      try {
        this.loading = true;
        const response = await axios.get('https://ott.no1news.in/api/videos/hero/');
        if (response.data && response.data.status === 'success') {
          this.slides = response.data.data;
          // Auto-play first video after a short delay
          this.$nextTick(() => {
            setTimeout(() => {
              this.initializeFirstVideo();
            }, 500); // Slight delay for DOM render
          });
        }
      } catch (error) {
        console.error('Error fetching hero videos:', error);
        this.error = 'Failed to load hero videos';
      } finally {
        this.loading = false;
      }
    },

    initializeFirstVideo() {
      if (!this.$refs.videos) return;
      
      let firstVideo = null;
      if (Array.isArray(this.$refs.videos)) {
        firstVideo = this.$refs.videos[0];
      } else {
        firstVideo = this.$refs.videos;
      }

      if (firstVideo) {
        // Initialize video.js player
        const player = videojs(firstVideo, {
          controls: false,
          autoplay: false,
          preload: 'auto',
          muted: true,
          fluid: true,
          playsinline: true
        });

        // Store player reference
        this.videojsPlayers[0] = player;
        
        // Start playback
        this.startVideoPlayback(firstVideo);
      }
    },

    startVideoPlayback(videoElement) {
      if (!videoElement) return;
      
      try {
        // Ensure video is muted for autoplay
        videoElement.muted = true;
        this.isMuted = true;
        
        // Get the current slide's video URL
        const currentSlide = this.slides[this.currentSlide];
        if (currentSlide?.promo_hls_url) {
          // Get the player instance
          const player = this.videojsPlayers[this.currentSlide];
          if (player) {
            player.src({
              src: currentSlide.promo_hls_url,
              type: 'application/x-mpegURL'
            });
            player.play().catch(error => {
              console.error('Video playback failed:', error);
            });
          }
        }
      } catch (error) {
        console.error('Error starting video playback:', error);
      }
    },
    getYear(dateString) {
      return dateString ? new Date(dateString).getFullYear() : '';
    },
    formatDuration(seconds) {
      if (!seconds) return '';
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    },
    formatTitle(title) {
      if (!title) return '';
      title = title.trim();
      // Only first letter uppercase, rest lowercase for the whole string
      return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
    },
    capitalizeText(text) {
      if (!text) return '';
      // Capitalize the first letter of every word
      return text.split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    },
    formatDescription(description) {
      if (!description) return '';
      // First letter uppercase, rest lowercase
      return description.charAt(0).toUpperCase() + description.slice(1).toLowerCase();
    },
    setupEventListeners() {
      const heroContainer = document.getElementById('heroContainer')
      if (heroContainer) {
        heroContainer.addEventListener('mouseenter', this.pauseAutoplay)
        heroContainer.addEventListener('mouseleave', this.resumeAutoplay)
      }
    },
    setupTouchEvents() {
      const heroContainer = document.getElementById('heroContainer')
      if (heroContainer) {
        heroContainer.addEventListener('touchstart', this.handleTouchStart, { passive: true })
        heroContainer.addEventListener('touchmove', this.handleTouchMove, { passive: true })
        heroContainer.addEventListener('touchend', this.handleTouchEnd, { passive: true })
      }
    },
    handleTouchStart(event) {
      this.touchStartX = event.touches[0].clientX
      this.touchStartY = event.touches[0].clientY
      this.touchStartTime = Date.now()
      this.isDragging = false // Start as not dragging
      this.dragOffset = 0
      
      // Pause autoplay during potential drag
      if (this.videoTimeout) {
        clearTimeout(this.videoTimeout)
      }
    },
    handleTouchMove(event) {
      this.touchEndX = event.touches[0].clientX
      this.touchEndY = event.touches[0].clientY
      
      const deltaX = this.touchEndX - this.touchStartX
      const deltaY = this.touchEndY - this.touchStartY
      
      // Only start dragging if we've moved enough horizontally
      if (!this.isDragging && Math.abs(deltaX) > this.minDragDistance) {
        this.isDragging = true
      }
      
      // Only handle swipe if we're actually dragging
      if (this.isDragging && Math.abs(deltaX) > Math.abs(deltaY)) {
        event.preventDefault()
        
        const currentSlide = document.querySelector('.carousel-slide.active')
        const nextSlide = document.querySelectorAll('.carousel-slide')[
          (this.currentSlide + 1) % this.slides.length
        ]
        const prevSlide = document.querySelectorAll('.carousel-slide')[
          (this.currentSlide - 1 + this.slides.length) % this.slides.length
        ]
        
        // Calculate drag percentage and apply spring effect
        const dragPercentage = deltaX / window.innerWidth
        const springEffect = Math.sin(dragPercentage * Math.PI) * 0.1
        
        // Move current slide with spring effect
        currentSlide.style.transform = `translateX(${deltaX + springEffect * 100}px) scale(${1.05 - Math.abs(dragPercentage) * 0.1})`
        currentSlide.style.transition = 'none'
        
        // Move next/prev slides with parallax effect
        if (deltaX > 0) {
          // Swiping right
          prevSlide.style.transform = `translateX(${-100 + dragPercentage * 100}%) scale(${0.95 + dragPercentage * 0.1})`
          prevSlide.style.opacity = Math.abs(dragPercentage)
          prevSlide.style.transition = 'none'
          prevSlide.style.zIndex = '1'
        } else {
          // Swiping left
          nextSlide.style.transform = `translateX(${100 + dragPercentage * 100}%) scale(${0.95 + Math.abs(dragPercentage) * 0.1})`
          nextSlide.style.opacity = Math.abs(dragPercentage)
          nextSlide.style.transition = 'none'
          nextSlide.style.zIndex = '1'
        }
        
        this.dragOffset = deltaX
      }
    },
    handleTouchEnd() {
      if (!this.isDragging) return
      
      this.isDragging = false
      const swipeThreshold = window.innerWidth * 0.3
      const swipeDistance = this.touchEndX - this.touchStartX
      const swipeTime = Date.now() - this.touchStartTime
      
      const currentSlide = document.querySelector('.carousel-slide.active')
      const nextSlide = document.querySelectorAll('.carousel-slide')[
        (this.currentSlide + 1) % this.slides.length
      ]
      const prevSlide = document.querySelectorAll('.carousel-slide')[
        (this.currentSlide - 1 + this.slides.length) % this.slides.length
      ]
      
      currentSlide.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      nextSlide.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      prevSlide.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      
      if (Math.abs(swipeDistance) > swipeThreshold || (Math.abs(swipeDistance) > 50 && swipeTime < 300)) {
        this.isManualNavigation = true
        if (swipeDistance > 0) {
          this.prevSlide()
        } else {
          this.nextSlide()
        }
      } else {
        currentSlide.style.transform = 'translateX(0) scale(1.05)'
        nextSlide.style.transform = 'translateX(100%) scale(0.95)'
        prevSlide.style.transform = 'translateX(-100%) scale(0.95)'
        nextSlide.style.opacity = '0'
        prevSlide.style.opacity = '0'
      }
    },
    cleanup() {
      // Cleanup video.js players
      this.videojsPlayers.forEach(player => {
        if (player) {
          player.dispose();
        }
      });
      this.videojsPlayers = [];

      // Remove event listeners
      const heroContainer = document.getElementById('heroContainer');
      if (heroContainer) {
        heroContainer.removeEventListener('touchstart', this.handleTouchStart);
        heroContainer.removeEventListener('touchmove', this.handleTouchMove);
        heroContainer.removeEventListener('touchend', this.handleTouchEnd);
      }
      
      // Clear any pending timeouts
      if (this.videoTimeout) {
        clearTimeout(this.videoTimeout);
      }
    },
    showSlide(index) {
      if (index === this.currentSlide) return;
      const currentSlide = document.querySelector('.carousel-slide.active');
      const nextSlide = document.querySelectorAll('.carousel-slide')[index];
      if (currentSlide && nextSlide) {
        this.isDragging = false;
        this.dragOffset = 0;
        const direction = index > this.currentSlide ? 'next' : 'prev';
        if (direction === 'next') {
          currentSlide.classList.add('prev');
          nextSlide.style.transform = 'translateX(100%) scale(0.95)';
        } else {
          currentSlide.classList.add('prev');
          nextSlide.style.transform = 'translateX(-100%) scale(0.95)';
        }
        requestAnimationFrame(() => {
          currentSlide.style.opacity = '0';
          currentSlide.style.transform = direction === 'next' ? 
            'translateX(-100%) scale(0.95)' : 
            'translateX(100%) scale(0.95)';
          nextSlide.style.opacity = '1';
          nextSlide.style.transform = 'translateX(0) scale(1.05)';
        });
        setTimeout(() => {
          this.stopAllVideos();
          this.currentSlide = index;
          currentSlide.classList.remove('active', 'prev');
          nextSlide.classList.add('active');
          // Pre-load next video
          const nextVideo = this.$refs.videos[index];
          if (nextVideo) {
            nextVideo.load();
          }
        }, 800);
      }
    },
    handleAudioToggle(event) {
      // Prevent any default behavior and stop event propagation
      event.preventDefault();
      event.stopPropagation();

      if (!this.isVideoPlaying || !this.activeVideo) {
        console.log('No active video to toggle audio');
        return;
      }
      
      try {
        // Toggle mute state
        this.isMuted = !this.isMuted;
        this.activeVideo.muted = this.isMuted;
        
        // If video is paused, try to play it
        if (this.activeVideo.paused) {
          this.playVideo();
        }

        // Log state change
        console.log('Audio state changed:', this.isMuted ? 'muted' : 'unmuted');
      } catch (error) {
        console.error('Audio toggle error:', error);
        // Reset to safe state
        this.isMuted = true;
        if (this.activeVideo) {
          this.activeVideo.muted = true;
        }
      }
    },
    toggleMute() {
      this.isMuted = !this.isMuted;
      // Update all video elements
      const videos = this.$refs.videos;
      if (videos) {
        if (Array.isArray(videos)) {
          videos.forEach(video => {
            if (video) {
              video.muted = this.isMuted;
            }
          });
        } else if (videos) {
          videos.muted = this.isMuted;
        }
      }
      // Update active video if exists
      if (this.activeVideo) {
        this.activeVideo.muted = this.isMuted;
      }
      // Save preference to localStorage
      localStorage.setItem('videoMuted', this.isMuted.toString());
    },
    handleVideoPlaying(index) {
      console.log('handleVideoPlaying', 'isVideoPlaying:', this.isVideoPlaying, 'currentSlide:', this.currentSlide, 'index:', index);
      this.isVideoPlaying = true;
    },
    handleVideoEnded(index) {
      console.log('handleVideoEnded', 'isVideoPlaying:', this.isVideoPlaying, 'currentSlide:', this.currentSlide, 'index:', index);
      this.isVideoPlaying = false;
      // Move to next slide (loop if at end)
      let nextIndex = (this.currentSlide + 1) % this.slides.length;
      this.showSlide(nextIndex);
      // Start playing the next video after transition
      setTimeout(() => {
        this.playVideo();
      }, 800); // Match your slide transition duration
    },
    handleVideoError(index) {
      console.log('handleVideoError', 'isVideoPlaying:', this.isVideoPlaying, 'currentSlide:', this.currentSlide, 'index:', index);
      this.isVideoPlaying = false;
    },
    handleVideoEnd() {
      console.log('Video ended naturally');
      if (!this.isManualNavigation) {
        this.stopVideo();
        this.nextSlide();
        // Ensure next video plays
        setTimeout(() => {
          this.playVideo();
        }, 1000);
      }
    },
    stopVideo() {
      if (this.activeVideo) {
        this.activeVideo.pause()
        this.activeVideo.currentTime = 0
        this.isVideoPlaying = false
        this.activeVideo = null
      }
    },
    stopAllVideos() {
      if (this.$refs.videos) {
        this.$refs.videos.forEach(video => {
          video.pause()
          video.currentTime = 0
        })
      }
      this.isVideoPlaying = false
      this.activeVideo = null
    },
    nextSlide() {
      this.isManualNavigation = false;
      const newIndex = (this.currentSlide + 1) % this.slides.length;
      this.showSlide(newIndex);
    },
    prevSlide() {
      this.isManualNavigation = true;
      const newIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
      this.showSlide(newIndex);
    },
    pauseAutoplay() {
      if (this.videoTimeout) {
        clearTimeout(this.videoTimeout)
      }
    },
    resumeAutoplay() {
      if (!this.videoTimeout && !this.isVideoPlaying) {
        this.startVideoPlayback()
      }
    },
    navigateToMovie(movieId) {
      if (movieId) {
        console.log('Navigating to movie:', movieId);
        this.$router.push({
          name: 'MovieDetails',
          params: { id: movieId }
        });
      } else {
        console.log('No movie ID available');
      }
    },
    handleMobileVideoClick(slide) {
      // Check if on mobile
      if (window.innerWidth <= 768) {
        // Stop video playback
        this.stopVideo();
        // Navigate to movie details
        this.navigateToMovie(slide.id);
      }
    }
  }
}
</script>

<style scoped>
#heroContainer {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  margin-top: 0;
  background: #000;
  display: flex;
  justify-content: space-between;
  perspective: 1000px;
}

.hero-media-container {
  position: relative;
  width: 75%;
  height: 100vh;
  margin-left: auto;
  overflow: hidden;
  touch-action: pan-y pinch-zoom;
  transform-style: preserve-3d;
}

.hero-media, .carousel-slide video, .carousel-slide img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  object-fit: cover;
  object-position: center;
  z-index: 10;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(1.1);
}

#heroGradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(92deg, 
    rgb(0, 0, 0) 0%, 
    rgb(0 0 0 / 88%) 15%, 
    rgb(0 0 0 / 69%) 25%, 
    rgba(0, 0, 0, 0.5) 60%, 
    rgba(0, 0, 0, 0.2) 80%,
    rgba(0, 0, 0, 0) 100%
  );
  z-index: 3;
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  backdrop-filter: blur(0px);
}

.hero-content {
  position: relative;
  width: 40%;
  height: 100vh;
  /* Responsive padding for zoom and big screens */
  padding: 11rem 2.5vw 2.5rem;
  z-index: 20;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgb(0, 0, 0);
  bottom: 0;
}

@media screen and (max-width: 1200px) {
  .hero-content {
    padding-top: 3.5rem;
  }
}

@media screen and (max-width: 900px) {
  #heroContainer {
    height: 0;
    padding-bottom: 56.25%;
    min-height: unset;
    position: relative;
  }
  .hero-media-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  .hero-media, .carousel-slide video, .carousel-slide img {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  .hero-content {
    display: none;
  }
  .hero-media-container::before,
  .hero-media-container::after,
  #heroGradient {
    display: none;
  }
  .carousel-nav {
    display: none;
  }
  .video-controls {
    bottom: 25px;
    right: 25px;
  }
  
  .video-audio-toggle {
    width: 44px;
    height: 44px;
  }

  .video-audio-toggle::before {
    inset: -10px;
  }
}

.hero-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 0;
}

.hero-badges {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0;
}

.hero-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
}

.hero-badge.premium {
  background: linear-gradient(45deg, #c30059, #ff0077);
}

.hero-title {
  font-size: clamp(2rem, 2.5vw, 3rem);
  font-weight: 700;
  background: linear-gradient(45deg, #fff 30%, rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  margin: 0;
  order: 1;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0;
  order: 2;
}

.meta-dot {
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
}

.hero-description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0;
  order: 3;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin: 0;
  order: 4;
}

.hero-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hero-button.primary {
  background: linear-gradient(45deg, #c30059, #ff0077);
  color: white;
}

.hero-button.primary:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(195, 0, 89, 0.3);
}

.hero-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
}

.hero-button.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.hero-thumbnails {
  position: relative;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-top: 1rem;
  order: 5;
}

.hero-thumbnails::before {
  position: absolute;
  top: -1.5rem;
  left: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  font-weight: 500;
}

.hero-thumbnail {
  width: 100px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.hero-thumbnail::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.hero-thumbnail:hover::after {
  background: rgba(0, 0, 0, 0.2);
}

.hero-thumbnail.active {
  transform: scale(1.1);
}

.hero-thumbnail.active::after {
  background: rgba(0, 0, 0, 0);
}

.hero-thumbnail.active::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid #ff0077;
  border-radius: 6px;
  z-index: 2;
}

.hero-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-nav {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.thumbnail-nav:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  transform: translateX(100%) scale(0.95);
  will-change: transform, opacity;
  backface-visibility: hidden;
  z-index: 1;
}

.carousel-slide.active {
  opacity: 1;
  pointer-events: all;
  transform: translateX(0) scale(1.05);
  z-index: 2;
}

.carousel-slide.prev {
  transform: translateX(-100%) scale(0.95);
  z-index: 1;
}

.carousel-slide video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(1.05);
  will-change: transform;
  backface-visibility: hidden;
  pointer-events: none;
}

.carousel-slide.active img,
.carousel-slide.active video {
  transform: scale(1);
}

.carousel-slide.active .video-controls {
  opacity: 1;
  pointer-events: all;
  z-index: 1000;
}

.carousel-nav {
  display: none;
}

.carousel-dots {
  position: absolute;
  bottom: 7px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 20;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.carousel-dot.active {
  background: #c30059;
  transform: scale(1.2);
}

@media screen and (min-width: 901px) {
  .carousel-dots {
    display: none;
  }
}

@media screen and (max-width: 480px) {
  .video-controls {
    bottom: 20px;
    right: 20px;
  }
  
  .video-audio-toggle {
    width: 40px;
    height: 40px;
  }
  
  .video-audio-toggle i {
    font-size: 1.1rem;
  }

  .video-audio-toggle::before {
    inset: -8px;
  }

  .carousel-dots {
    bottom: 15px;
  }

  .carousel-dot {
    width: 6px;
    height: 6px;
  }
}

.carousel-slide::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-slide.active::after {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1.05);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0) scale(1.05);
    opacity: 1;
  }
  to {
    transform: translateX(-100%) scale(0.95);
    opacity: 0;
  }
}

.mute-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 30;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mute-button:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .mute-button {
    bottom: 10px;
    right: 15px;
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
    background: rgba(0, 0, 0, 0.7);
  }
}

.mobile-video-click-area {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.video-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

@media (min-width: 769px) {
  .mobile-video-click-area {
    cursor: default;
  }
}

/* Override video.js fluid mode to remove unwanted padding and fill parent */
#heroContainer .vjs-fluid {
  padding-top: 0 !important;
  height: 100% !important;
  min-height: 0 !important;
}
</style>