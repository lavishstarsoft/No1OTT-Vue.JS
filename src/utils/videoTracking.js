import api from './api';

// Store view tracking data in sessionStorage to prevent duplicate tracking
const TRACKED_VIDEOS_KEY = 'tracked_videos';

/**
 * Track video view count by sending a request to the backend
 * @param {number} videoId - The ID of the video to track
 * @param {Object} options - Additional tracking options
 * @param {number} options.watchDuration - Watch duration in seconds
 * @param {boolean} options.isCompleted - Whether the video was watched to completion
 * @returns {Promise} - Promise that resolves when the view is tracked
 */
export const trackVideoView = async (videoId, options = {}) => {
  try {
    // Check if we've already tracked this video in this session
    const trackedVideos = JSON.parse(sessionStorage.getItem(TRACKED_VIDEOS_KEY) || '{}');
    
    // If we've already tracked this video and it was completed, don't track again
    if (trackedVideos[videoId] && trackedVideos[videoId].isCompleted) {
      console.log(`Video ${videoId} already tracked as completed, skipping`);
      return null;
    }
    
    // Mark as tracked in sessionStorage
    trackedVideos[videoId] = {
      timestamp: Date.now(),
      isCompleted: options.isCompleted || false
    };
    sessionStorage.setItem(TRACKED_VIDEOS_KEY, JSON.stringify(trackedVideos));
    
    // Send request to track video view
    const response = await api.post('/api/videos/track-view/', {
      video_id: videoId,
      watch_duration: options.watchDuration || 0,
      is_completed: options.isCompleted || false
    });
    
    console.log(`Video view tracked for video ID: ${videoId}`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error tracking video view for video ID: ${videoId}`, error);
    // We don't want to interrupt the user experience if tracking fails
    // So we just log the error and continue
    return null;
  }
};

/**
 * Format view count for display (e.g., 1.2K, 3.4M)
 * @param {number} views - The number of views
 * @returns {string} - Formatted view count
 */
export const formatViewCount = (views) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
};

/**
 * Track video completion (watched to the end)
 * @param {number} videoId - The ID of the video
 * @returns {Promise} - Promise that resolves when completion is tracked
 */
export const trackVideoCompletion = async (videoId) => {
  return trackVideoView(videoId, { isCompleted: true });
};

export default {
  trackVideoView,
  trackVideoCompletion,
  formatViewCount
};