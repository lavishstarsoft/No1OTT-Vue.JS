<template>
  <div ref="playerContainer" class="video-player-container">
    <!-- Main video element -->
    <video
      ref="videoElement"
      class="main-video"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @waiting="onBuffering"
      @playing="onPlaying"
      @error="onError"
    ></video>

    <!-- Loading spinner -->
    <div v-if="isLoading || isBuffering" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <!-- Video controls overlay -->
    <div 
      v-if="showControls || isPaused" 
      class="controls-overlay"
      @mousemove="resetControlsTimer"
      @click="togglePlayPause"
    >
      <!-- Top bar -->
      <div class="top-bar" @click.stop>
        <button @click="$emit('back')" class="control-btn">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h3 class="video-title">{{ title }}</h3>
        <div class="right-controls">
          <!-- Live indicator -->
          <div v-if="isLive" class="live-indicator">
            <span class="live-dot"></span>
            <span>LIVE</span>
          </div>
          <!-- Quality selector -->
          <div class="quality-selector" v-if="!isLive" @click.stop>
            <button @click.stop="toggleQualityMenu" class="control-btn">
              <i class="fas fa-cog"></i>
            </button>
            <!-- Quality menu -->
            <div v-if="showQualityMenu" class="quality-menu" @click.stop>
              <div class="menu-header">
                <span>Quality</span>
                <button class="close-btn" @click.stop="showQualityMenu = false">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <button 
                v-for="quality in availableQualities" 
                :key="quality.id"
                @click.stop="setQuality(quality)"
                class="quality-option"
                :class="{
                  'selected': currentQuality?.id === quality.id,
                  'hd': quality.label === '1080p' || quality.label === '720p'
                }"
              >
                {{ quality.label }}
                <span v-if="quality.label === '1080p' || quality.label === '720p'" class="hd-badge">HD</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Center controls -->
      <div class="center-controls" @click.stop>
        <button @click="skipBackward(10)" class="control-btn large">
          <i class="fas fa-undo-alt"></i>
          <span>10</span>
        </button>
        <button @click="togglePlayPause" class="control-btn extra-large">
          <i :class="isPaused ? 'fas fa-play' : 'fas fa-pause'"></i>
        </button>
        <button @click="skipForward(10)" class="control-btn large">
          <i class="fas fa-redo-alt"></i>
          <span>10</span>
        </button>
      </div>

      <!-- Bottom controls -->
      <div class="bottom-controls" @click.stop>
        <!-- Progress bar -->
        <div 
          class="progress-container"
          @mousemove="updatePreview"
          @mouseleave="hidePreview"
        >
          <!-- Preview tooltip -->
          <div 
            v-if="showPreview" 
            class="preview-tooltip"
            :style="{ left: `${previewPosition}%` }"
          >
            <div class="preview-time">{{ formatTime(previewTime) }}</div>
          </div>
          
          <!-- Progress bar -->
          <div class="progress-bar">
            <div class="progress-buffer" :style="{ width: `${bufferedPercentage}%` }"></div>
            <div class="progress-current" :style="{ width: `${playedPercentage}%` }">
              <div class="progress-handle"></div>
            </div>
          </div>
        </div>

        <!-- Time and controls -->
        <div class="bottom-bar">
          <div class="time-display">
            <span>{{ formatTime(currentTime) }}</span>
            <span v-if="!isLive">/</span>
            <span v-if="!isLive">{{ formatTime(duration) }}</span>
          </div>

          <div class="playback-controls">
            <!-- Volume control -->
            <div class="volume-control">
              <button @click="toggleMute" class="control-btn">
                <i :class="volumeIcon"></i>
              </button>
              <input 
                type="range" 
                min="0" 
                max="100" 
                v-model="volume"
                @input="setVolume"
                class="volume-slider"
              >
            </div>

            <!-- PiP button -->
            <button 
              v-if="supportsPiP && !isMobile"
              @click="togglePiP" 
              class="control-btn"
            >
              <i class="fas fa-clone"></i>
            </button>

            <!-- Fullscreen toggle -->
            <button @click="toggleFullscreen" class="control-btn">
              <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-overlay">
      <div class="error-content">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Playback Error</h3>
        <p>{{ error }}</p>
        <button @click="retry" class="retry-btn">Retry</button>
      </div>
    </div>
  </div>
</template>

<script>
import Hls from 'hls.js';

export default {
  name: 'ModernVideoPlayer',
  
  props: {
    src: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: 'Video'
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    isLive: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      hls: null,
      isLoading: true,
      isBuffering: false,
      isPaused: true,
      isMuted: false,
      volume: 100,
      currentTime: 0,
      duration: 0,
      bufferedPercentage: 0,
      playedPercentage: 0,
      showControls: true,
      controlsTimeout: null,
      isFullscreen: false,
      supportsPiP: false,
      isPiP: false,
      isMobile: false,
      showQualityMenu: false,
      availableQualities: [],
      currentQuality: null,
      error: null,
      showPreview: false,
      previewPosition: 0,
      previewTime: 0,
      lastInteraction: Date.now()
    };
  },

  computed: {
    volumeIcon() {
      if (this.isMuted || this.volume === 0) return 'fas fa-volume-mute';
      if (this.volume < 50) return 'fas fa-volume-down';
      return 'fas fa-volume-up';
    }
  },

  watch: {
    src: {
      handler(newSrc) {
        this.initializePlayer(newSrc);
      },
      immediate: true
    }
  },

  mounted() {
    this.detectDevice();
    this.initializePlayer(this.src);
    this.setupEventListeners();
    this.loadUserPreferences();
  },

  beforeUnmount() {
    this.cleanup();
  },

  methods: {
    initializePlayer(src) {
      const video = this.$refs.videoElement;
      if (!video) return;

      this.destroyPlayer();
      this.isLoading = true;
      this.error = null;

      try {
        if (Hls.isSupported()) {
          this.initHlsPlayer(src);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          this.initNativePlayer(src);
        } else {
          throw new Error('HLS is not supported in this browser');
        }
      } catch (error) {
        this.handleError(error);
      }
    },

    initHlsPlayer(src) {
      this.hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1,
        debug: false
      });

      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        this.hls.loadSource(src);
      });

      this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        this.setupQualities(data.levels);
        this.startPlayback();
      });

      this.hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          this.handleError('HLS playback error');
        }
      });

      this.hls.attachMedia(this.$refs.videoElement);
    },

    initNativePlayer(src) {
      const video = this.$refs.videoElement;
      video.src = src;
      this.startPlayback();
    },

    setupQualities(levels) {
      this.availableQualities = levels.map((level, index) => ({
        id: index,
        label: `${level.height}p`,
        bitrate: level.bitrate
      }));

      this.availableQualities.unshift({
        id: 'auto',
        label: 'Auto'
      });

      this.currentQuality = this.availableQualities[0];
    },

    startPlayback() {
      if (this.autoplay) {
        const video = this.$refs.videoElement;
        video.muted = true;
        video.play().then(() => {
          if (this.volume > 0) {
            video.muted = false;
            video.volume = this.volume / 100;
          }
        }).catch(() => {
          this.isPaused = true;
        });
      }
    },

    togglePlayPause() {
      const video = this.$refs.videoElement;
      if (this.isPaused) {
        video.play();
      } else {
        video.pause();
      }
    },

    skipForward(seconds) {
      const video = this.$refs.videoElement;
      if (video) {
        video.currentTime = Math.min(video.currentTime + seconds, video.duration);
      }
    },

    skipBackward(seconds) {
      const video = this.$refs.videoElement;
      if (video) {
        video.currentTime = Math.max(video.currentTime - seconds, 0);
      }
    },

    toggleMute() {
      const video = this.$refs.videoElement;
      video.muted = !video.muted;
      this.isMuted = video.muted;
    },

    setVolume() {
      const video = this.$refs.videoElement;
      video.volume = this.volume / 100;
      video.muted = this.volume === 0;
      this.isMuted = video.muted;
      localStorage.setItem('video-volume', this.volume);
    },

    async toggleFullscreen() {
      try {
        if (!document.fullscreenElement) {
          await this.$refs.playerContainer.requestFullscreen();
          this.isFullscreen = true;
        } else {
          await document.exitFullscreen();
          this.isFullscreen = false;
        }
      } catch (error) {
        console.error('Fullscreen error:', error);
      }
    },

    toggleQualityMenu(event) {
      event.stopPropagation();
      this.showQualityMenu = !this.showQualityMenu;
      
      // Hide other menus if open
      if (this.showQualityMenu) {
        // Reset controls timer
        this.resetControlsTimer();
        
        // Add click outside listener
        setTimeout(() => {
          document.addEventListener('click', this.handleClickOutside);
        }, 0);
      }
    },

    handleClickOutside(event) {
      const menu = this.$el.querySelector('.quality-menu');
      const button = this.$el.querySelector('.quality-selector button');
      
      if (menu && !menu.contains(event.target) && !button.contains(event.target)) {
        this.showQualityMenu = false;
        document.removeEventListener('click', this.handleClickOutside);
      }
    },

    setQuality(quality) {
      if (!this.hls) return;

      this.currentQuality = quality;
      this.showQualityMenu = false;

      if (quality.id === 'auto') {
        this.hls.currentLevel = -1;
      } else {
        this.hls.currentLevel = quality.id;
      }

      // Remove click outside listener
      document.removeEventListener('click', this.handleClickOutside);
    },

    resetControlsTimer() {
      if (this.controlsTimeout) {
        clearTimeout(this.controlsTimeout);
      }

      this.showControls = true;
      this.lastInteraction = Date.now();

      if (!this.isPaused) {
        this.controlsTimeout = setTimeout(() => {
          if (Date.now() - this.lastInteraction >= 3000) {
            this.showControls = false;
          }
        }, 3000);
      }
    },

    onTimeUpdate() {
      const video = this.$refs.videoElement;
      this.currentTime = video.currentTime;
      
      if (this.duration > 0) {
        this.playedPercentage = (this.currentTime / this.duration) * 100;
      }

      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        this.bufferedPercentage = (bufferedEnd / this.duration) * 100;
      }
    },

    onLoadedMetadata() {
      const video = this.$refs.videoElement;
      this.duration = video.duration;
      this.isLoading = false;
    },

    onPlay() {
      this.isPaused = false;
      this.resetControlsTimer();
    },

    onPause() {
      this.isPaused = true;
      this.showControls = true;
    },

    onEnded() {
      this.isPaused = true;
      this.showControls = true;
      this.$emit('ended');
    },

    onBuffering() {
      this.isBuffering = true;
    },

    onPlaying() {
      this.isBuffering = false;
    },

    onError() {
      this.handleError('Video playback error');
    },

    handleError(message) {
      console.error('Player error:', message);
      this.error = message;
      this.isLoading = false;
      this.isBuffering = false;
      this.$emit('error', message);
    },

    retry() {
      this.initializePlayer(this.src);
    },

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00';
      
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },

    updatePreview(event) {
      const progressBar = event.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const position = ((event.clientX - rect.left) / rect.width);
      
      this.previewPosition = position * 100;
      this.previewTime = position * this.duration;
      this.showPreview = true;
    },

    hidePreview() {
      this.showPreview = false;
    },

    detectDevice() {
      this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      this.supportsPiP = document.pictureInPictureEnabled;
    },

    setupEventListeners() {
      document.addEventListener('fullscreenchange', () => {
        this.isFullscreen = !!document.fullscreenElement;
      });

      window.addEventListener('keydown', this.handleKeyboardControls);
    },

    handleKeyboardControls(event) {
      if (!this.$refs.videoElement) return;

      switch (event.key.toLowerCase()) {
        case ' ':
        case 'k':
          event.preventDefault();
          this.togglePlayPause();
          break;
        case 'f':
          event.preventDefault();
          this.toggleFullscreen();
          break;
        case 'm':
          event.preventDefault();
          this.toggleMute();
          break;
        case 'arrowright':
          event.preventDefault();
          this.skipForward(10);
          break;
        case 'arrowleft':
          event.preventDefault();
          this.skipBackward(10);
          break;
      }
    },

    loadUserPreferences() {
      const savedVolume = localStorage.getItem('video-volume');
      if (savedVolume !== null) {
        this.volume = parseInt(savedVolume);
        this.setVolume();
      }
    },

    async togglePiP() {
      const video = this.$refs.videoElement;
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await video.requestPictureInPicture();
        }
      } catch (error) {
        console.error('PiP error:', error);
      }
    },

    destroyPlayer() {
      if (this.hls) {
        this.hls.destroy();
        this.hls = null;
      }

      const video = this.$refs.videoElement;
      if (video) {
        video.src = '';
        video.removeAttribute('src');
      }
    },

    cleanup() {
      this.destroyPlayer();
      
      if (this.controlsTimeout) {
        clearTimeout(this.controlsTimeout);
      }

      document.removeEventListener('fullscreenchange', this.onFullscreenChange);
      window.removeEventListener('keydown', this.handleKeyboardControls);

      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      }

      document.removeEventListener('click', this.handleClickOutside);
    }
  }
};
</script>

<style scoped>
.video-player-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

.main-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.controls-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    transparent 65%, 
    rgba(0,0,0,0.8) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0;
  color: white;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(to bottom, 
    rgba(0,0,0,0.8) 0%, 
    transparent 100%);
}

.bottom-controls {
  width: 100%;
  padding: 0 12px 12px;
}

.progress-container {
  width: 100%;
  padding: 8px 0;
  cursor: pointer;
}

.progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  position: relative;
  transition: height 0.2s ease;
}

.progress-container:hover .progress-bar {
  height: 5px;
}

.progress-buffer {
  position: absolute;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
}

.progress-current {
  position: absolute;
  height: 100%;
  background: #ff0000;
  border-radius: 2px;
}

.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.control-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.time-display {
  font-size: 14px;
  color: #fff;
  margin: 0 16px;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-control {
  display: flex;
  align-items: center;
}

.volume-slider {
  width: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  transition: width 0.2s;
  opacity: 0;
}

.volume-control:hover .volume-slider {
  width: 60px;
  opacity: 1;
  margin-left: 8px;
}

.quality-selector {
  position: relative;
  z-index: 100;
}

.quality-menu {
  position: absolute;
  bottom: 40px;
  right: 0;
  background: rgba(28, 28, 28, 0.95);
  border-radius: 8px;
  padding: 0;
  min-width: 250px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-header span {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}

.close-btn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.quality-option {
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.2s;
}

.quality-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.quality-option.selected {
  background: rgba(255, 255, 255, 0.08);
}

.quality-option.selected::after {
  content: '✓';
  margin-left: 8px;
  color: #fff;
}

.hd-badge {
  font-size: 10px;
  padding: 2px 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-left: 8px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .controls-overlay {
    padding: 0;
  }

  .bottom-controls {
    padding: 0 8px 8px;
  }

  .control-btn {
    width: 36px;
    height: 36px;
  }

  .volume-control {
    display: none;
  }

  .time-display {
    font-size: 12px;
    margin: 0 8px;
  }

  .quality-menu {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    min-width: 100%;
    margin: 0;
    border-radius: 12px 12px 0 0;
    background: rgba(28, 28, 28, 0.98);
  }

  .menu-header {
    padding: 20px 16px;
  }

  .menu-header span {
    font-size: 16px;
  }

  .quality-option {
    padding: 16px;
    font-size: 16px;
  }
}

/* Loading Spinner */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error Overlay */
.error-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.error-content {
  text-align: center;
  padding: 24px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 24px;
  background: #ff0000;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #cc0000;
}

/* HD Badge */
.quality-option[data-quality="1080p"]::after,
.quality-option[data-quality="720p"]::after {
  content: "HD";
  font-size: 10px;
  padding: 2px 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-left: 8px;
}
</style> 