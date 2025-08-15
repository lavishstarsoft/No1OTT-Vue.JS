<template>
  <div class="advertisement-player" v-if="showAd">
    <div class="ad-overlay">
      <div class="ad-container">
        <!-- Ad Header -->
        <div class="ad-header">
          <div class="ad-badge">
            <i class="fas fa-ad"></i>
            Advertisement
          </div>
          <div class="ad-controls">
            <span v-if="canSkip" class="skip-timer">
              Skip in {{ skipCountdown }}s
            </span>
            <button 
              v-if="canSkip && skipCountdown <= 0" 
              @click="skipAd"
              class="skip-button"
            >
              Skip Ad
            </button>
            <button @click="closeAd" class="close-button">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Video Player -->
        <div class="video-container">
          <video
            ref="videoPlayer"
            :src="currentAd.video_file"
            @loadedmetadata="onVideoLoad"
            @timeupdate="onTimeUpdate"
            @ended="onAdEnd"
            @click="onAdClick"
            class="ad-video"
            controls
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <!-- Ad Info -->
        <div class="ad-info">
          <h3 class="ad-title">{{ currentAd.title }}</h3>
          <p class="ad-description">{{ currentAd.description }}</p>
          <button 
            v-if="currentAd.external_url"
            @click="onAdClick"
            class="cta-button"
          >
            {{ currentAd.call_to_action || 'Learn More' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'AdvertisementPlayer',
  props: {
    videoId: {
      type: Number,
      required: true
    },
    userId: {
      type: Number,
      required: true
    },
    adType: {
      type: String,
      default: 'pre_roll'
    }
  },
  data() {
    return {
      showAd: false,
      currentAd: null,
      adQueue: [],
      currentAdIndex: 0,
      skipCountdown: 0,
      canSkip: false,
      videoDuration: 0,
      watchedDuration: 0,
      impressionTracked: false
    }
  },
  async mounted() {
    await this.loadAdvertisements()
  },
  methods: {
    async loadAdvertisements() {
      console.log('🔍 Loading advertisements for video:', this.videoId, 'adType:', this.adType)
      try {
        const response = await api.get(`/api/video/${this.videoId}/ads/`)
        console.log('📡 API Response:', response.data)
        const ads = response.data[this.adType] || []
        console.log('📺 Ads for', this.adType, ':', ads)
        
        if (ads.length > 0) {
          this.adQueue = ads
          this.showAd = true
          console.log('✅ Showing ads, queue length:', this.adQueue.length)
          this.playNextAd()
        } else {
          console.log('❌ No ads found for type:', this.adType)
          this.$emit('no-ads')
        }
      } catch (error) {
        console.error('❌ Error loading advertisements:', error)
        this.$emit('no-ads')
      }
    },

    playNextAd() {
      if (this.currentAdIndex < this.adQueue.length) {
        this.currentAd = this.adQueue[this.currentAdIndex]
        this.skipCountdown = this.currentAd.skip_after || 0
        this.canSkip = this.currentAd.skip_after > 0
        
        this.$nextTick(() => {
          if (this.$refs.videoPlayer) {
            this.$refs.videoPlayer.play()
            this.trackImpression()
          }
        })
      } else {
        this.finishAdSequence()
      }
    },

    onVideoLoad() {
      this.videoDuration = this.$refs.videoPlayer.duration
    },

    onTimeUpdate() {
      if (this.$refs.videoPlayer) {
        this.watchedDuration = this.$refs.videoPlayer.currentTime
        
        // Update skip countdown
        if (this.canSkip && this.skipCountdown > 0) {
          this.skipCountdown = Math.max(0, this.currentAd.skip_after - this.watchedDuration)
        }
      }
    },

    onAdEnd() {
      this.currentAdIndex++
      if (this.currentAdIndex < this.adQueue.length) {
        this.playNextAd()
      } else {
        this.finishAdSequence()
      }
    },

    skipAd() {
      this.currentAdIndex++
      if (this.currentAdIndex < this.adQueue.length) {
        this.playNextAd()
      } else {
        this.finishAdSequence()
      }
    },

    closeAd() {
      this.finishAdSequence()
    },

    async onAdClick() {
      if (this.currentAd && this.currentAd.external_url) {
        // Track click
        await this.trackClick()
        
        // Open external URL
        window.open(this.currentAd.external_url, '_blank')
      }
    },

    async trackImpression() {
      if (!this.impressionTracked && this.currentAd) {
        try {
          await api.post(`/api/advertisements/${this.currentAd.id}/track_impression/`, {
            user_id: this.userId,
            video_id: this.videoId,
            impression_type: this.adType
          })
          this.impressionTracked = true
        } catch (error) {
          console.error('Error tracking impression:', error)
        }
      }
    },

    async trackClick() {
      if (this.currentAd) {
        try {
          await api.post(`/api/advertisements/${this.currentAd.id}/track_click/`, {
            user_id: this.userId,
            video_id: this.videoId
          })
        } catch (error) {
          console.error('Error tracking click:', error)
        }
      }
    },

    finishAdSequence() {
      this.showAd = false
      this.$emit('ads-finished')
    }
  }
}
</script>

<style scoped>
.advertisement-player {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.9);
}

.ad-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px;
}

.ad-container {
  background: #1a1a1a;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.ad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #2a2a2a;
  border-bottom: 1px solid #333;
}

.ad-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ff6b35;
  font-size: 14px;
  font-weight: 600;
}

.ad-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skip-timer {
  color: #888;
  font-size: 14px;
}

.skip-button {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.skip-button:hover {
  background: #e55a2b;
}

.close-button {
  background: none;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;
}

.close-button:hover {
  color: white;
}

.video-container {
  position: relative;
  width: 100%;
  background: #000;
}

.ad-video {
  width: 100%;
  height: auto;
  cursor: pointer;
}

.ad-info {
  padding: 20px;
  background: #1a1a1a;
}

.ad-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.ad-description {
  color: #ccc;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.cta-button {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .ad-overlay {
    padding: 10px;
  }
  
  .ad-container {
    max-width: 100%;
  }
  
  .ad-header {
    padding: 10px 15px;
  }
  
  .ad-info {
    padding: 15px;
  }
}
</style> 