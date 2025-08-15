// Popup Manager Utility
class PopupManager {
  constructor() {
    this.config = null;
    this.isLoaded = false;
  }

  // Load popup configuration from JSON file
  async loadConfig() {
    try {
      const response = await fetch('/popup-config.json');
      if (response.ok) {
        this.config = await response.json();
        this.isLoaded = true;
        console.log('Popup config loaded successfully:', this.config);
        return this.config;
      } else {
        console.warn('Failed to load popup config:', response.status);
        return this.getDefaultConfig();
      }
    } catch (error) {
      console.error('Error loading popup config:', error);
      return this.getDefaultConfig();
    }
  }

  // Get default configuration
  getDefaultConfig() {
    return {
      showPopup: true,
      popupContent: {
        title: 'Welcome to OTT Platform!',
        message: 'Enjoy unlimited streaming of your favorite movies and TV shows.',
        imageUrl: '/images/placeholder.png',
        buttonText: 'Get Started',
        closeButtonText: 'Close'
      },
      popupSettings: {
        autoShow: true,
        showOnLoad: true,
        delay: 2000,
        dismissible: true
      }
    };
  }

  // Check if popup should be shown
  shouldShowPopup() {
    if (!this.config) return false;
    
    // Check if popup is enabled
    if (!this.config.showPopup) return false;
    
    // Check if popup should show on load
    if (!this.config.popupSettings?.showOnLoad) return false;
    
    // Check device type
    if (!this.shouldShowOnCurrentDevice()) return false;
    
    // Check if popup has already been shown
    const popupShown = localStorage.getItem('popupShown');
    if (popupShown === 'true') return false;
    
    return true;
  }

  // Check if popup should show on current device
  shouldShowOnCurrentDevice() {
    const deviceType = this.config?.popupSettings?.deviceType;
    
    if (!deviceType) return true; // If no device type specified, show on all devices
    
    const isMobile = this.isMobileDevice();
    
    switch (deviceType.toLowerCase()) {
      case 'desktop':
        return !isMobile;
      case 'mobile':
        return isMobile;
      case 'all':
        return true;
      default:
        return true;
    }
  }

  // Detect if current device is mobile
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }

  // Get popup delay
  getPopupDelay() {
    return this.config?.popupSettings?.delay || 0;
  }

  // Mark popup as shown
  markPopupAsShown() {
    localStorage.setItem('popupShown', 'true');
  }

  // Reset popup state (for testing)
  resetPopupState() {
    localStorage.removeItem('popupShown');
  }

  // Update popup configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig() {
    return this.config;
  }

  // Check if popup is dismissible
  isDismissible() {
    return this.config?.popupSettings?.dismissible ?? true;
  }

  // Get popup content
  getPopupContent() {
    return this.config?.popupContent || {};
  }

  // Get popup settings
  getPopupSettings() {
    return this.config?.popupSettings || {};
  }
}

// Create singleton instance
const popupManager = new PopupManager();

export default popupManager; 