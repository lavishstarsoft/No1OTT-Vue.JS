<template>
  <div v-if="isOpen" class="fixed inset-0 z-[2000] bg-black flex items-center justify-center player-root">
    <!-- Video Container -->
    <div 
      ref="playerContainer"
      class="relative w-full h-full max-h-screen overflow-hidden player-container"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <!-- Video Elements -->
      <video
        v-if="isDirectVideo"
        ref="videoRef"
        class="w-full h-full object-contain"
        :src="videoUrl"
        preload="auto"
        autoplay
        muted
        @timeupdate="updateProgress"
        @loadedmetadata="onVideoLoaded"
        @ended="onVideoEnded"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @volumechange="onVolumeChange"
      ></video>
      
      <iframe
        v-else
        ref="youtubePlayer"
        :src="youtubeEmbedUrl"
        class="w-full h-full"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>

      <!-- Transparent overlay to prevent YouTube controls -->
      <div 
        v-if="!isDirectVideo" 
        class="absolute inset-0 z-10"
      ></div>

      <!-- Additional overlay to hide YouTube logo/branding when paused -->
      <div 
        v-if="!isDirectVideo && !isPlaying" 
        class="absolute inset-0 z-20 bg-black/80 flex items-center justify-center"
      >
        <div 
          class="w-20 h-20 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-full cursor-pointer"
          @click="togglePlayPause"
        >
          <i class="fas fa-play text-white text-3xl pl-1"></i>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div v-if="isLoading" class="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="w-20 h-20 relative">
          <div class="absolute inset-0 rounded-full border-4 border-white/20"></div>
          <div class="absolute inset-0 rounded-full border-4 border-t-[#c30059] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <img src="@/assets/ott.jpg" alt="Logo" class="h-10 w-10 rounded-full object-cover">
          </div>
        </div>
      </div>

      <!-- Big Play/Pause Button (shows momentarily when toggling) -->
      <div 
        v-if="showBigPlayButton"
        class="absolute inset-0 flex items-center justify-center z-40 bg-black/10"
      >
        <div class="w-20 h-20 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full">
          <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'" class="text-white text-3xl pl-1"></i>
        </div>
      </div>

      <!-- Top Chrome Bar -->
      <div 
        class="absolute top-0 left-0 right-0 pt-4 pb-16 z-30 bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-opacity duration-300"
        :class="{'opacity-0': !showControls && !isControlsLocked, 'opacity-100': showControls || isControlsLocked}"
      >
        <div class="px-2 flex items-center justify-between">
          <!-- Back Button -->
          <button 
            @click.stop="close"
            class="flex items-center group"
          >
            <div class="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full mr-3 group-hover:bg-[#c30059]/80 transition-all">
              <i class="fas fa-arrow-left text-white/90 text-3xl"></i>
            </div> 
            </button>

          <!-- Title and Info -->
          <div class="flex-1 flex flex-col items-center md:items-start mx-4">
            <h1 class="text-white font-bold text-xl md:text-2xl tracking-wide">{{ videoTitle }}</h1>
            <div class="flex items-center mt-1">
              
            </div>
          </div>
          
          <!-- Top Right Actions -->
          <div class="flex items-center gap-2">
            <button 
              @click.stop="toggleCaptions"
              class="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full hover:bg-white/20 transition-all"
              :class="{'bg-[#c30059]/80': hasCaptions}"
            >
              <i class="fas fa-closed-captioning text-white/90 text-lg"></i>
            </button>
            <button 
              v-if="supportsPiP"
              @click.stop="togglePictureInPicture"
              class="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full hover:bg-white/20 transition-all"
            >
              <i class="fas fa-external-link-alt text-white/90 text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Controls -->
      <div 
        class="absolute left-0 right-0 bottom-0 z-30 transition-opacity duration-300 pb-6 pt-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent"
        :class="{'opacity-0': !showControls && !isControlsLocked, 'opacity-100': showControls || isControlsLocked}"
      >
        <!-- Progress Bar -->
        <div class="relative px-8 pb-4">
          <div 
            ref="progressContainer" 
            class="h-1.5 bg-white/30 rounded-full cursor-pointer group/progress overflow-hidden hover:h-2.5 transition-all duration-150"
            @click="seekToPosition"
            @mousemove="showProgressPreview"
          >
            <div 
              class="h-full bg-[#c30059] rounded-full relative"
              :style="{ width: `${progressPercentage}%` }"
            >
              <!-- Progress Knob - only visible on hover -->
              <div class="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#c30059] border-2 border-white rounded-full transform scale-0 opacity-0 group-hover/progress:scale-100 group-hover/progress:opacity-100 transition-all duration-150"></div>
            </div>
          </div>
          
          <!-- Preview thumbnail on hover (would be implemented with actual thumbnails in a real OTT platform) -->
          <div 
            v-if="previewPosition > 0" 
            class="absolute bottom-8 transform -translate-x-1/2 bg-black/90 rounded overflow-hidden shadow-lg"
            :style="{ left: `${previewPosition}%` }"
          >
            <div class="w-32 h-20 bg-[#1a1a1a] flex items-center justify-center">
              <i class="fas fa-tv text-[#c30059] text-2xl"></i>
            </div>
            <div class="px-2 py-1 text-center text-xs text-white">{{ formatTime(previewTime) }}</div>
          </div>
        </div>

        <!-- Main Controls -->
        <div class="px-8 flex items-center justify-between">
          <!-- Left Controls -->
          <div class="flex items-center gap-6">
            <!-- Play/Pause Button -->
            <button 
              @click.stop="togglePlayPause"
              class="group cursor-pointer"
            >
              <div class="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'" class="text-white text-2xl group-hover:text-[#c30059] transition-colors"></i>
              </div>
            </button>

            <!-- Volume Control -->
            <div class="hidden md:flex items-center group/volume">
              <button 
                @click.stop="toggleMute"
                class="group"
              >
                <div class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                  <i :class="volumeIcon" class="text-white text-xl group-hover:text-[#c30059] transition-colors"></i>
                </div>
              </button>
              
              <!-- Volume Slider -->
              <div class="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-200 h-10 flex items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  v-model="volumeLevel" 
                  @input="updateVolume"
                  class="ml-2 w-full h-1 bg-white/30 rounded-full appearance-none focus:outline-none volume-slider"
                />
              </div>
            </div>

            <!-- Live Indicator for Mobile -->
            <div class="md:hidden flex items-center">
              <span class="h-2 w-2 bg-red-600 rounded-full animate-pulse mr-1.5"></span>
              <span class="text-white/90 text-sm">LIVE</span>
            </div>
          </div>

          <!-- Center Info (only visible on larger screens) -->
          <div class="hidden md:block absolute left-1/2 -translate-x-1/2 text-white flex items-center">
            <div class="flex items-center">
              <span class="h-2 w-2 bg-red-600 rounded-full animate-pulse mr-1.5"></span>
              <span class="text-white/90 font-medium">LIVE</span>
            </div>
          </div>

          <!-- Right Controls -->
          <div class="flex items-center gap-3">
            <!-- Settings Button -->
            <div class="relative group/settings">
              <button 
                @click.stop="isQualityMenuOpen = !isQualityMenuOpen"
                class="group"
              >
                <div class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                  <i class="fas fa-cog text-white text-lg group-hover:text-[#c30059] transition-colors"></i>
                </div>
              </button>
              
              <!-- Settings Menu -->
              <div 
                v-if="isQualityMenuOpen"
                class="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-lg overflow-hidden border border-white/10 w-48"
              >
                <div class="py-2">
                  <div class="px-4 py-1 text-white/70 text-xs font-medium uppercase tracking-wider">Quality</div>
                  <div class="mt-1">
                    <button 
                      v-for="quality in ['Auto', '1080p', '720p', '480p', '360p']" 
                      :key="quality"
                      @click.stop="setQuality(quality)"
                      class="w-full px-4 py-2 text-left text-sm text-white flex items-center justify-between hover:bg-white/10"
                      :class="{'text-[#c30059]': currentQuality === quality}"
                    >
                      <span>{{ quality }}</span>
                      <i v-if="currentQuality === quality" class="fas fa-check text-[#c30059]"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Lock Controls -->
            <button 
              @click.stop="toggleControlsLock"
              class="group"
            >
              <div class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                <i :class="[
                  isControlsLocked ? 'fas fa-lock' : 'fas fa-lock-open',
                  'text-white text-lg group-hover:text-[#c30059] transition-colors',
                  {'text-[#c30059]': isControlsLocked}
                ]"></i>
              </div>
            </button>
            
            <!-- Fullscreen -->
            <button 
              @click.stop="enterFullscreen"
              class="group"
            >
              <div class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                <i :class="isFullScreen ? 'fas fa-compress' : 'fas fa-expand'" class="text-white text-lg group-hover:text-[#c30059] transition-colors"></i>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useScreenOrientation } from '@vueuse/core'

export default {
  name: 'LiveTVPlayer',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    videoUrl: {
      type: String,
      required: true
    },
    videoTitle: {
      type: String,
      required: true
    },
    isDirectVideo: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isPlaying: true,
      isFullScreen: false,
      orientationLock: null,
      showControls: true,
      controlsTimeout: null,
      progressPercentage: 0,
      duration: 0,
      currentTime: 0,
      volumeLevel: 100,
      isMuted: false,
      previousVolume: 100,
      isQualityMenuOpen: false,
      currentQuality: 'Auto',
      supportsPiP: false,
      isControlsLocked: false,
      showBigPlayButton: false,
      bigPlayButtonTimeout: null,
      isLoading: true,
      previewPosition: 0,
      previewTime: 0,
      hasCaptions: false
    }
  },
  computed: {
    youtubeEmbedUrl() {
      // Extract video ID from YouTube URL
      const videoId = this.extractVideoId(this.videoUrl)
      // Add parameters to completely hide controls and disable all YouTube UI elements
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&controls=0&disablekb=1&fs=0&modestbranding=1&showinfo=0&iv_load_policy=3&playsinline=1&enablejsapi=1&origin=${window.location.origin}&widget_referrer=${window.location.origin}&color=white&loop=1&wmode=transparent&vq=hd1080&cc_load_policy=3`
    },
    volumeIcon() {
      if (this.isMuted || this.volumeLevel === 0) {
        return 'fas fa-volume-mute'
      } else if (this.volumeLevel < 50) {
        return 'fas fa-volume-down'
      } else {
        return 'fas fa-volume-up'
      }
    },
    formattedCurrentTime() {
      return this.formatTime(this.currentTime)
    },
    formattedDuration() {
      return this.formatTime(this.duration)
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        document.addEventListener('keydown', this.handleKeyboardShortcuts)
        this.checkPiPSupport()
        // Set loading to true initially
        this.isLoading = true
        // Simulate loading completion after 2s (would be based on actual video loading in a real app)
        setTimeout(() => {
          this.isLoading = false
          // Ensure video is playing
          this.ensureVideoIsPlaying()
        }, 2000)
      } else {
        document.removeEventListener('keydown', this.handleKeyboardShortcuts)
      }
    }
  },
  mounted() {
    const { lockOrientation, unlockOrientation } = useScreenOrientation()
    this.orientationLock = { lockOrientation, unlockOrientation }
    
    // Load saved volume if available
    try {
      const savedVolume = localStorage.getItem('player-volume')
      if (savedVolume !== null) {
        this.volumeLevel = parseInt(savedVolume, 10)
      }
    } catch (e) {
      // Ignore storage errors
    }
    
    if (this.isOpen) {
      document.addEventListener('keydown', this.handleKeyboardShortcuts)
      this.checkPiPSupport()
      // Simulate loading completion after 2s
      setTimeout(() => {
        this.isLoading = false
        // Ensure video is playing
        this.ensureVideoIsPlaying()
      }, 2000)
    }
    
    // Auto-hide controls after 3 seconds
    this.resetControlsTimeout()
  },
  methods: {
    extractVideoId(url) {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
      const match = url.match(regExp)
      return (match && match[7].length === 11) ? match[7] : ''
    },
    async close() {
      // Exit fullscreen first if we're in fullscreen mode
      if (document.fullscreenElement) {
        try {
          await this.toggleFullscreen();
          // Only after fullscreen exit is complete, navigate away
          this.$emit('close');
        } catch (error) {
          console.error('Error during cleanup:', error);
          // Still allow navigation even if there was an error
          this.$emit('close');
        }
      } else {
        // If not in fullscreen, just navigate away
        this.$emit('close');
      }
    },
    togglePlayPause() {
      if (this.isDirectVideo) {
        const video = this.$refs.videoRef
        if (video) {
          if (video.paused) {
            video.play()
          } else {
            video.pause()
          }
          this.isPlaying = !video.paused
        }
      } else {
        const iframe = this.$refs.youtubePlayer
        if (iframe) {
          const command = this.isPlaying ? 'pauseVideo' : 'playVideo'
          iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: command
          }), '*')
          this.isPlaying = !this.isPlaying
        }
      }
      
      // Show the big play/pause button
      this.showBigPlayButton = true
      clearTimeout(this.bigPlayButtonTimeout)
      this.bigPlayButtonTimeout = setTimeout(() => {
        this.showBigPlayButton = false
      }, 800)
    },
    toggleCaptions() {
      this.hasCaptions = !this.hasCaptions
      // This would actually toggle captions in a real implementation
    },
    handleMouseMove() {
      if (this.isControlsLocked) return
      this.showControls = true
      this.resetControlsTimeout()
    },
    handleMouseLeave() {
      if (this.isControlsLocked) return
      clearTimeout(this.controlsTimeout)
      this.controlsTimeout = setTimeout(() => {
        this.showControls = false
        this.previewPosition = 0 // Hide preview on mouse leave
      }, 1000)
    },
    resetControlsTimeout() {
      if (this.isControlsLocked) return
      clearTimeout(this.controlsTimeout)
      this.controlsTimeout = setTimeout(() => {
        this.showControls = false
        this.previewPosition = 0 // Hide preview when controls hide
      }, 3000)
    },
    toggleControlsLock() {
      this.isControlsLocked = !this.isControlsLocked
    },
    updateProgress() {
      if (!this.isDirectVideo) return
      
      const video = this.$refs.videoRef
      if (video) {
        this.currentTime = video.currentTime
        this.duration = video.duration
        this.progressPercentage = (video.currentTime / video.duration) * 100 || 0
      }
    },
    showProgressPreview(e) {
      if (!this.isDirectVideo) return
      
      const container = this.$refs.progressContainer
      if (!container) return
      
      const rect = container.getBoundingClientRect()
      const position = ((e.clientX - rect.left) / rect.width) * 100
      this.previewPosition = position
      
      if (this.duration) {
        this.previewTime = (position / 100) * this.duration
      }
    },
    seekToPosition(e) {
      if (!this.isDirectVideo) return
      
      const container = this.$refs.progressContainer
      if (!container) return
      
      const rect = container.getBoundingClientRect()
      const position = ((e.clientX - rect.left) / rect.width)
      const video = this.$refs.videoRef
      
      if (video && !isNaN(video.duration)) {
        video.currentTime = position * video.duration
      }
      
      // Hide preview after seeking
      this.previewPosition = 0
    },
    formatTime(seconds) {
      if (isNaN(seconds) || !isFinite(seconds)) return '0:00'
      
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      const remainingSeconds = Math.floor(seconds % 60)
      
      if (hours > 0) {
        return `${hours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
      }
      
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
    },
    toggleMute() {
      if (this.isDirectVideo) {
        const video = this.$refs.videoRef
        if (video) {
          if (this.isMuted) {
            video.volume = this.previousVolume / 100
            this.volumeLevel = this.previousVolume
          } else {
            this.previousVolume = this.volumeLevel
            video.volume = 0
            this.volumeLevel = 0
          }
          this.isMuted = !this.isMuted
        }
      } else {
        // YouTube mute/unmute
        const iframe = this.$refs.youtubePlayer
        if (iframe) {
          const command = this.isMuted ? 'unMute' : 'mute'
          iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: command
          }), '*')
          this.isMuted = !this.isMuted
        }
      }
    },
    updateVolume() {
      if (this.isDirectVideo) {
        const video = this.$refs.videoRef
        if (video) {
          video.volume = this.volumeLevel / 100
          video.muted = this.volumeLevel === 0
          this.isMuted = this.volumeLevel === 0
        }
      } else {
        // YouTube volume control
        const iframe = this.$refs.youtubePlayer
        if (iframe) {
          // Ensure the volume value is between 0-100
          const volume = Math.max(0, Math.min(100, this.volumeLevel))
          
          try {
            // First unmute if muted and volume > 0
            if (this.isMuted && volume > 0) {
              iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'unMute'
              }), '*')
              this.isMuted = false
            }
            
            // Set volume (YouTube API expects 0-100)
            iframe.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: 'setVolume',
              args: [volume]
            }), '*')
            
            // Set mute state if volume is 0
            if (volume === 0 && !this.isMuted) {
              iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'mute'
              }), '*')
              this.isMuted = true
            }
          } catch (err) {
            console.error('Error updating YouTube volume:', err)
          }
        }
      }
      
      // Save volume to localStorage for persistence
      try {
        localStorage.setItem('player-volume', this.volumeLevel.toString())
      } catch (e) {
        // Ignore storage errors
      }
    },
    onVolumeChange() {
      if (!this.isDirectVideo) return
      
      const video = this.$refs.videoRef
      if (video) {
        this.volumeLevel = video.volume * 100
        this.isMuted = video.muted
      }
    },
    onVideoLoaded() {
      if (!this.isDirectVideo) return
      
      const video = this.$refs.videoRef
      if (video) {
        this.duration = video.duration
        this.isLoading = false
      }
    },
    onVideoEnded() {
      this.isPlaying = false
    },
    async enterFullscreen() {
      const element = this.$refs.playerContainer
      
      if (!element) return
      
      if (!document.fullscreenElement) {
        try {
          await element.requestFullscreen()
          this.isFullScreen = true
          try {
            await this.orientationLock.lockOrientation('landscape')
          } catch (err) {
            console.warn('Orientation lock failed:', err)
          }
        } catch (err) {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`)
        }
      } else {
        document.exitFullscreen()
        this.isFullScreen = false
        try {
          this.orientationLock.unlockOrientation()
        } catch (err) {
          console.warn('Failed to unlock orientation:', err)
        }
      }
    },
    checkPiPSupport() {
      if (this.isDirectVideo) {
        this.supportsPiP = document.pictureInPictureEnabled || 
                          (this.$refs.videoRef && 'requestPictureInPicture' in HTMLVideoElement.prototype)
      } else {
        this.supportsPiP = false // YouTube iframe doesn't support native PiP
      }
    },
    async togglePictureInPicture() {
      if (!this.isDirectVideo || !this.supportsPiP) return
      
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture()
        } else {
          const video = this.$refs.videoRef
          if (video) {
            await video.requestPictureInPicture()
          }
        }
      } catch (err) {
        console.error('PiP failed:', err)
      }
    },
    setQuality(quality) {
      this.currentQuality = quality
      this.isQualityMenuOpen = false
      
      if (this.isDirectVideo) {
        // Implementation would depend on your video source
        console.log(`Setting quality to ${quality}`)
      } else {
        // YouTube quality (not fully supported via iframe API)
        const iframe = this.$refs.youtubePlayer
        if (iframe) {
          let qualityLevel
          
          switch(quality) {
            case '1080p': qualityLevel = 'hd1080'; break;
            case '720p': qualityLevel = 'hd720'; break;
            case '480p': qualityLevel = 'large'; break;
            case '360p': qualityLevel = 'medium'; break;
            default: qualityLevel = 'default';
          }
          
          iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'setPlaybackQuality',
            args: [qualityLevel]
          }), '*')
        }
      }
    },
    handleKeyboardShortcuts(e) {
      // Only process shortcuts when player is open
      if (!this.isOpen) return
      
      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault()
          this.togglePlayPause()
          break
        case 'f':
          e.preventDefault()
          this.enterFullscreen()
          break
        case 'm':
          e.preventDefault()
          this.toggleMute()
          break
        case 'c':
          e.preventDefault()
          this.toggleCaptions()
          break
        case 'arrowright':
          if (this.isDirectVideo) {
            e.preventDefault()
            const video = this.$refs.videoRef
            if (video) video.currentTime += 10
          }
          break
        case 'arrowleft':
          if (this.isDirectVideo) {
            e.preventDefault()
            const video = this.$refs.videoRef
            if (video) video.currentTime -= 10
          }
          break
        case 'arrowup':
          e.preventDefault()
          this.volumeLevel = Math.min(100, this.volumeLevel + 5)
          this.updateVolume()
          break
        case 'arrowdown':
          e.preventDefault()
          this.volumeLevel = Math.max(0, this.volumeLevel - 5)
          this.updateVolume()
          break
        case 'escape':
          if (document.fullscreenElement) {
            e.preventDefault()
            document.exitFullscreen()
          } else if (this.isQualityMenuOpen) {
            e.preventDefault()
            this.isQualityMenuOpen = false
          }
          break
      }
    },
    ensureVideoIsPlaying() {
      if (this.isDirectVideo) {
        const video = this.$refs.videoRef
        if (video) {
          // Force play with user interaction workaround
          video.muted = true // Browsers allow muted autoplay
          const playPromise = video.play()
          if (playPromise !== undefined) {
            playPromise.then(() => {
              // Autoplay started successfully
              this.isPlaying = true
              // After 1 second, unmute if volume is not zero
              setTimeout(() => {
                if (this.volumeLevel > 0 && !this.isMuted) {
                  video.muted = false
                }
              }, 1000)
            }).catch(error => {
              console.error('Autoplay failed:', error)
            })
          }
        }
      } else {
        // For YouTube, send play command
        const iframe = this.$refs.youtubePlayer
        if (iframe) {
          iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'playVideo'
          }), '*')
          this.isPlaying = true
        }
      }
    },
    async toggleFullscreen() {
      const container = this.$refs.playerContainer;
      if (!container) return;
      
      try {
        if (!document.fullscreenElement) {
          await container.requestFullscreen();
        } else {
          // Add a small delay before navigation after exiting fullscreen
          await document.exitFullscreen();
          // Wait for the fullscreen exit to complete
          return new Promise(resolve => {
            const onFullscreenChange = () => {
              document.removeEventListener('fullscreenchange', onFullscreenChange);
              setTimeout(resolve, 100); // Small delay to ensure completion
            };
            document.addEventListener('fullscreenchange', onFullscreenChange);
          });
        }
      } catch (error) {
        console.error('Fullscreen error:', error);
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyboardShortcuts)
    
    clearTimeout(this.controlsTimeout)
    clearTimeout(this.bigPlayButtonTimeout)
    
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.warn('Error exiting fullscreen:', err)
      })
    }
    
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(err => {
        console.warn('Error exiting PiP:', err)
      })
    }
    
    try {
      this.orientationLock.unlockOrientation()
    } catch (err) {
      console.warn('Failed to unlock orientation:', err)
    }
  }
}
</script>

<style scoped>
.player-root {
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.player-container {
  overflow: hidden;
  background-color: #000;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
}

.aspect-video {
  aspect-ratio: 16/9;
}

/* Hide iframe border and all controls */
iframe, video {
  border: none;
  outline: none;
}

/* Override any YouTube controls that might still appear */
iframe {
  pointer-events: none !important; /* Prevent YouTube controls from being interacted with */
  z-index: 1;
}

/* YouTube control hiding - Extended to hide more elements */
:deep(.ytp-chrome-top),
:deep(.ytp-chrome-bottom),
:deep(.ytp-gradient-top),
:deep(.ytp-gradient-bottom),
:deep(.ytp-pause-overlay),
:deep(.ytp-watermark),
:deep(.ytp-large-play-button),
:deep(.ytp-title-channel),
:deep(.ytp-title),
:deep(.ytp-show-cards-title),
:deep(.ytp-related-on-show-info),
:deep(.ytp-youtube-button),
:deep(.ytp-embed),
:deep(.ytp-logo),
:deep(.ytp-paid-content-overlay),
:deep(.ytp-thumbnail-overlay),
:deep(.ytp-pause-overlay-container),
:deep(.ytp-cued-thumbnail-overlay),
:deep(.html5-endscreen),
:deep(.html5-video-container:after),
:deep(.html5-video-container::after),
:deep(.ytp-spinner),
:deep(.ytp-player-content),
:deep(.ytp-ce-element) {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

/* Add a background color to the iframe when paused */
iframe {
  background-color: black;
}

/* Re-enable pointer events on our container */
.player-container {
  pointer-events: auto;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1.5s linear infinite;
}

/* Volume slider styling */
.volume-slider {
  height: 4px;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #c30059;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #c30059;
  cursor: pointer;
  border: none;
}

/* Transition for controls visibility */
.transition-opacity {
  transition: opacity 0.3s ease;
}

/* Backdrop blur for UI elements */
.backdrop-blur-md {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
</style> 