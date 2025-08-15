<template>
  <div class="banner-ad" v-if="currentAd">
    <div class="banner-container" @click="onAdClick">
      <img 
        :src="currentAd.banner_image" 
        :alt="currentAd.title"
        class="banner-image"
      />
      <div class="banner-overlay">
        <div class="banner-content">
          <h3 class="banner-title">{{ currentAd.title }}</h3>
          <p class="banner-description">{{ currentAd.description }}</p>
          <button class="banner-cta">
            {{ currentAd.call_to_action || 'Learn More' }}
          </button>
        </div>
        <div class="banner-badge">
          <i class="fas fa-ad"></i>
          Ad
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'BannerAd',
  props: {
    position: {
      type: String,
      default: 'top'
    },
    userId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      currentAd: null,
      ads: [],
      currentIndex: 0,
      rotationInterval: null
    }
  },
  async mounted() {
    await this.loadBannerAds()
    this.startRotation()
  },
  beforeUnmount() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval)
    }
  },
  methods: {
    async loadBannerAds() {
      try {
        const response = await api.get('/api/ads/banner/')
        this.ads = response.data.filter(ad => ad.is_active_now)
        
        if (this.ads.length > 0) {
          this.currentAd = this.ads[0]
          this.trackImpression()
        }
      } catch (error) {
        console.error('Error loading banner ads:', error)
      }
    },

    startRotation() {
      if (this.ads.length > 1) {
        this.rotationInterval = setInterval(() => {
          this.rotateAd()
        }, 10000) // Rotate every 10 seconds
      }
    },

    rotateAd() {
      this.currentIndex = (this.currentIndex + 1) % this.ads.length
      this.currentAd = this.ads[this.currentIndex]
      this.trackImpression()
    },

    async onAdClick() {
      if (this.currentAd && this.currentAd.external_url) {
        await this.trackClick()
        window.open(this.currentAd.external_url, '_blank')
      }
    },

    async trackImpression() {
      if (this.currentAd) {
        try {
          await api.post(`/api/advertisements/${this.currentAd.id}/track_impression/`, {
            user_id: this.userId,
            impression_type: 'banner'
          })
        } catch (error) {
          console.error('Error tracking banner impression:', error)
        }
      }
    },

    async trackClick() {
      if (this.currentAd) {
        try {
          await api.post(`/api/advertisements/${this.currentAd.id}/track_click/`, {
            user_id: this.userId
          })
        } catch (error) {
          console.error('Error tracking banner click:', error)
        }
      }
    }
  }
}
</script>

<style scoped>
.banner-ad {
  width: 100%;
  margin: 20px 0;
}

.banner-container {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.banner-container:hover {
  transform: translateY(-2px);
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  display: flex;
  align-items: center;
  padding: 20px;
}

.banner-content {
  flex: 1;
  color: white;
}

.banner-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.banner-description {
  font-size: 14px;
  margin-bottom: 12px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.banner-cta {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.banner-cta:hover {
  transform: scale(1.05);
}

.banner-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 107, 53, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 768px) {
  .banner-container {
    height: 100px;
  }
  
  .banner-overlay {
    padding: 15px;
  }
  
  .banner-title {
    font-size: 16px;
  }
  
  .banner-description {
    font-size: 12px;
  }
  
  .banner-cta {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style> 