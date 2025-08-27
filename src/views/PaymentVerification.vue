<template>
  <div class="payment-verification">
    <div class="verification-container">
      <div v-if="verifying" class="loading">
        <h2>Verifying Payment...</h2>
        <p>Please wait while we confirm your payment.</p>
      </div>
      <div v-else-if="error" class="error">
        <h2>Payment Verification Failed</h2>
        <p>{{ error }}</p>
        <button @click="goToProfile" class="btn">Go to Profile</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'PaymentVerification',
  setup() {
    const router = useRouter();
    const verifying = ref(true);
    const error = ref(null);

    const goToProfile = () => {
      router.push('/profile');
    };

    onMounted(async () => {
      try {
        // Check for payment success in localStorage
        const paymentData = localStorage.getItem('payment_success');
        if (!paymentData) {
          error.value = 'No payment data found. Please try again.';
          verifying.value = false;
          return;
        }

        const { orderId, timestamp } = JSON.parse(paymentData);
        
        // Check if the payment data is not too old (within last 10 minutes)
        const now = new Date().getTime();
        if (now - timestamp > 10 * 60 * 1000) {
          error.value = 'Payment verification timeout. Please contact support.';
          verifying.value = false;
          return;
        }

        try {
          // Verify payment with backend
          const verifyResponse = await axios.post('/api/payment/verify-upi-status/', {
            order_id: orderId
          });

          if (verifyResponse.data.status === 'success') {
            // Clear the payment data from localStorage
            localStorage.removeItem('payment_success');
            // Redirect to profile page after successful verification
            router.push('/profile');
          } else {
            error.value = 'Payment verification failed. Please contact support.';
            verifying.value = false;
          }
        } catch (err) {
          console.error('Payment verification error:', err);
          error.value = 'Failed to verify payment status. Please check your subscription status in profile.';
          verifying.value = false;
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        error.value = 'An error occurred during payment verification. Please contact support.';
        verifying.value = false;
      }
    });

    return {
      verifying,
      error,
      goToProfile
    };
  }
};
</script>

<style scoped>
.payment-verification {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.verification-container {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.loading h2,
.error h2 {
  margin-bottom: 15px;
  color: #333;
}

.loading p,
.error p {
  color: #666;
  margin-bottom: 20px;
}

.btn {
  background: #3399cc;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.btn:hover {
  background: #2980b9;
}
</style>
