# Popup System Documentation

## Overview
The popup system allows you to display customizable popups with images and text based on a JSON configuration file. The popup can be controlled via the `popup-config.json` file in the public folder.

## Configuration File
The popup configuration is stored in `/public/popup-config.json`:

```json
{
  "showPopup": true,
  "popupContent": {
    "title": "Welcome to OTT Platform!",
    "message": "Enjoy unlimited streaming of your favorite movies and TV shows.",
    "imageUrl": "/images/placeholder.png",
    "buttonText": "Get Started",
    "closeButtonText": "Close"
  },
  "popupSettings": {
    "autoShow": true,
    "showOnLoad": true,
    "delay": 2000,
    "dismissible": true,
    "deviceType": "desktop"
  }
}
```

## Configuration Options

### Main Settings
- `showPopup` (boolean): Enable/disable the popup system
- `popupContent` (object): Content configuration
- `popupSettings` (object): Behavior settings

### Device Type Options
- `"desktop"`: Show popup only on desktop/laptop devices
- `"mobile"`: Show popup only on mobile/tablet devices  
- `"all"`: Show popup on all devices (default)

### Popup Content
- `title` (string): Popup title
- `message` (string): Popup message text
- `imageUrl` (string): URL to the popup image
- `buttonText` (string): Main action button text
- `closeButtonText` (string): Close button text

### Popup Settings
- `autoShow` (boolean): Auto-show popup on page load
- `showOnLoad` (boolean): Show popup when component mounts
- `delay` (number): Delay in milliseconds before showing popup
- `dismissible` (boolean): Allow users to close the popup
- `deviceType` (string): Device type to show popup on ("desktop", "mobile", "all")

## Usage

### Basic Usage
The popup is automatically integrated into the main App.vue component and will show based on the JSON configuration.

### Manual Control
You can manually control the popup from any component:

```javascript
// Show popup manually
this.$refs.popupModal.showPopupManually();

// Reset popup state (for testing)
this.$refs.popupModal.resetPopup();
```

### Popup Manager Utility
Use the popup manager for advanced control:

```javascript
import popupManager from '@/utils/popupManager.js';

// Load configuration
await popupManager.loadConfig();

// Check if popup should be shown
if (popupManager.shouldShowPopup()) {
  // Show popup
}

// Mark popup as shown
popupManager.markPopupAsShown();

// Reset popup state
popupManager.resetPopupState();
```

## Features

### Automatic Display
- Popup shows automatically on page load (if enabled)
- Respects localStorage to prevent showing multiple times
- Configurable delay before display

### Responsive Design
- Mobile-friendly design
- Responsive image handling
- Touch-friendly buttons

### Error Handling
- Fallback content if JSON fails to load
- Image error handling with placeholder
- Graceful degradation

### Customization
- Fully customizable via JSON
- CSS animations and transitions
- Gradient backgrounds and modern styling

## File Structure
```
ott_frontend/
├── public/
│   ├── popup-config.json          # Popup configuration
│   └── images/
│       └── placeholder.png        # Default popup image
├── src/
│   ├── components/
│   │   └── PopupModal.vue         # Popup component
│   ├── utils/
│   │   └── popupManager.js        # Popup management utility
│   └── App.vue                    # Main app with popup integration
```

## Testing

### Reset Popup State
To test the popup again after it has been shown:

```javascript
// In browser console
localStorage.removeItem('popupShown');

// Or use the reset method
this.$refs.popupModal.resetPopup();
```

### Update Configuration
Modify `/public/popup-config.json` and refresh the page to see changes.

## Troubleshooting

### Popup Not Showing
1. Check `showPopup` is set to `true`
2. Check `showOnLoad` is set to `true`
3. Clear localStorage: `localStorage.removeItem('popupShown')`
4. Check browser console for errors

### Image Not Loading
1. Verify image URL in `imageUrl` field
2. Check image exists in public folder
3. Image will show placeholder if loading fails

### Configuration Not Loading
1. Verify JSON syntax in `popup-config.json`
2. Check file path is correct
3. Component will use default config if loading fails 