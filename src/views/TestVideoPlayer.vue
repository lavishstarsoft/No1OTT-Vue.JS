<template>
  <div class="min-h-screen bg-[#121212] text-white p-6">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">Video Player Test</h1>
      
      <div class="bg-white/10 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">Advanced Video Player Test</h2>
        <p class="mb-4">Test the video player with view tracking functionality:</p>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Video URL:</label>
          <input 
            v-model="videoUrl" 
            type="text" 
            class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            placeholder="Enter video URL"
          >
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Video Title:</label>
          <input 
            v-model="videoTitle" 
            type="text" 
            class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            placeholder="Enter video title"
          >
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Video ID:</label>
          <input 
            v-model="videoId" 
            type="number" 
            class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            placeholder="Enter video ID"
          >
        </div>
        
        <button 
          @click="loadPlayer"
          class="bg-[#e50914] hover:bg-[#f40612] text-white px-4 py-2 rounded transition-colors mr-2"
        >
          Load Player
        </button>
        
        <button 
          @click="unloadPlayer"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
        >
          Unload Player
        </button>
      </div>
      
      <div v-if="showPlayer" class="bg-black rounded-lg overflow-hidden">
        <AdvancedVideoPlayer
          :src="videoUrl"
          :title="videoTitle"
          :video-id="videoId"
          :autoplay="false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import AdvancedVideoPlayer from '@/components/AdvancedVideoPlayer.vue';

export default {
  name: 'TestVideoPlayer',
  components: {
    AdvancedVideoPlayer
  },
  setup() {
    const showPlayer = ref(false);
    const videoUrl = ref('https://noonenews.s3.ap-south-1.amazonaws.com/videos/hls/7/hls/master.m3u8');
    const videoTitle = ref('Test Video');
    const videoId = ref(1);
    
    const loadPlayer = () => {
      showPlayer.value = true;
    };
    
    const unloadPlayer = () => {
      showPlayer.value = false;
    };
    
    return {
      showPlayer,
      videoUrl,
      videoTitle,
      videoId,
      loadPlayer,
      unloadPlayer
    };
  }
};
</script>