/**
 * Test utility for video tracking functionality
 */

import { trackVideoView, trackVideoCompletion, formatViewCount } from './videoTracking';

// Test the video tracking functions
export const testVideoTracking = async () => {
  console.log('Testing video tracking functions...');
  
  // Test formatViewCount function
  console.log('Testing formatViewCount:');
  console.log('1500 views:', formatViewCount(1500)); // Should return "1.5K"
  console.log('1500000 views:', formatViewCount(1500000)); // Should return "1.5M"
  console.log('500 views:', formatViewCount(500)); // Should return "500"
  
  // Test trackVideoView function
  console.log('Testing trackVideoView:');
  try {
    const result = await trackVideoView(123, { watchDuration: 30, isCompleted: false });
    console.log('trackVideoView result:', result);
  } catch (error) {
    console.error('Error in trackVideoView:', error);
  }
  
  // Test trackVideoCompletion function
  console.log('Testing trackVideoCompletion:');
  try {
    const result = await trackVideoCompletion(123);
    console.log('trackVideoCompletion result:', result);
  } catch (error) {
    console.error('Error in trackVideoCompletion:', error);
  }
  
  console.log('Video tracking test completed!');
};

export default {
  testVideoTracking
};