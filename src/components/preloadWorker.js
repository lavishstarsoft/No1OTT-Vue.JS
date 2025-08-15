// Web Worker for background preloading of video chunks
self.onmessage = async function(e) {
  const { type, chunkIndex, url } = e.data;
  
  if (type === 'preload') {
    try {
      const response = await fetch(url);
      const chunkData = await response.blob();
      
      // Store the chunk data in memory
      self.chunks = self.chunks || new Map();
      self.chunks.set(chunkIndex, chunkData);
      
      // Send success message back to main thread
      self.postMessage({
        type: 'preloadComplete',
        chunkIndex,
        success: true
      });
    } catch (error) {
      // Send error message back to main thread
      self.postMessage({
        type: 'preloadComplete',
        chunkIndex,
        success: false,
        error: error.message
      });
    }
  }
}; 