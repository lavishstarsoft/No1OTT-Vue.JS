<template>
  <div class="search-page">
    <button class="back-btn" @click="goBack" aria-label="Go back">
      <i class="fas fa-arrow-left"></i>
    </button>
    
    <div class="search-container">
      <div class="search-input-wrapper" :class="{ 'focused': isInputFocused }">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search Title, Movie or Cast"
          @input="debouncedSearch"
          @focus="isInputFocused = true"
          @blur="isInputFocused = false"
          class="search-input"
          autofocus
        >
        <button v-if="searchQuery" @click="clearSearch" class="clear-btn" aria-label="Clear search">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Quick Filters -->
      <div class="quick-filters" v-if="!searchQuery">
        <button 
          v-for="filter in quickFilters" 
          :key="filter"
          class="filter-chip"
          @click="applyFilter(filter)"
        >
          {{ filter }}
        </button>
      </div>

      <!-- Recent Searches -->
      <div class="recent-searches" v-if="!searchQuery && recentSearches.length">
        <div class="section-header">
          <h2 class="section-title">Recent Searches</h2>
          <button @click="clearRecentSearches" class="clear-all-btn">Clear All</button>
        </div>
        <div class="recent-list">
          <div v-for="search in limitedRecentSearches" :key="search" class="recent-item" @click="applyRecentSearch(search)">
            <i class="fas fa-history"></i>
            <span>{{ search }}</span>
            <button @click.stop="removeRecentSearch(search)" class="remove-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Trending Searches -->
      <div class="trending-section" v-if="!searchQuery">
        <h2 class="section-title">Trending Now</h2>
        <div class="trending-grid">
          <div v-for="item in trendingItems" :key="item.id" class="trending-card" @click="handleTrendingClick(item)">
            <div class="trending-image">
              <img :src="item.image || item.thumbnail_url || item.portrait_thumbnail_url" :alt="item.title">
              <div class="badges" v-if="item.isPremium">
                <span class="badge quality">PREMIUM</span>
              </div>
            </div>
            <div class="trending-info">
              <h3>{{ item.title }}</h3>
              {{ item.type }}
            </div>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div class="search-results" v-else>
        <!-- Loading Indicator -->
        <div class="loading-indicator" v-if="isLoading">
          <div class="spinner"></div>
          <p>Searching...</p>
        </div>

        <!-- Error Message -->
        <div class="error-message" v-if="searchError && !isLoading">
          <i class="fas fa-exclamation-circle error-icon"></i>
          <p>{{ searchError }}</p>
          <button @click="handleSearch" class="retry-btn">
            <i class="fas fa-redo"></i> Retry
          </button>
        </div>
        <!-- Search Suggestions -->
        <div class="search-suggestions" v-if="suggestions.length && !searchResults.length">
          <div v-for="suggestion in suggestions" 
               :key="suggestion" 
               class="suggestion-item"
               @click="applySuggestion(suggestion)">
            <i class="fas fa-search"></i>
            <span>{{ suggestion }}</span>
          </div>
        </div>

        <!-- Results Grid -->
        <div class="results-grid mt-10" v-if="searchResults.length">
          <div v-for="result in searchResults" 
               :key="result.id" 
               class="result-card"
               @click="handleResultClick(result)">
            <div class="result-image">
              <img :src="result.thumbnail_url || result.portrait_thumbnail_url" :alt="result.title">
              <div class="badges" v-if="result.video_type === 'rental' || result.video_type === 'paid'">
                <span v-if="result.video_type === 'rental'" class="badge quality">RENTAL</span>
                <span v-if="result.video_type === 'paid'" class="badge premium">PAID</span>
              </div>
            </div>
            <div class="result-info">
              <h3>{{ result.title }}</h3>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div class="no-results" v-else-if="!suggestions.length">
          <i class="fas fa-search no-results-icon"></i>
          <p>No results found for "{{ searchQuery }}"</p>
          <p class="no-results-suggestion">Try different keywords or browse trending content</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchPage',
  beforeUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
  data() {
    return {
      searchQuery: '',
      isInputFocused: false,
      searchResults: [],
      suggestions: [],
      recentSearches: [],
      isLoading: false,
      searchTimeout: null,
      searchError: null,
     
  trendingItems: []
    }
  },
  mounted() {
    // Load recent searches from localStorage when component mounts
    this.loadRecentSearches()

    // Fetch trending items from backend (latest 30 days, random 10)
    this.fetchTrendingItems()

    // Restore last search state if coming back from content page
    const lastSearchState = localStorage.getItem('lastSearchState')
    if (lastSearchState) {
      const { query, results, scrollPosition } = JSON.parse(lastSearchState)
      this.searchQuery = query
      this.searchResults = results
      setTimeout(() => {
        window.scrollTo(0, scrollPosition)
      }, 100)
      localStorage.removeItem('lastSearchState')
    }
  },
  computed: {
    limitedRecentSearches() {
      // Use window.innerWidth to determine device type
      if (window.innerWidth <= 768) {
        // Mobile: show last 3
        return this.recentSearches.slice(0, 3)
      } else {
        // Desktop: show last 7
        return this.recentSearches.slice(0, 7)
      }
    }
  },
  methods: {
    async fetchTrendingItems() {
      try {
        // Replace with your backend API endpoint for trending/latest videos
        const response = await fetch('https://ott.no1news.in/api/videos?days=30', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
        if (!response.ok) throw new Error('Failed to fetch trending items')
        let data = await response.json()
        // Always shuffle and pick 10 random items on every fetch (refresh)
        if (Array.isArray(data)) {
          // Shuffle array
          data = data.sort(() => Math.random() - 0.5)
          // Pick 10 random items
          this.trendingItems = data.slice(0, 10)
        } else {
          this.trendingItems = []
        }
      } catch (e) {
        this.trendingItems = []
      }
    },
    loadRecentSearches() {
      const savedSearches = localStorage.getItem('recentSearches')
      this.recentSearches = savedSearches ? JSON.parse(savedSearches) : []
    },
    saveRecentSearches() {
      localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches))
    },
    addToRecentSearches(query) {
      if (!query.trim()) return
      
      // Remove if already exists (to move it to top)
      this.recentSearches = this.recentSearches.filter(s => s !== query)
      
      // Add to beginning of array
      this.recentSearches.unshift(query)
      
      // Keep only last 10 searches
      if (this.recentSearches.length > 10) {
        this.recentSearches = this.recentSearches.slice(0, 10)
      }
      
      // Save to localStorage
      this.saveRecentSearches()
    },
    debouncedSearch() {
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      // Set new timeout
      this.searchTimeout = setTimeout(() => {
        this.handleSearch();
      }, 300); // Wait for 300ms after last keystroke
    },
    
    async handleSearch() {
      const query = this.searchQuery.trim();
      if (query) {
        this.isLoading = true;
        this.searchError = null;
        try {
          // Add to recent searches
          this.addToRecentSearches(query)
          
          // Call backend API for search
          const response = await fetch(`https://ott.no1news.in/api/videos?title=${encodeURIComponent(query)}&description=${encodeURIComponent(query)}&category_name=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          })
          
          if (!response.ok) {
            throw new Error('Search failed')
          }
          
          const data = await response.json()
          if (Array.isArray(data)) {
            this.searchResults = data.filter(video => 
              video.title.toLowerCase().includes(query.toLowerCase()) ||
              video.description.toLowerCase().includes(query.toLowerCase()) ||
              video.category_name.toLowerCase().includes(query.toLowerCase())
            )
            this.suggestions = []
            this.searchError = null
          } else {
            throw new Error('Search failed')
          }
        } catch (error) {
          console.error('Search error:', error);
          this.searchResults = [];
          this.suggestions = [];
          this.searchError = 'Error searching videos. Please try again.';
        }
      } else {
        this.searchResults = [];
        this.suggestions = [];
        this.searchError = null;
      }
      this.isLoading = false;
    },
    updateSuggestions() {
      // Update search suggestions based on query
    },
    clearSearch() {
      this.searchQuery = ''
      this.searchResults = []
      this.suggestions = []
    },
    goBack() {
      this.$router.go(-1)
    },
    applyFilter(filter) {
      this.searchQuery = filter
      this.handleSearch()
    },
    applyRecentSearch(search) {
      this.searchQuery = search
      this.handleSearch()
    },
    removeRecentSearch(search) {
      this.recentSearches = this.recentSearches.filter(s => s !== search)
      this.saveRecentSearches()
    },
    clearRecentSearches() {
      this.recentSearches = []
      localStorage.removeItem('recentSearches')
    },
    applySuggestion(suggestion) {
      this.searchQuery = suggestion
      this.handleSearch()
    },
    handleTrendingClick(item) {
  // Always navigate to MovieDetails page
  this.$router.push({ name: 'MovieDetails', params: { id: item.id } })
    },
    handleResultClick(result) {
      // Store search state
      const searchState = {
        query: this.searchQuery,
        results: this.searchResults,
        scrollPosition: window.pageYOffset
      };
      localStorage.setItem('lastSearchState', JSON.stringify(searchState));

      // Always navigate to MovieDetails page
      this.$router.push({ name: 'MovieDetails', params: { id: result.id } })
    }
  }
}
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
  padding: 24px;
  position: relative;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
}

.back-btn {
  position: fixed;
  top: 24px;
  left: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  z-index: 10;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.back-btn:active {
  transform: scale(0.95);
}

.search-container {
  width: 100%;
  max-width: 1600px;
  margin: 60px auto 0;
  padding: 0 40px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

.search-input-wrapper.focused {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.search-icon {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.3rem;
  margin-right: 16px;
  transition: color 0.3s ease;
}

.search-input-wrapper.focused .search-icon {
  color: #ff4d4d;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.2rem;
  padding: 20px 0;
  outline: none;
  font-weight: 500;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
  font-weight: 400;
}

.clear-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 8px;
  transition: all 0.3s ease;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.quick-filters {
  display: flex;
  gap: 12px;
  margin: 32px 0;
  overflow-x: auto;
  padding: 4px 0 12px;
  scrollbar-width: none;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.filter-chip {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 10px 20px;
  border-radius: 24px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  backdrop-filter: blur(8px);
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.filter-chip:active {
  transform: translateY(0);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  color: white;
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 32px;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: '🔥';
  font-size: 1.4rem;
  margin-top: 2px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, 
    #ff4d4d 0%, 
    rgba(255, 77, 77, 0.5) 50%,
    rgba(255, 77, 77, 0) 100%
  );
  border-radius: 2px;
}

.section-header h2 {
  color: white;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  position: relative;
}

.section-header h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 30px;
  height: 2px;
  background: #ff4d4d;
  border-radius: 2px;
}

.clear-all-btn {
  background: none;
  border: none;
  color: #ff4d4d;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.clear-all-btn:hover {
  background: rgba(255, 77, 77, 0.1);
}

.recent-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.recent-item {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(8px);
}

.recent-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
}

.recent-item i.fa-history {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.recent-item:hover i.fa-history {
  color: #ff4d4d;
}

.recent-item span {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recent-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ff4d4d;
}

.trending-grid, .results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  animation: fadeIn 0.5s ease-out;
}

.trending-card, .result-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  background: transparent;
  position: relative;
}

.trending-card:hover, .result-card:hover {
  transform: translateY(-8px);
}

.trending-image, .result-image {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.trending-image img, .result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.trending-card:hover img, .result-card:hover img {
  transform: scale(1.08);
}

.badges {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  z-index: 2;
}

.badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.badge.premium {
  background: linear-gradient(135deg, #c30059 0%, #ff1a75 100%);
  color: white;
}

.badge.quality {
  background: linear-gradient(135deg, #2196f3 0%, #00bcd4 100%);
  color: white;
}

.meta-info {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.meta-info span {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.meta-info i {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.description {
  margin: 8px 0;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.trending-info, .result-info {
  padding: 8px 2px 2px;
}

.trending-info h3, .result-info h3 {
  color: white;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.3;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.trending-info p, .result-info p {
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.no-results {
  text-align: center;
  padding: 60px 0;
  color: rgba(255, 255, 255, 0.7);
  animation: fadeIn 0.5s ease-out;
}

.no-results-icon {
  font-size: 3.5rem;
  margin-bottom: 24px;
  opacity: 0.5;
  color: #ff4d4d;
}

.no-results p {
  font-size: 1.2rem;
  margin: 0;
  font-weight: 500;
}

.no-results-suggestion {
  font-size: 1rem;
  margin-top: 12px;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 1600px) {
  .search-container {
    padding: 0 32px;
  }
}

@media (max-width: 768px) {
  .search-page {
    padding: 16px;
  }

  .search-container {
    margin-top: 50px;
    padding: 0 16px;
  }

  .search-input {
    font-size: 1.1rem;
    padding: 16px 0;
  }
  
  .section-title {
    font-size: 1.3rem;
    margin-bottom: 24px;
  }

  .section-title::before {
    font-size: 1.2rem;
  }

  .trending-section::before {
    left: -16px;
    right: -16px;
  }

  .trending-grid, .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .trending-info h3, .result-info h3 {
    font-size: 1rem;
  }

  .badge {
    font-size: 0.7rem;
    padding: 3px 6px;
  }

  .recent-list {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 8px;
  }

  .section-header h2 {
    font-size: 1.2rem;
  }

  .recent-item {
    padding: 10px;
  }

  .remove-btn {
    opacity: 1;
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 1440px) {
  .trending-grid, .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 1024px) {
  .trending-grid, .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.loading-indicator, .error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.error-message {
  color: #ff4d4d;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 16px;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.3);
  color: #ff4d4d;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.retry-btn:hover {
  background: rgba(255, 77, 77, 0.2);
  border-color: rgba(255, 77, 77, 0.4);
}

.retry-btn i {
  font-size: 0.9rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #ff4d4d;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(to right, 
    rgba(255,255,255,0.05) 0%,
    rgba(255,255,255,0.1) 50%,
    rgba(255,255,255,0.05) 100%);
  background-size: 1000px 100%;
}

.trending-section {
  position: relative;
  margin-top: 40px;
}

.trending-section::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -40px;
  right: -40px;
  height: 1px;
  background: linear-gradient(to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
}
</style>