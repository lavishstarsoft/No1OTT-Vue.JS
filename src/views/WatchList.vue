<template>
  <div class="watchlist-container">
    <h1 class="watchlist-title">My Watchlist</h1>
    
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      Loading your watchlist...
    </div>
    
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </div>
    
    <div v-else-if="watchlistItems.length === 0" class="empty-state">
      <i class="fas fa-bookmark"></i>
      <p>Your watchlist is empty</p>
      <router-link to="/" class="browse-link">Browse Videos</router-link>
    </div>
    
    <div v-else class="watchlist-grid">
      <div v-for="item in watchlistItems" :key="item.id" class="watchlist-item">
        <div class="video-card">
          <div class="thumbnail-container" @click="navigateToVideo(item.content_details.id)">
            <img :src="item.content_details.thumbnail_url" :alt="item.content_details.title">
            <div class="overlay">
              <button class="play-button">
                <i class="fas fa-play"></i>
              </button>
            </div>
          </div>
          
          <div class="video-info">
            <h3 class="video-title">{{ item.content_details.title }}</h3>
            <div class="video-meta">
              <span>{{ getYear(item.content_details.release_date) }}</span>
              <span class="dot">•</span>
              <span>{{ formatDuration(item.content_details.duration) }}</span>
            </div>
            
            <div class="action-buttons">
              <button class="watch-now" @click="navigateToVideo(item.content_details.id)">
                <i class="fas fa-play"></i>
                Watch Now
              </button>
              <button class="remove-button" @click="removeFromWatchlist(item.content)">
                <i class="fas fa-trash"></i>
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { watchlistAPI } from '@/utils/api';

export default {
  name: 'WatchList',
  data() {
    return {
      watchlistItems: [],
      loading: true,
      error: null
    }
  },
  async created() {
    await this.fetchWatchlist();
  },
  methods: {
    async fetchWatchlist() {
      try {
        this.loading = true;
        const response = await watchlistAPI.getList();
        this.watchlistItems = response.data;
        this.loading = false;
      } catch (error) {
        console.error('Error fetching watchlist:', error);
        this.error = 'Failed to load watchlist. Please try again later.';
        this.loading = false;
      }
    },
    async removeFromWatchlist(videoId) {
      try {
        await watchlistAPI.toggle(videoId);
        // Refresh watchlist after removal
        await this.fetchWatchlist();
      } catch (error) {
        console.error('Error removing from watchlist:', error);
        this.$store.dispatch('showToast', {
          message: 'Failed to remove from watchlist. Please try again.',
          type: 'error'
        });
      }
    },
    navigateToVideo(videoId) {
      this.$router.push(`/ott/${videoId}`);
    },
    getYear(dateString) {
      return dateString ? new Date(dateString).getFullYear() : '';
    },
    formatDuration(seconds) {
      if (!seconds) return '';
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }
  }
}
</script>

<style scoped>
.watchlist-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.watchlist-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #fff;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #fff;
  text-align: center;
}

.loading-state i,
.error-state i,
.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ff0077;
}

.browse-link {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #ff0077;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.browse-link:hover {
  transform: scale(1.05);
  background: #d10063;
}

.watchlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.video-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.video-card:hover {
  transform: translateY(-5px);
}

.thumbnail-container {
  position: relative;
  aspect-ratio: 16/9;
  cursor: pointer;
}

.thumbnail-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.thumbnail-container:hover .overlay {
  opacity: 1;
}

.play-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #ff0077;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-button:hover {
  transform: scale(1.1);
  background: #d10063;
}

.video-info {
  padding: 1rem;
}

.video-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
}

.video-meta {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.dot {
  font-size: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.watch-now,
.remove-button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.watch-now {
  background: #ff0077;
  color: white;
  flex: 2;
}

.watch-now:hover {
  background: #d10063;
}

.remove-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  flex: 1;
}

.remove-button:hover {
  background: rgba(255, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .watchlist-container {
    padding: 1rem;
  }
  
  .watchlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .watch-now,
  .remove-button {
    width: 100%;
    justify-content: center;
  }
}
</style> 