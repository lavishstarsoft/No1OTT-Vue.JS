<template>
  <div class="min-h-screen bg-[#121212] flex flex-col">
    <div class="flex-grow">
      <router-view></router-view>
      <MobileNav v-if="showMobileNav" />
      <ToastNotification />
      <PopupModal @popup-action="handlePopupAction" />
    </div>
  </div>
</template>

<script>
import MobileNav from './components/MobileNav.vue'
import ToastNotification from '@/components/Toast.vue'
import PopupModal from '@/components/PopupModal.vue'

export default {
  name: 'App',
  components: {
    MobileNav,
    ToastNotification,
    PopupModal
  },
  computed: {
    showMobileNav() {
      const hideOnRoutes = ['/login', '/register', '/mini-register'];
      return !hideOnRoutes.includes(this.$route.path);
    }
  },
  mounted() {
    console.log('App mounted, checking authentication status');
    
    // Check if user is authenticated
    const isAuthenticated = this.$store.getters.isAuthenticated;
    const user = this.$store.getters.currentUser;
    
    console.log('Authentication status:', { isAuthenticated, user: user ? 'exists' : 'null' });
    
    // Check and clean expired orders on page load
    this.checkAndCleanExpiredOrders();
    
    // Only check notifications and payments if user is authenticated
    if (isAuthenticated && user) {
    // Check for success messages
    this.checkAndShowToast('registrationSuccess', 'registrationMessage');
    this.checkAndShowToast('loginSuccess', 'loginMessage');
      // Check for pending payments on mount
      this.checkPendingPayments();
      // Check for user notifications (like account deletion)
      this.checkUserNotifications();
      // Listen for app resume/focus
      window.addEventListener('focus', this.checkPendingPayments);
      window.addEventListener('focus', this.checkUserNotifications);
      window.addEventListener('focus', this.checkAndCleanExpiredOrders);
    } else {
      console.log('User not authenticated, skipping background checks');
    }
  },
  beforeUnmount() {
    window.removeEventListener('focus', this.checkPendingPayments);
    window.removeEventListener('focus', this.checkUserNotifications);
    window.removeEventListener('focus', this.checkAndCleanExpiredOrders);
  },
  methods: {
    checkAndShowToast(successKey, messageKey) {
      const isSuccess = localStorage.getItem(successKey);
      if (isSuccess === 'true') {
        // Show success toast
        try {
          if (this.$toast) {
            this.$toast.success(localStorage.getItem(messageKey) || 'Operation completed successfully!', {
              position: 'top-right',
              duration: 3000
            });
          }
        } catch (error) {
          console.warn('Toast notification failed:', error);
        }
        // Clear the success message
        localStorage.removeItem(successKey);
        localStorage.removeItem(messageKey);
      }
    },
    async checkPendingPayments() {
      const pendingPayment = localStorage.getItem('pending_payment');
      if (pendingPayment) {
        try {
          const paymentData = JSON.parse(pendingPayment);
          console.log('=== CHECKING PENDING PAYMENT ===');
          console.log('Payment data:', paymentData);
          
          // 15 నిమిషాల లోపల payment అయితే మాత్రమే
          const timeDiff = Date.now() - paymentData.timestamp;
          console.log('Time difference:', timeDiff, 'ms');
          
          if (timeDiff < 15 * 60 * 1000) {
            console.log('Payment is within time limit, proceeding with verification');
            
            // Retry count check
            if (paymentData.retry_count >= 10) {
              console.log('Max retries reached, removing pending payment');
              localStorage.removeItem('pending_payment');
              return;
            }
            
            console.log('Attempting payment verification...');
            // Backend కి verify-payment API call చేయండి
            const verifyResponse = await this.$axios.post('/users/verify-payment/', {
              razorpay_payment_id: paymentData.payment_id,
              razorpay_order_id: paymentData.order_id,
              razorpay_signature: paymentData.signature,
              plan_id: paymentData.plan_id,
              phone: paymentData.phone || this.$store.getters.currentUser?.phone
            });
            
            console.log('Verification response:', verifyResponse.data);
            
            if (verifyResponse.data.status === 'success') {
              localStorage.removeItem('pending_payment');
              this.$store.commit('setSubscription', verifyResponse.data.subscription);
              this.$store.dispatch('showToast', {
                message: 'Payment successful! Your subscription is now active.',
                type: 'success'
              });
              console.log('Pending payment verified successfully');
            } else {
              console.log('Payment verification failed:', verifyResponse.data);
              // Increment retry count
              paymentData.retry_count = (paymentData.retry_count || 0) + 1;
              localStorage.setItem('pending_payment', JSON.stringify(paymentData));
              console.log('Updated retry count:', paymentData.retry_count);
            }
          } else {
            // Payment చాలా పాతది అయితే, localStorage నుండి తీసేయండి
            localStorage.removeItem('pending_payment');
            console.log('Pending payment expired, removed from localStorage');
          }
        } catch (error) {
          console.error('Error checking pending payment:', error);
          // Increment retry count on error
          try {
            const paymentData = JSON.parse(pendingPayment);
            paymentData.retry_count = (paymentData.retry_count || 0) + 1;
            localStorage.setItem('pending_payment', JSON.stringify(paymentData));
            console.log('Error occurred, updated retry count:', paymentData.retry_count);
          } catch (parseError) {
            console.error('Error updating retry count:', parseError);
          }
        }
      } else {
        console.log('No pending payment found in localStorage');
      }
      
      // Also check subscription status directly
      await this.checkSubscriptionStatus();
    },
    
    // Check and clean expired orders
    checkAndCleanExpiredOrders() {
      try {
        const paymentOrder = localStorage.getItem('payment_order');
        if (paymentOrder) {
          const orderData = JSON.parse(paymentOrder);
          const orderTime = orderData.created_at;
          const currentTime = Date.now();
          const timeDiff = currentTime - orderTime;
          
          // If order is older than 30 minutes, remove it
          if (timeDiff > 30 * 60 * 1000) { // 30 minutes
            localStorage.removeItem('payment_order');
            console.log('Expired payment order removed from localStorage');
          } else {
            console.log('Valid payment order found, keeping it');
          }
        } else {
          console.log('No payment order found in localStorage');
        }
      } catch (error) {
        console.error('Error checking expired orders:', error);
        // Remove corrupted data
        localStorage.removeItem('payment_order');
      }
    },
    
    async checkSubscriptionStatus() {
      try {
        const user = this.$store.getters.currentUser;
        if (!user || !user.phone) {
          console.log('No user found, skipping subscription check');
          return;
        }
        
        console.log('=== CHECKING SUBSCRIPTION STATUS ===');
        console.log('User phone:', user.phone);
        
        const response = await this.$axios.get('/users/check-subscription-status/', {
          params: { phone: user.phone }
        });
        
        console.log('Subscription status response:', response.data);
        
        if (response.data.status === 'success') {
          if (response.data.is_subscribed) {
            console.log('User has active subscription:', response.data.subscription);
            // Update store with subscription data
            this.$store.commit('setSubscription', response.data.subscription);
            
            // Clear any pending payments since subscription is active
            localStorage.removeItem('pending_payment');
            console.log('Cleared pending payment from localStorage');
            
            this.$store.dispatch('showToast', {
              message: 'Your subscription is active!',
              type: 'success'
            });
          } else {
            console.log('User has no active subscription');
            // Check if there's a pending payment
            const pendingPayment = localStorage.getItem('pending_payment');
            if (pendingPayment) {
              console.log('Found pending payment, will retry verification');
            }
          }
        } else {
          console.log('Subscription status check failed:', response.data);
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        console.error('Error details:', error.response?.data);
      }
    },
    async checkUserNotifications() {
      try {
        // Check if user is authenticated
        const isAuthenticated = this.$store.getters.isAuthenticated;
        const user = this.$store.getters.currentUser;
        
        if (!isAuthenticated || !user || !user.phone) {
          console.log('User not authenticated, skipping notification check');
          return;
        }

        console.log('Checking notifications for user:', user.phone);

        const response = await this.$axios.get(`/users/check-notifications/?phone=${user.phone}`);
        
        if (response.data.status === 'success') {
          // Check if user still exists in database
          if (response.data.user_exists === false) {
            console.log('User no longer exists in database, logging out');
            
            // Complete logout process
            this.performCompleteLogout('Your account has been deleted. You have been logged out.');
            return;
          }

          // Check for notifications
          if (response.data.has_notifications) {
            console.log('Found notifications:', response.data.notifications);
            
            // Check for account deletion notification
            const accountDeletedNotification = response.data.notifications.find(
              notification => notification.type === 'account_deleted'
            );

            if (accountDeletedNotification) {
              console.log('Account deletion notification found, logging out user');
              
              // Complete logout process
              this.performCompleteLogout('Your account has been deleted by admin. You have been logged out.');
            }
          } else {
            console.log('No notifications found');
          }
        }
      } catch (error) {
        console.error('Error checking user notifications:', error);
      }
    },
    performCompleteLogout(message) {
      console.log('Performing complete logout');
      
      // Clear all localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear specific items to be sure
      const itemsToRemove = [
        'user', 'isAuthenticated', 'token', 'subscription', 'csrfToken',
        'pending_payment', 'registrationSuccess', 'registrationMessage',
        'loginSuccess', 'loginMessage', 'hasCompletedRegistration', 'app_version'
      ];
      
      itemsToRemove.forEach(item => {
        localStorage.removeItem(item);
        sessionStorage.removeItem(item);
      });
      
      // Clear store
      this.$store.commit('logout');
      
      // Clear all cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Clear axios default headers
      if (this.$axios && this.$axios.defaults) {
        this.$axios.defaults.headers.common['Authorization'] = '';
        this.$axios.defaults.headers.common['X-CSRFToken'] = '';
      }
      
      // Show notification
      this.$store.dispatch('showToast', {
        message: message || 'You have been logged out.',
        type: 'error',
        duration: 5000
      });

      // Redirect to login page
      this.$router.push('/login');
      
      console.log('Complete logout finished');
    },
    handlePopupAction() {
      // Handle popup action - you can add custom logic here
      console.log('Popup action handled');
    }
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #121212;
  color: white;
}

#app {
  min-height: 100vh;
}
</style>
