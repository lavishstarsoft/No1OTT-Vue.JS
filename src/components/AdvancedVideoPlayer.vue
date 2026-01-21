<template>
  <div class="video-wrapper" 
       @click="handleVideoClick" 
       @touchstart="handleTouchStart" 
       @touchmove="handleTouchMove" 
       @touchend="handleTouchEnd"
       :class="{ 'mobile-view': isMobile }">
  <div class="video-container">
      <video ref="videoElement" class="video-js vjs-big-play-centered vjs-theme-ott" :poster="poster" preload="auto" playsinline webkit-playsinline crossorigin="anonymous" data-setup='{}'>
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

      <div class="custom-controls-overlay" :class="{ 'controls-hidden': !showControls || isLoading }">
        <!-- Top Controls -->
        <div class="top-controls">
          <div class="top-left">
            <h3 class="video-title" v-if="title">{{ title }}</h3>
          </div>
          
          <div class="top-center">
            <!-- Empty center area -->
          </div>
          
          <div class="top-right">
            <button @click="handleBackClick" class="top-control-btn close-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Center Controls -->
        <div class="center-controls">
          <button @click="skipBackward" class="center-control-btn skip-backward">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 17l-5-5 5-5"/>
              <path d="M17 17l-5-5 5-5"/>
            </svg>
          </button>
          
          <button @click="togglePlay" class="center-control-btn play-pause-btn">
            <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          </button>
          
          <button @click="skipForward" class="center-control-btn skip-forward">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 17l5-5-5-5"/>
              <path d="M13 17l5-5-5-5"/>
            </svg>
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
            <div class="progress-bar" 
                 @click="onProgressBarClick" 
                 @mousedown="handleProgressBarMouseDown"
                 @touchstart="handleProgressBarTouchStart" 
                 @touchmove="handleProgressBarTouchMove" 
                 @touchend="handleProgressBarTouchEnd">
              <div class="progress-background"></div>
              <div class="progress-loaded" :style="{ width: bufferedPercent + '%' }"></div>
              <div class="progress-played" :style="{ width: playedPercent + '%' }"></div>
              <div class="progress-thumb" :style="{ left: `calc(${playedPercent}% - 8px)` }"></div>
              <input type="range" min="0" :max="duration" :value="currentTime" @input="onProgressChange" @mousedown="isDragging = true" @mouseup="isDragging = false" class="progress-slider">
            </div>
            <div class="bottom-row">
              <div class="bottom-left">
              <div class="time-display">
                {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
              </div>
              </div>
              
              <div class="bottom-center">
                <!-- Additional bottom controls can go here -->
              </div>
              
              <div class="bottom-right">
                <!-- Quality Selector -->
                <div class="quality-container">
                  <button class="bottom-control-btn quality-btn" @click="$refs.qualitySelector && $refs.qualitySelector.focus()" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 12 2.6V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                    <span class="control-label">{{ selectedQuality }}</span>
                </button>
                <select ref="qualitySelector" v-model="selectedQuality" class="quality-selector" @change="onQualityChange">
                  <option v-for="quality in qualities" :key="quality" :value="quality">{{ quality }}</option>
                </select>
                </div>
                
                <!-- Fullscreen Button -->
                <button v-if="!isMobile" @click="toggleFullscreen" class="bottom-control-btn fullscreen-btn">
                  <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
                    <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                    <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
                    <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3"/>
                    <path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
                    <path d="M3 16h3a2 2 0 0 1 2 2v3"/>
                    <path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
                  </svg>
                  <span class="control-label"></span>
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
import shaka from 'shaka-player/dist/shaka-player.ui.js';
import 'shaka-player/dist/controls.css';
import { trackVideoView, trackVideoCompletion } from '@/utils/videoTracking';

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
    videoId: {
      type: [String, Number],
      default: null
    }
  },
  emits: ['close'],
  // Add navigation guard to detect route leaving
  beforeRouteLeave(to, from, next) {
    console.log('🎬 Route leaving detected, cleaning up video player');
    this.handleNavigationCleanup();
    next();
  },
  data() {
    return {
      player: null,
      shakaPlayer: null,
      playerType: null, // 'videojs' or 'shaka'
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
      controlsTimeoutDuration: 2000, // 2 seconds
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
      wasPlayingBeforeSeek: false, // Track if video was playing before seeking
      originalBodyStyles: {}, // Store original body styles
      hasTrackedView: false, // Track if we've already tracked the view
      hasTrackedCompletion: false, // Track if we've already tracked completion
      startTime: null, // Track when playback started
      totalWatchTime: 0 // Track total watch time
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
      
      // Store original body styles before video player takes over
      this.originalBodyStyles = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        height: document.body.style.height,
        touchAction: document.body.style.touchAction,
        userSelect: document.body.style.userSelect,
        pointerEvents: document.body.style.pointerEvents
      };
      
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
        
        // Add play state listener - check player type
        if (this.playerType === 'videojs' && this.player) {
          this.player.on('play', this.handleFirstPlay);
        } else if (this.playerType === 'shaka') {
          // For Shaka Player, use video element events
          const videoElement = this.$refs.videoElement;
          if (videoElement) {
            videoElement.addEventListener('play', this.handleFirstPlay);
          }
        }
      }
    },

    async handleFirstPlay() {
      // Only handle first play
      if (!this.hasAutoRotated && this.isMobile && this.enableAutoRotate) {
        this.hasAutoRotated = true;
        await this.checkAndRotate();
      }
      // Remove listener after first play
      if (this.playerType === 'videojs' && this.player) {
        this.player.off('play', this.handleFirstPlay);
      } else if (this.playerType === 'shaka') {
        const videoElement = this.$refs.videoElement;
        if (videoElement) {
          videoElement.removeEventListener('play', this.handleFirstPlay);
        }
      }
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

          // Force update fullscreen state
          this.isFullscreen = false;

          // Unlock orientation
          if (this.isMobile) {
            this.tryUnlockOrientation();
          }
          
          // Reset page styles after exiting fullscreen
          this.resetPageStyles();
          
        } catch (err) {
          console.error('Exit fullscreen error:', err);
          // Force reset even if exit fails
          this.isFullscreen = false;
          this.resetPageStyles();
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
      
      // Detect format based on file extension
      const isMPD = this.src.toLowerCase().includes('.mpd');
      const isHLS = this.src.toLowerCase().includes('.m3u8');
      
      console.log('🎬 AdvancedVideoPlayer - initializePlayer called');
      console.log('🎬 Video Source URL:', this.src);
      console.log('🎬 Is MPD format:', isMPD);
      console.log('🎬 Is HLS format:', isHLS);
      
      if (isMPD) {
        // Use Shaka Player for MPD/DASH
        console.log('🎬 Using Shaka Player for MPD/DASH');
        this.initializeShakaPlayer(videoElement);
      } else {
        // Use Video.js for HLS and other formats
        console.log('🎬 Using Video.js for HLS/other formats');
        this.initializeVideoJsPlayer(videoElement);
      }
    },

    initializeShakaPlayer(videoElement) {
      console.log('🎬 Initializing Shaka Player for MPD');
      this.playerType = 'shaka';
      
      // Install Shaka polyfills
      shaka.polyfill.installAll();
      
      // Check browser support
      if (!shaka.Player.isBrowserSupported()) {
        console.error('Browser not supported for Shaka Player');
        return;
      }
      
      // Create Shaka player - NEW WAY (v4.15+)
      this.shakaPlayer = new shaka.Player();
      
      // Attach to video element
      this.shakaPlayer.attach(videoElement);
      
      // Configure Shaka player
      this.shakaPlayer.configure({
        streaming: {
          bufferingGoal: 60,
          rebufferingGoal: 2,
          bufferBehind: 30
        },
        abr: {
          enabled: true
        }
      });
      
      // Error handling
      this.shakaPlayer.addEventListener('error', (event) => {
        const error = event.detail;
        console.error('Shaka Player error:', error);
        
        // Check for CORS errors
        if (error.code === shaka.util.Error.Code.BAD_HTTP_STATUS || 
            error.code === shaka.util.Error.Code.HTTP_ERROR) {
          console.error('🚨 CORS Error: S3 bucket needs CORS configuration');
          console.error('Add this CORS policy to your S3 bucket:');
          console.error(JSON.stringify({
            "AllowedOrigins": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedHeaders": ["*"],
            "ExposeHeaders": ["Content-Length", "Content-Range"],
            "MaxAgeSeconds": 3000
          }, null, 2));
        }
        
        this.handleVideoError(error);
      });
      
      // Load the manifest
      this.shakaPlayer.load(this.src).then(() => {
        console.log('🎬 MPD manifest loaded successfully');
        this.isLoading = false;
        
        // Setup event listeners
        this.setupShakaEventListeners(videoElement);
        
        if (this.autoplay) {
          videoElement.play().catch(err => console.log('Autoplay prevented:', err));
        }
      }).catch((error) => {
        console.error('Error loading MPD:', error);
        
        // Provide helpful error messages
        if (error.code === shaka.util.Error.Code.BAD_HTTP_STATUS) {
          console.error('🚨 HTTP Error - Check CORS configuration on S3 bucket');
        } else if (error.code === shaka.util.Error.Code.HTTP_ERROR) {
          console.error('🚨 Network Error - CORS policy blocking request');
        }
        
        this.isLoading = false;
      });
    },

    setupShakaEventListeners(videoElement) {
      // Time update
      videoElement.addEventListener('timeupdate', () => {
        this.currentTime = videoElement.currentTime;
        this.playedPercent = (this.currentTime / this.duration) * 100;
      });
      
      // Duration
      videoElement.addEventListener('loadedmetadata', () => {
        this.duration = videoElement.duration;
        console.log('🎬 Video duration:', this.duration);
      });
      
      // Play/Pause
      videoElement.addEventListener('play', () => {
        this.isPlaying = true;
        this.handlePlay();
      });
      
      videoElement.addEventListener('pause', () => {
        this.isPlaying = false;
        this.handlePause();
      });
      
      videoElement.addEventListener('ended', () => {
        this.isPlaying = false;
        this.handleEnded();
      });
      
      // Loading states
      videoElement.addEventListener('waiting', () => {
        this.isLoading = true;
      });
      
      videoElement.addEventListener('playing', () => {
        this.isLoading = false;
      });
      
      videoElement.addEventListener('canplay', () => {
        this.isLoading = false;
      });
    },

    initializeVideoJsPlayer(videoElement) {
      console.log('🎬 Initializing Video.js for HLS');
      this.playerType = 'videojs';
      
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
            maxBufferLength: 60,
            maxMaxBufferLength: 120,
            maxBufferSize: 120 * 1000 * 1000,
            maxBufferHole: 0.1,
            lowLatencyMode: false,
            backBufferLength: 60,
            limitRenditionByPlayerDimensions: false
          },
          vhs: {
            limitRenditionByPlayerDimensions: false,
            smoothQualityChange: true,
            maxPlaylistRetries: 10,
            bufferSize: 60,
            enableLowInitialPlaylist: true,
            allowSeeksWithinUnsafeLiveWindow: true,
            handlePartialData: true,
            overrideNative: true,
            maxBufferLength: 60,
            maxMaxBufferLength: 120,
            maxBufferSize: 120 * 1000 * 1000,
            maxBufferHole: 0.1,
            lowLatencyMode: false,
            backBufferLength: 60
          },
          nativeTextTracks: false,
          nativeAudioTracks: false,
          nativeVideoTracks: false
        },
        techOrder: ['html5'],
        playbackRates: [0.5, 1, 1.5, 2],
        responsive: true,
        aspectRatio: '16:9',
        liveui: true,
        inactivityTimeout: 0,
        suppressNotSupportedError: true,
        playsinline: true,
        'webkit-playsinline': true,
        errorDisplay: false,
        muted: this.isMobile,
        volume: 0.5,
        poster: this.poster
      });

      // Set source
      this.player.src({ src: this.src, type: 'application/x-mpegURL' });

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
        this.loadingTimeout = setTimeout(() => {
          this.isLoading = true;
        }, 500);
        
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
        if (this.player.muted()) {
          this.player.muted(false);
        }
        this.showControlsTemporarily();
      });

      this.player.on('error', (error) => {
        console.log('🎬 Video error event fired:', error)
        this.isLoading = false;
        this.handleVideoError(error);
      });

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
        if (this.isPlaying && !this.userPaused) {
          setTimeout(() => {
            if (this.player && this.isPlaying && !this.userPaused) {
              this.player.play().catch(err => {
                console.log('Failed to resume after stall:', err);
              });
            }
          }, 2000);
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
        this.pauseRecoveryAttempts = 0;
        this.isLoading = false;
        this.showControlsTemporarily();
      });
      this.player.on('pause', () => {
        console.log('🎬 Video pause event fired')
        this.isPlaying = false;
        this.lastPlayTime = this.player.currentTime();
        
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
        if (this.player.tech().hls) {
          const qualities = this.player.tech().hls.representations();
          if (qualities.length > 0) {
            this.qualities = ['Auto', ...qualities.map(q => `${q.height}p`)];
          }
        }
      });

      // Add visibility change listener
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      
      // Add network recovery listener
      window.addEventListener('online', this.handleNetworkRecovery);
      
      // Add page unload listener
      window.addEventListener('beforeunload', this.handlePageUnload);
      window.addEventListener('pagehide', this.handlePageUnload);

      // Add event listeners for view tracking
      this.player.on('play', this.handlePlay);
      this.player.on('pause', this.handlePause);
      this.player.on('ended', this.handleEnded);
      this.player.on('timeupdate', this.handleTimeUpdate);
      
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
        }, this.controlsTimeoutDuration); // Use the configurable duration (2 seconds)
      }
    },
    
    hideControls() {
      if (this.isPlaying) {
        this.showControls = false;
      }
    },

    togglePlay() {
      const videoElement = this.$refs.videoElement;
      
      if (this.playerType === 'shaka') {
        // Handle Shaka Player
        if (this.isPlaying) {
          this.userPaused = true;
          videoElement.pause();
        } else {
          this.userPaused = false;
          this.handleMobileAudioInteraction();
          videoElement.play();
        }
      } else if (this.player && typeof this.player.paused === 'function') {
        // Handle Video.js
        if (this.isPlaying) {
          this.userPaused = true;
          this.pauseRecoveryAttempts = 0;
          this.player.pause();
        } else {
          this.userPaused = false;
          this.pauseRecoveryAttempts = 0;
          this.handleMobileAudioInteraction();
          this.player.play();
        }
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

    handlePlay() {
      this.isPlaying = true;
      // Record start time
      this.startTime = Date.now();
      
      // Track view when video starts playing for the first time
      if (this.videoId && !this.hasTrackedView) {
        trackVideoView(this.videoId);
        this.hasTrackedView = true;
      }
      
      // Hide loading indicator when video starts playing
      this.isLoading = false;
      
      // Start controls hide timer when video starts playing
      this.showControlsTemporarily();
    },

    handlePause() {
      this.isPlaying = false;
      // Calculate watch time when paused
      if (this.startTime) {
        this.totalWatchTime += (Date.now() - this.startTime) / 1000; // Convert to seconds
        this.startTime = null;
      }
    },

    handleEnded() {
      this.isPlaying = false;
      // Calculate final watch time
      if (this.startTime) {
        this.totalWatchTime += (Date.now() - this.startTime) / 1000; // Convert to seconds
        this.startTime = null;
      }
      
      // Track completion
      if (this.videoId && !this.hasTrackedCompletion) {
        trackVideoCompletion(this.videoId);
        this.hasTrackedCompletion = true;
      }
    },

    handleTimeUpdate() {
      if (this.player) {
        this.currentTime = this.player.currentTime();
        this.duration = this.player.duration();
        this.buffered = this.player.bufferedEnd();
        
        // Update progress bar
        if (this.duration > 0) {
          this.playedPercent = (this.currentTime / this.duration) * 100;
          this.bufferedPercent = (this.buffered / this.duration) * 100;
        }
      }
    },





    onProgressBarClick(event) {
      // Only handle click if not dragging (to avoid conflicts with drag events)
      if (this.isDragging) return;
      
      // Calculate click position on progress bar
      const progressBar = event.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const progressBarWidth = rect.width;
      const seekPercent = (clickX / progressBarWidth);
      const seekTime = seekPercent * this.duration;
      
      const videoElement = this.$refs.videoElement;
      
      if (this.playerType === 'shaka' && videoElement) {
        // For Shaka Player, use video element directly
        videoElement.currentTime = Math.max(0, Math.min(seekTime, this.duration));
      } else if (this.player && typeof this.player.currentTime === 'function') {
        // For Video.js
        this.player.currentTime(Math.max(0, Math.min(seekTime, this.duration)));
      }
      
      this.isSeeking = true;
      this.isLoading = true;
      this.showControlsTemporarily();
    },

    onProgressChange(event) {
      const time = parseFloat(event.target.value);
      const videoElement = this.$refs.videoElement;
      
      if (this.playerType === 'shaka' && videoElement) {
        // For Shaka Player, use video element directly
        videoElement.currentTime = time;
      } else if (this.player && typeof this.player.currentTime === 'function') {
        // For Video.js
        this.player.currentTime(time);
      }
      
      this.isSeeking = true;
      this.isLoading = true;
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
      const videoElement = this.$refs.videoElement;
      const newTime = this.currentTime + 10;
      
      if (this.playerType === 'shaka' && videoElement) {
        // For Shaka Player, use video element directly
        videoElement.currentTime = Math.min(newTime, this.duration);
      } else if (this.player && typeof this.player.currentTime === 'function') {
        // For Video.js
        this.player.currentTime(newTime);
      }
      
      this.isLoading = true;
      this.showControlsTemporarily();
    },

    skipBackward() {
      const videoElement = this.$refs.videoElement;
      const newTime = this.currentTime - 10;
      
      if (this.playerType === 'shaka' && videoElement) {
        // For Shaka Player, use video element directly
        videoElement.currentTime = Math.max(newTime, 0);
      } else if (this.player && typeof this.player.currentTime === 'function') {
        // For Video.js
        this.player.currentTime(newTime);
      }
      
      this.isLoading = true;
      this.showControlsTemporarily();
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    beforeDestroy() {
      console.log('🎬 Component destroying, starting cleanup');
      this.performFullCleanup();
    },

    // For Vue 3 compatibility
    beforeUnmount() {
      console.log('🎬 Component unmounting, starting cleanup');
      this.performFullCleanup();
    },

    // Comprehensive cleanup for component destruction
    async performFullCleanup() {
      try {
        // Perform navigation cleanup
        await this.handleNavigationCleanup();
      
      // Clean up all event listeners
        this.removeAllEventListeners();
        
        console.log('🎬 Component cleanup completed successfully');
      } catch (error) {
        console.error('🎬 Error during component cleanup:', error);
        // Still try to clean up what we can
        this.removeAllEventListeners();
        this.resetPageStyles();
      }
    },

    // Remove all event listeners
    removeAllEventListeners() {
      try {
        // Remove popstate listener
        window.removeEventListener('popstate', this.handleBackNavigation);
        
        // Remove orientation and fullscreen listeners
      if (this.isMobile && this.enableAutoRotate) {
        window.removeEventListener('orientationchange', this.handleOrientationChange);
          window.removeEventListener('resize', this.checkOrientation);
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
      
      // Remove mouse drag listeners (in case they're still attached)
      document.removeEventListener('mousemove', this.handleProgressBarMouseMove);
      document.removeEventListener('mouseup', this.handleProgressBarMouseUp);
      
        console.log('🎬 All event listeners removed');
      } catch (error) {
        console.error('🎬 Error removing event listeners:', error);
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
        }, this.controlsTimeoutDuration); // 2 seconds
      }
    },

    async handleBackClick() {
      console.log('🎬 Back button clicked');
      
      // Use comprehensive navigation cleanup
      await this.handleNavigationCleanup();
      
      // Emit close event to parent
      this.$emit('close');
    },

    // Comprehensive video player cleanup
    cleanupVideoPlayer() {
      console.log('🎬 Starting video player cleanup');
      
      if (this.player) {
        try {
          // Stop all playback immediately
          this.player.pause();
          
          // Mute to stop audio immediately
          this.player.muted(true);
          
          // Set volume to 0
          this.player.volume(0);
          
          // Mobile-specific audio cleanup
          this.handleMobileAudioCleanup();
          
          // Remove all event listeners to prevent memory leaks
          this.player.off('timeupdate');
          this.player.off('progress');
          this.player.off('play');
          this.player.off('pause');
          this.player.off('ended');
          this.player.off('loadedmetadata');
          this.player.off('loadstart');
          this.player.off('loadeddata');
          this.player.off('waiting');
          this.player.off('playing');
          this.player.off('error');
          this.player.off('canplay');
          this.player.off('canplaythrough');
          this.player.off('stalled');
          this.player.off('suspend');
          this.player.off('abort');
          
          // Remove all sources
          this.player.src('');
          
          // Reset player state
          this.player.reset();
          
          // Dispose the player completely
          this.player.dispose();
          
          // Clear the player reference
          this.player = null;
          
          console.log('🎬 Video player disposed successfully');
        } catch (error) {
          console.error('🎬 Error disposing video player:', error);
          // Force clear player reference even if disposal fails
          this.player = null;
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
      this.isFullscreen = false;
      this.showControls = true;
      this.isDragging = false;
      this.isSeeking = false;
      this.userPaused = false;
      this.pauseRecoveryAttempts = 0;
      
      console.log('🎬 Video player cleanup completed');
    },

    handleBackNavigation() {
      console.log('🎬 Back navigation detected');
      // Handle browser/mobile back button
      this.handleNavigationCleanup();
    },

    // Comprehensive cleanup for navigation (mobile back button, browser back, route change)
    async handleNavigationCleanup() {
      console.log('🎬 Starting navigation cleanup');
      
      try {
        // Exit fullscreen if active
      if (this.isFullscreen) {
          await this.exitFullscreen();
        }
        
        // Clean up video player completely
        this.cleanupVideoPlayer();
        
        // IMMEDIATE emergency scroll reset first
        this.emergencyScrollReset();
        
        // Then do comprehensive reset
        this.resetPageStyles();
        
        // Force scroll restoration with multiple attempts
        this.restorePageScroll();
        
        console.log('🎬 Navigation cleanup completed');
      } catch (error) {
        console.error('🎬 Navigation cleanup error:', error);
        // Emergency fallback
        this.emergencyScrollReset();
      }
    },

    // Emergency scroll reset - called immediately when navigation happens
    emergencyScrollReset() {
      try {
        console.log('🎬 EMERGENCY SCROLL RESET');
        
        // Nuclear approach - remove everything that could block scroll
        document.body.style.cssText = '';
        document.documentElement.style.cssText = '';
        
        // Force enable scroll
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
        document.body.style.height = 'auto';
        document.body.style.width = 'auto';
        document.body.style.transform = 'none';
        document.body.style.willChange = 'auto';
        document.body.style.touchAction = 'auto';
        document.body.style.pointerEvents = 'auto';
        document.body.style.userSelect = 'auto';
        document.body.style.webkitUserSelect = 'auto';
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Same for HTML
        document.documentElement.style.overflow = 'auto';
        document.documentElement.style.height = 'auto';
        document.documentElement.style.position = 'static';
        
        // Remove video classes immediately
        document.body.classList.remove('vjs-fullscreen', 'video-playing', 'no-scroll');
        document.documentElement.classList.remove('vjs-fullscreen', 'video-playing', 'no-scroll');
        
        // Force scroll test
        window.scrollTo(0, 1);
        window.scrollTo(0, 0);
        
        console.log('🎬 Emergency scroll reset completed');
      } catch (error) {
        console.error('🎬 Emergency scroll reset error:', error);
      }
    },

    // Reset all body/document styles that might interfere with page scrolling
    resetPageStyles() {
      try {
        console.log('🎬 Starting page styles reset');
        
        // Restore original styles if available
        if (this.originalBodyStyles && Object.keys(this.originalBodyStyles).length > 0) {
          console.log('🎬 Restoring original body styles:', this.originalBodyStyles);
          document.body.style.overflow = this.originalBodyStyles.overflow || 'auto';
          document.body.style.position = this.originalBodyStyles.position || 'static';
          document.body.style.height = this.originalBodyStyles.height || 'auto';
          document.body.style.touchAction = this.originalBodyStyles.touchAction || 'auto';
          document.body.style.userSelect = this.originalBodyStyles.userSelect || 'auto';
          document.body.style.pointerEvents = this.originalBodyStyles.pointerEvents || 'auto';
        } else {
          // Fallback: force scrollable styles
          console.log('🎬 No original styles found, using fallback');
          document.body.style.overflow = 'auto';
          document.body.style.position = 'static';
          document.body.style.height = 'auto';
          document.body.style.touchAction = 'auto';
          document.body.style.userSelect = 'auto';
          document.body.style.pointerEvents = 'auto';
        }
        
        // Reset additional problematic styles
        document.body.style.transform = '';
        document.body.style.willChange = '';
        document.body.style.webkitOverflowScrolling = 'touch';
        document.body.style.minHeight = '100vh';
        
        // Reset HTML element
        document.documentElement.style.overflow = 'auto';
        document.documentElement.style.height = 'auto';
        document.documentElement.style.position = 'static';
        document.documentElement.style.touchAction = 'auto';
        
        // Remove video-related classes
        document.body.classList.remove('vjs-fullscreen', 'video-playing');
        document.documentElement.classList.remove('vjs-fullscreen', 'video-playing');
        
        // Add force scrollable temporarily
        document.body.classList.add('force-scrollable');
        setTimeout(() => {
          document.body.classList.remove('force-scrollable');
        }, 1000);
        
        // Reset viewport
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=yes');
        }
        
        console.log('🎬 Page styles reset completed');
      } catch (error) {
        console.error('🎬 Error resetting page styles:', error);
        // Emergency reset
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        document.body.style.position = 'static';
        document.body.style.height = 'auto';
      }
    },

    // Force restore page scrolling capability
    restorePageScroll() {
      try {
        console.log('🎬 Starting scroll restoration');
        
        // Multiple attempts to restore scroll
        const restoreAttempts = [
          () => {
            // Attempt 1: Immediate restoration
            console.log('🎬 Scroll restore attempt 1');
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
            window.scrollTo(0, 0);
            return Promise.resolve();
          },
          () => {
            // Attempt 2: Force layout recalculation
            console.log('🎬 Scroll restore attempt 2');
            return new Promise(resolve => {
              setTimeout(() => {
                document.body.style.height = 'auto';
                document.body.style.minHeight = '100vh';
                document.body.style.position = 'static';
                
                // Force reflow
                void document.body.offsetHeight;
                void document.documentElement.offsetHeight;
                
                // Dispatch resize event
                window.dispatchEvent(new Event('resize'));
                
                // Try scroll
                window.scrollTo(0, 1);
                window.scrollTo(0, 0);
                
                resolve();
              }, 50);
            });
          },
          () => {
            // Attempt 3: DOM manipulation
            console.log('🎬 Scroll restore attempt 3');
            return new Promise(resolve => {
              setTimeout(() => {
                // Remove all potential scroll blockers
                const body = document.body;
                const html = document.documentElement;
                
                // Clear all inline styles that might block scroll
                ['overflow', 'position', 'height', 'width', 'transform', 'touchAction'].forEach(prop => {
                  body.style[prop] = '';
                  html.style[prop] = '';
                });
                
                // Force essential styles
                body.style.overflow = 'auto';
                body.style.position = 'static';
                body.style.height = 'auto';
                html.style.overflow = 'auto';
                
                // Force layout
                body.offsetHeight;
                
                resolve();
              }, 100);
            });
          },
          () => {
            // Attempt 4: Nuclear option
            console.log('🎬 Scroll restore attempt 4 (nuclear)');
            return new Promise(resolve => {
              setTimeout(() => {
                // Remove all classes that might interfere
                document.body.className = document.body.className.replace(/vjs-\S+/g, '');
                document.documentElement.className = document.documentElement.className.replace(/vjs-\S+/g, '');
                
                // Force scroll capability
                document.body.style.cssText = 'overflow: auto !important; position: static !important; height: auto !important;';
                document.documentElement.style.cssText = 'overflow: auto !important; height: auto !important;';
                
                // Try to scroll
                window.scrollTo(0, 0);
                
                resolve();
              }, 200);
            });
          }
        ];
        
        // Execute attempts sequentially
        restoreAttempts.reduce((promise, attempt) => {
          return promise.then(attempt);
        }, Promise.resolve()).then(() => {
          console.log('🎬 All scroll restoration attempts completed');
        });
        
      } catch (error) {
        console.error('🎬 Error restoring page scroll:', error);
        // Emergency fallback
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        document.body.style.position = 'static';
        document.body.style.height = 'auto';
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

    // Mouse drag handlers for smooth seeking (YouTube-like)
    handleProgressBarMouseDown(event) {
      event.preventDefault();
      this.isDragging = true;
      this.showControls = true;
      
      const videoElement = this.$refs.videoElement;
      
      // Pause video while seeking
      if (this.playerType === 'shaka' && videoElement && !videoElement.paused) {
        videoElement.pause();
        this.wasPlayingBeforeSeek = true;
      } else if (this.player && this.isPlaying) {
        this.player.pause();
        this.wasPlayingBeforeSeek = true;
      }
      
      // Seek to clicked position immediately
      this.updateProgressFromMouse(event);
      
      // Add global mouse move and up listeners
      document.addEventListener('mousemove', this.handleProgressBarMouseMove);
      document.addEventListener('mouseup', this.handleProgressBarMouseUp);
      
      this.isLoading = true;
    },

    handleProgressBarMouseMove(event) {
      if (!this.isDragging) return;
      
      event.preventDefault();
      this.updateProgressFromMouse(event);
    },

    handleProgressBarMouseUp(event) {
      if (!this.isDragging) return;
      
      event.preventDefault();
      this.isDragging = false;
      
      const videoElement = this.$refs.videoElement;
      
      // Resume video if it was playing before
      if (this.wasPlayingBeforeSeek) {
        if (this.playerType === 'shaka' && videoElement) {
          videoElement.play().catch(err => {
            console.log('Failed to resume after seek:', err);
          });
        } else if (this.player) {
          this.player.play().catch(err => {
            console.log('Failed to resume after seek:', err);
          });
        }
        this.wasPlayingBeforeSeek = false;
      }
      
      // Remove global listeners
      document.removeEventListener('mousemove', this.handleProgressBarMouseMove);
      document.removeEventListener('mouseup', this.handleProgressBarMouseUp);
      
      // Hide loading after a delay
      setTimeout(() => {
        if (this.playerType === 'shaka' && videoElement && videoElement.readyState >= 2) {
          this.isLoading = false;
        } else if (this.player && this.player.readyState() >= 2) {
          this.isLoading = false;
        }
      }, 300);
      
      this.isSeeking = false;
    },

    updateProgressFromMouse(event) {
      // Find the progress bar element
      const progressBar = this.$el.querySelector('.progress-bar');
      if (!progressBar) return;
      
      const rect = progressBar.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const progressBarWidth = rect.width;
      
      // Clamp to progress bar bounds
      const clampedX = Math.max(0, Math.min(clickX, progressBarWidth));
      const seekPercent = clampedX / progressBarWidth;
      const seekTime = seekPercent * this.duration;
      
      const videoElement = this.$refs.videoElement;
      const newTime = Math.max(0, Math.min(seekTime, this.duration));
      
      // Update video time
      if (this.playerType === 'shaka' && videoElement) {
        videoElement.currentTime = newTime;
      } else if (this.player && typeof this.player.currentTime === 'function') {
        this.player.currentTime(newTime);
      }
      
      // Update UI immediately
      this.currentTime = newTime;
      this.playedPercent = (newTime / this.duration) * 100;
      this.isSeeking = true;
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
      const videoElement = this.$refs.videoElement;
      if (this.playerType === 'shaka' && videoElement && !videoElement.paused) {
        videoElement.pause();
        this.wasPlayingBeforeSeek = true;
      } else if (this.player && this.isPlaying) {
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
      
      const videoElement = this.$refs.videoElement;
      const newTime = Math.max(0, Math.min(seekTime, this.duration));
      
      // Only update if the time difference is significant to avoid excessive updates
      if (Math.abs(newTime - this.currentTime) > 0.5) {
        if (this.playerType === 'shaka' && videoElement) {
          // For Shaka Player, use video element directly
          videoElement.currentTime = newTime;
        } else if (this.player && typeof this.player.currentTime === 'function') {
          // For Video.js
          this.player.currentTime(newTime);
        }
        
        // Update UI immediately for responsive feel
        this.currentTime = newTime;
        this.playedPercent = (newTime / this.duration) * 100;
        
        // Show loading indicator while seeking
        this.isLoading = true;
      }
      
      this.isSeeking = true;
    },

    handleProgressBarTouchEnd(event) {
      this.isDragging = false;
      const touchDuration = Date.now() - this.touchStartTime;
      
      // Remove visual feedback
      const progressBar = event.currentTarget;
      progressBar.classList.remove('progress-bar-active');
      
      const videoElement = this.$refs.videoElement;
      
      // Resume video if it was playing before
      if (this.wasPlayingBeforeSeek) {
        if (this.playerType === 'shaka' && videoElement) {
          videoElement.play().catch(err => {
            console.log('Failed to resume after seek:', err);
          });
        } else if (this.player) {
          this.player.play().catch(err => {
            console.log('Failed to resume after seek:', err);
          });
        }
        this.wasPlayingBeforeSeek = false;
      }
      
      // Handle tap (quick touch without much movement)
      if (!this.touchMoved && touchDuration < 200) {
        // Calculate position for tap
        const rect = progressBar.getBoundingClientRect();
        const clickX = event.changedTouches[0].clientX - rect.left;
        const progressBarWidth = rect.width;
        const seekPercent = (clickX / progressBarWidth);
        const seekTime = seekPercent * this.duration;
        
        if (this.playerType === 'shaka' && videoElement) {
          videoElement.currentTime = Math.max(0, Math.min(seekTime, this.duration));
        } else if (this.player && typeof this.player.currentTime === 'function') {
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
        if (this.playerType === 'shaka' && videoElement && videoElement.readyState >= 2) {
          this.isLoading = false;
        } else if (this.player && this.player.readyState() >= 2) {
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
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.3) 10%,
    rgba(0, 0, 0, 0.1) 25%,
    rgba(0, 0, 0, 0) 40%,
    rgba(0, 0, 0, 0) 60%,
    rgba(0, 0, 0, 0.1) 75%,
    rgba(0, 0, 0, 0.6) 90%,
    rgba(0, 0, 0, 0.95) 100%
  );
  opacity: 1;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 32px;
  z-index: 9999;
  pointer-events: auto;
  /* Remove backdrop blur that was affecting video */
}

.top-controls {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.top-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.top-right {
  display: flex;
  align-items: center;
}

.top-control-btn {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.top-control-btn:hover {
  background: rgba(0, 0, 0, 0.85);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
}

.top-control-btn svg {
  width: 20px;
  height: 20px;
  stroke: white;
  stroke-width: 2.5;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
}

.close-btn svg {
  width: 24px;
  height: 24px;
}



.back-button {
  background: rgba(42, 42, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  padding: 0;
  margin-right: 16px;
  /* Removed backdrop blur to prevent video blurring */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);
}

.back-button:hover {
  background: rgba(60, 60, 60, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3);
}

.back-button:active {
  transform: translateY(0) scale(0.96);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2);
}

.back-button svg {
  width: 24px;
  height: 24px;
  stroke: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.video-title {
  color: white;
  margin: 0;
  font-size: 1.4em;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(0, 0, 0, 0.4);
  letter-spacing: 0.3px;
  line-height: 1.3;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
}

.center-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
  margin: 0;
  padding: 40px 0;
}

.center-control-btn {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.4);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 12px;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.center-control-btn:hover {
  transform: scale(1.1);
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.8);
}

.center-control-btn svg {
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8));
}

.skip-backward,
.skip-forward {
  position: relative;
}

.skip-text {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
}

.play-pause-btn {
  background: rgba(0, 0, 0, 0.7);
  border: 3px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  width: 70px;
  height: 70px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.play-pause-btn:hover {
  background: rgba(0, 0, 0, 0.85);
  border-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.8);
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

.bottom-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 12px;
}

.bottom-left {
  display: flex;
  align-items: center;
}

.bottom-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.bottom-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.quality-container {
  position: relative;
  display: flex;
  align-items: center;
}

.bottom-control-btn {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  padding: 10px 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.bottom-control-btn:hover {
  background: rgba(0, 0, 0, 0.85);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
}

.bottom-control-btn svg {
  width: 18px;
  height: 18px;
  stroke: white;
  stroke-width: 2.5;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
}

.control-label {
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.progress-bar {
  position: relative;
  height: 6px;
  width: 100%;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  overflow: visible;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2);
  /* Removed backdrop blur to prevent video blurring */
}

.progress-bar:hover {
  height: 10px;
  background: rgba(255, 255, 255, 0.35);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 3px rgba(0, 0, 0, 0.3);
  transform: scaleY(1.2);
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
  background: rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.progress-played {
  background: linear-gradient(90deg, #e50914 0%, #ff1744 50%, #e50914 100%);
  box-shadow: 0 0 20px rgba(229, 9, 20, 0.5), 0 0 10px rgba(229, 9, 20, 0.3);
  border-radius: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.progress-played::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
  border-radius: 8px;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  border: 3px solid #e50914;
  border-radius: 50%;
  transform: translateY(-50%);
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3);
  opacity: 0;
  pointer-events: none;
  z-index: 15;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
  transform: translateY(-50%) scale(1.2);
  box-shadow: 0 6px 20px rgba(229, 9, 20, 0.6), 0 3px 10px rgba(0, 0, 0, 0.4);
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
  background: rgba(42, 42, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  margin: 0 8px;
  /* Removed backdrop blur to prevent video blurring */
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3), 0 3px 12px rgba(0, 0, 0, 0.2);
}

.control-button:hover {
  background: rgba(60, 60, 60, 0.95);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px) scale(1.08);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 6px 16px rgba(0, 0, 0, 0.3);
}

.control-button:active {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);
}

.control-button svg {
  width: 28px;
  height: 28px;
  stroke: white;
  stroke-width: 2.5;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.play-button {
  width: 80px;
  height: 60px;
  background: linear-gradient(135deg, rgba(229, 9, 20, 0.95) 0%, rgba(179, 7, 16, 0.95) 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(229, 9, 20, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  border-radius: 30px;
}

.play-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%);
  border-radius: 50%;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.play-button:hover::before {
  opacity: 1;
}

.play-button:hover {
  background: linear-gradient(135deg, rgba(229, 9, 20, 1) 0%, rgba(179, 7, 16, 1) 100%);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 16px 40px rgba(229, 9, 20, 0.5), 0 8px 20px rgba(0, 0, 0, 0.4);
}

/* Secondary Button Design - Same width and height as play button */
.play-button.secondary {
  width: 80px;
  height: 60px;
  background: linear-gradient(135deg, rgba(0, 150, 136, 0.95) 0%, rgba(0, 121, 107, 0.95) 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 150, 136, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  border-radius: 30px;
}

.play-button.secondary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%);
  border-radius: 50%;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.play-button.secondary:hover::before {
  opacity: 1;
}

.play-button.secondary:hover {
  background: linear-gradient(135deg, rgba(0, 150, 136, 1) 0%, rgba(0, 121, 107, 1) 100%);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 16px 40px rgba(0, 150, 136, 0.5), 0 8px 20px rgba(0, 0, 0, 0.4);
}

/* Alternative Secondary Button Design - Blue Theme */
.play-button.secondary-blue {
  width: 80px;
  height: 60px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.95) 0%, rgba(25, 118, 210, 0.95) 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(33, 150, 243, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  border-radius: 30px;
}

.play-button.secondary-blue::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%);
  border-radius: 50%;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.play-button.secondary-blue:hover::before {
  opacity: 1;
}

.play-button.secondary-blue:hover {
  background: linear-gradient(135deg, rgba(33, 150, 243, 1) 0%, rgba(25, 118, 210, 1) 100%);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 16px 40px rgba(33, 150, 243, 0.5), 0 8px 20px rgba(0, 0, 0, 0.4);
}

/* Purple Secondary Button Design */
.play-button.secondary-purple {
  width: 80px;
  height: 60px;
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.95) 0%, rgba(123, 31, 162, 0.95) 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(156, 39, 176, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  border-radius: 30px;
}

.play-button.secondary-purple::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%);
  border-radius: 50%;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.play-button.secondary-purple:hover::before {
  opacity: 1;
}

.play-button.secondary-purple:hover {
  background: linear-gradient(135deg, rgba(156, 39, 176, 1) 0%, rgba(123, 31, 162, 1) 100%);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 16px 40px rgba(156, 39, 176, 0.5), 0 8px 20px rgba(0, 0, 0, 0.4);
}

/* Orange Secondary Button Design */
.play-button.secondary-orange {
  width: 80px;
  height: 60px;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.95) 0%, rgba(245, 124, 0, 0.95) 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(255, 152, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  border-radius: 30px;
}

.play-button.secondary-orange::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%);
  border-radius: 50%;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.play-button.secondary-orange:hover::before {
  opacity: 1;
}

.play-button.secondary-orange:hover {
  background: linear-gradient(135deg, rgba(255, 152, 0, 1) 0%, rgba(245, 124, 0, 1) 100%);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 16px 40px rgba(255, 152, 0, 0.5), 0 8px 20px rgba(0, 0, 0, 0.4);
}

.play-button svg {
  width: 36px;
  height: 36px;
  stroke-width: 2;
}

.button-text {
  position: absolute;
  bottom: -20px;
  font-size: 12px;
  color: white;
}

.time-display {
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0.3px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.quality-selector {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  background: transparent;
  border: none;
  color: white;
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
  gap: 12px;
  background: rgba(42, 42, 42, 0.95);
  padding: 12px 20px;
  border-radius: 16px;
  cursor: pointer;
  /* Removed backdrop blur to prevent video blurring */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.resolution-container:hover {
  background: rgba(60, 60, 60, 0.95);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3);
}

.resolution-text {
  color: white;
  font-size: 15px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0.3px;
}

.settings-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

.settings-icon {
  width: 20px;
  height: 20px;
  stroke: white;
  stroke-width: 2;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.fullscreen-btn {
  background: rgba(42, 42, 42, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
  width: 48px;
  height: 48px;
  margin-left: 8px;
}

.fullscreen-btn:hover {
  background: rgba(60, 60, 60, 0.95);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px) scale(1.05);
}

.fullscreen-btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
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
  padding: 20px 16px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.4) 8%,
    rgba(0, 0, 0, 0.1) 20%,
    rgba(0, 0, 0, 0) 35%,
    rgba(0, 0, 0, 0) 65%,
    rgba(0, 0, 0, 0.1) 80%,
    rgba(0, 0, 0, 0.4) 92%,
    rgba(0, 0, 0, 0.95) 100%
  );
  /* Removed backdrop blur to prevent video blurring */
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
    padding: 20px 16px;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.95) 0%,
      rgba(0, 0, 0, 0.3) 10%,
      rgba(0, 0, 0, 0.1) 25%,
      rgba(0, 0, 0, 0) 40%,
      rgba(0, 0, 0, 0) 60%,
      rgba(0, 0, 0, 0.1) 75%,
      rgba(0, 0, 0, 0.3) 90%,
      rgba(0, 0, 0, 0.95) 100%
    );
    /* Removed backdrop blur to prevent video blurring */
  }

  .top-controls {
    padding: 16px 12px;
  }

  .back-button {
    width: 44px;
    height: 44px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .back-button svg {
    width: 22px;
    height: 22px;
  }

  .video-title {
    font-size: 1.2em;
    font-weight: 600;
  }

  .center-controls {
    gap: 32px;
    margin: 24px 0;
  }

  .control-button {
    width: 52px;
    height: 52px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 3px 10px rgba(0, 0, 0, 0.3);
  }

  .control-button svg {
    width: 26px;
    height: 26px;
  }

  .play-button {
    width: 72px;
    height: 54px;
    box-shadow: 0 8px 28px rgba(229, 9, 20, 0.5), 0 4px 14px rgba(0, 0, 0, 0.4);
    border-radius: 27px;
  }

  /* Mobile Secondary Button Styles - Same width and height */
  .play-button.secondary {
    width: 72px;
    height: 54px;
    box-shadow: 0 8px 28px rgba(0, 150, 136, 0.5), 0 4px 14px rgba(0, 0, 0, 0.4);
    border-radius: 27px;
  }

  .play-button.secondary-blue {
    width: 72px;
    height: 54px;
    box-shadow: 0 8px 28px rgba(33, 150, 243, 0.5), 0 4px 14px rgba(0, 0, 0, 0.4);
    border-radius: 27px;
  }

  .play-button.secondary-purple {
    width: 72px;
    height: 54px;
    box-shadow: 0 8px 28px rgba(156, 39, 176, 0.5), 0 4px 14px rgba(0, 0, 0, 0.4);
    border-radius: 27px;
  }

  .play-button.secondary-orange {
    width: 72px;
    height: 54px;
    box-shadow: 0 8px 28px rgba(255, 152, 0, 0.5), 0 4px 14px rgba(0, 0, 0, 0.4);
    border-radius: 27px;
  }

  .play-button svg {
    width: 32px;
    height: 32px;
  }

  .button-text {
    display: none;
  }

  .volume-slider-container {
    display: none;
  }

  .quality-selector {
    font-size: 13px;
    padding: 6px 12px;
    border-radius: 10px;
  }

  .resolution-container {
    padding: 10px 16px;
    border-radius: 14px;
    gap: 10px;
  }

  .resolution-text {
    font-size: 14px;
    font-weight: 600;
  }

  .time-display {
    font-size: 14px;
    padding: 6px 12px;
    border-radius: 10px;
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

  /* Landscape Secondary Button Styles - Same dimensions */
  .play-button.secondary,
  .play-button.secondary-blue,
  .play-button.secondary-purple,
  .play-button.secondary-orange {
    width: 72px;
    height: 54px;
    border-radius: 27px;
  }

  .play-button.secondary {
    box-shadow: 0 8px 28px rgba(0, 150, 136, 0.5), 0 4px 14px rgba(0, 0, 0, 0.4);
  }

  .play-button.secondary-blue {
    box-shadow: 0 8px 28px rgba(33, 150, 243, 0.5), 0 4px 14px rgba(0, 0, 0, 0.4);
  }

  .play-button.secondary-purple {
    box-shadow: 0 8px 28px rgba(156, 39, 176, 0.5), 0 4px 14px rgba(0, 0, 0, 0.4);
  }

  .play-button.secondary-orange {
    box-shadow: 0 8px 28px rgba(255, 152, 0, 0.5), 0 4px 14px rgba(0, 0, 0, 0.4);
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
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  /* Removed backdrop blur to prevent video blurring */
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

/* Ensure proper scroll restoration after video cleanup */
.scroll-restored {
  overflow: auto !important;
  position: static !important;
  width: auto !important;
  height: auto !important;
  touch-action: auto !important;
  -webkit-overflow-scrolling: touch !important;
  transform: none !important;
  pointer-events: auto !important;
}

/* Force scroll capability class */
.force-scrollable {
  overflow: auto !important;
  height: auto !important;
  min-height: 100vh !important;
  position: static !important;
  touch-action: auto !important;
  -webkit-overflow-scrolling: touch !important;
  pointer-events: auto !important;
  user-select: auto !important;
  -webkit-user-select: auto !important;
  transform: none !important;
  will-change: auto !important;
}

/* Reset any video-related transforms */
.video-cleanup-reset {
  transform: none !important;
  transform-style: flat !important;
  backface-visibility: visible !important;
  will-change: auto !important;
}
</style>