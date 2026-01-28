<template>
  <div class="min-h-screen bg-[#121212] flex items-center justify-center px-4">
    <!-- Back Button -->
    <router-link 
      v-if="!showOTP" 
      to="/" 
      class="absolute top-6 left-6 text-white/70 hover:text-white"
    >
      <i class="fas fa-arrow-left text-xl"></i>
    </router-link>
    <button 
      v-else 
      @click="handleBack" 
      class="absolute top-6 left-6 text-white/70 hover:text-white"
    >
      <i class="fas fa-arrow-left text-xl"></i>
    </button>

    <!-- Main Content -->
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-12">
        <img src="@/assets/ott.jpg" alt="Logo" class="h-12 mx-auto mb-8">
        <h1 class="text-[2.5rem] font-bold text-white leading-tight">
          LET'S GET STARTED<span class="text-[#c30059]">.</span>
        </h1>
      </div>

      <!-- Login Form -->
      <div class="space-y-6">
        <!-- Mobile Number Input -->
        <div v-if="!showOTP">
          <label class="block text-white/90 text-sm mb-2">Mobile Number</label>
          <div class="flex items-center bg-[#1d1d1d] rounded-lg overflow-hidden"
               :class="phoneInputStyle">
            <div class="flex items-center px-3 border-r border-white/10 h-14">
              <img src="@/assets/posters/india-flag.png" alt="India" class="w-6 h-4">
              <span class="text-white ml-2">+91</span>
            </div>
            <input 
              type="tel"
              v-model="phoneNumber"
              class="flex-1 bg-transparent text-white h-14 px-4 focus:outline-none"
              :class="{
                'shake-animation': showPhoneError,
                'text-[#4CAF50]': phoneNumber.length === 10 && !phoneError
              }"
              placeholder="Enter your mobile number"
              maxlength="10"
              @input="handlePhoneInput"
            />
            <!-- Success Icon -->
            <div v-if="phoneNumber.length === 10 && !phoneError" 
                 class="pr-4 text-[#4CAF50]">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
          <!-- Phone Error Message -->
          <transition name="fade">
            <p v-if="phoneError" class="mt-2 text-[#ff4d4d] text-sm flex items-center">
              <i class="fas fa-exclamation-circle mr-2"></i>
              {{ phoneError }}
            </p>
          </transition>
        </div>

        <!-- OTP Input Section -->
        <div v-if="showOTP" class="space-y-4">
          <div class="text-center">
            <h2 class="text-white text-xl font-medium mb-2">Enter Verification Code</h2>
            <p class="text-white/60 text-sm">
              We've sent a 4-digit code to +91 {{ phoneNumber }}
              <button @click="showOTP = false" class="text-[#c30059] ml-2 hover:text-[#ff4d4d]">
                Change
              </button>
            </p>
          </div>
          
          <div class="flex flex-col items-center">
            <div class="flex justify-center space-x-4 my-8">
              <template v-for="(digit, index) in 4" :key="index">
                <input
                  type="text"
                  v-model="otpDigits[index]"
                  @input="handleOtpInput($event, index)"
                  @keydown="handleKeydown($event, index)"
                  @paste="handlePaste"
                  maxlength="1"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  :id="index === 0 ? 'otp-input' : ''"
                  :class="[
                    'w-14 h-14 bg-[#1d1d1d] border rounded-lg text-center text-white text-2xl font-medium focus:outline-none transition-all',
                    otpError ? 'border-[#ff4d4d] shake-animation' : 'border-white/10 focus:border-[#c30059]'
                  ]"
                  :ref="'otpInput' + index"
                />
              </template>
            </div>
            
            <!-- OTP Error Message -->
            <transition name="fade">
              <p v-if="otpError" class="mt-2 text-[#ff4d4d] text-sm flex items-center">
                <i class="fas fa-exclamation-circle mr-2"></i>
                {{ otpError }}
              </p>
            </transition>
          </div>

          <div class="text-center">
            <p class="text-white/60 text-sm">
              Didn't receive the code?
              <button 
                @click="resendOTP" 
                :disabled="resendTimer > 0"
                class="text-[#c30059] ml-1 hover:text-[#ff4d4d] disabled:opacity-50"
              >
                {{ resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend' }}
              </button>
            </p>
          </div>
        </div>

        <!-- Proceed/Verify Button -->
        <button 
          @click="handleLogin"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-[#c30059] to-[#ff4d4d] text-white py-4 rounded-lg font-medium text-lg hover:opacity-90 transition-opacity disabled:opacity-50 relative"
        >
          <span v-if="!isLoading">{{ showOTP ? 'Verify' : 'Proceed' }}</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </span>
        </button>

        <!-- Terms & Privacy Section -->
        <div class="mt-6" v-if="!showOTP">
          <div class="flex items-start space-x-3 bg-[#1d1d1d] p-4 rounded-lg border border-white/10">
            <div class="flex-shrink-0 mt-1">
              <input 
                type="checkbox" 
                id="terms-consent"
                v-model="termsAccepted"
                class="w-4 h-4 rounded border-white/30 bg-transparent checked:bg-[#c30059] checked:border-[#c30059] focus:ring-[#c30059] focus:ring-offset-0 focus:ring-offset-transparent transition-all cursor-pointer"
              >
            </div>
            <div class="flex-grow">
              <label for="terms-consent" class="block text-white/80 text-sm leading-relaxed cursor-pointer">
                I agree to the 
                <a 
                  @click.prevent="showTermsModal = true" 
                  href="#" 
                  class="text-[#c30059] hover:text-[#ff4d4d] underline decoration-dotted underline-offset-2 font-medium transition-colors"
                >
                  Terms & Conditions
                </a> 
                and 
                <a 
                  @click.prevent="showPrivacyModal = true" 
                  href="#" 
                  class="text-[#c30059] hover:text-[#ff4d4d] underline decoration-dotted underline-offset-2 font-medium transition-colors"
                >
                  Privacy Policy
                </a>
              </label>
              <p class="mt-1 text-white/50 text-xs">
                Your privacy matters to us. Read how we handle your data.
              </p>
            </div>
          </div>
          <!-- Error message -->
          <p v-if="showTermsError" class="mt-2 text-[#ff4d4d] text-sm flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            Please accept the terms to continue
          </p>
        </div>
      </div>
    </div>

    <!-- Cookie Notice -->
    
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      phoneNumber: '',
      phoneError: '',
      showPhoneError: false,
      showCookieNotice: true,
      showOTP: false,
      otpDigits: ['', '', '', ''],
      resendTimer: 0,
      timerInterval: null,
      termsAccepted: false,
      showTermsError: false,
      showTermsModal: false,
      showPrivacyModal: false,
      isLoading: false,
      apiBaseUrl: 'https://ott.no1news.in',
      referralCode: '',
      otpError: '',
      smsReceiver: null
    }
  },
  methods: {
    // Get CSRF token from cookie
    getCSRFToken() {
      const name = 'csrftoken';
      let cookieValue = null;
      if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    },

    validatePhoneNumber() {
      // Remove any non-digit characters
      let cleanedNumber = this.phoneNumber.replace(/\D/g, '');
      
      // If user entered 12 digits and starts with 91, remove country code
      if (cleanedNumber.length === 12 && cleanedNumber.startsWith('91')) {
        cleanedNumber = cleanedNumber.substring(2);
      }
      
      // Update the phone number field with cleaned number
      this.phoneNumber = cleanedNumber;
      
      if (cleanedNumber.length === 0) {
        this.phoneError = '';  // Don't show error for empty field
        return false;
      } else if (cleanedNumber.length !== 10) {
        this.phoneError = cleanedNumber.length > 0 ? 'Please enter a valid 10-digit mobile number' : '';
        return false;
      } else if (!/^[6-9]\d{9}$/.test(cleanedNumber)) {
        this.phoneError = 'Please enter a valid Indian mobile number';
        return false;
      }
      
      this.phoneError = '';
      return true;
    },
    clearLoginPageData() {
      console.log('Clearing login page data');
      
      // Clear specific login-related items
      const itemsToRemove = [
        'registrationSuccess', 'registrationMessage',
        'loginSuccess', 'loginMessage',
        'hasCompletedRegistration', 'app_version'
      ];
      
      itemsToRemove.forEach(item => {
        localStorage.removeItem(item);
        sessionStorage.removeItem(item);
      });
      
      // Clear any pending payment data
      localStorage.removeItem('pending_payment');
      sessionStorage.removeItem('pending_payment');
      
      console.log('Login page data cleared');
    },

    // Handle input formatting as user types
    handlePhoneInput(event) {
      let value = event.target.value.replace(/\D/g, '');
      
      // If user entered 12 digits and starts with 91, remove country code
      if (value.length === 12 && value.startsWith('91')) {
        value = value.substring(2);
      }
      
      // Limit to 10 digits
      if (value.length > 10) {
        value = value.substring(0, 10);
      }
      
      this.phoneNumber = value;
      this.validatePhoneNumber();  // Validate on each input
    },

    async handleLogin() {
      if (!this.showOTP) {
        // Clear any previous errors
        this.phoneError = '';
        this.showTermsError = false;

        // Validate phone number first
        if (!this.validatePhoneNumber()) {
          this.showPhoneError = true;
          const inputField = document.querySelector('input[type="tel"]');
          inputField.classList.add('shake-animation');
          setTimeout(() => {
            this.showPhoneError = false;
            inputField.classList.remove('shake-animation');
          }, 650);
          return;
        }

        if (!this.termsAccepted) {
          this.showTermsError = true;
          const termsBox = document.querySelector('#terms-consent').parentElement.parentElement;
          termsBox.classList.add('shake-animation');
          setTimeout(() => {
            termsBox.classList.remove('shake-animation');
          }, 650);
          return;
        }

        // Request OTP
        try {
          this.isLoading = true;
          const response = await fetch(`${this.apiBaseUrl}/users/request-otp/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-CSRFToken': this.getCSRFToken()
            },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({
              phone: this.phoneNumber,
              otp_type: 'login'
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || 'Failed to send OTP';
            } catch (e) {
              errorMessage = 'Server error. Please try again.';
            }
            throw new Error(errorMessage);
          }

          await response.json(); // Just consume the response
          this.showOTP = true;
          this.startOTPDetection(); // Start OTP detection
          this.startResendTimer();
          // Focus on first OTP input
          this.$nextTick(() => {
            const firstInput = this.$refs.otpInput0[0];
            firstInput.focus();
            
            // Try to show virtual keyboard on mobile
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
              firstInput.click();
            }
          });
        } catch (error) {
          console.error('Error requesting OTP:', error);
          this.phoneError = error.message || 'Network error. Please check your connection.';
          this.showPhoneError = true;
        } finally {
          this.isLoading = false;
        }
      } else {
        // Verify OTP
        const otp = this.otpDigits.join('');
        if (otp.length === 4) {
          try {
            this.isLoading = true;
            this.otpError = ''; // Clear previous errors
            
            const response = await fetch(`${this.apiBaseUrl}/users/login/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
              },
              credentials: 'include',
              mode: 'cors',
              body: JSON.stringify({
                phone: this.phoneNumber,
                otp: otp,
                ref: this.referralCode
              })
            });

            if (!response.ok) {
              const errorText = await response.text();
              let errorMessage;
              try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || 'Invalid OTP';
              } catch (e) {
                errorMessage = 'Invalid OTP. Please try again.';
              }
              throw new Error(errorMessage);
            }

            const userData = await response.json();
            
            // Store user data and tokens
            localStorage.setItem('user', JSON.stringify(userData.user));
            localStorage.setItem('csrfToken', userData.csrf_token);
            localStorage.setItem('phone', this.phoneNumber);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('token', userData.csrf_token);
            
            const user = userData.user;
            
            // Check if user has completed basic registration
            if (user.first_name && user.last_name && user.state && user.district) {
              localStorage.setItem('hasCompletedRegistration', 'true');
              const userName = user.first_name || 'User';
              localStorage.setItem('loginSuccess', 'true');
              localStorage.setItem('loginMessage', `Welcome back, ${userName}! 👋`);
              // Redirect to home or saved redirect path
              const redirect = this.$route.query.redirect || '/';
              await this.$router.push(redirect);
            } else {
              localStorage.setItem('hasCompletedRegistration', 'false');
              // Redirect to mini registration
              await this.$router.push('/mini-register');
            }
          } catch (error) {
            console.error('Login Error:', error);
            this.otpError = error.message;
            
            // Add shake animation to OTP inputs
            const inputs = Array.from({ length: 4 }, (_, i) => this.$refs['otpInput' + i][0]);
            inputs.forEach(input => {
              input.classList.add('shake-animation');
              setTimeout(() => input.classList.remove('shake-animation'), 650);
            });
            
            // Clear OTP fields and focus on first input
            this.otpDigits = ['', '', '', ''];
            this.$refs.otpInput0[0].focus();
          } finally {
            this.isLoading = false;
          }
        }
      }
    },

    async resendOTP() {
      if (this.resendTimer > 0) return;

      try {
        this.isLoading = true;
        await fetch(`${this.apiBaseUrl}/users/request-otp/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRFToken': this.getCSRFToken()
          },
          credentials: 'include',
          mode: 'cors',
          body: JSON.stringify({
            phone: this.phoneNumber,
            otp_type: 'login'
          })
        });

        // Start resend timer and clear OTP fields
        this.startResendTimer();
        this.otpDigits = ['', '', '', ''];
        this.otpError = '';
        this.$refs.otpInput0[0].focus();
      } catch (error) {
        console.error('Error resending OTP:', error);
        this.otpError = 'Failed to resend OTP. Please try again.';
      } finally {
        this.isLoading = false;
      }
    },

    handleOtpInput(event, index) {
      this.clearOtpError(); // Clear error when user starts typing
      const value = event.target.value;
      // Only allow numbers
      if (!/^\d*$/.test(value)) {
        event.target.value = '';
        return;
      }
      
      this.otpDigits[index] = value;
      
      // Move to next input if value is entered
      if (value && index < 3) {
        this.$refs['otpInput' + (index + 1)][0].focus();
      }

      // Check if all digits are filled
      if (this.otpDigits.every(digit => digit !== '')) {
        // Auto verify after a short delay
        setTimeout(() => {
          this.handleLogin();
        }, 300);
      }
    },

    handleKeydown(event, index) {
      // Handle backspace
      if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
        this.$refs['otpInput' + (index - 1)][0].focus();
      }
    },

    handlePaste(event) {
      event.preventDefault();
      const pastedData = event.clipboardData.getData('text');
      const numbers = pastedData.match(/\d/g);
      
      if (numbers) {
        // Clear existing OTP digits
        this.otpDigits = ['', '', '', ''];
        
        // Fill in the pasted numbers
        numbers.slice(0, 4).forEach((num, index) => {
          if (index < 4) {
            this.otpDigits[index] = num;
            if (this.$refs['otpInput' + index]) {
              this.$refs['otpInput' + index][0].value = num;
            }
          }
        });

        // Focus on the next empty input or the last input if all filled
        const emptyIndex = this.otpDigits.findIndex(digit => !digit);
        const focusIndex = emptyIndex === -1 ? 3 : emptyIndex;
        this.$refs['otpInput' + focusIndex][0].focus();

        // If all digits are filled, trigger verification
        if (this.otpDigits.every(digit => digit !== '')) {
          setTimeout(() => {
            this.handleLogin();
          }, 300);
        }
      }
    },

    setupSMSRetrieval() {
      try {
        if (!this.smsReceiver && 'OTPCredential' in window) {
          const ac = new AbortController();
          navigator.credentials.get({
            otp: { transport:['sms'] },
            signal: ac.signal
          }).then(otp => {
            if (otp && otp.code) {
              const otpValue = otp.code;
              // Fill in OTP digits
              for (let i = 0; i < Math.min(otpValue.length, 4); i++) {
                this.otpDigits[i] = otpValue[i];
                if (this.$refs['otpInput' + i]) {
                  this.$refs['otpInput' + i][0].value = otpValue[i];
                }
              }
              // Auto verify if complete
              if (this.otpDigits.every(digit => digit !== '')) {
                setTimeout(() => this.handleLogin(), 300);
              }
            }
          }).catch(err => {
            console.log('SMS Retrieval Error:', err);
          });

          this.smsReceiver = ac;
        }
      } catch (error) {
        console.log('SMS Setup Error:', error);
      }
    },

    startOTPDetection() {
      // Clean up any existing receiver
      if (this.smsReceiver) {
        this.smsReceiver.abort();
        this.smsReceiver = null;
      }

      // Setup new SMS retrieval
      this.setupSMSRetrieval();

      // Add format hint for browsers
      const input = document.getElementById('otp-input');
      if (input) {
        input.addEventListener('focus', () => {
          if ('OTPCredential' in window) {
            navigator.credentials.get({
              otp: { transport:['sms'] },
              signal: this.smsReceiver?.signal
            }).catch(() => {});
          }
        });
      }
    },

    startResendTimer() {
      this.resendTimer = 30;
      this.timerInterval = setInterval(() => {
        if (this.resendTimer > 0) {
          this.resendTimer--;
        } else {
          clearInterval(this.timerInterval);
        }
      }, 1000);
    },

    closeCookieNotice() {
      this.showCookieNotice = false;
    },

    handleBack() {
      // Clear OTP related data
      this.showOTP = false;
      this.otpDigits = ['', '', '', ''];
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.resendTimer = 0;
      }
    },

    beforeDestroy() {
      // Clean up SMS receiver
      if (this.smsReceiver) {
        this.smsReceiver.abort();
        this.smsReceiver = null;
      }
      
      // Clean up timer
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
    },

    // Add method to clear OTP error
    clearOtpError() {
      this.otpError = '';
    }
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  },
  async created() {
    console.log('Component created - Starting initialization');
    
    // Clear any existing data on login page load
    this.clearLoginPageData();
    
    try {
        // Get phone number and token from query params or localStorage
        this.phoneNumber = this.$route.query.phone || localStorage.getItem('phone') || '';
        
        // Get referral code from URL if present - check both query params and hash params
          const urlParams = new URLSearchParams(window.location.search);
          let referralFromUrl = urlParams.get('ref');
          
          // If not found, check hash params (after #)
          if (!referralFromUrl && window.location.hash) {
            const hashParts = window.location.hash.split('?');
            if (hashParts.length > 1) {
              const hashParams = new URLSearchParams(hashParts[1]);
              referralFromUrl = hashParams.get('ref');
            }
          }
          
          this.referralCode = referralFromUrl || '';
          
          // Store referral code in localStorage if present
          if (this.referralCode) {
            localStorage.setItem('referralCode', this.referralCode);
          }
        
        // Try to get token from multiple sources
        const token = this.$route.query.token || 
                    localStorage.getItem('token') || 
                    localStorage.getItem('csrfToken') ||
                    (localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).token);
        
        console.log('Initial token:', token);

        // Only show error if we have both phone and token but they're invalid
        if (this.$route.query.phone && !this.phoneNumber) {
            console.error('Invalid phone number');
            this.phoneError = 'Invalid phone number. Please try again.';
        }

        if (this.$route.query.token && !token) {
            console.error('Invalid token');
            this.phoneError = 'Authentication failed. Please try again.';
        }

        // Store token if not already stored
        if (token) {
            localStorage.setItem('token', token);
        }

        // Get referral code from URL if present - check both query params and hash params
        let refCode = null;
        
        // First check normal query params
        const queryParams = new URLSearchParams(window.location.search);
        refCode = queryParams.get('ref');
        
        // If not found, check hash params (after #)
        if (!refCode && window.location.hash) {
          const hashParts = window.location.hash.split('?');
          if (hashParts.length > 1) {
            const hashParams = new URLSearchParams(hashParts[1]);
            refCode = hashParams.get('ref');
          }
        }
        
        this.referralCode = refCode || '';
        
        // Store referral code in localStorage if present
        if (this.referralCode) {
          localStorage.setItem('referralCode', this.referralCode);
        }

        // Validate phone number if it exists
        if (this.phoneNumber) {
            this.validatePhoneNumber();
        }
    } catch (error) {
        console.error('Error in component creation:', error);
        // Don't show error message for normal initialization
        if (error.message !== 'Failed to fetch') {
            console.error('Unexpected error:', error);
        }
    }
  },
  watch: {
    // Add watcher for phone number to validate in real-time
    phoneNumber: {
      handler(newValue) {
        if (newValue) {
          this.validatePhoneNumber();
        } else {
          this.phoneError = '';
        }
      },
      immediate: true
    }
  },
  computed: {
    // Add computed property for input styling
    phoneInputStyle() {
      if (this.phoneNumber.length === 10 && !this.phoneError) {
        return 'border-[#4CAF50] text-[#4CAF50]';
      } else if (this.phoneError) {
        return 'border-[#ff4d4d]';
      }
      return 'border-white/10';
    }
  }
}
</script>

<style scoped>
/* Custom styles */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

/* Placeholder color */
::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* Focus styles */
input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(195, 0, 89, 0.2);
}

/* OTP input animations */
input {
  transition: all 0.3s ease;
}

input:focus {
  transform: scale(1.05);
}

/* Checkbox custom styles */
input[type="checkbox"] {
  @apply rounded border-white/30 bg-transparent;
}

input[type="checkbox"]:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
}

/* Shake animation for terms error */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

.shake-animation {
  animation: shake 0.65s cubic-bezier(.36,.07,.19,.97) both;
}

/* Terms box hover effect */
.bg-[#1d1d1d]:hover {
  @apply border-white/20 transition-all duration-300;
}

/* Fade transition for error messages */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Input error state */
input.shake-animation {
  animation: shake 0.65s cubic-bezier(.36,.07,.19,.97) both;
}

/* Loading spinner styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #c30059;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>