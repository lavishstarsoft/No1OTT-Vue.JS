<template>
  <div class="payment-container">
    <div v-if="!showPaymentForm" class="subscription-plans">
      <h2>Choose Your Plan</h2>
      <div class="plans">
        <div class="plan" v-for="plan in plans" :key="plan.id" @click="selectPlan(plan)">
          <h3>{{ plan.name }}</h3>
          <p class="price">₹{{ plan.price }}</p>
          <p class="duration">{{ plan.duration }} days</p>
          <button class="select-btn">Select</button>
        </div>
      </div>
    </div>

    <div v-if="selectedPlan" class="payment-summary">
      <h3>Payment Summary</h3>
      <p>Plan: {{ selectedPlan.name }}</p>
      <p>Amount: ₹{{ selectedPlan.price }}</p>
      <button @click="initiatePayment" class="pay-btn">Pay Now</button>
    </div>

    <!-- Payment Status Modal -->
    <div v-if="showStatusModal" class="status-modal">
      <div class="modal-content">
        <h3>Checking Payment Status...</h3>
        <p>Please wait while we verify your payment.</p>
        <div class="loader"></div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useStore } from 'vuex';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'PaymentPage',
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const plans = ref([
      { id: 1, name: 'Basic Plan', price: 199, duration: 30 },
      { id: 2, name: 'Standard Plan', price: 499, duration: 90 },
      { id: 3, name: 'Premium Plan', price: 999, duration: 365 }
    ]);

    const selectedPlan = ref(null);
    const showPaymentForm = ref(false);
    const showStatusModal = ref(false);
    const statusCheckInterval = ref(null);

    // Computed properties
    const user = computed(() => store.state.user);
    const isAuthenticated = computed(() => store.state.isAuthenticated);

    onMounted(() => {
      console.log('Payment Component Mounted');
      
      if (!isAuthenticated.value || !user.value) {
        router.push({
          path: '/login',
          query: { redirect: route.fullPath }
        });
        return;
      }

      // Check for pending payments
      checkPendingPayments();

      // Check for plan in route query
      const planType = route.query.plan;
      if (planType) {
        const plan = plans.value.find(p => 
          p.name.toLowerCase().replace(' ', '_') === planType
        );
        if (plan) {
          selectPlan(plan);
        }
      }
    });

    const checkPendingPayments = () => {
      const pendingPayment = localStorage.getItem('pending_payment');
      if (pendingPayment) {
        const payment = JSON.parse(pendingPayment);
        const timeElapsed = new Date().getTime() - payment.timestamp;
        
        // Check if payment was initiated in last 10 minutes
        if (timeElapsed < 600000) {
          showStatusModal.value = true;
          startPaymentStatusCheck(payment.order_id);
        } else {
          localStorage.removeItem('pending_payment');
        }
      }
    };

    const selectPlan = (plan) => {
      console.log('Selected Plan:', plan);
      selectedPlan.value = plan;
      showPaymentForm.value = true;
    };

    const initiatePayment = async () => {
      try {
        console.log('Initiating payment for plan:', selectedPlan.value);
        
        const orderResponse = await axios.post('/api/payment/create-order/', {
          amount: selectedPlan.value.price,
          plan_id: selectedPlan.value.id,
          phone: user.value?.phone
        });

        console.log('Order created:', orderResponse.data);

        // Save order details for recovery
        localStorage.setItem('pending_payment', JSON.stringify({
          order_id: orderResponse.data.order_id,
          plan_id: selectedPlan.value.id,
          amount: selectedPlan.value.price,
          timestamp: new Date().getTime()
        }));

        const options = {
          key: orderResponse.data.key_id,
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency,
          name: 'Your OTT Platform',
          description: `${selectedPlan.value.name} Subscription`,
          order_id: orderResponse.data.order_id,
          handler: handlePaymentSuccess,
          prefill: {
            name: user.value?.name || '',
            email: user.value?.email || '',
            contact: user.value?.phone || ''
          },
          theme: {
            color: '#3399cc'
          },
          modal: {
            ondismiss: function() {
              // Start checking payment status when modal is closed
              startPaymentStatusCheck(orderResponse.data.order_id);
            }
          },
          config: {
            display: {
              blocks: {
                upi: {
                  preferred: true,
                  name: "UPI",
                  instruments: [
                    { targetApp: "phonepe" },
                    { targetApp: "googlePay" },
                    { targetApp: "paytm" },
                    { targetApp: "upi" }
                  ]
                }
              }
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        console.error('Payment initiation failed:', error);
        alert('Unable to initiate payment. Please try again.');
      }
    };

    const startPaymentStatusCheck = async (orderId) => {
      showStatusModal.value = true;
      let attempts = 0;
      const maxAttempts = 10; // 5 minutes (30 seconds * 10)

      const checkStatus = async () => {
        try {
          const response = await axios.get(`/api/payment/check-status/${orderId}/`);
          
          if (response.data.status === 'completed') {
            // Payment successful
            showStatusModal.value = false;
            clearInterval(statusCheckInterval.value);
            localStorage.removeItem('pending_payment');
            
            // Show success message
            alert('Payment successful! Your subscription is now active.');
            router.push('/profile');
            return;
          }
          
          attempts++;
          if (attempts >= maxAttempts) {
            showStatusModal.value = false;
            clearInterval(statusCheckInterval.value);
            alert('Payment status could not be verified. Please contact support.');
          }
        } catch (error) {
          console.error('Status check failed:', error);
        }
      };

      // Check immediately
      await checkStatus();
      
      // Then check every 30 seconds
      statusCheckInterval.value = setInterval(checkStatus, 30000);
    };

    const handlePaymentSuccess = async (response) => {
      try {
        console.log('Payment successful, verifying:', response);
        
        const verifyResponse = await axios.post('/api/payment/verify-payment/', {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          phone: user.value?.phone,
          plan_id: selectedPlan.value.id
        });

        if (verifyResponse.data.status === 'success') {
          localStorage.removeItem('pending_payment');
          alert('Payment successful! Your subscription is now active.');
          router.push('/profile');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        alert('Payment verification failed. Please contact support.');
      }
    };

    // Cleanup on component unmount
    onUnmounted(() => {
      if (statusCheckInterval.value) {
        clearInterval(statusCheckInterval.value);
      }
    });

    return {
      plans,
      selectedPlan,
      showPaymentForm,
      showStatusModal,
      selectPlan,
      initiatePayment
    };
  }
}
</script>

<style scoped>
.payment-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.subscription-plans {
  text-align: center;
}

.plans {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.plan {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
  width: 250px;
}

.plan:hover {
  transform: translateY(-5px);
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #3399cc;
  margin: 10px 0;
}

.duration {
  color: #666;
  margin-bottom: 15px;
}

.select-btn {
  background: #3399cc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  margin-top: 10px;
  cursor: pointer;
  width: 100%;
}

.payment-summary {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.pay-btn {
  background: #3399cc;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 5px;
  width: 100%;
  margin-top: 20px;
  cursor: pointer;
  font-size: 16px;
}

.pay-btn:hover, .select-btn:hover {
  background: #2980b9;
}

/* Status Modal Styles */
.status-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>