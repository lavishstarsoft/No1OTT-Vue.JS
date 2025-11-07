<template>
  <div class="min-h-screen bg-[#121212] text-white">
    <!-- Header -->
    <header class="px-4 py-5 flex items-center justify-between border-b border-white/10">
      <div class="flex items-center gap-3">
        <router-link to="/" class="text-[#c30059] font-bold text-2xl">OTTApp</router-link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold mb-2">Advanced Video Player</h1>
        <p class="text-white/70">Featuring HLS, DASH, and DRM support</p>
      </div>
      
      <!-- Banner Advertisement -->
      <BannerAd 
        v-if="user" 
        :user-id="user.id" 
        position="top"
        class="mb-6"
      />
      
      <!-- Player Selection Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- HLS Stream Card -->
        <div class="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-colors">
          <div class="relative aspect-video bg-black/40">
            <img src="https://via.placeholder.com/640x360?text=HLS+Stream" alt="HLS Stream" class="w-full h-full object-cover opacity-70">
            <button 
              @click="openPlayer('hls', hlsStreamUrl, 'HLS Live Stream', true)"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div class="w-16 h-16 bg-[#c30059]/80 rounded-full flex items-center justify-center">
                <i class="fas fa-play text-white text-xl ml-1"></i>
              </div>
            </button>
            <div class="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">LIVE</div>
          </div>
          <div class="p-4">
            <h3 class="font-bold text-lg mb-1">HLS Live Stream</h3>
            <p class="text-white/60 text-sm mb-2">Adaptive streaming with HLS</p>
            <div class="text-xs text-white/50 flex items-center">
              <i class="fas fa-signal mr-1"></i> Adaptive Bitrate
            </div>
          </div>
        </div>
        
        <!-- DASH Stream Card -->
        <div class="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-colors">
          <div class="relative aspect-video bg-black/40">
            <img src="https://via.placeholder.com/640x360?text=DASH+Stream" alt="DASH Stream" class="w-full h-full object-cover opacity-70">
            <button 
              @click="openPlayer('dash', dashStreamUrl, 'DASH VOD Stream')"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div class="w-16 h-16 bg-[#c30059]/80 rounded-full flex items-center justify-center">
                <i class="fas fa-play text-white text-xl ml-1"></i>
              </div>
            </button>
          </div>
          <div class="p-4">
            <h3 class="font-bold text-lg mb-1">DASH VOD Stream</h3>
            <p class="text-white/60 text-sm mb-2">Dynamic Adaptive Streaming over HTTP</p>
            <div class="text-xs text-white/50 flex items-center">
              <i class="fas fa-film mr-1"></i> On-Demand Content
            </div>
          </div>
        </div>
        
        <!-- DRM Protected Stream Card -->
        <div class="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-colors">
          <div class="relative aspect-video bg-black/40">
            <img src="https://via.placeholder.com/640x360?text=DRM+Protected" alt="DRM Protected" class="w-full h-full object-cover opacity-70">
            <button 
              @click="openPlayer('dash', drmStreamUrl, 'DRM Protected Content', false, drmConfig)"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div class="w-16 h-16 bg-[#c30059]/80 rounded-full flex items-center justify-center">
                <i class="fas fa-play text-white text-xl ml-1"></i>
              </div>
            </button>
            <div class="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded flex items-center">
              <i class="fas fa-lock text-xs mr-1"></i> DRM
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-bold text-lg mb-1">DRM Protected Content</h3>
            <p class="text-white/60 text-sm mb-2">Secure streaming with DRM protection</p>
            <div class="text-xs text-white/50 flex items-center">
              <i class="fas fa-shield-alt mr-1"></i> Content Protection
            </div>
          </div>
        </div>
      </div>
      
      <!-- Information Section -->
      <div class="mt-12 max-w-3xl mx-auto">
        <h2 class="text-xl font-bold mb-4">Features and Capabilities</h2>
        
        <div class="space-y-6">
          <div class="bg-white/5 p-5 rounded-lg">
            <h3 class="font-bold mb-2 flex items-center">
              <i class="fas fa-exchange-alt text-[#c30059] mr-2"></i> 
              Adaptive Bitrate Streaming
            </h3>
            <p class="text-white/70">Automatically adjusts video quality based on available bandwidth and device capabilities. Switch between qualities manually or let the player optimize for your connection.</p>
          </div>
          
          <div class="bg-white/5 p-5 rounded-lg">
            <h3 class="font-bold mb-2 flex items-center">
              <i class="fas fa-signal text-[#c30059] mr-2"></i> 
              DASH Support
            </h3>
            <p class="text-white/70">Dynamic Adaptive Streaming over HTTP (DASH) provides a standards-based solution for high-quality streaming video delivery, with support for advanced features and content protection.</p>
          </div>
          
          <div class="bg-white/5 p-5 rounded-lg">
            <h3 class="font-bold mb-2 flex items-center">
              <i class="fas fa-shield-alt text-[#c30059] mr-2"></i> 
              Digital Rights Management (DRM)
            </h3>
            <p class="text-white/70">Supports industry-standard DRM technologies including Widevine, PlayReady, and FairPlay to ensure secure delivery of premium content.</p>
          </div>
          
          <div class="bg-white/5 p-5 rounded-lg">
            <h3 class="font-bold mb-2 flex items-center">
              <i class="fas fa-broadcast-tower text-[#c30059] mr-2"></i> 
              Live Streaming
            </h3>
            <p class="text-white/70">Low-latency live streaming with dynamic quality adaptation, perfect for live events, sports, and news broadcasts.</p>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Advanced Video Player Modal -->
    <div 
      v-if="playerVisible" 
      class="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      <AdvancedVideoPlayer
        :src="currentStream.url"
        :title="currentStream.title"
        :stream-type="currentStream.type"
        :is-live="currentStream.isLive"
        :drm-config="currentStream.drmConfig"
        :autoplay="true"
        :video-id="currentStream.videoId"
        @close="playerVisible = false"
      />
    </div>

    <!-- Advertisement Player -->
    <AdvertisementPlayer
      v-if="showAds && user"
      :video-id="currentVideoId"
      :user-id="user.id"
      :ad-type="currentAdType"
      @ads-finished="onAdsFinished"
      @no-ads="onNoAds"
    />
  </div>
</template>

<script>
import AdvancedVideoPlayer from '@/components/AdvancedVideoPlayer.vue';
import AdvertisementPlayer from '@/components/AdvertisementPlayer.vue';
import BannerAd from '@/components/BannerAd.vue';

export default {
  name: 'VideoPlayer',
  components: {
    AdvancedVideoPlayer,
    AdvertisementPlayer,
    BannerAd
  },
  data() {
    return {
      playerVisible: false,
      showAds: false,
      currentVideoId: null,
      currentAdType: 'pre_roll',
      user: null,
      currentStream: {
        url: '',
        title: '',
        type: 'hls',
        isLive: false,
        drmConfig: null
      },
      
      // Sample stream URLs (replace with actual URLs in production)
      hlsStreamUrl: 'https://noonenews.s3.ap-south-1.amazonaws.com/videos/hls/7/hls/master.m3u8',
      dashStreamUrl: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
      drmStreamUrl: 'https://media.axprod.net/TestVectors/v7-MultiDRM-SingleKey/Manifest.mpd',
      
      // Sample DRM configuration (would need to be replaced with actual values)
      drmConfig: {
        servers: {
          'com.widevine.alpha': 'https://drm-widevine-licensing.axtest.net/AcquireLicense',
          'com.microsoft.playready': 'https://drm-playready-licensing.axtest.net/AcquireLicense'
        },
        // For testing with clear key (not actual DRM)
        clearKeys: {
          // Key ID : Key (base64)
          'e4a2359a99d24d5797d10c86da322026': 'cb541084c99731aef4fff74500c12ead'
        }
      }
    };
  },
  mounted() {
    this.loadUserData();
  },
  methods: {
    loadUserData() {
      const userData = localStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData);
      }
    },

    openPlayer(type, url, title, isLive = false, drmConfig = null, videoId = null) {
      // Set video ID for ads (you might want to get this from your actual video data)
      this.currentVideoId = videoId || 1; // Replace with actual video ID
      this.currentAdType = 'pre_roll';
      
      // Show ads first
      this.showAds = true;
      
      // Store stream data for after ads
      this.currentStream = {
        url,
        title,
        type,
        isLive,
        drmConfig,
        videoId
      };
    },

    onAdsFinished() {
      this.showAds = false;
      // Now show the actual video player
      this.playerVisible = true;
    },

    onNoAds() {
      this.showAds = false;
      // If no ads, show video player directly
      this.playerVisible = true;
    }
  }
};
</script> 