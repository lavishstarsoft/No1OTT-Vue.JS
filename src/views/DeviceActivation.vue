<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] text-white">
    <!-- Header -->
    <div class="px-4 py-6">
      <div class="max-w-7xl mx-auto">
        <router-link to="/" class="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
          <div class="w-10 h-10 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <i class="fas fa-arrow-left text-lg"></i>
          </div>
          <span class="font-medium">Back to Home</span>
        </router-link>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            Activate Your <span class="text-[#c30059]">TV Device</span>
          </h1>
          <p class="text-lg text-white/70 max-w-2xl mx-auto">
            Enter the activation code displayed on your TV screen to link your device to your account
          </p>
        </div>

        <div class="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-3xl border border-white/10 p-8 max-w-2xl mx-auto">
          <!-- Activation Form -->
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-white/80 mb-3">Activation Code</label>
              <div class="flex gap-3 items-stretch">
                <input 
                  v-model="activationCode"
                  type="text"
                  class="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl h-14 px-4 text-white text-lg font-mono tracking-wider focus:border-[#c30059] focus:outline-none focus:ring-2 focus:ring-[#c30059]/20 transition-all uppercase placeholder-white/40 text-center min-w-0"
                  placeholder="ENTER CODE"
                  maxlength="8"
                  @input="formatCode"
                />
                <button
                  @click="openQRScanner"
                  type="button"
                  class="h-14 px-4 sm:px-6 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#c30059]/25 transition-all duration-300 flex items-center justify-center gap-2 min-w-[60px] sm:min-w-[120px] flex-shrink-0"
                  title="Scan QR Code"
                >
                  <i class="fas fa-qrcode text-lg sm:text-xl"></i>
                  <span class="hidden sm:inline whitespace-nowrap">Scan QR</span>
                </button>
              </div>
            </div>

            <!-- User Info (if logged in) -->
            <div v-if="isAuthenticated" class="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-[#c30059] to-[#ff6b9d] flex items-center justify-center">
                  <i class="fas fa-user text-white"></i>
                </div>
                <div>
                  <div class="font-medium text-white">{{ user.first_name }} {{ user.last_name }}</div>
                  <div class="text-sm text-white/60">{{ user.phone }}</div>
                </div>
              </div>
            </div>

            <!-- Login Prompt (if not logged in) -->
            <div v-else class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div class="flex items-start gap-3">
                <i class="fas fa-exclamation-triangle text-amber-400 mt-0.5"></i>
                <div>
                  <div class="font-medium text-amber-400 mb-1">Login Required</div>
                  <p class="text-sm text-amber-300">
                    You need to be logged in to activate your device. Please login or create an account.
                  </p>
                  <router-link 
                    to="/login" 
                    class="inline-block mt-3 px-4 py-2 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#c30059]/25 transition-all"
                  >
                    Login to Continue
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Activate Button -->
            <button 
              @click="activateDevice"
              :disabled="!isAuthenticated || !activationCode || activationCode.length !== 8 || isActivating"
              class="w-full py-4 px-6 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#c30059]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <span v-if="isActivating">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                Activating...
              </span>
              <span v-else>
                <i class="fas fa-tv mr-2"></i>
                Activate Device
              </span>
            </button>

            <!-- Error Message -->
            <div v-if="errorMessage" class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div class="flex items-center gap-2 text-red-400">
                <i class="fas fa-exclamation-circle"></i>
                <span>{{ errorMessage }}</span>
              </div>
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div class="flex items-center gap-2 text-green-400">
                <i class="fas fa-check-circle"></i>
                <span>{{ successMessage }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="mt-12 max-w-3xl mx-auto">
          <h2 class="text-2xl font-bold text-center mb-8">How to Activate</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-[#1a1a1a]/50 border border-white/10 rounded-2xl p-6 text-center">
              <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] rounded-2xl flex items-center justify-center">
                <span class="text-2xl font-bold text-white">1</span>
              </div>
              <h3 class="text-lg font-bold mb-2">Open App on TV</h3>
              <p class="text-white/60 text-sm">
                Launch the OTT TV app on your smart TV or streaming device
              </p>
            </div>
            
            <div class="bg-[#1a1a1a]/50 border border-white/10 rounded-2xl p-6 text-center">
              <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] rounded-2xl flex items-center justify-center">
                <span class="text-2xl font-bold text-white">2</span>
              </div>
              <h3 class="text-lg font-bold mb-2">Get Activation Code</h3>
              <p class="text-white/60 text-sm">
                Note the 8-character code displayed on your TV screen
              </p>
            </div>
            
            <div class="bg-[#1a1a1a]/50 border border-white/10 rounded-2xl p-6 text-center">
              <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] rounded-2xl flex items-center justify-center">
                <span class="text-2xl font-bold text-white">3</span>
              </div>
              <h3 class="text-lg font-bold mb-2">Enter Code Here</h3>
              <p class="text-white/60 text-sm">
                Type the code above and click Activate Device
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Scanner Modal -->
    <div v-if="showQRScanner" class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div class="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-3xl border border-white/10 p-6 max-w-md w-full">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-white">Scan QR Code</h3>
          <button
            @click="closeQRScanner"
            class="text-white/60 hover:text-white transition-colors"
          >
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        
        <div class="mb-4 relative">
          <div id="qr-reader" class="w-full rounded-xl overflow-hidden bg-black/50" style="min-height: 300px;"></div>
          <div v-if="!isScanning && !qrScannerError" class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl pointer-events-none">
            <div class="text-center">
              <i class="fas fa-spinner fa-spin text-white text-3xl mb-2"></i>
              <p class="text-white text-sm">Initializing camera...</p>
            </div>
          </div>
        </div>
        
        <div v-if="qrScannerError" class="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div class="flex items-start gap-3">
            <i class="fas fa-exclamation-triangle text-red-400 mt-0.5"></i>
            <div class="flex-1">
              <p class="text-red-400 text-sm font-medium mb-2">{{ qrScannerError }}</p>
              <div class="text-red-300 text-xs space-y-1">
                <p><strong>Tips:</strong></p>
                <ul class="list-disc list-inside space-y-1 ml-2">
                  <li>Make sure you've allowed camera permissions in your browser</li>
                  <li>Close other apps that might be using the camera</li>
                  <li>Try refreshing the page and scanning again</li>
                  <li>On mobile: Check Settings → Privacy → Camera permissions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button
            @click="closeQRScanner"
            class="flex-1 py-3 px-4 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            @click="stopQRScanner"
            v-if="isScanning"
            class="flex-1 py-3 px-4 bg-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/30 transition-all"
          >
            Stop Scanner
          </button>
          <button
            @click="openQRScanner"
            v-if="qrScannerError && !isScanning"
            class="flex-1 py-3 px-4 bg-gradient-to-r from-[#c30059] to-[#ff4d4d] text-white font-medium rounded-xl hover:opacity-90 transition-all"
          >
            <i class="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

export default {
  name: 'DeviceActivation',
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const activationCode = ref('');
    const isActivating = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const showQRScanner = ref(false);
    const isScanning = ref(false);
    const qrScannerError = ref('');
    let html5QrCode = null;
    
    // Computed properties from store
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const user = computed(() => store.getters.currentUser);
    const token = computed(() => store.getters.token);
    
    // Format activation code (uppercase, remove spaces)
    const formatCode = () => {
      activationCode.value = activationCode.value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 8);
    };
    
    // Extract activation code from QR code URL or text
    const extractCodeFromQR = (qrData) => {
      try {
        // Check if it's a URL with code parameter
        const url = new URL(qrData);
        const code = url.searchParams.get('code');
        if (code) {
          return code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        }
      } catch (e) {
        // Not a URL, might be direct code
      }
      
      // Try to extract 8-character code from the string
      const codeMatch = qrData.match(/[A-Z0-9]{8}/);
      if (codeMatch) {
        return codeMatch[0];
      }
      
      // Return the string itself if it's 8 characters
      const cleaned = qrData.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (cleaned.length === 8) {
        return cleaned;
      }
      
      return null;
    };
    
    // Check camera permissions
    const checkCameraPermissions = async () => {
      try {
        // Check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported in this browser');
        }
        
        // Try to access camera to request permission
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop());
        
        return true;
      } catch (error) {
        console.error('Camera permission error:', error);
        throw error;
      }
    };
    
    // Open QR Scanner
    const openQRScanner = async () => {
      // Clean up any existing scanner first
      if (html5QrCode) {
        try {
          await stopQRScanner();
        } catch (e) {
          console.log('Error cleaning up before restart:', e);
        }
      }
      
      try {
        showQRScanner.value = true;
        qrScannerError.value = '';
        isScanning.value = false;
        
        // Check HTTPS
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
          qrScannerError.value = 'Camera requires HTTPS connection. Please use https:// or localhost.';
          return;
        }
        
        // Wait for DOM to update and element to be available
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check if element exists
        const qrReaderElement = document.getElementById("qr-reader");
        if (!qrReaderElement) {
          throw new Error('QR reader element not found');
        }
        
        // Request camera permissions first
        try {
          await checkCameraPermissions();
        } catch (permError) {
          if (permError.name === 'NotAllowedError' || permError.name === 'PermissionDeniedError') {
            qrScannerError.value = 'Camera permission denied. Please allow camera access in your browser settings and try again.';
            return;
          } else if (permError.name === 'NotFoundError' || permError.name === 'DevicesNotFoundError') {
            qrScannerError.value = 'No camera found on your device. Please connect a camera and try again.';
            return;
          } else if (permError.name === 'NotReadableError' || permError.name === 'TrackStartError') {
            qrScannerError.value = 'Camera is being used by another application. Please close other apps using the camera and try again.';
            return;
          }
          throw permError;
        }
        
        const qrCodeSuccessCallback = (decodedText) => {
          console.log('QR Code scanned:', decodedText);
          
          const extractedCode = extractCodeFromQR(decodedText);
          if (extractedCode && extractedCode.length === 8) {
            activationCode.value = extractedCode;
            formatCode();
            stopQRScanner();
            showQRScanner.value = false;
            
            // Show success message
            store.dispatch('showToast', {
              message: 'QR Code scanned successfully!',
              type: 'success'
            });
          } else {
            qrScannerError.value = 'Invalid QR code. Please scan a valid activation code QR.';
          }
        };
        
        const qrCodeErrorCallback = (errorMessage) => {
          // Ignore continuous scanning errors
          if (errorMessage && (
            errorMessage.includes('NotFoundException') || 
            errorMessage.includes('No MultiFormat Readers')
          )) {
            return;
          }
          console.log('QR Code error:', errorMessage);
        };
        
        // Stop any existing scanner first
        if (html5QrCode) {
          try {
            await html5QrCode.stop();
            await html5QrCode.clear();
          } catch (e) {
            console.log('Error stopping existing scanner:', e);
          }
        }
        
        html5QrCode = new Html5Qrcode("qr-reader");
        
        // Try to get available cameras first
        let cameras = [];
        try {
          cameras = await Html5Qrcode.getCameras();
          console.log('Available cameras:', cameras);
        } catch (camError) {
          console.warn('Could not get camera list:', camError);
          // Continue with facingMode fallback
        }
        
        let cameraId = null;
        if (cameras && cameras.length > 0) {
          // Prefer back camera (environment)
          const backCamera = cameras.find(cam => 
            cam.label.toLowerCase().includes('back') || 
            cam.label.toLowerCase().includes('rear') ||
            cam.label.toLowerCase().includes('environment')
          );
          cameraId = backCamera ? backCamera.id : cameras[0].id;
          console.log('Using camera:', cameraId);
        }
        
        // Start scanning with multiple fallback options
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false
        };
        
        let started = false;
        
        // Try 1: Use specific camera ID if available
        if (cameraId && !started) {
          try {
            await html5QrCode.start(
              cameraId,
              config,
              qrCodeSuccessCallback,
              qrCodeErrorCallback
            );
            started = true;
          } catch (err) {
            console.warn('Failed to start with camera ID, trying fallback:', err);
          }
        }
        
        // Try 2: Use environment facing mode
        if (!started) {
          try {
            await html5QrCode.start(
              { facingMode: "environment" },
              config,
              qrCodeSuccessCallback,
              qrCodeErrorCallback
            );
            started = true;
          } catch (err) {
            console.warn('Failed to start with environment mode, trying user mode:', err);
          }
        }
        
        // Try 3: Use user facing mode (front camera)
        if (!started) {
          try {
            await html5QrCode.start(
              { facingMode: "user" },
              config,
              qrCodeSuccessCallback,
              qrCodeErrorCallback
            );
            started = true;
          } catch (err) {
            console.warn('Failed to start with user mode:', err);
          }
        }
        
        // Try 4: Use any available camera (first one)
        if (!started && cameras && cameras.length > 0) {
          try {
            await html5QrCode.start(
              cameras[0].id,
              config,
              qrCodeSuccessCallback,
              qrCodeErrorCallback
            );
            started = true;
          } catch (err) {
            console.error('Failed to start with any camera:', err);
          }
        }
        
        if (!started) {
          throw new Error('Unable to access camera. Please check permissions and try again.');
        }
        
        isScanning.value = true;
        qrScannerError.value = '';
      } catch (error) {
        console.error('QR Scanner error:', error);
        let errorMsg = 'Failed to start camera. ';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMsg = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMsg = 'No camera found on your device.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          errorMsg = 'Camera is being used by another application. Please close other apps and try again.';
        } else if (error.message) {
          errorMsg += error.message;
        } else {
          errorMsg += 'Please check camera permissions and try again.';
        }
        
        qrScannerError.value = errorMsg;
        isScanning.value = false;
        // Don't close modal on error, let user see the error message
      }
    };
    
    // Stop QR Scanner
    const stopQRScanner = async () => {
      if (html5QrCode) {
        try {
          if (isScanning.value) {
            await html5QrCode.stop();
          }
          await html5QrCode.clear();
        } catch (error) {
          // Ignore errors when stopping - scanner might already be stopped
          console.log('Error stopping QR scanner (may already be stopped):', error);
        } finally {
          html5QrCode = null;
          isScanning.value = false;
        }
      } else {
        isScanning.value = false;
      }
    };
    
    // Close QR Scanner
    const closeQRScanner = async () => {
      await stopQRScanner();
      showQRScanner.value = false;
      qrScannerError.value = '';
    };
    
    // Activate device
    const activateDevice = async () => {
      if (!isAuthenticated.value || !activationCode.value || activationCode.value.length !== 8) {
        return;
      }
      
      isActivating.value = true;
      errorMessage.value = '';
      successMessage.value = '';
      
      try {
        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
        
        // Call activation API
        const response = await axios.post('/users/api/device-activation/', {
          activation_code: activationCode.value,
          device_id: `web_${Date.now()}`, // Generate a temporary device ID
          device_name: 'Web Activation',
          device_type: 'web',
          phone: user.value.phone
        });
        
        if (response.data.status === 'success') {
          successMessage.value = 'Device activated successfully! Your TV should now have access to premium content.';
          
          // Show success toast
          store.dispatch('showToast', {
            message: 'Device activated successfully!',
            type: 'success'
          });
          
          // Redirect to profile after a delay
          setTimeout(() => {
            router.push('/profile');
          }, 3000);
        } else {
          throw new Error(response.data.message || 'Failed to activate device');
        }
      } catch (error) {
        console.error('Activation error:', error);
        errorMessage.value = error.response?.data?.message || 'Failed to activate device. Please try again.';
        
        // Show error toast
        store.dispatch('showToast', {
          message: errorMessage.value,
          type: 'error'
        });
      } finally {
        isActivating.value = false;
      }
    };
    
    // Check for code in URL parameters
    onMounted(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        activationCode.value = code;
        formatCode();
      }
    });
    
    // Cleanup on unmount
    onUnmounted(async () => {
      await stopQRScanner();
    });
    
    return {
      activationCode,
      isActivating,
      errorMessage,
      successMessage,
      isAuthenticated,
      user,
      showQRScanner,
      isScanning,
      qrScannerError,
      formatCode,
      activateDevice,
      openQRScanner,
      stopQRScanner,
      closeQRScanner
    };
  }
};
</script>

<style scoped>
/* QR Scanner Styles */
#qr-reader {
  min-height: 300px;
  width: 100%;
  position: relative;
}

#qr-reader__dashboard_section {
  display: none !important;
}

#qr-reader__camera_selection {
  display: none !important;
}

/* Override html5-qrcode styles for better appearance */
#qr-reader__scan_region {
  border: 2px solid #c30059 !important;
  border-radius: 12px !important;
}

#qr-reader__scan_region video {
  border-radius: 12px !important;
  width: 100% !important;
  height: auto !important;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  #qr-reader {
    min-height: 250px;
  }
}
</style>

<style>
/* Global styles for QR scanner (not scoped) */
#qr-reader {
  width: 100% !important;
}

#qr-reader__scan_region {
  width: 100% !important;
}

#qr-reader__scan_region video {
  width: 100% !important;
  height: auto !important;
  object-fit: cover !important;
}
</style>