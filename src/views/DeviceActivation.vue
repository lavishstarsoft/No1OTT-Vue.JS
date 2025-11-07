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
              <input 
                v-model="activationCode"
                type="text"
                class="w-full bg-[#0a0a0a] border border-white/10 rounded-xl h-14 px-4 text-white text-lg font-mono tracking-wider focus:border-[#c30059] focus:outline-none focus:ring-2 focus:ring-[#c30059]/20 transition-all uppercase placeholder-white/40 text-center"
                placeholder="ENTER CODE"
                maxlength="8"
                @input="formatCode"
              />
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
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'DeviceActivation',
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const activationCode = ref('');
    const isActivating = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    
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
    
    return {
      activationCode,
      isActivating,
      errorMessage,
      successMessage,
      isAuthenticated,
      user,
      formatCode,
      activateDevice
    };
  }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>