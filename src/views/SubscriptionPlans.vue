<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] text-white">
    <!-- Fullscreen Spinner Overlay -->
    <div v-if="isProcessingPayment" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div class="relative">
        <div class="w-16 h-16 border-4 border-[#c30059]/30 border-t-[#c30059] rounded-full animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <i class="fas fa-play text-[#c30059] text-xl"></i>
        </div>
      </div>
      <div class="mt-6 text-center">
        <div class="text-xl font-bold text-white mb-2">Processing Payment...</div>
        <div class="w-64 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-[#c30059] to-[#ff6b9d] animate-pulse"></div>
        </div>
        <div class="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg max-w-md">
          <div class="flex items-center justify-center gap-2 mb-2">
            <i class="fas fa-shield-alt text-amber-400"></i>
            <span class="font-semibold text-amber-400">Secure Payment</span>
          </div>
          <p class="text-sm text-amber-300">
            Please wait while we process your payment securely. Do not close this window.
          </p>
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-gradient-to-br from-[#c30059]/10 via-transparent to-[#ff6b9d]/10"></div>
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, rgba(195, 0, 89, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 107, 157, 0.1) 0%, transparent 50%);"></div>
      </div>
      
      <!-- Header -->
      <div class="relative z-10 px-4 py-8">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <router-link to="/" class="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
              <div class="w-10 h-10 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <i class="fas fa-arrow-left text-lg"></i>
              </div>
              <span class="font-medium">Back to Home</span>
            </router-link>
            
            <div class="flex items-center gap-2 text-sm text-white/60">
              <i class="fas fa-shield-check text-green-400"></i>
              <span>Secure Payment</span>
            </div>
          </div>
          
          <!-- Hero Content -->
          <div class="text-center max-w-4xl mx-auto">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-[#c30059]/10 border border-[#c30059]/20 rounded-full text-[#c30059] text-sm font-medium mb-6">
              <i class="fas fa-crown"></i>
              <span>Premium Plans Available</span>
            </div>
            
            <h1 class="text-4xl md:text-6xl font-bold mb-1">
              Choose Your
              <span class="bg-gradient-to-r from-[#c30059] to-[#ff6b9d] bg-clip-text text-transparent">
                Entertainment
              </span>
              <br>Plan
            </h1>
          </div>
        </div>
      </div>
    </div>

    <!-- Plans Section -->
    <div class="relative px-4 py-1">
      <div class="max-w-7xl mx-auto">
        
       
        
        <!-- Plans Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16 max-w-6xl mx-auto place-items-center">
          <!-- Loading State -->
          <div v-if="isLoadingPlans" class="col-span-full w-full flex flex-col items-center py-16">
            <div class="w-12 h-12 border-4 border-[#c30059]/30 border-t-[#c30059] rounded-full animate-spin"></div>
            <p class="mt-4 text-white/70 text-sm">Loading plans...</p>
          </div>
          
          <!-- No Plans Message -->
          <div v-else-if="plans.length === 0" class="col-span-full text-center py-16">
            <div class="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/10 p-8">
              <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] rounded-2xl flex items-center justify-center">
                <i class="fas fa-exclamation-triangle text-white text-3xl"></i>
              </div>
              <h3 class="text-2xl font-bold text-white mb-3">No Plans Available</h3>
              <p class="text-white/60 mb-4">Subscription plans are currently not available. Please try again later.</p>
              <button @click="fetchPlans" class="px-6 py-3 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#c30059]/25 transition-all">
                <i class="fas fa-refresh mr-2"></i>
                Refresh Plans
              </button>
            </div>
          </div>
          
          <!-- Plan Cards -->
          <div 
            v-for="plan in plans" 
            :key="plan.id"
            @click="selectPlan(plan)"
            :class="[
              'relative group cursor-pointer transition-all duration-300 transform hover:scale-105',
              (selectedPlan && selectedPlan.id) === plan.id ? 'scale-105' : ''
            ]"
          >
            <!-- Plan Card -->
            <div :class="[
              'relative bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-2xl overflow-hidden border-2 transition-all duration-300 h-full',
              (selectedPlan && selectedPlan.id) === plan.id 
                ? 'border-[#c30059] shadow-2xl shadow-[#c30059]/20' 
                : 'border-white/10 hover:border-[#c30059]/50 group-hover:shadow-xl'
            ]">
              <!-- Badge Section -->
              <div class="p-4 pb-2">
                <div v-if="plan.popular" class="inline-block">
                  <div class="bg-[#c30059] text-white text-xs font-bold px-3 py-1 rounded-full">
                    {{ plan.badge || 'RECOMMENDED' }}
                  </div>
                </div>
                <div v-else-if="plan.badge" class="inline-block">
                  <div class="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {{ plan.badge }}
                  </div>
                </div>
              </div>
              
              <!-- Selected Badge -->
              <div v-if="(selectedPlan && selectedPlan.id) === plan.id" class="absolute top-4 right-4 z-10">
                <div class="w-8 h-8 bg-[#c30059] rounded-full flex items-center justify-center">
                  <i class="fas fa-check text-white text-sm"></i>
                </div>
              </div>
              
              <!-- Card Content -->
              <div class="p-6 pt-2 flex flex-col h-full">
                <!-- Logo/Brand Section -->
                <div class="text-center mb-4">
                  <div class="inline-flex items-center gap-2 mb-3">
                    <div class="w-8 h-8 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] rounded-lg flex items-center justify-center">
                      <i class="fas fa-play text-white text-sm"></i>
                    </div>
                    <span class="text-[#c30059] font-bold text-lg">OTT</span>
                    <span class="bg-gradient-to-r from-[#ffd700] to-[#ffed4e] bg-clip-text text-transparent font-bold text-lg">{{ plan.brand_text || 'GOLD' }}</span>
                  </div>
                </div>
                
                <!-- Plan Features -->
                <div class="text-center mb-6">
                  <div class="text-white font-semibold text-sm mb-2">
                    {{ plan.features.join(' • ') }}
                  </div>
                  <div class="text-white/70 text-xs">
                    {{ plan.description }}
                  </div>
                </div>
                
                <!-- Divider -->
                <div class="border-t border-white/10 my-4"></div>
                
                <!-- Pricing Section -->
                <div class="text-center mb-6 flex-grow">
                  <div class="flex items-baseline justify-center gap-2 mb-2">
                    <span class="text-2xl font-bold text-white">₹{{ plan.price }}</span>
                    <span class="text-white/60 text-sm">/{{ plan.duration_text || 'month' }}</span>
                  </div>
                  <!-- Per-day dynamic text -->
                  <div class="text-white/70 text-xs">
                    Just ₹{{ getPerDay(plan) }} per day
                  </div>
                </div>
                
                <!-- Subscribe Button -->
                <div class="mt-auto">
                  <!-- Pay Online Button -->
                  <button 
                    @click.stop="handlePlanSubscription(plan)"
                    :disabled="isProcessingPayment"
                    :class="[
                      'w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2',
                      'bg-gradient-to-r from-[#c30059] to-[#ff6b9d] text-white hover:shadow-lg hover:shadow-[#c30059]/25 disabled:opacity-50'
                    ]"
                  >
                    <i class="fas fa-credit-card" v-if="!isProcessingPayment"></i>
                    <i class="fas fa-spinner fa-spin" v-else></i>
                    <span v-if="isProcessingPayment">Processing...</span>
                    <span v-else>Pay Online</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
       <!-- Subscription Code Callout (outside cards) -->
        <div class="mb-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-3 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-white/10 rounded-2xl p-4 max-w-4xl mx-auto">
            <div class="flex items-center gap-3 text-white/80">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-[#c30059] to-[#ff6b9d] flex items-center justify-center">
                <i class="fas fa-ticket-alt text-white"></i>
              </div>
              <div>
                <div class="font-semibold text-white">Have a subscription code?</div>
                <div class="text-sm text-white/60">Redeem it to activate your plan instantly</div>
              </div>
            </div>
            <button 
              @click="showCodeInput = true"
              class="w-full md:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#c30059] to-[#ff6b9d] text-white hover:shadow-lg hover:shadow-[#c30059]/25 transition-all"
            >
              Redeem Code
            </button>
          </div>
        </div>
        
      <!-- Code Input Dialog -->
      <div v-if="showCodeInput" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-3xl w-full max-w-md border border-white/10 overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-[#c30059] to-[#ff6b9d] p-6">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-xl font-bold text-white">Subscription Code</h3>
                <p class="text-white/80 text-sm">Enter your redemption code</p>
              </div>
              <button @click="showCodeInput = false" class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <!-- Content -->
          <div class="p-6 space-y-6">
            <div>
              <label class="block text-sm font-medium text-white/80 mb-3">Redemption Code</label>
              <input 
                v-model="subscriptionCode"
                type="text"
                class="w-full bg-[#0a0a0a] border border-white/10 rounded-xl h-14 px-4 text-white text-lg font-mono tracking-wider focus:border-[#c30059] focus:outline-none focus:ring-2 focus:ring-[#c30059]/20 transition-all uppercase placeholder-white/40"
                placeholder="ENTER-CODE-HERE"
                @input="validateCode"
              />
              <p v-if="codeError" class="mt-3 text-sm text-red-400 flex items-center gap-2">
                <i class="fas fa-exclamation-circle"></i>
                {{ codeError }}
              </p>
            </div>
            
            <button 
              @click="handleCodeSubmit"
              :disabled="!isValidCode"
              class="w-full py-4 px-6 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#c30059]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <span v-if="isValidCode">Activate Subscription</span>
              <span v-else>Enter Valid Code</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Why Choose Us Section -->
    <div class="bg-[#0a0a0a] py-16">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
          <p class="text-lg text-white/70">Experience entertainment like never before</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center group">
            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <i class="fas fa-video text-3xl text-white"></i>
            </div>
            <h3 class="text-xl font-bold mb-3">Premium Content</h3>
            <p class="text-white/60">Access thousands of movies, TV shows, and exclusive originals in HD quality</p>
          </div>
          
          <div class="text-center group">
            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <i class="fas fa-mobile-alt text-3xl text-white"></i>
            </div>
            <h3 class="text-xl font-bold mb-3">Multi-Device Support</h3>
            <p class="text-white/60">Watch on TV, laptop, tablet, or smartphone. Stream on up to 2 devices simultaneously</p>
          </div>
          
          <div class="text-center group">
            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#c30059] to-[#ff6b9d] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <i class="fas fa-download text-3xl text-white"></i>
            </div>
            <h3 class="text-xl font-bold mb-3">Offline Viewing</h3>
            <p class="text-white/60">Download content and watch offline anywhere, anytime without internet connection</p>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="py-16">
      <div class="max-w-4xl mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p class="text-lg text-white/70">Everything you need to know about our subscription plans</p>
        </div>
        
        <div class="space-y-4">
          <div class="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/10 overflow-hidden">
            <button class="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors">
              <div>
                <h3 class="font-semibold text-lg mb-1">What payment methods do you accept?</h3>
                <p class="text-white/60 text-sm">Learn about our secure payment options</p>
              </div>
              <i class="fas fa-chevron-down text-[#c30059] text-lg"></i>
            </button>
          </div>
          
          <div class="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/10 overflow-hidden">
            <button class="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors">
              <div>
                <h3 class="font-semibold text-lg mb-1">Can I cancel my subscription anytime?</h3>
                <p class="text-white/60 text-sm">Understand our flexible cancellation policy</p>
              </div>
              <i class="fas fa-chevron-down text-[#c30059] text-lg"></i>
            </button>
          </div>
          
          <div class="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/10 overflow-hidden">
            <button class="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors">
              <div>
                <h3 class="font-semibold text-lg mb-1">How many devices can I watch on simultaneously?</h3>
                <p class="text-white/60 text-sm">Details about multi-device streaming</p>
              </div>
              <i class="fas fa-chevron-down text-[#c30059] text-lg"></i>
            </button>
          </div>
          
          <div class="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/10 overflow-hidden">
            <button class="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors">
              <div>
                <h3 class="font-semibold text-lg mb-1">Is there a free trial available?</h3>
                <p class="text-white/60 text-sm">Information about trial periods and offers</p>
              </div>
              <i class="fas fa-chevron-down text-[#c30059] text-lg"></i>
            </button>
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
  name: 'SubscriptionPlans',
  setup() {
    const store = useStore();
    const router = useRouter();
    const showCodeInput = ref(false);
    const subscriptionCode = ref('');
    const codeError = ref('');
    const isValidCode = ref(false);
    const isProcessingPayment = ref(false);

    const plans = ref([]);
    const selectedPlan = ref(null);
    const isLoadingPlans = ref(true);

    // Use computed properties from store
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const user = computed(() => store.getters.currentUser);
    const token = computed(() => store.getters.token);

    // Function to select a plan
    const selectPlan = (plan) => {
      // If there is a cached order for a different plan, clear it
      try {
        const cached = localStorage.getItem('payment_order');
        if (cached) {
          const orderData = JSON.parse(cached);
          if (orderData.plan_id && orderData.plan_id !== plan.id) {
            localStorage.removeItem('payment_order');
          }
        }
      } catch (e) {
        localStorage.removeItem('payment_order');
      }
      selectedPlan.value = plan;
    };

    // Function to handle plan subscription
    const handlePlanSubscription = (plan) => {
      selectedPlan.value = plan;
      handlePaymentGateway();
    };

    // Note: code redemption is now opened from the top callout

    // Fetch plans from backend on mount
    onMounted(async () => {
      await fetchPlans();
      store.dispatch('initializeStore');
      
      // Check for plan in URL
      const urlParams = new URLSearchParams(window.location.search);
      const planType = urlParams.get('plan');
      if (planType && plans.value.length > 0) {
        const plan = plans.value.find(p => p.id === planType);
        if (plan) {
          selectedPlan.value = plan;
        }
      }
      
      // Check and clean expired orders on page load
      checkAndCleanExpiredOrders();
    });

    // Check for expired orders and clean up
    const checkAndCleanExpiredOrders = (expectedPlanId = null) => {
      const paymentOrder = localStorage.getItem('payment_order');
      if (paymentOrder) {
        try {
          const orderData = JSON.parse(paymentOrder);
          // If the cached order is for a different plan than currently selected, remove it
          if (expectedPlanId && orderData.plan_id && orderData.plan_id !== expectedPlanId) {
            localStorage.removeItem('payment_order');
            return false;
          }
          const orderTime = orderData.created_at;
          const currentTime = Date.now();
          const timeDiff = currentTime - orderTime;
          
          // If order is older than 30 minutes, remove it
          if (timeDiff > 30 * 60 * 1000) { // 30 minutes
            localStorage.removeItem('payment_order');
            console.log('Expired payment order removed');
            return false;
          }
          return true;
        } catch (error) {
          localStorage.removeItem('payment_order');
          return false;
        }
      }
      return false;
    };

    // Create new order function
    const createNewOrder = async () => {
      try {
        const orderResponse = await axios.post('/api/payment/create-order/', {
          amount: selectedPlan.value.price,
          currency: 'INR',
          plan_id: selectedPlan.value.id,
          phone: user.value.phone
        });

        console.log('New order created:', orderResponse.data);

        if (!orderResponse.data || !orderResponse.data.key_id) {
          throw new Error('Invalid order response from server');
        }

        // Store new order in localStorage with timestamp
        const orderData = {
          ...orderResponse.data,
          created_at: Date.now(),
          plan_id: selectedPlan.value.id,
          phone: user.value.phone
        };
        localStorage.setItem('payment_order', JSON.stringify(orderData));

        return orderData;
      } catch (error) {
        console.error('Error creating new order:', error);
        throw error;
      }
    };

    // Use existing order function
    const useExistingOrder = (orderData) => {
      console.log('Using existing order:', orderData.order_id);
      return orderData;
    };

    // Payment status polling function
    const startPaymentStatusPolling = async (orderId, storedPaymentData) => {
      console.log('Starting payment status polling for order:', orderId);
      console.log('Stored payment data:', storedPaymentData);
      let attempts = 0;
      const maxAttempts = 10; // Check for 5 minutes (30 seconds * 10)
      
      const pollInterval = setInterval(async () => {
        try {
          attempts++;
          console.log(`Payment status check attempt ${attempts}/${maxAttempts}`);
          
          // Check payment status with backend
          const statusResponse = await axios.get(`/users/payment/check-status/${orderId}/`);
          
          if (statusResponse.data.status === 'completed') {
            console.log('Payment completed successfully!');
            clearInterval(pollInterval);
            
            // Clear pending payment
            localStorage.removeItem('pending_payment');
            
            // Update store
            store.commit('setLoading', false);
            store.dispatch('showToast', {
              message: 'Payment successful! Your subscription is now active.',
              type: 'success'
            });
            
            // Redirect to profile
            router.push('/profile');
            return;
          }
          
          if (attempts >= maxAttempts) {
            console.log('Max polling attempts reached');
            clearInterval(pollInterval);
            
            // Keep payment data for App.vue to handle
            console.log('Keeping payment data for later verification');
            
            store.dispatch('showToast', {
              message: 'Payment verification is taking longer than expected. We will notify you once confirmed.',
              type: 'warning'
            });
          }
        } catch (error) {
          console.error('Payment status check failed:', error);
          
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
          }
        }
      }, 30000); // Check every 30 seconds
    };

    const handlePaymentGateway = async () => {
      isProcessingPayment.value = true;
      try {
        console.log('Payment gateway initiated');
        console.log('Auth status:', isAuthenticated.value);
        console.log('User:', user.value);
        console.log('Token:', token.value);

        // Check authentication and token
        if (!isAuthenticated.value || !user.value || !token.value) {
          console.log('User not authenticated or missing token, redirecting to login');
          router.push({
            path: '/login',
            query: { 
              redirect: '/plans',
              plan: selectedPlan.value.id
            }
          });
          isProcessingPayment.value = false;
          return;
        }

        // Check if registration and location details are complete
        const hasCompletedRegistration = user.value.first_name && 
                                       user.value.last_name && 
                                       user.value.address &&
                                       user.value.state &&
                                       user.value.district &&
                                       user.value.constituency;

        if (!hasCompletedRegistration) {
          console.log('Registration or location details incomplete, redirecting to profile update');
          store.dispatch('showToast', {
            message: 'Please complete your profile with all location details',
            type: 'warning',
            duration: 5000
          });
          router.push({
            path: '/profile/update',
            query: { 
              redirect: '/plans',
              plan: selectedPlan.value.id
            }
          });
          isProcessingPayment.value = false;
          return;
        }

        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;

        // Show loading state
        store.commit('setLoading', true);
        
        console.log('Creating order for plan:', selectedPlan.value);
        
        // Check for existing valid order
        const hasValidOrder = checkAndCleanExpiredOrders(selectedPlan.value.id);
        let orderData;
        
        if (hasValidOrder) {
          // Use existing order
          const existingOrder = JSON.parse(localStorage.getItem('payment_order'));
          orderData = useExistingOrder(existingOrder);
        } else {
          // Create new order
          orderData = await createNewOrder();
        }

        console.log('Order data:', orderData);

        // Hide loading state
        store.commit('setLoading', false);

        if (!orderData || !orderData.key_id) {
          throw new Error('Invalid order response from server');
        }

        try {
          // Initialize Razorpay
          const options = {
            key: orderData.key_id,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'No1 OTT',
            description: `${selectedPlan.value.name} Subscription`,
            order_id: orderData.order_id,
            prefill: {
              name: user.value?.first_name || '',
              email: user.value?.email || '',
              contact: user.value?.phone || ''
            },
            theme: {
              color: '#c30059'
            },
            // Better UPI configuration to prevent app closing
            config: {
              display: {
                blocks: {
                  upi: {
                    name: 'Pay using UPI',
                    instruments: [
                      { method: 'upi' }
                    ]
                  },
                  card: {
                    name: 'Credit/Debit Cards',
                    instruments: [
                      { method: 'card' }
                    ]
                  },
                  netbanking: {
                    name: 'Net Banking',
                    instruments: [
                      { method: 'netbanking' }
                    ]
                  }
                },
                sequence: ['upi', 'card', 'netbanking'],
                preferences: {
                  show_default_blocks: true
                }
              }
            },
            // Enhanced retry configuration
            retry: {
              enabled: true,
              max_count: 3
            },
            // Better timeout handling
            timeout: 300, // 5 minutes
            // Handle modal close (when user cancels or app redirects)
            modal: {
              ondismiss: async function() {
                console.log('Razorpay modal dismissed, starting payment status check');
                // Start background checking for payment status
                setTimeout(async () => {
                  // Try to get payment data from localStorage if available
                  const storedPayment = localStorage.getItem('pending_payment');
                  if (storedPayment) {
                    const paymentInfo = JSON.parse(storedPayment);
                    await startPaymentStatusPolling(orderData.order_id, paymentInfo);
                  } else {
                    await startPaymentStatusPolling(orderData.order_id, null);
                  }
                }, 2000); // Wait 2 seconds before starting checks
              },
              // Handle escape and back button
              escape: true,
              backdropclose: false
            },
            // Handle different payment methods
            method: {
              upi: {
                // Handle UPI flow completion
                flow: 'intent' // Use intent-based flow for better UPI handling
              }
            },
            handler: async (response) => {
              // Now handle the payment success
              try {
                store.commit('setLoading', true);
                console.log('=== PAYMENT SUCCESSFUL ===');
                console.log('Payment response:', response);
                
                // Store payment details in localStorage for backup verification
                const paymentData = {
                  payment_id: response.razorpay_payment_id,
                  order_id: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                  plan_id: selectedPlan.value.id,
                  phone: user.value.phone,
                  timestamp: Date.now(),
                  retry_count: 0,
                  amount: selectedPlan.value.price,
                  plan_name: selectedPlan.value.name
                };
                
                console.log('Storing payment data in localStorage:', paymentData);
                localStorage.setItem('pending_payment', JSON.stringify(paymentData));

                // Try immediate verification
                console.log('Attempting immediate payment verification...');
                const verifyResponse = await axios.post('/users/verify-payment/', {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  plan_id: selectedPlan.value.id,
                  phone: user.value.phone
                });

                console.log('Verification response:', verifyResponse.data);

                if (verifyResponse.data.status === 'success') {
                  // Clear pending payment from localStorage
                  localStorage.removeItem('pending_payment');
                  
                  // Update user subscription in store
                  store.commit('setSubscription', verifyResponse.data.subscription);
                  store.dispatch('showToast', {
                    message: 'Payment successful! Your subscription is now active.',
                    type: 'success'
                  });
                  console.log('Payment verified successfully, redirecting to profile');
                  router.push('/profile');
                } else {
                  throw new Error(verifyResponse.data.message || 'Payment verification failed');
                }
              } catch (error) {
                console.error('=== PAYMENT VERIFICATION FAILED ===');
                console.error('Error details:', error);
                console.error('Error response:', error.response?.data);
                
                // Don't remove pending_payment from localStorage - let App.vue handle it
                store.dispatch('showToast', {
                  message: 'Payment successful! Please wait a moment for verification. You will be notified once your subscription is active.',
                  type: 'warning'
                });
                console.log('Redirecting to profile, payment data stored for retry');
                router.push('/profile');
              } finally {
                store.commit('setLoading', false);
              }
            },
            webview_intent: true
          };

          // Create and open Razorpay
          console.log('Opening Razorpay with options:', options);
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            isProcessingPayment.value = false;
            store.commit('setLoading', false);
            alert(`Payment failed: ${response.error.description}`);
          });
          
          rzp.open();
          // Hide loader after a short delay to ensure Razorpay UI is visible
          setTimeout(() => { isProcessingPayment.value = false; }, 1000);
        } catch (error) {
          console.error('Order creation failed:', error);
          store.commit('setLoading', false);
          
          if (error.response) {
            if (error.response.status === 401) {
              // Clear invalid session and redirect to login
              store.dispatch('logout');
              router.push({
                path: '/login',
                query: { 
                  redirect: '/plans',
                  plan: selectedPlan.value.id
                }
              });
            } else {
              alert(`Server error: ${error.response.data.message || 'Please try again later'}`);
            }
          } else if (error.request) {
            alert('Network error. Please check your internet connection.');
          } else {
            alert('Unable to create order. Please try again.');
          }
        }
      } catch (error) {
        console.error('Payment gateway error:', error);
        store.commit('setLoading', false);
        alert('Something went wrong. Please try again.');
      }
    };

    const validateCode = async () => {
      try {
        // Show loading state
        store.commit('setLoading', true);
        
        // Basic validation
        if (!subscriptionCode.value) {
          codeError.value = 'Please enter a subscription code';
          isValidCode.value = false;
          return;
        }

        // Get user phone from store
        const phone = store.getters.currentUser?.phone;
        
        if (!phone) {
          store.dispatch('showToast', {
            message: 'Please login to continue',
            type: 'error'
          });
          router.push({
            name: 'login',
            query: { redirect: router.currentRoute.value.fullPath }
          });
          return;
        }

        // Call API to validate code
        const response = await axios.post('/users/validate-coupon/', {
          code: subscriptionCode.value,
          phone: phone,
          amount: selectedPlan.value.price,
          plan_id: selectedPlan.value.id
        });

        if (response.data.status === 'success') {
          isValidCode.value = true;
          codeError.value = '';
          store.dispatch('showToast', {
            message: 'Code is valid! Click Activate to use it',
            type: 'success'
          });
        } else {
          isValidCode.value = false;
          codeError.value = response.data.message || 'Invalid code';
          store.dispatch('showToast', {
            message: codeError.value,
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Code validation error:', error);
        isValidCode.value = false;
        codeError.value = error.response?.data?.message || 'Error validating code. Please try again.';
        store.dispatch('showToast', {
          message: codeError.value,
          type: 'error'
        });
      } finally {
        store.commit('setLoading', false);
      }
    };

    const handleCodeSubmit = async () => {
      if (!isValidCode.value) return;

      try {
        // Show loading state
        store.commit('setLoading', true);
        
        // Get user from Vuex store
        const user = store.getters.currentUser;
        const phone = user?.phone || localStorage.getItem('phone');
        
        if (!phone) {
          store.dispatch('showToast', {
            message: 'Please login to continue',
            type: 'error'
          });
          router.push({
            name: 'login',
            query: { redirect: router.currentRoute.value.fullPath }
          });
          store.commit('setLoading', false);
          return;
        }

        // Check if registration and location details are complete (same as Pay Online)
        const hasCompletedRegistration = user && user.first_name && 
                                         user.last_name && 
                                         user.address &&
                                         user.state &&
                                         user.district &&
                                         user.constituency;

        if (!hasCompletedRegistration) {
          store.dispatch('showToast', {
            message: 'Please complete your profile with all location details',
            type: 'warning',
            duration: 5000
          });
          router.push({
            path: '/profile/update',
            query: { 
              redirect: router.currentRoute.value.fullPath,
              code: subscriptionCode.value
            }
          });
          store.commit('setLoading', false);
          return;
        }
        
        // Call API to activate subscription
        const response = await axios.post('/users/apply-coupon/', {
          code: subscriptionCode.value,
          phone: phone,
          plan_id: selectedPlan.value.id
        });

        if (response.data.status === 'success') {
          // Update user subscription in store
          store.commit('setSubscription', response.data.subscription);
          
          // Show success message
          store.dispatch('showToast', {
            message: 'Subscription activated successfully!',
            type: 'success'
          });
          
          // Close code input dialog
          showCodeInput.value = false;
          
          // Redirect to profile page
          router.push('/profile');
        } else {
          throw new Error(response.data.message || 'Failed to activate subscription');
        }
      } catch (error) {
        console.error('Code activation error:', error);
        
        // Show error message
        store.dispatch('showToast', {
          message: error.response?.data?.message || 'Error activating subscription. Please try again.',
          type: 'error'
        });

        if (error.response?.status === 404) {
          // User not found - redirect to login (same as Pay Online)
          router.push({
            path: '/login',
            query: { 
              redirect: router.currentRoute.value.fullPath,
              phone: localStorage.getItem('phone')
            }
          });
        } else if (!localStorage.getItem('phone')) {
          // Not logged in - redirect to login
          router.push({
            name: 'login',
            query: { redirect: router.currentRoute.value.fullPath }
          });
        }
      } finally {
        store.commit('setLoading', false);
      }
    };

    const fetchPlans = async () => {
      isLoadingPlans.value = true;
      try {
        const response = await axios.get('/users/api/subscription-plans/');
        plans.value = response.data.plans || [];
        if (plans.value.length > 0) {
          const popularPlan = plans.value.find(p => p.popular) || plans.value[0];
          selectedPlan.value = popularPlan;
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
        plans.value = [];
        store.dispatch('showToast', {
          message: 'Failed to refresh plans. Please try again later.',
          type: 'error'
        });
      } finally {
        isLoadingPlans.value = false;
      }
    };

    const formatNumber = (num) => {
      if (!isFinite(num)) return '0';
      const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
      return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
    };

    const getPerDay = (plan) => {
      if (plan && plan.per_day_text) return plan.per_day_text.replace(/^\s*₹?\s*/, '');
      if (!plan || !plan.price || !plan.duration) return '0';
      const perDay = Number(plan.price) / Number(plan.duration);
      return formatNumber(perDay);
    };


    return {
      plans,
      selectedPlan,
      showCodeInput,
      subscriptionCode,
      codeError,
      isValidCode,
      isProcessingPayment,
      handlePaymentGateway,
      validateCode,
      handleCodeSubmit,
      selectPlan,
      handlePlanSubscription,
      checkAndCleanExpiredOrders, // Expose order cleanup method
      fetchPlans, // Expose fetchPlans function
      isLoadingPlans,
      getPerDay
    };
  }
}
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(90deg, #c30059 0%, #7c1d44 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Add these responsive styles */
@media screen and (max-width: 1200px) {
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media screen and (max-width: 1024px) {
  .max-w-7xl {
    max-width: 100%;
  }
  
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media screen and (max-width: 768px) {
  .grid {
    gap: 1rem;
  }
  
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  /* Force single column on mobile */
  .md\:grid-cols-2,
  .lg\:grid-cols-4 {
    grid-template-columns: 1fr;
  }

  /* Add padding for mobile nav */
  .pb-32 {
    padding-bottom: 8rem;
  }
}

@media screen and (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
  }
  
  .text-2xl {
    font-size: 1.5rem;
  }
  
  .py-4 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
  
  .px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  /* Add bottom padding to account for fixed button */
  .pb-24 {
    padding-bottom: 6rem;
  }
  
  /* Scale down cards on mobile */
  .scale-105 {
    transform: scale(1.02);
  }
}
</style>