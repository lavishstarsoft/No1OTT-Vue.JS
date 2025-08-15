<template>
  <div class="min-h-screen bg-[#121212] text-white">
    <!-- Back Navigation -->
    <div class="px-4 py-6">
      <router-link to="/plans" class="flex items-center gap-2 text-white/80 hover:text-white">
        <i class="fas fa-arrow-left"></i>
        <span>Back to Plans</span>
      </router-link>
    </div>

    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-8">Complete Your Purchase</h1>

      <!-- Order Summary -->
      <div class="bg-[#1d1d1d] rounded-2xl p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
        <div class="flex justify-between items-center py-3 border-b border-white/10">
          <div>
            <p class="font-medium">{{ planDetails.name }}</p>
            <p class="text-sm text-white/60">{{ planDetails.duration }} subscription</p>
          </div>
          <p class="text-xl font-bold">₹{{ planDetails.amount }}</p>
        </div>
        <div class="flex justify-between items-center py-3 border-b border-white/10">
          <p>GST (18%)</p>
          <p class="font-medium">₹{{ gstAmount }}</p>
        </div>
        <div class="flex justify-between items-center py-4 mt-2">
          <p class="text-lg font-bold">Total Amount</p>
          <p class="text-2xl font-bold text-[#c30059]">₹{{ totalAmount }}</p>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="bg-[#1d1d1d] rounded-2xl p-6">
        <h2 class="text-xl font-semibold mb-4">Select Payment Method</h2>
        
        <!-- UPI Section -->
        <div class="mb-6">
          <button 
            @click="selectedMethod = 'upi'"
            class="w-full flex items-center justify-between p-4 rounded-lg"
            :class="selectedMethod === 'upi' ? 'bg-[#c30059]/10 border-[#c30059]' : 'bg-white/5 border-transparent'"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <i class="fas fa-mobile-alt text-xl"></i>
              </div>
              <div>
                <p class="font-medium">UPI</p>
                <p class="text-sm text-white/60">Pay using any UPI app</p>
              </div>
            </div>
            <div class="w-6 h-6 rounded-full border-2"
              :class="selectedMethod === 'upi' ? 'border-[#c30059] bg-[#c30059]' : 'border-white/30'"
            >
              <i v-if="selectedMethod === 'upi'" class="fas fa-check text-white text-xs"></i>
            </div>
          </button>
        </div>

        <!-- Cards Section -->
        <div class="mb-6">
          <button 
            @click="selectedMethod = 'card'"
            class="w-full flex items-center justify-between p-4 rounded-lg"
            :class="selectedMethod === 'card' ? 'bg-[#c30059]/10 border-[#c30059]' : 'bg-white/5 border-transparent'"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <i class="fas fa-credit-card text-xl"></i>
              </div>
              <div>
                <p class="font-medium">Credit/Debit Card</p>
                <p class="text-sm text-white/60">All major cards accepted</p>
              </div>
            </div>
            <div class="w-6 h-6 rounded-full border-2"
              :class="selectedMethod === 'card' ? 'border-[#c30059] bg-[#c30059]' : 'border-white/30'"
            >
              <i v-if="selectedMethod === 'card'" class="fas fa-check text-white text-xs"></i>
            </div>
          </button>
        </div>

        <!-- Net Banking Section -->
        <div class="mb-6">
          <button 
            @click="selectedMethod = 'netbanking'"
            class="w-full flex items-center justify-between p-4 rounded-lg"
            :class="selectedMethod === 'netbanking' ? 'bg-[#c30059]/10 border-[#c30059]' : 'bg-white/5 border-transparent'"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <i class="fas fa-university text-xl"></i>
              </div>
              <div>
                <p class="font-medium">Net Banking</p>
                <p class="text-sm text-white/60">All major banks supported</p>
              </div>
            </div>
            <div class="w-6 h-6 rounded-full border-2"
              :class="selectedMethod === 'netbanking' ? 'border-[#c30059] bg-[#c30059]' : 'border-white/30'"
            >
              <i v-if="selectedMethod === 'netbanking'" class="fas fa-check text-white text-xs"></i>
            </div>
          </button>
        </div>

        <!-- Pay Button -->
        <button 
          @click="processPayment"
          class="w-full py-4 px-6 bg-gradient-to-r from-[#c30059] to-[#ff4d4d] text-white font-bold rounded-lg hover:opacity-90 transition-opacity mt-6"
          :disabled="!selectedMethod"
        >
          Pay ₹{{ totalAmount }}
        </button>

        <!-- Secure Payment Note -->
        <div class="flex items-center justify-center gap-2 mt-4 text-sm text-white/60">
          <i class="fas fa-lock"></i>
          <span>Secure payment powered by Razorpay</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentPage',
  data() {
    return {
      selectedMethod: '',
      planDetails: {
        name: '',
        amount: 0,
        duration: ''
      }
    }
  },
  computed: {
    gstAmount() {
      return Math.round(this.planDetails.amount * 0.18);
    },
    totalAmount() {
      return this.planDetails.amount + this.gstAmount;
    }
  },
  methods: {
    processPayment() {
      // Here you would integrate with your payment gateway
      console.log('Processing payment with:', {
        method: this.selectedMethod,
        amount: this.totalAmount,
        plan: this.planDetails
      });
    }
  },
  created() {
    // Get plan details from route query parameters
    const { plan, amount, duration } = this.$route.query;
    this.planDetails = {
      name: plan,
      amount: parseInt(amount) || 0,
      duration: duration
    };
  }
}
</script> 