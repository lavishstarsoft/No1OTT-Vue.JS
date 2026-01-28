<template>
  <div class="min-h-screen bg-[#121212] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Auto-filled Referral Alert -->
      <div v-if="autoFilledReferral && referralSuccess" 
        class="mb-4 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm flex items-center gap-2">
        <i class="fas fa-info-circle text-green-400"></i>
        <span>Referral code was automatically applied from your invitation link!</span>
      </div>
      <!-- Logo -->
      <div class="text-center mb-8">
        <img src="@/assets/ott.jpg" alt="Logo" class="h-12 mx-auto mb-4">
        <h1 class="text-2xl font-bold text-white">Complete Your Profile</h1>
        <p class="text-white/60 mt-2">Just a few more details to get started</p>
      </div>

      <!-- Mini Registration Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Name Fields -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-white/90 text-sm mb-2">
              First Name <span class="text-[#ff4d4d]">*</span>
            </label>
            <input 
              v-model="form.firstName"
              type="text"
              class="w-full bg-[#1d1d1d] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors"
              :class="{'border-[#ff4d4d]': errors.firstName}"
              required
            />
            <p v-if="errors.firstName" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.firstName }}</p>
          </div>

          <div>
            <label class="block text-white/90 text-sm mb-2">
              Last Name <span class="text-[#ff4d4d]">*</span>
            </label>
            <input 
              v-model="form.lastName"
              type="text"
              class="w-full bg-[#1d1d1d] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors"
              :class="{'border-[#ff4d4d]': errors.lastName}"
              required
            />
            <p v-if="errors.lastName" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.lastName }}</p>
          </div>
        </div>

        <!-- Address Field -->
        <div>
          <label class="block text-white/90 text-sm mb-2">
            City/Village <span class="text-[#ff4d4d]">*</span>
          </label>
          <input 
            v-model="form.address"
            class="w-full bg-[#1d1d1d] border border-white/10 rounded-lg p-4 text-white focus:border-[#c30059] focus:outline-none transition-colors h-13 resize-none"
            :class="{'border-[#ff4d4d]': errors.address}"
            placeholder="City or village name"
            required
          >
          <p v-if="errors.address" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.address }}</p>
        </div>

        <!-- Referral Code (Optional) -->
        <div>
          <label class="block text-white/90 text-sm mb-2">
            Referral Phone Number<span class="text-gray-400">(Optional)</span>
          </label>
          <div class="flex gap-2">
            <input
              v-model="form.referralCode"
              ref="referralField"
              type="text"
              class="w-full bg-[#1d1d1d] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors uppercase"
              :class="{'border-[#ff4d4d]': errors.referralCode, 'border-green-500': autoFilledReferral}"
              placeholder="Enter Referral phone number"
              autocomplete="off"
            />
            <button
              type="button"
              @click="verifyReferralCode"
              :disabled="!form.referralCode || isVerifyingReferral"
              class="bg-[#c30059] text-white px-4 rounded-lg h-12 font-semibold hover:bg-[#ff4d4d] transition-colors disabled:opacity-50"
            >
              <span v-if="!isVerifyingReferral">Verify</span>
              <span v-else>
                <i class="fas fa-spinner fa-spin"></i>
              </span>
            </button>
          </div>
          <p v-if="errors.referralCode" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.referralCode }}</p>
          <p v-if="referralSuccess" class="mt-1 text-green-500 text-sm flex items-center gap-1">
            <i class="fas fa-check-circle"></i> Valid referral code {{ autoFilledReferral ? '(Auto-filled from link)' : '' }}
          </p>
          <p v-if="referralError" class="mt-1 text-[#ff4d4d] text-sm flex items-center gap-1">
            <i class="fas fa-times-circle"></i> {{ referralError }}
          </p>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-[#c30059] to-[#ff4d4d] text-white py-4 rounded-lg font-medium text-lg hover:opacity-90 transition-opacity disabled:opacity-50 relative"
        >
          <span v-if="!isLoading">Complete Registration</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'MiniRegistration',
  
  setup() {
    const isLoading = ref(false)
    const isVerifyingReferral = ref(false)
    const referralSuccess = ref(false)
    const referralError = ref('')
    const referralField = ref(null)
    const autoFilledReferral = ref(false)

    const form = reactive({
      firstName: '',
      lastName: '',
      address: '',
      referralCode: ''
    })

    const errors = reactive({
      firstName: '',
      lastName: '',
      address: '',
      referralCode: ''
    })

    const validateForm = () => {
      let isValid = true
      
      // Reset errors
      Object.keys(errors).forEach(key => errors[key] = '')

      if (!form.firstName.trim()) {
        errors.firstName = 'First name is required'
        isValid = false
      }

      if (!form.lastName.trim()) {
        errors.lastName = 'Last name is required'
        isValid = false
      }

      if (!form.address.trim()) {
        errors.address = 'Address is required'
        isValid = false
      }

      // In validateForm, referralCode is optional, so no validation needed

      return isValid
    }

    const verifyReferralCode = async () => {
      if (!form.referralCode) return
      isVerifyingReferral.value = true
      referralSuccess.value = false
      referralError.value = ''
      errors.referralCode = ''

      try {
        // Check if the referral code is a phone number or a referral code
        const codeToVerify = form.referralCode.trim().toUpperCase()
        console.log('Verifying referral code:', codeToVerify, 'Auto-filled:', autoFilledReferral.value)
        
        const response = await fetch(`https://ott.no1news.in/users/verify-referral/?code=${codeToVerify}`, {
          headers: {
            'Accept': 'application/json'
          }
        })
        const result = await response.json()
        if (result.status === 'success') {
          referralSuccess.value = true
          referralError.value = ''
          console.log('Referral code verification successful')
        } else {
          referralSuccess.value = false
          referralError.value = 'Invalid referral code'
          console.log('Referral code verification failed:', result)
          // Only reset autoFilledReferral if this was not an auto-filled verification
          // This prevents the green highlight from disappearing if auto-verification fails
          if (!autoFilledReferral.value) {
            autoFilledReferral.value = false
          }
        }
      } catch (err) {
        console.error('Error verifying referral code:', err)
        referralSuccess.value = false
        referralError.value = 'Error verifying referral code'
        // Only reset autoFilledReferral if this was not an auto-filled verification
        if (!autoFilledReferral.value) {
          autoFilledReferral.value = false
        }
      } finally {
        isVerifyingReferral.value = false
      }
    }

    // Function to check URL for referral code and auto-fill
    const checkUrlForReferral = async () => {
      // Get the URL parameters - handle both normal query params and hash params
      let refCode = null
      
      // First check normal query params
      const urlParams = new URLSearchParams(window.location.search)
      refCode = urlParams.get('ref')
      
      // If not found, check hash params (after #)
      if (!refCode && window.location.hash) {
        const hashParts = window.location.hash.split('?')
        if (hashParts.length > 1) {
          const hashParams = new URLSearchParams(hashParts[1])
          refCode = hashParams.get('ref')
        }
      }
      
      // Also check localStorage for referral code that might have been saved during login
      if (!refCode) {
        refCode = localStorage.getItem('referralCode')
      }
      
      if (refCode) {
        console.log('Found referral code:', refCode)
        form.referralCode = refCode
        autoFilledReferral.value = true
        // Auto verify the referral code
        await verifyReferralCode()
      }
    }
    
    // Call this function when component is mounted
    onMounted(() => {
      checkUrlForReferral()
    })
    
    const handleSubmit = async () => {
      if (!validateForm()) return

      // If referral code is entered, must be verified
      if (form.referralCode && !referralSuccess.value) {
        errors.referralCode = 'Please verify the referral code first'
        return
      }

      isLoading.value = true

      try {
        // Get CSRF token and phone
        const csrfToken = localStorage.getItem('csrfToken')
        const phone = localStorage.getItem('phone')

        // Clear the referral code from localStorage after it's been used
        // This prevents it from being applied to future registrations
        localStorage.removeItem('referralCode')

        if (!phone) {
          throw new Error('Phone number is required. Please login again.')
        }

        // Make registration request with proper headers
        const response = await fetch('https://ott.no1news.in/users/complete-registration/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRFToken': csrfToken,
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'include',
          body: JSON.stringify({
            first_name: form.firstName,
            last_name: form.lastName,
            address: form.address,
            phone: phone,
            ...(form.referralCode ? { referral_code: form.referralCode.trim().toUpperCase() } : {})
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Registration failed')
        }

        // Update stored user data if available
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user))
        }
        // Update CSRF token if provided
        if (result.csrf_token) {
          localStorage.setItem('csrfToken', result.csrf_token)
        }

        // Mark registration as completed
        localStorage.setItem('hasCompletedRegistration', 'true')

        // Update user data in Vuex store
        try {
          const userResponse = await fetch(`https://ott.no1news.in/users/profile/?phone=${phone}`, {
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include'
          })
          const userData = await userResponse.json()
          if (userData && userData.status === 'success') {
            localStorage.setItem('user', JSON.stringify(userData.user))
          }
        } catch (error) {
          console.error('Error updating user data:', error)
        }

        // Store success message for home page
        localStorage.setItem('registrationSuccess', 'true')
        localStorage.setItem('registrationMessage', 'Registration completed successfully!')

        // Get the URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const redirectPath = urlParams.get('redirect')

        // Force navigation to home page or redirect path
        if (redirectPath && redirectPath !== '/mini-register') {
          window.location.href = redirectPath
        } else {
          window.location.href = '/'
        }

      } catch (error) {
        console.error('Registration error:', error)
        // Handle API errors
        if (error.response?.data) {
          const serverErrors = error.response.data;
          Object.keys(serverErrors).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(errors, key)) {
              errors[key] = serverErrors[key][0];
            }
          });
          // Handle referral_code error if present
          if (serverErrors.referral_code && errors.referralCode !== undefined) {
            errors.referralCode = serverErrors.referral_code[0];
          }
        }
      } finally {
        isLoading.value = false
      }
    }

    return {
      form,
      errors,
      isLoading,
      handleSubmit,
      isVerifyingReferral,
      referralSuccess,
      referralError,
      verifyReferralCode,
      referralField,
      autoFilledReferral
    }
  }
}
</script>