<template>
  <div class="min-h-screen bg-[#121212] text-white">
    <!-- Loading Spinner -->
    <div v-if="isProcessingPayment" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70">
      <i class="fas fa-spinner fa-spin text-5xl text-[#c30059] mb-4"></i>
      <div class="text-lg font-semibold text-white">Processing Payment...</div>
    </div>

    <!-- Back Navigation -->
    <div class="px-4 py-6 flex justify-between items-center">
      <router-link :to="'/movie/' + movieId" class="flex items-center gap-2 text-white/80 hover:text-white">
        <i class="fas fa-arrow-left"></i>
        <span>Back to Movie</span>
      </router-link>
    </div>

    <!-- Rental Card -->
    <div class="max-w-md mx-auto px-4 py-8">
      <div class="bg-[#1d1d1d] rounded-2xl overflow-hidden border border-[#c30059]/20 hover:border-[#c30059]/40 transition-all">
        <div class="p-6">
          <!-- Movie Preview -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-r from-[#c30059] to-[#7c1d44] flex items-center justify-center">
              <i class="fas fa-ticket-alt text-2xl text-white"></i>
            </div>
            <div>
              <h3 class="text-2xl font-bold">{{ movieTitle }}</h3>
              <p class="text-sm text-white/60">{{ rentalDuration }} Days Rental</p>
            </div>
          </div>

          <!-- Price Section -->
          <div class="bg-[#c30059]/10 rounded-lg p-4 mb-6">
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-[#c30059]">₹{{ rentalPrice }}</span>
              <span class="text-sm text-[#c30059]">/{{ rentalDuration }} days</span>
            </div>
            <p class="text-sm text-white/60 mt-1">Watch anytime within rental period</p>
          </div>

          <!-- Features List -->
          <div class="space-y-4 mb-6">
            <div class="flex items-start gap-3">
              <i class="fas fa-clock text-[#c30059] mt-1"></i>
              <div>
                <p class="font-medium">{{ rentalDuration }} Days Access</p>
                <p class="text-sm text-white/60">Watch unlimited times</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="fas fa-tv text-[#c30059] mt-1"></i>
              <div>
                <p class="font-medium">Watch on Any Device</p>
                <p class="text-sm text-white/60">TV, Mobile, Laptop</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="fas fa-film text-[#c30059] mt-1"></i>
              <div>
                <p class="font-medium">High Quality</p>
                <p class="text-sm text-white/60">HD Quality Available</p>
              </div>
            </div>
          </div>

          <!-- Payment Button -->
          <button 
            @click="handlePayment"
            :disabled="isProcessingPayment"
            class="w-full py-3 px-6 bg-gradient-to-r from-[#c30059] to-[#7c1d44] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i class="fas fa-credit-card" v-if="!isProcessingPayment"></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
            <span v-if="isProcessingPayment">Processing...</span>
            <span v-else>Pay ₹{{ rentalPrice }}</span>
          </button>

          <p class="text-center text-sm text-white/60 mt-4">
            Available to watch for {{ rentalDuration }} days after payment
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import axios from 'axios';

export default {
  name: 'RentalPayment',
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    
    const isProcessingPayment = ref(false);
    const movieId = ref(route.params.id);
    const movieTitle = ref('');
    const rentalPrice = ref(0);
    const rentalDuration = ref(0);

    // Get token from localStorage
    const token = ref(localStorage.getItem('token'));
    const isAuthenticated = ref(localStorage.getItem('isAuthenticated') === 'true');
    const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

    onMounted(async () => {
      try {
        console.log('RentalPayment: onMounted started');
        console.log('Current route:', route.fullPath);
        console.log('Movie ID:', movieId.value);
        
        // Initialize store
        store.dispatch('initializeStore');

        // Check authentication and token
        console.log('Auth check - isAuthenticated:', isAuthenticated.value);
        console.log('Auth check - user:', user.value);
        console.log('Auth check - token:', token.value);
        
        if (!isAuthenticated.value || !user.value || !token.value) {
          console.log('User not authenticated, redirecting to login');
          router.push({
            path: '/login',
            query: { 
              redirect: route.fullPath
            }
          });
          return;
        }

        // Set axios defaults with proper token
        axios.defaults.baseURL = 'https://ott.no1news.in/';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
        axios.defaults.withCredentials = true;
        console.log('Token set:', token.value);

        // Get movie details
        console.log('Fetching movie details for ID:', movieId.value);
        const response = await axios.get(`/api/videos/${movieId.value}/`);
        
        console.log('Movie details response:', response.data);
        
        if (response.data) {
          movieTitle.value = response.data.title;
          if (response.data.prices && response.data.prices.length > 0) {
            rentalPrice.value = response.data.prices[0].rental_price;
            rentalDuration.value = response.data.prices[0].rental_duration;
            console.log('Rental details set:', { price: rentalPrice.value, duration: rentalDuration.value });
          }
        }
      } catch (error) {
        console.error('Error in onMounted:', error);
        console.error('Error response:', error.response);
        store.dispatch('showToast', {
          message: 'Error loading movie details. Please try again.',
          type: 'error'
        });
      }
    });

    const handlePayment = async () => {
      try {
        isProcessingPayment.value = true;
        console.log('Starting payment process...');

        // Check authentication again
        const currentToken = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';

        if (!isAuth || !currentToken || !currentUser.phone) {
          console.log('Authentication check failed');
          store.dispatch('showToast', {
            message: 'Please login to continue',
            type: 'warning'
          });
          router.push({
            path: '/login',
            query: { 
              redirect: route.fullPath
            }
          });
          isProcessingPayment.value = false;
          return;
        }

        // Check if user profile is complete
        const hasCompletedRegistration = currentUser.first_name && 
                                       currentUser.last_name && 
                                       currentUser.phone && 
                                       currentUser.state && 
                                       currentUser.district && 
                                       currentUser.constituency;

        if (!hasCompletedRegistration) {
          console.log('Profile incomplete, redirecting to profile update');
          store.dispatch('showToast', {
            message: 'Please complete your profile details first',
            type: 'warning',
            duration: 5000
          });
          router.push({
            path: '/profile/update',
            query: { 
              redirect: route.fullPath
            }
          });
          isProcessingPayment.value = false;
          return;
        }

        // Create axios instance with proper headers
        const axiosInstance = axios.create({
          baseURL: 'https://ott.no1news.in/',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          withCredentials: true
        });

        console.log('Creating rental order with token:', currentToken);

        // Create rental order
        const orderResponse = await axiosInstance.post('/users/api/rentals/create/', {
          phone: currentUser.phone,
          video_id: movieId.value,
          rental_duration: rentalDuration.value,
          rental_price: rentalPrice.value
        });

        console.log('Order created:', orderResponse.data);

        if (!orderResponse.data || !orderResponse.data.key_id) {
          throw new Error('Invalid order response');
        }

        // Initialize Razorpay
        const options = {
          key: orderResponse.data.key_id,
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency,
          name: 'No1 OTT',
          description: `Rent ${movieTitle.value} for ${rentalDuration.value} days`,
          order_id: orderResponse.data.order_id,
          prefill: {
            name: currentUser.first_name + ' ' + currentUser.last_name,
            email: currentUser.email || '',
            contact: currentUser.phone
          },
          theme: {
            color: '#c30059'
          },
          webview_intent: true,
          handler: async (response) => {
            try {
              console.log('Payment successful, verifying:', response);
              
              // Get fresh token for verify request
              const verifyToken = localStorage.getItem('token');
              if (!verifyToken) {
                throw new Error('Token missing for verification');
              }
              
              // Create new axios instance for verification
              const verifyAxios = axios.create({
                baseURL: 'https://ott.no1news.in/',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${verifyToken}`
                },
                withCredentials: true
              });
              
              const verifyResponse = await verifyAxios.post('/users/api/rentals/verify/', {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                video_id: movieId.value,
                phone: currentUser.phone,
                rental_duration: rentalDuration.value
              });

              if (verifyResponse.data.status === 'success') {
                store.dispatch('showToast', {
                  message: 'Payment successful! You can now watch the movie.',
                  type: 'success'
                });
                router.push(`/movie/${movieId.value}`);
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification failed:', error);
              store.dispatch('showToast', {
                message: 'Payment verification failed. Please contact support.',
                type: 'error'
              });
            }
          },
          modal: {
            ondismiss: () => {
              isProcessingPayment.value = false;
            }
          }
        };

        // Create and open Razorpay
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          isProcessingPayment.value = false;
          store.dispatch('showToast', {
            message: `Payment failed: ${response.error.description}`,
            type: 'error'
          });
        });
        
        rzp.open();
        // Hide loader after Razorpay opens
        setTimeout(() => { isProcessingPayment.value = false; }, 1000);

      } catch (error) {
        console.error('Payment error:', error);
        
        // Handle specific error cases
        if (error.response?.status === 401) {
          store.dispatch('showToast', {
            message: 'Session expired. Please login again.',
            type: 'error'
          });
          store.dispatch('logout');
          router.push({
            path: '/login',
            query: { redirect: route.fullPath }
          });
        } else if (error.response?.status === 400) {
          store.dispatch('showToast', {
            message: error.response.data?.message || 'Invalid request. Please check your details.',
            type: 'error'
          });
        } else {
          store.dispatch('showToast', {
            message: error.response?.data?.message || 'Payment failed. Please try again.',
            type: 'error'
          });
        }
        isProcessingPayment.value = false;
      }
    };

    return {
      isProcessingPayment,
      movieId,
      movieTitle,
      rentalPrice,
      rentalDuration,
      handlePayment,
      isAuthenticated,
      user,
      token
    };
  }
}
</script> 