<template>
  <div class="min-h-screen bg-[#121212] text-white p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-6">Video Tracking Test</h1>
      
      <div class="bg-white/10 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">Test Video Tracking Functions</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-white/5 p-4 rounded">
            <h3 class="font-bold mb-2">Format View Count</h3>
            <div class="space-y-2">
              <div>1500 views: {{ formatViews(1500) }}</div>
              <div>1500000 views: {{ formatViews(1500000) }}</div>
              <div>500 views: {{ formatViews(500) }}</div>
            </div>
          </div>
          
          <div class="bg-white/5 p-4 rounded">
            <h3 class="font-bold mb-2">Tracking Status</h3>
            <div class="space-y-2">
              <div>Tracking Result: {{ trackingResult || 'Not tested yet' }}</div>
              <div>Completion Result: {{ completionResult || 'Not tested yet' }}</div>
            </div>
          </div>
        </div>
        
        <div class="flex flex-wrap gap-4">
          <button 
            @click="testTracking"
            class="bg-[#e50914] hover:bg-[#f40612] text-white px-4 py-2 rounded transition-colors"
          >
            Test View Tracking
          </button>
          
          <button 
            @click="testCompletion"
            class="bg-[#0071eb] hover:bg-[#0066d4] text-white px-4 py-2 rounded transition-colors"
          >
            Test Completion Tracking
          </button>
          
          <button 
            @click="testAll"
            class="bg-[#00b849] hover:bg-[#00a041] text-white px-4 py-2 rounded transition-colors"
          >
            Test All Functions
          </button>
        </div>
      </div>
      
      <div class="bg-white/10 rounded-lg p-6">
        <h2 class="text-xl font-bold mb-4">Test Video Player</h2>
        <p class="mb-4">Use the video player below to test automatic view tracking:</p>
        
        <AdvancedVideoPlayer
          v-if="showPlayer"
          :src="testVideoUrl"
          :title="testVideoTitle"
          :video-id="testVideoId"
          :autoplay="false"
        />
        
        <button 
          @click="togglePlayer"
          class="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
        >
          {{ showPlayer ? 'Hide Player' : 'Show Player' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { trackVideoView, trackVideoCompletion, formatViewCount } from '@/utils/videoTracking';
import AdvancedVideoPlayer from '@/components/AdvancedVideoPlayer.vue';

export default {
  name: 'TestVideoTracking',
  components: {
    AdvancedVideoPlayer
  },
  setup() {
    const trackingResult = ref(null);
    const completionResult = ref(null);
    const showPlayer = ref(false);
    
    // Test video data
    const testVideoId = 1;
    const testVideoUrl = 'https://noonenews.s3.ap-south-1.amazonaws.com/videos/hls/7/hls/master.m3u8';
    const testVideoTitle = 'Test Video for Tracking';
    
    const formatViews = (views) => {
      return formatViewCount(views);
    };
    
    const testTracking = async () => {
      try {
        const result = await trackVideoView(testVideoId, { 
          watchDuration: 30, 
          isCompleted: false 
        });
        trackingResult.value = result ? 'Success' : 'No response';
        console.log('Tracking result:', result);
      } catch (error) {
        trackingResult.value = `Error: ${error.message}`;
        console.error('Tracking error:', error);
      }
    };
    
    const testCompletion = async () => {
      try {
        const result = await trackVideoCompletion(testVideoId);
        completionResult.value = result ? 'Success' : 'No response';
        console.log('Completion result:', result);
      } catch (error) {
        completionResult.value = `Error: ${error.message}`;
        console.error('Completion error:', error);
      }
    };
    
    const testAll = async () => {
      await testTracking();
      await testCompletion();
    };
    
    const togglePlayer = () => {
      showPlayer.value = !showPlayer.value;
    };
    
    return {
      trackingResult,
      completionResult,
      showPlayer,
      testVideoId,
      testVideoUrl,
      testVideoTitle,
      formatViews,
      testTracking,
      testCompletion,
      testAll,
      togglePlayer
    };
  }
};
</script>