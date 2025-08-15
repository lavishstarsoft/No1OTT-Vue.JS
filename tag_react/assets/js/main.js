const menuBtn = document.getElementById('menu-btn');
const sideMenu = document.getElementById('side-menu');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('close-btn');

// Search functionality
const searchBtn = document.getElementById('search-btn');
const desktopSearchBtn = document.getElementById('desktop-search-btn');
const searchOverlay = document.getElementById('search-overlay');
const closeSearchBtn = document.getElementById('close-search');
const searchContainer = document.getElementById('search-container');

// Advanced Carousel functionality
class AdvancedCarousel {
  constructor() {
    this.carousel = document.querySelector('.advanced-carousel');
    if (!this.carousel) return;

    // Elements
    this.slidesContainer = this.carousel.querySelector('.slides-container');
    this.slides = Array.from(this.carousel.querySelectorAll('.carousel-slide'));
    this.progressBar = this.carousel.querySelector('.progress-bar');
    this.prevBtn = this.carousel.querySelector('.nav-btn.prev');
    this.nextBtn = this.carousel.querySelector('.nav-btn.next');
    this.indicators = Array.from(this.carousel.querySelectorAll('.indicator'));
    
    // State
    this.currentSlide = 0;
    this.slideCount = this.slides.length;
    this.isPlaying = true;
    this.progressValue = 0;
    this.autoplayDuration = 7000; // 7 seconds
    this.transitionDuration = 1000; // 1 second transition
    this.isVideoPlaying = false;
    
    // Initialize
    this.init();
  }

  init() {
    // Setup YouTube Player
    this.setupYouTubePlayer();
    
    // Event Listeners
    this.bindEvents();
    
    // Start autoplay
    this.startAutoplay();
    
    // Set initial state
    this.updateSlides();
    this.updateIndicators();
  }

  setupYouTubePlayer() {
    // Create YouTube Player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      this.player = new YT.Player('youtube-player', {
        videoId: 'azzaV1Kl3eI',
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          showinfo: 0,
          mute: 0,
          modestbranding: 1
        },
        events: {
          onStateChange: (event) => this.handleVideoStateChange(event)
        }
      });
    };

    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  handleVideoStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      this.isVideoPlaying = true;
      this.pauseAutoplay();
      this.hideNavigation();
    } else if (event.data === YT.PlayerState.ENDED || event.data === YT.PlayerState.PAUSED) {
      this.isVideoPlaying = false;
      this.showNavigation();
      if (!this.carousel.matches(':hover')) {
        this.startAutoplay();
      }
    }
  }

  bindEvents() {
    // Navigation buttons
    this.prevBtn?.addEventListener('click', () => this.prevSlide());
    this.nextBtn?.addEventListener('click', () => this.nextSlide());
    
    // Indicators
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Hover events
    this.carousel.addEventListener('mouseenter', () => this.pauseAutoplay());
    this.carousel.addEventListener('mouseleave', () => {
      if (!this.isVideoPlaying) {
        this.startAutoplay();
      }
    });

    // Touch events for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    this.carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    }, { passive: true });
  }

  handleSwipe(startX, endX) {
    const diff = startX - endX;
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }

  startAutoplay() {
    if (this.isVideoPlaying) return;
    
    this.isPlaying = true;
    this.progressValue = 0;
    
    // Reset and start progress bar animation
    if (this.progressBar) {
      this.progressBar.style.transition = 'none';
      this.progressBar.style.width = '0%';
      // Force reflow
      this.progressBar.offsetHeight;
      this.progressBar.style.transition = 'width 7000ms linear';
      this.progressBar.style.width = '100%';
    }
    
    this.autoplayInterval = setTimeout(() => {
      this.nextSlide();
    }, this.autoplayDuration);
  }

  pauseAutoplay() {
    this.isPlaying = false;
    clearTimeout(this.autoplayInterval);
    
    // Pause progress bar animation
    if (this.progressBar) {
      const computedWidth = window.getComputedStyle(this.progressBar).width;
      this.progressBar.style.transition = 'none';
      this.progressBar.style.width = computedWidth;
    }
  }

  hideNavigation() {
    this.prevBtn.style.display = 'none';
    this.nextBtn.style.display = 'none';
    this.indicators.forEach(indicator => {
      indicator.style.display = 'none';
    });
  }

  showNavigation() {
    this.prevBtn.style.display = '';
    this.nextBtn.style.display = '';
    this.indicators.forEach(indicator => {
      indicator.style.display = '';
    });
  }

  prevSlide() {
    if (this.isVideoPlaying) return;
    this.currentSlide = (this.currentSlide - 1 + this.slideCount) % this.slideCount;
    this.updateSlides();
    this.updateIndicators();
    this.resetProgress();
  }

  nextSlide() {
    if (this.isVideoPlaying) return;
    this.currentSlide = (this.currentSlide + 1) % this.slideCount;
    this.updateSlides();
    this.updateIndicators();
    this.resetProgress();
  }

  goToSlide(index) {
    if (this.isVideoPlaying || index === this.currentSlide) return;
    this.currentSlide = index;
    this.updateSlides();
    this.updateIndicators();
    this.resetProgress();
  }

  resetProgress() {
    if (this.progressBar) {
      this.progressBar.style.transition = 'none';
      this.progressBar.style.width = '0%';
    }
    
    if (this.isPlaying) {
      clearTimeout(this.autoplayInterval);
      this.startAutoplay();
    }
  }

  updateSlides() {
    this.slides.forEach((slide, index) => {
      const offset = index - this.currentSlide;
      slide.style.transform = `translateX(${offset * 100}%)`;
      slide.style.opacity = index === this.currentSlide ? '1' : '0';
    });
  }

  updateIndicators() {
    this.indicators.forEach((indicator, index) => {
      if (index === this.currentSlide) {
        indicator.classList.add('bg-white');
        indicator.classList.remove('bg-white/50');
      } else {
        indicator.classList.remove('bg-white');
        indicator.classList.add('bg-white/50');
      }
    });
  }
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
  const carousel = new AdvancedCarousel();
});

function openMenu() {
  sideMenu.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  sideMenu.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function openSearch() {
  searchOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    searchContainer.classList.add('scale-100', 'opacity-100');
    searchContainer.classList.remove('scale-95', 'opacity-0');
  }, 10);
}

function closeSearch() {
  searchContainer.classList.remove('scale-100', 'opacity-100');
  searchContainer.classList.add('scale-95', 'opacity-0');
  document.body.style.overflow = '';
  setTimeout(() => {
    searchOverlay.classList.add('hidden');
  }, 300);
}

menuBtn.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

// Add click handlers for both mobile and desktop search buttons
searchBtn?.addEventListener('click', openSearch);
desktopSearchBtn?.addEventListener('click', openSearch);
closeSearchBtn?.addEventListener('click', closeSearch);

// Close search when clicking outside the search container
searchOverlay?.addEventListener('click', (e) => {
  if (e.target === searchOverlay) {
    closeSearch();
  }
});

// Close search when pressing Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !searchOverlay.classList.contains('hidden')) {
    closeSearch();
  }
});

// Close menu on escape key press
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sideMenu.classList.contains('active')) {
    closeMenu();
  }
});