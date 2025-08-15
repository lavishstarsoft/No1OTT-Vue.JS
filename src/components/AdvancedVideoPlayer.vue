<template>
  <div class="video-wrapper" 
       @click="handleVideoClick" 
       @touchstart="handleTouchStart" 
       @touchmove="handleTouchMove" 
       @touchend="handleTouchEnd"
       :class="{ 'mobile-view': isMobile }">
  <div class="video-container">
      <video ref="videoElement" class="video-js vjs-big-play-centered vjs-theme-ott" :poster="poster" preload="auto" playsinline webkit-playsinline crossorigin="anonymous" data-setup='{}'>
      <source :src="src" type="application/x-mpegURL" />
        <p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video</p>
    </video>

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <svg class="spinner-svg" viewBox="0 0 50 50">
            <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
          </svg>
          <span class="loading-text">Loading...</span>
        </div>
      </div>

      <div class="custom-controls-overlay" :class="{ 'controls-hidden': !showControls }">
        <!-- Top Controls -->
        <div class="top-controls">
          <div class="top-left">
            <button @click="handleBackClick" class="control-button back-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h3 class="video-title" v-if="title">{{ title }}</h3>
          </div>
        </div>

        <!-- Center Controls with Mobile Rotation Hint -->
        <div class="center-controls">
          <button @click="skipBackward" class="control-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 17l-5-5 5-5"/>
              <path d="M17 17l-5-5 5-5"/>
            </svg>
            <span class="button-text">10</span>
          </button>
          <button @click="togglePlay" class="control-button play-button">
            <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          </button>
          <button @click="skipForward" class="control-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 17l5-5-5-5"/>
              <path d="M13 17l5-5-5-5"/>
            </svg>
            <span class="button-text">10</span>
          </button>
        </div>

        <!-- Mobile Rotation Hint -->
        <div v-if="isMobile && !isLandscape && !hasShownRotationHint" class="rotation-hint">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9v-3m-9-9a9 9 0 019-9m-9 9v3"/>
          </svg>
          <span>Rotate for fullscreen</span>
        </div>

        <!-- Bottom Controls -->
        <div class="bottom-controls">
          <div class="progress-container">
            <div class="progress-bar" @click="onProgressBarClick" 
                 @touchstart="handleProgressBarTouchStart" 
                 @touchmove="handleProgressBarTouchMove" 
                 @touchend="handleProgressBarTouchEnd">
              <div class="progress-background"></div>
              <div class="progress-loaded" :style="{ width: bufferedPercent + '%' }"></div>
              <div class="progress-played" :style="{ width: playedPercent + '%' }"></div>
              <div class="progress-thumb" :style="{ left: `calc(${playedPercent}% - 8px)` }"></div>
              <input type="range" min="0" :max="duration" :value="currentTime" @input="onProgressChange" @mousedown="isDragging = true" @mouseup="isDragging = false" class="progress-slider">
            </div>
            <div class="progress-row">
              <div class="time-display">
                {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
              </div>
              <div class="resolution-container">
                <span class="resolution-text">{{ selectedQuality }}</span>
                <button class="settings-icon-btn" @click="$refs.qualitySelector && $refs.qualitySelector.focus()" type="button">
                  <svg class="settings-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 12 2.6V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                </button>
                <select ref="qualitySelector" v-model="selectedQuality" class="quality-selector" @change="onQualityChange">
                  <option v-for="quality in qualities" :key="quality" :value="quality">{{ quality }}</option>
                </select>
                <button v-if="!isMobile" @click="toggleFullscreen" class="control-button fullscreen-btn">
                  <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
                    <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                    <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
                    <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3"/>
                    <path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
                    <path d="M3 16h3a2 2 0 0 1 2 2v3"/>
                    <path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="controls-row">
            <div class="left-controls">
            </div>

            <div class="right-controls">
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default {
  name: 'AdvancedVideoPlayer',

  props: {
    src: {
      type: String,
      required: true
    },
    poster: {
      type: String,
      default: ''
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    enableAutoRotate: {
      type: Boolean,
      default: true
    },

  },
  emits: ['close'],
  data() {
    return {
      player: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      buffered: 0,
      isMuted: false,
      volume: 1,
      isFullscreen: false,
      showControls: true,
      controlsTimeout: null,
      qualities: ['Auto', '1080p', '720p', '480p', '360p'],
      selectedQuality: 'Auto',
      bufferedPercent: 0,
      playedPercent: 0,
      isDragging: false,
      isMobile: false,
      isLandscape: false,
      touchStartTime: 0,
      touchStartX: 0,
      touchStartY: 0,
      touchMoved: false,
      lastTapTime: 0,
      controlsTimeoutDuration: 3500, // 3.5 seconds
      seekThreshold: 50, // Minimum pixels to trigger seek
      volumeThreshold: 30, // Minimum pixels to trigger volume change
      seekRate: 10, // Seconds to seek per swipe,
      isSeeking: false,
      hasAutoRotated: false,
      hasShownRotationHint: false,
      isLoading: true,
      loadingTimeout: null,
      userPaused: false, // Track if the user initiated the pause
      continuousPlayback: true, // Enable continuous playback mode
      lastPlayTime: 0, // Track last play time for continuity
      pauseRecoveryAttempts: 0, // Track recovery attempts
      wasPlayingBeforeSeek: false // Track if video was playing before seeking
    }
  },
  computed: {
    volumeIconState() {
      if (this.isMuted || this.volume === 0) {
        return 'muted';
      } else if (this.volume < 0.5) {
        return 'low';
      } else {
        return 'high';
      }
    }
  },
      mounted() {
      console.log('🎬 AdvancedVideoPlayer mounted with props:', {
        src: this.src,
        title: this.title
      })
      this.initializePlayer();
      this.checkMobileDevice();
      this.checkOrientation();

      // Initialize mobile audio context
      this.initializeMobileAudioContext();

      // Add window popstate event listener for handling browser back button
      window.addEventListener('popstate', this.handleBackNavigation);

      // Add orientation change listeners
      if (this.isMobile) {
        window.addEventListener('orientationchange', this.handleOrientationChange);
        window.addEventListener('resize', this.checkOrientation);
      }

      // Setup orientation listener
      this.setupOrientationListener();
    },
  methods: {
    checkMobileDevice() {
      this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        && (typeof window.orientation !== 'undefined' || navigator.maxTouchPoints > 0);
      
      // Add mobile-specific autoplay handling
      if (this.isMobile && this.autoplay) {
        // For mobile, we need to handle autoplay differently
        this.handleMobileAutoplay();
      }
    },

    handleMobileAutoplay() {
      // Mobile browsers require user interaction for autoplay
      // We'll start muted and unmute after user interaction
      if (this.player) {
        this.player.muted(true);
        this.player.volume(0.5); // Set volume but keep muted
        console.log('🎬 Mobile autoplay: Video muted for user interaction');
      }
    },

    // Handle mobile audio permissions and user interaction
    handleMobileAudioInteraction() {
      if (this.isMobile && this.player) {
        try {
          // Resume audio context if suspended
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          if (audioContext.state === 'suspended') {
            audioContext.resume();
          }
          
          // Unmute video player
          if (this.player.muted()) {
            this.player.muted(false);
            this.player.volume(0.5);
            console.log('🎬 Mobile: Audio enabled after user interaction');
          }
        } catch (error) {
          console.error('🎬 Mobile audio interaction error:', error);
        }
      }
    },

    // Mobile-specific audio cleanup
    handleMobileAudioCleanup() {
      if (this.isMobile && this.player) {
        try {
          // Force stop audio on mobile
          this.player.pause();
          this.player.muted(true);
          this.player.volume(0);
          
          // For iOS Safari, we need to be more aggressive
          if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            // Create a silent audio context to stop any background audio
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.close();
          }
          
          console.log('🎬 Mobile audio cleanup completed');
        } catch (error) {
          console.error('🎬 Mobile audio cleanup error:', error);
        }
      }
    },

    // Initialize mobile audio context for better audio support
    initializeMobileAudioContext() {
      if (this.isMobile) {
        try {
          // Create and resume audio context for mobile audio support
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          if (audioContext.state === 'suspended') {
            audioContext.resume();
          }
          console.log('🎬 Mobile audio context initialized');
        } catch (error) {
          console.error('🎬 Mobile audio context error:', error);
        }
      }
    },
    
    setupOrientationListener() {
      if (this.isMobile && this.enableAutoRotate) {
        window.addEventListener('orientationchange', this.handleOrientationChange);
        document.addEventListener('fullscreenchange', this.handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);
        
        // Add play state listener
        this.player.on('play', this.handleFirstPlay);
      }
    },

    async handleFirstPlay() {
      // Only handle first play
      if (!this.hasAutoRotated && this.isMobile && this.enableAutoRotate) {
        this.hasAutoRotated = true;
        await this.checkAndRotate();
      }
      // Remove listener after first play
      this.player.off('play', this.handleFirstPlay);
    },

    async checkAndRotate() {
      // Multiple ways to detect landscape mode
      let isLandscape = false;
      
      if (window.screen?.orientation?.type) {
        // Modern browsers
        isLandscape = window.screen.orientation.type.includes('landscape');
      } else if (window.orientation !== undefined) {
        // Fallback for older devices
        isLandscape = Math.abs(window.orientation) === 90;
      } else {
        // Last resort - check window dimensions
        isLandscape = window.innerWidth > window.innerHeight;
      }

      if (!isLandscape && !this.isFullscreen) {
        await this.enterFullscreen();
      }
    },

    async handleOrientationChange() {
      // Wait for orientation change to complete
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const isLandscape = window.orientation === 90 || window.orientation === -90;
      
      if (isLandscape && !this.isFullscreen) {
        await this.enterFullscreen();
      } else if (!isLandscape && this.isFullscreen) {
        await this.exitFullscreen();
      }
    },

    async enterFullscreen() {
      if (!this.isFullscreen) {
        try {
          const elem = this.$el;
          if (elem.requestFullscreen) {
            await elem.requestFullscreen();
          } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
          } else if (elem.mozRequestFullScreen) {
            await elem.mozRequestFullScreen();
          } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
          }

          // Try to lock orientation to landscape
          if (this.isMobile && window.screen?.orientation?.lock) {
            try {
              await window.screen.orientation.lock('landscape');
            } catch (e) {
              console.log('Orientation lock not supported');
            }
          }
        } catch (err) {
          console.error('Fullscreen error:', err);
        }
      }
    },

    async exitFullscreen() {
      if (this.isFullscreen) {
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            await document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            await document.msExitFullscreen();
          }

          // Unlock orientation
          if (this.isMobile && window.screen?.orientation?.unlock) {
            try {
              await window.screen.orientation.unlock();
            } catch (e) {
              console.log('Orientation unlock not supported');
            }
          }
        } catch (err) {
          console.error('Exit fullscreen error:', err);
        }
      }
    },

    async toggleFullscreen() {
      try {
        if (!this.isFullscreen) {
          // Enter fullscreen
          const elem = this.$refs.videoElement.parentElement;
          if (elem.requestFullscreen) {
            await elem.requestFullscreen();
          } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
          } else if (elem.mozRequestFullScreen) {
            await elem.mozRequestFullScreen();
          } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
          }
        } else {
          // Exit fullscreen
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            await document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            await document.msExitFullscreen();
          }
        }
      } catch (error) {
        console.error('Fullscreen toggle error:', error);
      }
    },

    handleFullscreenChange() {
      this.isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      // Try to lock orientation to landscape if entering fullscreen on mobile
      if (this.isFullscreen && this.isMobile) {
        this.tryLockOrientation();
      } else if (!this.isFullscreen && this.isMobile) {
        this.tryUnlockOrientation();
      }
    },

    tryLockOrientation() {
      if (!this.isMobile) return;

      try {
        // Check if screen orientation API is supported
        if (window.screen?.orientation?.lock && typeof window.screen.orientation.lock === 'function') {
          window.screen.orientation.lock('landscape')
            .catch(err => {
              console.log('Orientation lock not supported or permission denied:', err);
            });
        } else if (window.screen?.lockOrientation) {
          // Fallback for older browsers
          try {
            window.screen.lockOrientation('landscape');
          } catch (err) {
            console.log('Legacy orientation lock failed:', err);
          }
        }
      } catch (err) {
        console.log('Orientation lock not supported:', err);
      }
    },

    tryUnlockOrientation() {
      if (!this.isMobile) return;

      try {
        // Check if screen orientation API is supported
        if (window.screen?.orientation?.unlock && typeof window.screen.orientation.unlock === 'function') {
          // Use Promise.resolve().catch() to safely handle both Promise and non-Promise returns
          Promise.resolve(window.screen.orientation.unlock())
            .catch(err => {
              console.log('Orientation unlock error:', err);
            });
        } else if (window.screen?.unlockOrientation && typeof window.screen.unlockOrientation === 'function') {
          // Fallback for older browsers
          try {
            window.screen.unlockOrientation();
          } catch (err) {
            console.log('Legacy orientation unlock failed:', err);
          }
        }
      } catch (err) {
        console.log('Orientation unlock not supported:', err);
      }
    },

    initializePlayer() {
      const videoElement = this.$refs.videoElement;
      
      // Add fullscreen change event listeners
      document.addEventListener('fullscreenchange', this.handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);
      
      this.player = videojs(videoElement, {
        controls: false, // We'll use custom controls
        autoplay: this.autoplay,
        preload: 'auto',
        fluid: true,
        html5: {
          hls: {
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            overrideNative: true,
            handlePartialData: true,
            // Add better buffering settings for continuous playback
            maxBufferLength: 60,
            maxMaxBufferLength: 120,
            maxBufferSize: 120 * 1000 * 1000, // 120MB for better buffering
            maxBufferHole: 0.1, // Smaller buffer holes for smoother playback
            lowLatencyMode: false,
            backBufferLength: 60,
            // Add continuous playback settings
            limitRenditionByPlayerDimensions: false
          },
          vhs: {
            limitRenditionByPlayerDimensions: false,
            smoothQualityChange: true,
            maxPlaylistRetries: 10, // More retries for better reliability
            bufferSize: 60,
            enableLowInitialPlaylist: true,
            allowSeeksWithinUnsafeLiveWindow: true,
            handlePartialData: true,
            overrideNative: true,
            // Add better buffering settings for continuous playback
            maxBufferLength: 60,
            maxMaxBufferLength: 120,
            maxBufferSize: 120 * 1000 * 1000, // 120MB for better buffering
            maxBufferHole: 0.1, // Smaller buffer holes for smoother playback
            lowLatencyMode: false,
            backBufferLength: 60
          },
          nativeTextTracks: false,
          nativeAudioTracks: false,
          nativeVideoTracks: false
        },
        // Add performance options for continuous playback
        techOrder: ['html5'],
        playbackRates: [0.5, 1, 1.5, 2],
        responsive: true,
        aspectRatio: '16:9',
        // Add playback optimization for continuous streaming
        liveui: true,
        inactivityTimeout: 0,
        suppressNotSupportedError: true,
        // Add mobile-specific settings
        playsinline: true,
        'webkit-playsinline': true,
        // Add better error recovery
        errorDisplay: false,
        // Add autoplay settings for mobile
        muted: this.isMobile, // Start muted only on mobile to allow autoplay
        volume: 0.5,
        // Add continuous playback settings
        poster: this.poster
      });

      // Add loading event listeners
      this.player.on('loadstart', () => {
        console.log('🎬 Video loadstart event fired')
        this.isLoading = true;
      });

      this.player.on('loadeddata', () => {
        console.log('🎬 Video loadeddata event fired')
        this.isLoading = false;
      });

      this.player.on('waiting', () => {
        console.log('🎬 Video waiting event fired')
        // Show loading if waiting for more than 500ms
        this.loadingTimeout = setTimeout(() => {
          this.isLoading = true;
        }, 500);
        
        // Ensure playback continues after buffering
        if (this.continuousPlayback && !this.userPaused) {
          setTimeout(() => {
            if (this.player && !this.isPlaying && !this.userPaused) {
              this.player.play().catch(err => {
                console.log('Failed to resume after buffering:', err);
              });
            }
          }, 2000);
        }
      });

      this.player.on('playing', () => {
        console.log('🎬 Video playing event fired')
        this.isLoading = false;
        if (this.loadingTimeout) {
          clearTimeout(this.loadingTimeout);
        }
        // Unmute after playback starts
        if (this.player.muted()) {
          this.player.muted(false);
        }
      });

      this.player.on('error', (error) => {
        console.log('🎬 Video error event fired:', error)
        this.isLoading = false;
        // Try to recover from error
        this.handleVideoError(error);
      });

      // Add more event listeners for better control
      this.player.on('canplay', () => {
        console.log('🎬 Video canplay event fired')
        this.isLoading = false;
      });

      this.player.on('canplaythrough', () => {
        console.log('🎬 Video canplaythrough event fired')
        this.isLoading = false;
      });

      this.player.on('stalled', () => {
        console.log('🎬 Video stalled event fired')
        // Only try to resume if we're supposed to be playing
        if (this.isPlaying && !this.userPaused) {
          setTimeout(() => {
            if (this.player && this.isPlaying && !this.userPaused) {
              this.player.play().catch(err => {
                console.log('Failed to resume after stall:', err);
              });
            }
          }, 2000); // Longer delay for stall recovery
        }
      });

      this.player.on('suspend', () => {
        console.log('🎬 Video suspend event fired')
      });

      this.player.on('abort', () => {
        console.log('🎬 Video abort event fired')
      });

      // Event listeners
      this.player.on('timeupdate', this.onTimeUpdate);
      this.player.on('progress', this.onProgress);
      this.player.on('play', () => {
        console.log('🎬 Video play event fired')
        this.isPlaying = true;
        this.pauseRecoveryAttempts = 0; // Reset recovery attempts on successful play
        
        // Hide loading indicator when video starts playing
        this.isLoading = false;
      });
      this.player.on('pause', () => {
        console.log('🎬 Video pause event fired')
        this.isPlaying = false;
        this.lastPlayTime = this.player.currentTime();
        
        // Only auto-resume if it's not user-initiated and continuous playback is enabled
        if (!this.userPaused && this.continuousPlayback) {
          this.ensureContinuousPlayback();
        }
      });
      this.player.on('ended', () => {
        console.log('🎬 Video ended event fired')
        this.isPlaying = false;
      });
      this.player.on('loadedmetadata', () => {
        this.duration = this.player.duration();
        console.log('🎬 Video duration:', this.duration)
        // Get available qualities
        if (this.player.tech().hls) {
          const qualities = this.player.tech().hls.representations();
          if (qualities.length > 0) {
            this.qualities = ['Auto', ...qualities.map(q => `${q.height}p`)];
          }
        }
      });

      // Add visibility change listener to handle tab switching
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      
      // Add network recovery listener
      window.addEventListener('online', this.handleNetworkRecovery);
      
      // Add page unload listener to stop audio
      window.addEventListener('beforeunload', this.handlePageUnload);
      window.addEventListener('pagehide', this.handlePageUnload);
    },

    handlePageUnload() {
      // Stop all audio when page is unloading
      if (this.player) {
        this.player.pause();
        this.player.muted(true);
        this.player.volume(0);
      }
    },

    handleVideoError(error) {
      console.log('🎬 Handling video error:', error);
      // Try to reload the video after a short delay
      setTimeout(() => {
        if (this.player) {
          this.player.src(this.src);
          this.player.load();
          this.player.play().catch(err => {
            console.log('Failed to play after error recovery:', err);
            // Try one more time with a longer delay
            setTimeout(() => {
              if (this.player) {
                this.player.play().catch(err2 => {
                  console.log('Second attempt to play after error failed:', err2);
                });
              }
            }, 3000);
          });
        }
      }, 2000);
    },

    // Add network recovery method
    handleNetworkRecovery() {
      if (this.player && !this.isPlaying && !this.userPaused && this.continuousPlayback) {
        console.log('🎬 Attempting network recovery');
        this.player.play().catch(err => {
          console.log('Network recovery failed:', err);
        });
      }
    },

    // Ensure continuous playback
    ensureContinuousPlayback() {
      if (this.continuousPlayback && this.player && !this.isPlaying && !this.userPaused) {
        console.log('🎬 Ensuring continuous playback');
        this.pauseRecoveryAttempts++;
        
        if (this.pauseRecoveryAttempts <= 3) { // Limit recovery attempts
          setTimeout(() => {
            if (this.player && !this.isPlaying && !this.userPaused) {
              this.player.play().catch(err => {
                console.log('Continuous playback recovery failed:', err);
              });
            }
          }, 1500 * this.pauseRecoveryAttempts); // Exponential backoff
        } else {
          console.log('🎬 Max recovery attempts reached, resetting');
          this.pauseRecoveryAttempts = 0;
        }
      }
    },

    handleUnexpectedPause() {
      // Only auto-resume if it's not a user-initiated pause
      if (!this.userPaused && this.player && !this.player.ended()) {
        console.log('🎬 Auto-resuming video after unexpected pause');
        // Use a longer delay to prevent rapid pause/resume cycles
        setTimeout(() => {
          if (this.player && !this.isPlaying && !this.userPaused) {
            this.player.play().catch(err => {
              console.log('Failed to auto-resume:', err);
              // Try one more time with exponential backoff
              setTimeout(() => {
                if (this.player && !this.isPlaying && !this.userPaused) {
                  this.player.play().catch(err2 => {
                    console.log('Second auto-resume attempt failed:', err2);
                  });
                }
              }, 1000);
            });
          }
        }, 1000); // Increased delay to prevent flickering
      }
    },

    handleVisibilityChange() {
      if (document.hidden) {
        // Page is hidden, stop video and audio completely
        if (this.player) {
          this.player.pause();
          this.player.muted(true);
          this.player.volume(0);
        }
      } else {
        // Page is visible again, resume if it was playing
        if (this.player && !this.isPlaying && !this.userPaused) {
          this.player.muted(false);
          this.player.volume(0.5);
          this.player.play().catch(err => {
            console.log('Failed to resume after visibility change:', err);
          });
        }
      }
    },

    showControlsTemporarily() {
      this.showControls = true;
      if (this.controlsTimeout) {
        clearTimeout(this.controlsTimeout);
      }
      
      if (this.isPlaying) {
        this.controlsTimeout = setTimeout(() => {
          // Only hide if we're not seeking or touching
          if (!this.isDragging && !this.isSeeking) {
            this.showControls = false;
          }
        }, 4000); // Increased to 4 seconds
      }
    },
    
    hideControls() {
      if (this.isPlaying) {
        this.showControls = false;
      }
    },

    togglePlay() {
      if (!this.player || typeof this.player.paused !== 'function') {
        return;
      }
      if (this.isPlaying) {
        this.userPaused = true;
        this.pauseRecoveryAttempts = 0; // Reset recovery attempts on user pause
        this.player.pause();
      } else {
        this.userPaused = false;
        this.pauseRecoveryAttempts = 0; // Reset recovery attempts on user play
        
        // Handle mobile audio unmuting when play is pressed
        this.handleMobileAudioInteraction();
        
        this.player.play();
      }
      this.showControls = true;
      this.showControlsTemporarily();
    },

    onTimeUpdate() {
      if (!this.player || typeof this.player.currentTime !== 'function' || typeof this.player.duration !== 'function') {
        return;
      }
      this.currentTime = this.player.currentTime();
      this.playedPercent = (this.currentTime / this.duration) * 100;
    },

    onProgress() {
      if (!this.player || typeof this.player.buffered !== 'function' || typeof this.player.duration !== 'function') {
        return;
      }
      if (this.player.buffered().length > 0) {
        this.buffered = this.player.buffered().end(0);
        this.bufferedPercent = (this.buffered / this.duration) * 100;
      }
    },

    onProgressChange(event) {
      if (!this.player || typeof this.player.currentTime !== 'function') {
        return;
      }
      const time = parseFloat(event.target.value);
      this.player.currentTime(time);
      this.isSeeking = true;
    },

    onVolumeChange(event) {
      if (!this.player || typeof this.player.volume !== 'function') {
        return;
      }
      const volume = parseFloat(event.target.value);
      this.volume = volume;
      this.player.volume(volume);
      this.isMuted = volume === 0;
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      this.player.muted(this.isMuted);
    },

    skipForward() {
      if (!this.player || typeof this.player.currentTime !== 'function') {
        return;
      }
      this.player.currentTime(this.currentTime + 10);
    },

    skipBackward() {
      if (!this.player || typeof this.player.currentTime !== 'function') {
        return;
      }
      this.player.currentTime(this.currentTime - 10);
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    beforeDestroy() {
      // Use comprehensive cleanup
      this.cleanupVideoPlayer();
      
      // Clean up all event listeners
      if (this.isMobile && this.enableAutoRotate) {
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
      }
      // Remove visibility change listener
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      // Remove network recovery listener
      window.removeEventListener('online', this.handleNetworkRecovery);
      // Remove page unload listeners
      window.removeEventListener('beforeunload', this.handlePageUnload);
      window.removeEventListener('pagehide', this.handlePageUnload);
      
      console.log('🎬 Component destroyed, all cleanup completed');
    },

    onProgressBarClick(event) {
      if (!this.player || typeof this.player.currentTime !== 'function' || typeof this.player.duration !== 'function') {
        return;
      }
      if (!this.isDragging) {
        const progressBar = event.currentTarget;
        const clickX = event.clientX - progressBar.getBoundingClientRect().left;
        const progressBarWidth = progressBar.offsetWidth;
        const seekTime = (clickX / progressBarWidth) * this.duration;
        this.player.currentTime(seekTime);
      }
    },

    onQualityChange() {
      if (!this.player || !this.player.tech().hls) return;
      
      const qualities = this.player.tech().hls.representations();
      const selectedHeight = parseInt(this.selectedQuality);
      
      if (this.selectedQuality === 'Auto') {
        // Enable auto quality selection
        qualities.forEach(q => q.enabled(true));
      } else {
        // Enable only selected quality
        qualities.forEach(q => {
          q.enabled(q.height === selectedHeight);
        });
      }
    },

    handleTouch(event) {
      // Store touch start time and position
      this.touchStartTime = Date.now();
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;

      // Show controls on touch
      this.showControls = true;
      
      // Clear any existing timeout
      if (this.controlsTimeout) {
        clearTimeout(this.controlsTimeout);
      }
      
      // Handle double tap
      const currentTime = Date.now();
      const tapLength = currentTime - this.lastTapTime;
      
      if (tapLength < 300 && tapLength > 0) {
        // Double tap detected
        this.togglePlay();
        event.preventDefault();
      }
      
      this.lastTapTime = currentTime;
    },

    handleTouchEnd(event) {
      const touchDuration = Date.now() - this.touchStartTime;
      
      // Handle tap (quick touch without much movement)
      if (!this.touchMoved && touchDuration < 200) {
        if (!event.target.closest('.custom-controls-overlay')) {
          this.toggleControlsVisibility();
        }
      }

      // Reset touch tracking
      this.touchStartX = null;
      this.touchStartY = null;
      this.touchMoved = false;
      
      // Start hide timer for controls
      if (this.isPlaying) {
        this.startHideTimer();
      }

      // Reset seeking state after a delay
      setTimeout(() => {
        this.isSeeking = false;
      }, 200);
    },

    toggleControlsVisibility() {
      this.showControls = !this.showControls;
      if (this.showControls) {
        this.startHideTimer();
      }
    },

    handleVideoClick(event) {
      // Prevent click if we were seeking
      if (this.isSeeking) {
        this.isSeeking = false;
        return;
      }

      // If clicked on controls, don't toggle
      if (event.target.closest('.custom-controls-overlay')) {
        return;
      }

      // Handle mobile autoplay - unmute on first interaction
      this.handleMobileAudioInteraction();

      this.toggleControlsVisibility();
    },

    handleTouchStart(event) {
      // Store initial touch data
      this.touchStartTime = Date.now();
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
      this.touchMoved = false;

      // Show controls immediately on touch
      this.showControls = true;
      
      // Handle mobile audio unmuting on first touch
      this.handleMobileAudioInteraction();
      
      // Handle double tap
      const timeSinceLastTap = this.touchStartTime - this.lastTapTime;
      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // Double tap detected
        if (!event.target.closest('.custom-controls-overlay')) {
          this.togglePlay();
          event.preventDefault();
        }
      }
      this.lastTapTime = this.touchStartTime;
    },

    handleTouchMove(event) {
      if (!this.touchStartX || !this.touchStartY || !this.isDragging) return;

      event.preventDefault();
      const touchX = event.touches[0].clientX;
      const touchY = event.touches[0].clientY;
      const deltaX = touchX - this.touchStartX;
      const deltaY = touchY - this.touchStartY;

      // If movement is significant, mark as moved
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        this.touchMoved = true;
      }

      // Calculate new position based on touch with better precision
      const progressBar = event.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const clickX = touchX - rect.left;
      const progressBarWidth = rect.width;
      
      // Ensure we don't go outside the progress bar bounds
      const clampedX = Math.max(0, Math.min(clickX, progressBarWidth));
      const seekPercent = (clampedX / progressBarWidth);
      const seekTime = seekPercent * this.duration;
      
      // Update video time with throttling for smooth performance
      if (this.player && typeof this.player.currentTime === 'function') {
        const newTime = Math.max(0, Math.min(seekTime, this.duration));
        
        // Only update if the time difference is significant to avoid excessive updates
        if (Math.abs(newTime - this.currentTime) > 0.5) {
          this.player.currentTime(newTime);
          
          // Update UI immediately for responsive feel
          this.currentTime = newTime;
          this.playedPercent = (newTime / this.duration) * 100;
          
          // Show loading indicator while seeking
          this.isLoading = true;
        }
      }
      
      this.isSeeking = true;
    },

    startHideTimer() {
      if (this.controlsTimeout) {
        clearTimeout(this.controlsTimeout);
      }
      
      if (this.isPlaying) {
        this.controlsTimeout = setTimeout(() => {
          if (!this.isDragging && !this.isSeeking) {
            this.showControls = false;
          }
        }, this.controlsTimeoutDuration);
      }
    },

    handleBackClick() {
      // First exit fullscreen if active
      if (this.isFullscreen) {
        this.exitFullscreen();
      }
      
      // Properly stop and clean up video player
      this.cleanupVideoPlayer();
      
      // Emit close event to parent
      this.$emit('close');
    },

    // Comprehensive video player cleanup
    cleanupVideoPlayer() {
      if (this.player) {
        try {
          // Stop all playback
          this.player.pause();
          
          // Mute to stop audio immediately
          this.player.muted(true);
          
          // Set volume to 0
          this.player.volume(0);
          
          // Mobile-specific audio cleanup
          this.handleMobileAudioCleanup();
          
          // Remove all sources
          this.player.src('');
          
          // Reset player state
          this.player.reset();
          
          // Dispose the player completely
          this.player.dispose();
          
          // Clear the player reference
          this.player = null;
          
          console.log('🎬 Video player cleaned up successfully');
        } catch (error) {
          console.error('🎬 Error cleaning up video player:', error);
        }
      }
      
      // Clear all timeouts
      if (this.controlsTimeout) {
        clearTimeout(this.controlsTimeout);
        this.controlsTimeout = null;
      }
      
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout);
        this.loadingTimeout = null;
      }
      

      
      // Reset component state
      this.isPlaying = false;
      this.currentTime = 0;
      this.duration = 0;
      this.isLoading = false;
    },

    handleBackNavigation(event) {
      // Handle browser back button
      if (this.isFullscreen) {
        event.preventDefault();
        this.exitFullscreen();
      }
      
      // Stop video playback when browser back is pressed
      if (this.player && this.isPlaying) {
        this.player.pause();
        this.player.muted(true);
      }
    },

    checkOrientation() {
      // Multiple ways to detect landscape mode
      if (window.screen?.orientation?.type) {
        // Modern browsers
        this.isLandscape = window.screen.orientation.type.includes('landscape');
      } else if (window.orientation !== undefined) {
        // Fallback for older devices
        this.isLandscape = Math.abs(window.orientation) === 90;
      } else {
        // Last resort - check window dimensions
        this.isLandscape = window.innerWidth > window.innerHeight;
      }
    },

    handleProgressBarTouchStart(event) {
      event.preventDefault();
      this.isDragging = true;
      this.touchStartTime = Date.now();
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
      this.touchMoved = false;
      
      // Show controls when user starts dragging
      this.showControls = true;
      this.showControlsTemporarily();
      
      // Add visual feedback
      const progressBar = event.currentTarget;
      progressBar.classList.add('progress-bar-active');
      
      // Haptic feedback for mobile devices
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Pause video while seeking for better performance
      if (this.player && this.isPlaying) {
        this.player.pause();
        this.wasPlayingBeforeSeek = true;
      }
      
      // Show loading indicator when seeking starts
      this.isLoading = true;
    },

    handleProgressBarTouchMove(event) {
      if (!this.touchStartX || !this.touchStartY || !this.isDragging) return;
      
      event.preventDefault();
      const touchX = event.touches[0].clientX;
      const touchY = event.touches[0].clientY;
      const deltaX = touchX - this.touchStartX;
      const deltaY = touchY - this.touchStartY;

      // If movement is significant, mark as moved
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        this.touchMoved = true;
      }

      // Calculate new position based on touch with better precision
      const progressBar = event.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const clickX = touchX - rect.left;
      const progressBarWidth = rect.width;
      
      // Ensure we don't go outside the progress bar bounds
      const clampedX = Math.max(0, Math.min(clickX, progressBarWidth));
      const seekPercent = (clampedX / progressBarWidth);
      const seekTime = seekPercent * this.duration;
      
      // Update video time with throttling for smooth performance
      if (this.player && typeof this.player.currentTime === 'function') {
        const newTime = Math.max(0, Math.min(seekTime, this.duration));
        
        // Only update if the time difference is significant to avoid excessive updates
        if (Math.abs(newTime - this.currentTime) > 0.5) {
          this.player.currentTime(newTime);
          
          // Update UI immediately for responsive feel
          this.currentTime = newTime;
          this.playedPercent = (newTime / this.duration) * 100;
          
          // Show loading indicator while seeking
          this.isLoading = true;
        }
      }
      
      this.isSeeking = true;
    },

    handleProgressBarTouchEnd(event) {
      this.isDragging = false;
      const touchDuration = Date.now() - this.touchStartTime;
      
      // Remove visual feedback
      const progressBar = event.currentTarget;
      progressBar.classList.remove('progress-bar-active');
      
      // Resume video if it was playing before
      if (this.wasPlayingBeforeSeek && this.player) {
        this.player.play().catch(err => {
          console.log('Failed to resume after seek:', err);
        });
        this.wasPlayingBeforeSeek = false;
      }
      
      // Handle tap (quick touch without much movement)
      if (!this.touchMoved && touchDuration < 200) {
        // Calculate position for tap
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = event.changedTouches[0].clientX - rect.left;
        const progressBarWidth = rect.width;
        const seekPercent = (clickX / progressBarWidth);
        const seekTime = seekPercent * this.duration;
        
        if (this.player && typeof this.player.currentTime === 'function') {
          this.player.currentTime(Math.max(0, Math.min(seekTime, this.duration)));
        }
        
        // Haptic feedback for tap
        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      }

      // Reset touch tracking
      this.touchStartX = null;
      this.touchStartY = null;
      this.touchMoved = false;
      
      // Hide loading indicator after a short delay if video is ready
      setTimeout(() => {
        if (this.player && this.player.readyState() >= 2) {
          this.isLoading = false;
        }
      }, 500);
      
      // Reset seeking state after a delay
      setTimeout(() => {
        this.isSeeking = false;
      }, 200);
    },



  }
}
</script>

<style>
.video-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  /* Add transform-style for better 3D rendering */
  transform-style: preserve-3d;
  /* Add will-change to optimize performance */
  will-change: transform;
  /* Force hardware acceleration */
  -webkit-transform: translateZ(0);
  -moz-transform: translateZ(0);
  -ms-transform: translateZ(0);
  -o-transform: translateZ(0);
  transform: translateZ(0);
  /* Prevent subpixel rendering */
  backface-visibility: hidden;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Add transform-style for better 3D rendering */
  transform-style: preserve-3d;
  /* Force GPU acceleration */
  -webkit-transform: translateZ(0);
  -moz-transform: translateZ(0);
  -ms-transform: translateZ(0);
  -o-transform: translateZ(0);
  transform: translateZ(0);
}

.video-js {
  width: 100% !important;
  height: 100% !important;
  position: absolute;
  top: 0;
  left: 0;
  /* Change object-fit to contain for better scaling */
  object-fit: contain !important;
  /* Add transform properties for stability */
  transform: translateZ(0);
  backface-visibility: hidden;
  /* Prevent flickering */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.video-js video {
  /* Change object-fit to contain for better scaling */
  object-fit: contain !important;
  width: 100%;
  height: 100%;
  /* Add transform properties for stability */
  transform: translateZ(0);
  backface-visibility: hidden;
  /* Force pixel alignment */
  transform-style: preserve-3d;
  /* Prevent flickering */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Add specific styles for 4K displays */
@media screen and (min-width: 3840px) {
  .video-js,
  .video-js video {
    /* Ensure smooth scaling on 4K */
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* Ensure fullscreen mode works properly */
.video-js.vjs-fullscreen {
  width: 100vw !important;
  height: 100vh !important;
}

.video-js.vjs-fullscreen video {
  object-fit: contain;
}

.custom-controls-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0) 15%,
    rgba(0, 0, 0, 0) 50%,
    rgba(0, 0, 0, 0.4) 80%,
    rgba(0, 0, 0, 0.8) 100%
  );
  opacity: 1;
  transition: opacity 0.4s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  z-index: 9999;
  pointer-events: auto;
}

.top-controls {
  width: 100%;
  padding: 10px 20px;
  display: flex;
  align-items: center;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-button {
  background: rgba(128, 128, 128, 0.5);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  margin-right: 12px;
}

.back-button:hover {
  background: rgba(128, 128, 128, 0.7);
}

.back-button:active {
  transform: scale(0.95);
}

.back-button svg {
  width: 20px;
  height: 20px;
  stroke: white;
}

.video-title {
  color: white;
  margin: 0;
  font-size: 1.2em;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  letter-spacing: 0.5px;
}

.center-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin: 20px 0;
}

.bottom-controls {
  display: flex;
  flex-direction: column;
  gap: 8px; /* reduced from 15px */
  margin-bottom: 0; /* ensure no extra margin */
  padding-bottom: 0; /* ensure no extra padding */
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 0;
  padding-bottom: 0;
}

.progress-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 2px;
}

.progress-bar {
  position: relative;
  height: 6px;
  width: 100%;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  overflow: visible; /* allow thumb to overflow */
  transition: height 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.progress-bar:hover {
  height: 8px;
}

.progress-background,
.progress-loaded,
.progress-played {
  position: absolute;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.progress-loaded {
  background: rgba(255,255,255,0.4);
}

.progress-played {
  background: linear-gradient(90deg, #ff0062, #ff4081);
  box-shadow: 0 0 10px rgba(255, 0, 98, 0.3);
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.progress-slider {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
  z-index: 10;
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.control-button {
  background: rgba(255, 255, 255, 0.25);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  margin: 0 5px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.control-button svg {
  width: 24px;
  height: 24px;
  stroke: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.play-button {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.play-button svg {
  width: 28px;
  height: 28px;
}

.button-text {
  position: absolute;
  bottom: -20px;
  font-size: 12px;
  color: white;
}

.quality-selector {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  margin-right: 10px;
  cursor: pointer;
}

.quality-selector:hover {
  background: rgba(255, 255, 255, 0.3);
}

.controls-hidden {
  opacity: 0;
  transition: opacity 0.6s ease; /* Even slower fade out */
  pointer-events: none;
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.resolution-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.resolution-container:hover {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.resolution-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.quality-selector {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Mobile Specific Styles */
.mobile-view .custom-controls-overlay {
  padding: 15px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0) 20%,
    rgba(0, 0, 0, 0) 40%,
    rgba(0, 0, 0, 0.5) 80%,
    rgba(0, 0, 0, 0.9) 100%
  );
}

.rotation-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 15px 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: white;
  animation: fadeInOut 3s forwards;
  pointer-events: none;
}

.rotation-hint svg {
  width: 32px;
  height: 32px;
  animation: rotate 2s infinite;
}

.rotation-hint span {
  font-size: 14px;
  font-weight: 500;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(90deg); }
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .custom-controls-overlay {
    padding: 15px;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0) 20%,
      rgba(0, 0, 0, 0) 40%,
      rgba(0, 0, 0, 0.5) 80%,
      rgba(0, 0, 0, 0.9) 100%
    );
  }

  .top-controls {
    padding: 10px;
  }

  .back-button {
    width: 36px;
    height: 36px;
  }

  .back-arrow {
    font-size: 20px;
  }

  .video-title {
    font-size: 1.1em;
  }

  .center-controls {
    gap: 20px;
  }

  .control-button {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.3);
  }

  .play-button {
    width: 48px;
    height: 48px;
  }

  .button-text {
    display: none;
  }

  .volume-slider-container {
    display: none;
  }

  .quality-selector {
    font-size: 12px;
    padding: 4px 8px;
  }

  .resolution-container {
    padding: 6px 10px;
  }

  .resolution-text {
    font-size: 13px;
  }

  .time-display {
    font-size: 0.9em;
  }

  .volume-control {
    background: none;
    padding: 0;
  }

  .volume-slider-wrapper {
    display: none;
  }

  /* Improved progress bar for mobile */
  .progress-bar {
    height: 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.3);
    position: relative;
    cursor: pointer;
    touch-action: pan-x;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  .progress-bar:active {
    height: 14px;
    background: rgba(255, 255, 255, 0.4);
  }

  .progress-thumb {
    width: 24px;
    height: 24px;
    border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(255,0,98,0.4);
    transition: transform 0.1s ease;
  }

  .progress-bar:active .progress-thumb {
    transform: translateY(-50%) scale(1.2);
    box-shadow: 0 4px 12px rgba(255,0,98,0.6);
  }

  .progress-loaded {
    background: rgba(255,255,255,0.5);
    border-radius: 8px;
  }

  .progress-played {
    background: linear-gradient(90deg, #ff0062, #ff4081);
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(255, 0, 98, 0.4);
  }

  /* Active state for progress bar */
  .progress-bar-active {
    height: 16px !important;
    background: rgba(255, 255, 255, 0.5) !important;
    transform: scale(1.02);
    transition: all 0.2s ease;
  }

  .progress-bar-active .progress-thumb {
    transform: translateY(-50%) scale(1.3);
    box-shadow: 0 6px 16px rgba(255,0,98,0.8);
  }

  .progress-bar-active .progress-played {
    box-shadow: 0 0 20px rgba(255, 0, 98, 0.6);
  }
}

/* Video.js Theme Overrides */
.video-js.vjs-theme-ott {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
}

.video-js.vjs-theme-ott .vjs-big-play-button {
  background: rgba(0,0,0,0.6);
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  line-height: 80px;
  transform: translate(-50%, -50%);
}

.video-js.vjs-theme-ott .vjs-big-play-button:hover {
    background: rgba(255,0,0,0.8);
  }

/* Mobile landscape optimizations */
@media (max-width: 768px) and (orientation: landscape) {
  .video-wrapper {
    width: 100vw;
    height: 100vh;
  }

  .custom-controls-overlay {
    padding: 10px;
  }

  .center-controls {
    gap: 15px;
  }

  .control-button {
    width: 40px;
    height: 40px;
    font-size: 1em;
  }

  .bottom-controls {
    gap: 4px; /* reduced from 8px */
    padding-bottom: 0;
  }

  .progress-bar {
    height: 6px;
  }

  .time-display {
    font-size: 0.8em;
  }

  .volume-control {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px;
  }

  .volume-slider-wrapper {
    display: block;
  }

  .volume-control:hover .volume-slider-wrapper {
    width: 60px;
  }
}

/* Hide browser's default fullscreen button */
.video-js .vjs-fullscreen-control {
  display: none;
}

/* Touch device specific styles */
@media (hover: none) and (pointer: coarse) {
  .custom-controls-overlay {
    opacity: 1;
    transition: opacity 0.4s ease-in-out;
  }

  .controls-hidden {
    opacity: 0;
    transition: opacity 0.6s ease-in-out;
  }

  .control-button {
    width: 44px;
    height: 44px;
    margin: 0 8px;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    transition: transform 0.2s ease, background-color 0.2s ease;
  }

  .control-button:active {
    transform: scale(0.95);
    background-color: rgba(255, 0, 0, 0.7);
  }

  .progress-bar {
    height: 8px;
    transition: height 0.2s ease;
  }

  .progress-bar:active {
    height: 10px;
  }

  /* Improve touch targets in landscape */
  @media (orientation: landscape) {
    .custom-controls-overlay {
      padding: 10px 20px;
    }

    .control-button {
      margin: 0 8px;
    }

    .progress-bar {
      margin: 8px 0;
    }
  }

  /* Prevent accidental touches */
  .video-wrapper {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    touch-action: manipulation;
  }

  /* Add active state feedback */
  .volume-slider:active,
  .quality-selector:active {
    transform: scale(0.98);
  }
}

/* Landscape mode optimizations */
@media (hover: none) and (pointer: coarse) and (orientation: landscape) {
  .custom-controls-overlay {
    padding: 15px;
    transition: opacity 0.4s ease-in-out;
  }

  .bottom-controls {
    padding-bottom: max(env(safe-area-inset-bottom), 10px);
  }

  /* Ensure controls are more visible in landscape */
  .control-button {
    background-color: rgba(0, 0, 0, 0.7);
  }

  /* Improve touch targets in landscape */
  .progress-bar {
    margin: 10px 0;
  }
}

/* Add loading indicator */
.video-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}



/* Hide fullscreen button on mobile */
@media (max-width: 768px) {
  .mobile-view .right-controls .control-button {
    display: none;
  }
  
  .mobile-view .resolution-container {
    margin-right: 0;
  }

  /* YouTube-style progress bar improvements */
  .progress-bar {
    height: 14px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.2);
    position: relative;
    cursor: pointer;
    touch-action: pan-x;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    transition: all 0.2s ease;
    overflow: visible;
  }

  .progress-bar:hover {
    height: 16px;
    background: rgba(255, 255, 255, 0.3);
  }

  .progress-bar:active {
    height: 18px;
    background: rgba(255, 255, 255, 0.4);
    transform: scale(1.02);
  }

  .progress-thumb {
    width: 28px;
    height: 28px;
    border: 3px solid #fff;
    box-shadow: 0 4px 12px rgba(255,0,98,0.5);
    transition: all 0.2s ease;
    background: linear-gradient(135deg, #ff0062, #ff4081);
  }

  .progress-bar:hover .progress-thumb {
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 6px 16px rgba(255,0,98,0.6);
  }

  .progress-bar:active .progress-thumb {
    transform: translateY(-50%) scale(1.3);
    box-shadow: 0 8px 20px rgba(255,0,98,0.8);
  }

  .progress-loaded {
    background: rgba(255,255,255,0.4);
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .progress-played {
    background: linear-gradient(90deg, #ff0062, #ff4081);
    border-radius: 10px;
    box-shadow: 0 0 15px rgba(255, 0, 98, 0.4);
    transition: all 0.2s ease;
  }

  /* Active state for progress bar */
  .progress-bar-active {
    height: 20px !important;
    background: rgba(255, 255, 255, 0.5) !important;
    transform: scale(1.02);
    transition: all 0.2s ease;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  }

  .progress-bar-active .progress-thumb {
    transform: translateY(-50%) scale(1.4);
    box-shadow: 0 8px 24px rgba(255,0,98,0.9);
  }

  .progress-bar-active .progress-played {
    box-shadow: 0 0 25px rgba(255, 0, 98, 0.7);
  }


}

/* Loading Indicator Styles */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background: rgba(0, 0, 0, 0.9);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.spinner-svg {
  width: 60px;
  height: 60px;
  animation: rotate 2s linear infinite;
}

.spinner-path {
  stroke: #ff0062;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
  stroke-width: 4;
}

.loading-text {
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* Mobile Loading Styles */
@media (max-width: 768px) {
  .loading-spinner {
    transform: scale(0.9);
    padding: 25px;
  }

  .loading-text {
    font-size: 16px;
  }

  .spinner-svg {
    width: 50px;
    height: 50px;
  }
}
</style>