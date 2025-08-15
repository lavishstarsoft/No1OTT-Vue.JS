<template>
  <div class="min-h-screen bg-[#121212] text-white">
    <!-- Fullscreen Spinner Overlay -->
    <div v-if="isProcessingPayment" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70">
      <i class="fas fa-spinner fa-spin text-5xl text-[#c30059] mb-4"></i>
      <div class="text-lg font-semibold text-white">Processing Payment...</div>
      <!-- Payment Warning Message -->
      <div class="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/40 rounded-lg max-w-md text-center">
        <div class="flex items-center justify-center gap-2 mb-2">
          <i class="fas fa-exclamation-triangle text-yellow-400"></i>
          <span class="font-semibold text-yellow-400">Important!</span>
        </div>
        <p class="text-sm text-yellow-300">
          <strong>Don't close this website</strong> while payment is being processed. 
          Your subscription will be activated automatically once payment is complete.
        </p>
      </div>
    </div>



    <!-- Back Navigation -->
    <div class="px-4 py-6 flex justify-between items-center">
      <router-link to="/" class="flex items-center gap-2 text-white/80 hover:text-white">
        <i class="fas fa-arrow-left"></i>
        <span>Choose a Plan</span>
      </router-link>
    </div>

    <!-- Plan Selector (if multiple plans) -->
    <div v-if="plans.length > 1" class="flex justify-center mb-8">
      <select v-model="selectedPlanId" @change="onPlanChange" class="bg-[#1d1d1d] border border-[#c30059]/40 text-white rounded-lg px-4 py-2">
        <option v-for="plan in plans" :key="plan.id" :value="plan.id">{{ plan.name }}</option>
      </select>
    </div>

    <!-- Single Centered Plan Card -->
    <div class="max-w-md mx-auto mb-24 sm:mb-0">
      <div class="bg-[#1d1d1d] rounded-2xl overflow-hidden border border-[#c30059]/20 hover:border-[#c30059]/40 transition-all">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-r from-[#c30059] to-[#7c1d44] flex items-center justify-center">
              <i class="fas fa-calendar-check text-2xl text-white"></i>
            </div>
            <div>
              <h3 class="text-2xl font-bold">{{ selectedPlan?.name }}</h3>
              <p class="text-sm text-white/60">{{ selectedPlan?.description }}</p>
            </div>
          </div>
          <!-- Price Section with Special Highlight -->
          <div class="bg-[#c30059]/10 rounded-lg p-4 mb-6">
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-[#c30059]">₹{{ selectedPlan?.price }}</span>
              <span class="text-sm text-[#c30059]">/{{ selectedPlan?.duration }} days</span>
            </div>
            <p class="text-sm text-white/60 mt-1">Just ₹{{ selectedPlan ? (selectedPlan.price / selectedPlan.duration).toFixed(2) : '0.00' }} per day</p>
          </div>
          <!-- Features List -->
          <div class="space-y-4 mb-6">
            <div class="flex items-start gap-3">
              <i class="fas fa-tv text-[#c30059] mt-1"></i>
              <div>
                <p class="font-medium">Watch on 2 Devices</p>
                <p class="text-sm text-white/60">Stream on TV & Mobile</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="fas fa-fire text-[#c30059] mt-1"></i>
              <div>
                <p class="font-medium">Trending Videos</p>
                <p class="text-sm text-white/60">Latest & Popular Content</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="fas fa-star text-[#c30059] mt-1"></i>
              <div>
                <p class="font-medium">Popular Shows</p>
                <p class="text-sm text-white/60">Binge-worthy Series</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="fas fa-film text-[#c30059] mt-1"></i>
              <div>
                <p class="font-medium">No.1 Originals</p>
                <p class="text-sm text-white/60">Exclusive Content</p>
              </div>
            </div>
          </div>
          <!-- Payment Options Section -->
          <div class="mt-6 border-t border-white/10 pt-6">
            <h4 class="text-lg font-semibold mb-4">Select Payment Method</h4>
            <div class="grid grid-cols-1 gap-4">
              <button 
                @click="handlePaymentGateway"
                :disabled="isProcessingPayment"
                class="bg-[#1a1a1a] p-4 rounded-lg border border-white/10 hover:border-[#c30059] transition-colors flex items-center justify-between group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-[#c30059]/10 flex items-center justify-center group-hover:bg-[#c30059]/20">
                    <i class="fas fa-credit-card text-[#c30059]" v-if="!isProcessingPayment"></i>
                    <i class="fas fa-spinner fa-spin text-[#c30059]" v-else></i>
                  </div>
                  <div class="text-left">
                    <p class="font-medium">
                      <span v-if="isProcessingPayment">Processing...</span>
                      <span v-else>Pay Online</span>
                    </p>
                    <p class="text-sm text-white/60">Credit/Debit Card, UPI, Net Banking</p>
                  </div>
                </div>
                <i class="fas fa-chevron-right text-white/40 group-hover:text-[#c30059]" v-if="!isProcessingPayment"></i>
              </button>
              <button 
                @click="showCodeInput = true"
                class="bg-[#1a1a1a] p-4 rounded-lg border border-white/10 hover:border-[#c30059] transition-colors flex items-center justify-between group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-[#c30059]/10 flex items-center justify-center group-hover:bg-[#c30059]/20">
                    <i class="fas fa-ticket-alt text-[#c30059]"></i>
                  </div>
                  <div class="text-left">
                    <p class="font-medium">Use Subscription Code</p>
                    <p class="text-sm text-white/60">Redeem subscription code</p>
                  </div>
                </div>
                <i class="fas fa-chevron-right text-white/40 group-hover:text-[#c30059]"></i>
              </button>
            </div>
          </div>
          <!-- Code Input Dialog -->
          <div v-if="showCodeInput" class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div class="bg-[#1d1d1d] rounded-xl w-full max-w-md p-6">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold">Enter Subscription Code</h3>
                <button @click="showCodeInput = false" class="text-white/60 hover:text-white">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm text-white/60 mb-2">Subscription Code</label>
                  <input 
                    v-model="subscriptionCode"
                    type="text"
                    class="w-full bg-[#121212] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors uppercase"
                    placeholder="Enter your code here"
                    @input="validateCode"
                  />
                  <p v-if="codeError" class="mt-2 text-sm text-red-500">{{ codeError }}</p>
                </div>
                <button 
                  @click="handleCodeSubmit"
                  :disabled="!isValidCode"
                  class="w-full py-3 px-6 bg-gradient-to-r from-[#c30059] to-[#7c1d44] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Activate Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Section (unchanged) -->
    <div class="mt-16 mb-24 md:mb-8">
      <h2 class="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
      <div class="max-w-3xl mx-auto space-y-4 pb-20 md:pb-0">
        <div class="bg-[#1d1d1d] rounded-lg p-4">
          <button class="flex items-center justify-between w-full text-left">
            <span class="font-semibold">What payment methods do you accept?</span>
            <i class="fas fa-chevron-down text-[#c30059]"></i>
          </button>
        </div>
        <div class="bg-[#1d1d1d] rounded-lg p-4">
          <button class="flex items-center justify-between w-full text-left">
            <span class="font-semibold">Can I cancel my subscription anytime?</span>
            <i class="fas fa-chevron-down text-[#c30059]"></i>
          </button>
        </div>
        <div class="bg-[#1d1d1d] rounded-lg p-4">
          <button class="flex items-center justify-between w-full text-left">
            <span class="font-semibold">How many devices can I watch on simultaneously?</span>
            <i class="fas fa-chevron-down text-[#c30059]"></i>
          </button>
        </div>
      </div>
    </div>
    <!-- Mobile Fixed Bottom Bar -->
    <div v-if="selectedPlan" class="fixed bottom-0 left-0 right-0 p-4 bg-[#121212]/95 backdrop-blur-md border-t border-white/10 md:hidden z-50 mb-[72px]">
      <div class="flex items-center justify-between mb-2">
        <div>
          <p class="text-sm text-white/60">Selected Plan</p>
          <p class="font-bold text-[#c30059]">{{ selectedPlan.name }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-white/60">Total Amount</p>
          <p class="font-bold text-[#c30059]">₹{{ selectedPlan.price }}</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button 
          @click="handlePaymentGateway"
          :disabled="isProcessingPayment"
          class="py-3 px-4 bg-gradient-to-r from-[#c30059] to-[#7c1d44] text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <i class="fas fa-credit-card" v-if="!isProcessingPayment"></i>
          <i class="fas fa-spinner fa-spin" v-else></i>
          <span v-if="isProcessingPayment">Processing...</span>
          <span v-else>Pay Online</span>
        </button>
        <button 
          @click="showCodeInput = true"
          class="py-3 px-4 bg-[#1a1a1a] text-white font-bold rounded-lg hover:bg-[#252525] transition-colors flex items-center justify-center gap-2 border border-white/10"
        >
          <i class="fas fa-ticket-alt"></i>
          <span>Use Subscription Code</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { ref, computed, onMounted, watch } from 'vue';
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
    const selectedPlanId = ref(null);

    // Use computed properties from store
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const user = computed(() => store.getters.currentUser);
    const token = computed(() => store.getters.token);

    // Fetch plans from backend on mount
    onMounted(async () => {
      try {
        const response = await axios.get('/users/api/subscription-plans/');
        plans.value = response.data.plans;
        if (plans.value.length > 0) {
          selectedPlan.value = plans.value[0];
          selectedPlanId.value = plans.value[0].id;
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      }
      store.dispatch('initializeStore');
      
      // Check for plan in URL
      const urlParams = new URLSearchParams(window.location.search);
      const planType = urlParams.get('plan');
      if (planType && plans.value.length > 0) {
        const plan = plans.value.find(p => p.id === planType);
        if (plan) {
          selectedPlan.value = plan;
          selectedPlanId.value = plan.id;
        }
      }
      
      // Check and clean expired orders on page load
      checkAndCleanExpiredOrders();
    });

    // Watch for plan selector change
    const onPlanChange = () => {
      const plan = plans.value.find(p => p.id === selectedPlanId.value);
      if (plan) {
        selectedPlan.value = plan;
      }
    };

    watch(selectedPlanId, onPlanChange);

    // Check for expired orders and clean up
    const checkAndCleanExpiredOrders = () => {
      const paymentOrder = localStorage.getItem('payment_order');
      if (paymentOrder) {
        try {
          const orderData = JSON.parse(paymentOrder);
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
        const hasValidOrder = checkAndCleanExpiredOrders();
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
            handler: async (response) => {
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
        const response = await axios.post('/users/apply-coupon-subscription/', {
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



    return {
      plans,
      selectedPlan,
      selectedPlanId,
      showCodeInput,
      subscriptionCode,
      codeError,
      isValidCode,
      isProcessingPayment,
      handlePaymentGateway,
      validateCode,
      handleCodeSubmit,
      onPlanChange,
      checkAndCleanExpiredOrders // Expose order cleanup method
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
@media screen and (max-width: 1024px) {
  .max-w-7xl {
    max-width: 100%;
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
}
</style>