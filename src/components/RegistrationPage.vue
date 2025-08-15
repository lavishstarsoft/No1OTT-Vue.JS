<template>
  <div class="min-h-screen bg-[#121212] flex items-center justify-center px-4 py-10">
    <!-- Back Button -->
    <button 
      @click="$router.push('/home')"
      class="absolute top-6 left-6 text-white/70 hover:text-white"
    >
      <i class="fas fa-arrow-left text-xl"></i>
    </button>

    <!-- Main Content -->
    <div class="w-full max-w-4xl">
      <!-- Logo -->
      <div class="text-center mb-8">
        <img src="@/assets/ott.jpg" alt="Logo" class="h-12 mx-auto mb-4">
        <h1 class="text-2xl font-bold text-white">Complete Your Profile</h1>
        <p class="text-white/60 mt-2">Please fill in your details to continue</p>
      </div>

      <!-- Registration Form -->
      <div class="bg-[#1d1d1d] rounded-xl p-6 md:p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6" novalidate>
          <!-- Personal Information Section -->
          <div class="space-y-6">
            <h3 class="text-xl font-semibold text-[#c30059] border-b border-[#c30059] pb-2">
              Personal Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- First Name -->
              <div>
                <label class="block text-white/90 text-sm mb-2">
                  First name <span class="text-[#ff4d4d]">*</span>
                </label>
                <input 
                  v-model="form.firstName"
                  type="text"
                  class="w-full bg-[#121212] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors"
                  :class="{'border-[#ff4d4d]': errors.firstName}"
                />
                <p v-if="errors.firstName" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.firstName }}</p>
              </div>

              <!-- Last Name -->
              <div>
                <label class="block text-white/90 text-sm mb-2">
                  Last name <span class="text-[#ff4d4d]">*</span>
                </label>
                <input 
                  v-model="form.lastName"
                  type="text"
                  class="w-full bg-[#121212] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors"
                  :class="{'border-[#ff4d4d]': errors.lastName}"
                />
                <p v-if="errors.lastName" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.lastName }}</p>
              </div>

              <!-- Email (Full Width) -->
              <div class="md:col-span-2">
                <label class="block text-white/90 text-sm mb-2">
                  Email Address <span class="text-gray-500">(Optional)</span>
                </label>
                <input 
                  v-model="form.email"
                  type="email"
                  class="w-full bg-[#121212] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors"
                  :class="{'border-[#ff4d4d]': errors.email}"
                  placeholder="Enter your email (optional)"
                />
                <p v-if="errors.email" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.email }}</p>
              </div>

              <!-- Referral Code Field -->
              <div class="space-y-2 md:col-span-2">
                <label class="block text-sm font-medium text-gray-300">
                  Referral Code <span class="text-gray-500">(Optional)</span>
                </label>
                <div class="flex gap-4">
                  <div class="relative flex-1">
                    <input
                      v-model="form.referralCode"
                      type="text"
                      class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white uppercase"
                      placeholder="Enter referral code"
                      :disabled="isValidatingReferral || referralStatus.valid"
                      @input="handleReferralInput"
                    />
                    <div v-if="isValidatingReferral" class="absolute right-3 top-1/2 -translate-y-1/2">
                      <div class="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-[#c30059]"></div>
                    </div>
                    <div v-if="referralStatus.valid" class="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <i class="fas fa-check-circle"></i>
                    </div>
                  </div>
                  <button
                    v-if="!referralStatus.valid"
                    type="button"
                    @click="verifyReferralCode"
                    :disabled="!form.referralCode || isValidatingReferral"
                    class="px-6 py-2 rounded-lg bg-[#c30059] text-white hover:bg-[#ff4d4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Verify</span>
                  </button>
                </div>
                <p v-if="errors.referralCode" class="text-[#ff4d4d] text-sm mt-1 flex items-center gap-2">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ errors.referralCode }}
                </p>
                <p v-if="referralStatus.valid" class="text-green-500 text-sm mt-1 flex items-center gap-2">
                  <i class="fas fa-check-circle"></i>
                  Valid referral code
                </p>
              </div>
            </div>
          </div>

          <!-- Location Information Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- State -->
            <div>
              <label class="block text-white/90 text-sm mb-2">
                1. State <span class="text-[#ff4d4d]">*</span>
              </label>
              <div class="relative">
                <select 
                  v-model="form.state"
                  @change="handleStateChange"
                  class="w-full bg-[#121212] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors appearance-none"
                  :class="{'border-[#ff4d4d]': errors.state}"
                  :disabled="isLoadingStates"
                >
                  <option value="">{{ isLoadingStates ? 'Loading states...' : 'Select State' }}</option>
                  <option 
                    v-for="state in states" 
                    :key="state.value" 
                    :value="state.value"
                  >
                    {{ state.label }}
                  </option>
                </select>
                <!-- Loading Spinner -->
                <div v-if="isLoadingStates" class="absolute right-10 top-1/2 -translate-y-1/2">
                  <div class="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-[#c30059]"></div>
                </div>
              </div>
              <p v-if="errors.state" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.state }}</p>
            </div>

            <!-- District -->
            <div>
              <label class="block text-white/90 text-sm mb-2">
                2. District <span class="text-[#ff4d4d]">*</span>
              </label>
              <select 
                v-model="form.district"
                @change="handleDistrictChange"
                class="w-full bg-[#121212] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors appearance-none"
                :class="{'border-[#ff4d4d]': errors.district}"
                :disabled="!form.state"
              >
                <option value="">Select District</option>
                <option v-for="district in districts" :key="district.value" :value="district.value">
                  {{ district.label }}
                </option>
              </select>
              <p v-if="errors.district" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.district }}</p>
            </div>

            <!-- Constituency -->
            <div>
              <label class="block text-white/90 text-sm mb-2">
                3. Constituency <span class="text-[#ff4d4d]">*</span>
              </label>
              <select 
                v-model="form.constituency"
                @change="handleConstituencyChange"
                class="w-full bg-[#121212] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors appearance-none"
                :class="{'border-[#ff4d4d]': errors.constituency}"
                :disabled="!form.district"
              >
                <option value="">Select Constituency</option>
                <option v-for="constituency in constituencies" :key="constituency.value" :value="constituency.value">
                  {{ constituency.label }}
                </option>
              </select>
              <p v-if="errors.constituency" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.constituency }}</p>
            </div>

            <!-- Mandal -->
            <div>
              <label class="block text-white/90 text-sm mb-2">
                4. Mandal <span class="text-[#ff4d4d]">*</span>
              </label>
              <div class="relative">
                <select 
                  v-if="!isManualMandal"
                  v-model="form.mandal"
                  @change="handleMandalChange"
                  class="w-full bg-[#121212] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors appearance-none"
                  :class="{'border-[#ff4d4d]': errors.mandal}"
                  :disabled="!form.constituency"
                >
                  <option value="">Select Mandal</option>
                  <option v-for="mandal in mandals" :key="mandal.value" :value="mandal.value">
                    {{ mandal.label }}
                  </option>
                </select>
                <input 
                  v-else
                  v-model="form.manualMandal"
                  type="text"
                  class="w-full bg-[#121212] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors"
                  :class="{'border-[#ff4d4d]': errors.mandal}"
                  placeholder="Enter Mandal name"
                  @input="handleManualMandalChange"
                />
                <button 
                  @click="toggleMandalInput"
                  class="absolute right-12 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-sm underline"
                  type="button"
                >
                  {{ isManualMandal ? 'Select from list' : 'Enter manually' }}
                </button>
              </div>
              <p v-if="errors.mandal" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.mandal }}</p>
            </div>

            <!-- Village -->
            <div>
              <label class="block text-white/90 text-sm mb-2">
                5. Village <span class="text-[#ff4d4d]">*</span>
              </label>
              <div class="relative">
                <select 
                  v-if="!isManualVillage"
                  v-model="form.village"
                  @change="handleVillageChange"
                  class="w-full bg-[#121212] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors appearance-none"
                  :class="{'border-[#ff4d4d]': errors.village}"
                  :disabled="!form.mandal"
                >
                  <option value="">Select Village</option>
                  <option v-for="village in villages" :key="village.value" :value="village.value">
                    {{ village.label }}
                  </option>
                </select>
                <input 
                  v-else
                  v-model="form.manualVillage"
                  type="text"
                  class="w-full bg-[#121212] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors"
                  :class="{'border-[#ff4d4d]': errors.village}"
                  placeholder="Enter Village name"
                  @input="handleManualVillageChange"
                />
                <button 
                  @click="toggleVillageInput"
                  class="absolute right-12 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-sm underline"
                  type="button"
                >
                  {{ isManualVillage ? 'Select from list' : 'Enter manually' }}
                </button>
              </div>
              <p v-if="errors.village" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.village }}</p>
            </div>

            <!-- Pincode -->
            <div>
              <label class="block text-white/90 text-sm mb-2">
                6. Pincode <span class="text-[#ff4d4d]">*</span>
              </label>
              <div class="relative">
                <input 
                  v-model="form.pincode"
                  type="number"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  @input="validatePincode"
                  @keypress="allowOnlyNumbers"
                  maxlength="6"
                  class="w-full bg-[#121212] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  :class="{'border-[#ff4d4d]': errors.pincode}"
                  placeholder="Enter 6-digit pincode"
                />
                <!-- Loading indicator for pincode -->
                <div v-if="isLoadingPincode" class="absolute right-4 top-1/2 -translate-y-1/2">
                  <div class="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-[#c30059]"></div>
                </div>
              </div>
              <p v-if="errors.pincode" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.pincode }}</p>
              <!-- Pincode suggestions -->
              <div v-if="pincodeSuggestions.length > 0" 
                   class="mt-1 bg-[#1d1d1d] border border-white/10 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                <div v-for="(suggestion, index) in pincodeSuggestions" 
                     :key="index"
                     @click="selectPincode(suggestion)"
                     class="px-4 py-2 text-white hover:bg-[#2d2d2d] cursor-pointer">
                  <div class="font-medium">{{ suggestion.pincode }}</div>
                  <div class="text-sm text-white/60">{{ suggestion.area }}</div>
                </div>
              </div>
            </div>

            <!-- Address with Autocomplete -->
            <div class="md:col-span-2">
              <label class="block text-white/90 text-sm mb-2">
                7. Address <span class="text-[#ff4d4d]">*</span>
              </label>
              <div class="relative">
                <input 
                  ref="addressInput"
                  v-model="form.address"
                  type="text"
                  class="w-full bg-[#121212] border border-white/10 rounded-lg h-12 px-4 text-white focus:border-[#c30059] focus:outline-none transition-colors"
                  :class="{'border-[#ff4d4d]': errors.address}"
                  placeholder="Start typing your address..."
                  @input="handleAddressInput"
                />
                <!-- Loading indicator -->
                <div v-if="isLoadingAddresses" class="absolute right-4 top-1/2 -translate-y-1/2">
                  <div class="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-[#c30059]"></div>
                </div>
                <!-- Address Suggestions Dropdown -->
                <div v-if="addressSuggestions.length > 0" 
                     class="absolute z-50 w-full mt-1 bg-[#1d1d1d] border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div v-for="(suggestion, index) in addressSuggestions" 
                       :key="index"
                       @click="selectAddress(suggestion)"
                       class="px-4 py-3 text-white hover:bg-[#2d2d2d] cursor-pointer flex items-start">
                    <div>
                      <div class="font-medium">{{ suggestion.structured_formatting?.main_text || suggestion.description }}</div>
                      <div class="text-sm text-white/60">{{ suggestion.structured_formatting?.secondary_text }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="errors.address" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.address }}</p>
            </div>
          </div>

          <!-- Terms and Submit Section -->
          <div class="space-y-6 pt-4">
            <!-- Terms Checkbox -->
            <div class="flex items-start space-x-3">
              <input 
                type="checkbox"
                id="terms"
                v-model="form.termsAccepted"
                class="mt-1 rounded border-white/30 bg-transparent text-[#c30059] focus:ring-[#c30059] focus:ring-offset-0 focus:ring-offset-transparent"
              >
              <label for="terms" class="text-white/80 text-sm">
                I accept OTT's 
                <a href="#" class="text-[#c30059] hover:text-[#ff4d4d] underline decoration-dotted underline-offset-2">Terms & Conditions</a>
                and
                <a href="#" class="text-[#c30059] hover:text-[#ff4d4d] underline decoration-dotted underline-offset-2">Privacy Statement</a>
              </label>
            </div>
            <p v-if="errors.terms" class="mt-1 text-[#ff4d4d] text-sm">{{ errors.terms }}</p>

            <!-- Submit Button -->
            <button 
              type="submit"
              :disabled="isLoading"
              class="w-full bg-gradient-to-r from-[#c30059] to-[#ff4d4d] text-white py-4 rounded-lg font-medium text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              <span v-if="!isLoading">Complete Registration</span>
              <div v-else class="absolute inset-0 flex items-center justify-center">
                <div class="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white"></div>
              </div>
            </button>

            <!-- General Error Message -->
            <div v-if="errors.general" class="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p class="text-red-500 text-sm text-center">{{ errors.general }}</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RegistrationPage',
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        state: '',
        district: '',
        constituency: '',
        mandal: '',
        manualMandal: '',
        village: '',
        manualVillage: '',
        address: '',
        pincode: '',
        termsAccepted: false,
        phone: '',
        referralCode: '',
      },
      token: null,
      errors: {},
      districts: [],
      constituencies: [],
      mandals: [],
      villages: [],
      states: [],
      isLoadingStates: false,
      isLoadingGoogleMaps: false,
      apiBaseUrl: 'https://ott.no1news.in/',
      addressSuggestions: [],
      placesService: null,
      geocoder: null,
      googleMapsLoaded: false,
      selectedPlace: null,
      googleMapsScriptLoaded: false,
      isManualMandal: false,
      isManualVillage: false,
      isLoadingAddresses: false,
      isLoadingPincode: false,
      pincodeSuggestions: [],
      addressSearchTimeout: null,
      isLoading: false,
      googleMapsApiKey: 'AIzaSyAYUmDhZ4ZWfwL15I2pYhEKcxhKEzEh2No', // Google Maps API Key
      isValidatingReferral: false,
      referralStatus: {
        valid: false,
        message: ''
      }
    };
  },

  methods: {
    async fetchStates() {
      console.log('fetchStates method called');
      try {
        this.isLoadingStates = true;
        this.errors.state = null;
        
        const statesUrl = `${this.apiBaseUrl}/api/states/`;
        console.log('Fetching states from URL:', statesUrl);

        const response = await fetch(statesUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include' // Add this to include cookies if needed
        });

        console.log('API Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Received states data:', data);

        if (!Array.isArray(data)) {
          throw new Error('Expected array of states but received different format');
        }

        // Process the states
        this.states = data.map(state => ({
          value: state.id,
          label: state.name
        }));

        console.log('Processed states:', this.states);

        if (this.states.length === 0) {
          this.errors.state = 'No states available. Please try again.';
        }
      } catch (error) {
        console.error('Error in fetchStates:', error);
        this.errors.state = `Failed to load states: ${error.message}`;
      } finally {
        this.isLoadingStates = false;
      }
    },

    async handleSubmit() {
      console.log('Handle submit called');
      if (this.validateForm()) {
        let registrationResponse = null;
        try {
          console.log('Form validation passed, proceeding with submission');
          this.isLoading = true;
          this.errors = {};

          // Get CSRF token
          const csrfToken = localStorage.getItem('csrfToken');

          // Prepare registration data
          const registrationData = {
            first_name: this.form.firstName,
            last_name: this.form.lastName,
            email: this.form.email,
            phone: this.form.phone,
            state: this.form.state,
            district: this.form.district,
            constituency: this.form.constituency,
            mandal: this.isManualMandal ? this.form.manualMandal : this.form.mandal,
            village: this.isManualVillage ? this.form.manualVillage : this.form.village,
            address: this.form.address,
            pincode: this.form.pincode,
            referral_code: this.form.referralCode || null,
          };

          console.log('Sending registration data:', registrationData);

          // Complete registration
          console.log('Completing registration...');
          registrationResponse = await fetch(`${this.apiBaseUrl}/users/complete-registration/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-CSRFToken': csrfToken,
              'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include',
            body: JSON.stringify(registrationData)
          });

          console.log('Registration response status:', registrationResponse.status);
          const registrationResult = await registrationResponse.json();
          console.log('Registration response:', registrationResult);

          if (registrationResponse.ok) {
            console.log('Registration successful, updating local storage');
            // Update stored user data
            if (registrationResult.user) {
              localStorage.setItem('user', JSON.stringify(registrationResult.user));
            }
            // Update CSRF token
            if (registrationResult.csrf_token) {
              localStorage.setItem('csrfToken', registrationResult.csrf_token);
            }
            localStorage.setItem('phone', this.form.phone);

            // Store success message in localStorage for home page
            localStorage.setItem('registrationSuccess', 'true');
            localStorage.setItem('registrationMessage', 'Registration completed successfully!');

            // Redirect to home page
            window.location.href = '/';
          } else {
            throw new Error(registrationResult.message || 'Registration failed');
          }
        } catch (error) {
          console.error('Registration error:', error);
          this.errors.general = error.message || 'An error occurred during registration. Please try again.';
          
          try {
            // Show error toast if available
            if (this.$toast) {
              this.$toast.error(this.errors.general, {
                position: 'top-right',
                duration: 3000
              });
            }
          } catch (toastError) {
            console.warn('Toast notification failed:', toastError);
          }

          // If unauthorized, redirect to login
          if (registrationResponse?.status === 401) {
            window.location.href = '/login';
          }
        } finally {
          this.isLoading = false;
        }
      }
    },

    async registerDevice(token) {
      try {
        const deviceData = {
          device_type: 'web',
          device_name: navigator.userAgent,
          device_id: 'web-' + Math.random().toString(36).substr(2, 9),
          device_model: navigator.platform,
          os_version: navigator.userAgent,
          app_version: '1.0.0'
        };

        const response = await fetch(`${this.apiBaseUrl}/devices/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(deviceData)
        });

        if (!response.ok) {
          console.error('Failed to register device');
        }
      } catch (error) {
        console.error('Error registering device:', error);
      }
    },

    async handleAddressInput() {
      if (!this.form.address || !this.googleMapsLoaded) {
        this.addressSuggestions = [];
        return;
      }

      if (this.addressSearchTimeout) {
        clearTimeout(this.addressSearchTimeout);
      }

      this.isLoadingAddresses = true;

      this.addressSearchTimeout = setTimeout(async () => {
        try {
          // Get the selected location names
          const selectedState = this.states.find(s => s.value === this.form.state)?.label || '';
          const selectedDistrict = this.districts.find(d => d.value === this.form.district)?.label || '';
          const selectedConstituency = this.constituencies.find(c => c.value === this.form.constituency)?.label || '';
          const selectedMandal = this.isManualMandal ? this.form.manualMandal : 
                                this.mandals.find(m => m.value === this.form.mandal)?.label || '';
          const selectedVillage = this.isManualVillage ? this.form.manualVillage :
                                 this.villages.find(v => v.value === this.form.village)?.label || '';

          // Build the search query with location context including constituency
          const searchQuery = `${this.form.address}, ${selectedVillage}, ${selectedMandal}, ${selectedConstituency} constituency, ${selectedDistrict}, ${selectedState}, India`;
          
          const predictions = await this.getPlacePredictions(searchQuery, true);
          this.addressSuggestions = predictions;
        } catch (error) {
          console.error('Error fetching address suggestions:', error);
          this.errors.maps = 'Unable to fetch address suggestions. Please try again.';
        } finally {
          this.isLoadingAddresses = false;
        }
      }, 300);
    },

    async getPlacePredictions(searchQuery, isDirectSearch = false) {
      if (!this.placesService) {
        console.error('Places service not initialized');
        return [];
      }

      return new Promise((resolve, reject) => {
        const options = {
          input: searchQuery,
          componentRestrictions: { country: 'IN' },
          language: 'en',
          types: isDirectSearch ? ['address', 'establishment'] : ['geocode']
        };

        this.placesService.getPlacePredictions(options, (results, status) => {
          console.log('Places API response:', { status, results, query: searchQuery });
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results);
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            console.warn('Places API returned status:', status);
            reject(new Error(`Places API returned status: ${status}`));
          }
        });
      });
    },

    async selectAddress(suggestion) {
      this.isLoadingPincode = true;
      try {
        const placeResult = await this.getPlaceDetails(suggestion.place_id);
        console.log('Selected place details:', placeResult);

        const formattedAddress = this.formatAddress(placeResult);
        this.form.address = formattedAddress;

        const pincode = await this.extractPincode(placeResult);
        if (pincode) {
          this.form.pincode = pincode;
          delete this.errors.pincode;
        }

        this.addressSuggestions = [];
        this.selectedPlace = placeResult;

      } catch (error) {
        console.error('Error in selectAddress:', error);
        this.errors.maps = 'Error retrieving address details. Please try again.';
      } finally {
        this.isLoadingPincode = false;
      }
    },

    formatAddress(placeResult) {
      const components = {
        street_number: '',
        route: '',
        sublocality_level_1: '',
        locality: '',
        administrative_area_level_2: '',
        administrative_area_level_1: '',
        postal_code: ''
      };

      placeResult.address_components.forEach(component => {
        const type = component.types[0];
        if (Object.prototype.hasOwnProperty.call(components, type)) {
          components[type] = component.long_name;
        }
      });

      let formattedAddress = '';
      if (components.street_number) formattedAddress += components.street_number + ' ';
      if (components.route) formattedAddress += components.route + ', ';
      if (components.sublocality_level_1) formattedAddress += components.sublocality_level_1 + ', ';
      if (components.locality) formattedAddress += components.locality + ', ';
      if (components.administrative_area_level_2) formattedAddress += components.administrative_area_level_2 + ', ';
      if (components.administrative_area_level_1) formattedAddress += components.administrative_area_level_1;
      if (components.postal_code) formattedAddress += ' - ' + components.postal_code;

      return formattedAddress.trim().replace(/,\s*$/, '');
    },

    async getPlaceDetails(placeId) {
      return new Promise((resolve, reject) => {
        this.detailedPlacesService.getDetails({
          placeId: placeId,
          fields: ['address_components', 'formatted_address', 'geometry', 'name']
        }, (result, status) => {
          if (status === 'OK') {
            resolve(result);
          } else {
            reject(new Error(`Place details failed with status: ${status}`));
          }
        });
      });
    },

    async extractPincode(placeResult) {
      for (const component of placeResult.address_components) {
        if (component.types.includes('postal_code')) {
          return component.long_name;
        }
      }

      if (placeResult.geometry?.location) {
        try {
          return await this.getPincodeFromCoordinates(
            placeResult.geometry.location.lat(),
            placeResult.geometry.location.lng()
          );
        } catch (error) {
          console.warn('Failed to get pincode from coordinates:', error);
        }
      }

      return null;
    },

    async getPincodeFromCoordinates(lat, lng) {
      return new Promise((resolve, reject) => {
        if (!this.geocoder) {
          this.geocoder = new window.google.maps.Geocoder();
        }

        this.geocoder.geocode({
          location: { lat, lng }
        }, (results, status) => {
          if (status === 'OK') {
            for (let result of results) {
              for (let component of result.address_components) {
                if (component.types.includes('postal_code')) {
                  resolve(component.long_name);
                  return;
                }
              }
            }
            reject(new Error('No pincode found in geocoding results'));
          } else {
            reject(new Error(`Geocoding failed with status: ${status}`));
          }
        });
      });
    },

    async fetchDistricts(stateId) {
      try {
        console.log('Fetching districts for state:', stateId);
        const response = await fetch(`${this.apiBaseUrl}/api/frontend/districts/?state_id=${stateId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Districts API response:', result);

        if (result.status === 'success') {
          this.districts = result.data.map(district => ({
            value: district.id,
            label: district.name
          }));
          console.log('Mapped districts:', this.districts);
        } else {
          console.error('Error fetching districts:', result.message);
          this.errors.district = 'Failed to load districts. Please try again.';
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
        this.errors.district = 'Failed to load districts. Please check your connection.';
      }
    },

    async fetchConstituencies(districtId) {
      try {
        console.log('Fetching constituencies for district:', districtId);
        const response = await fetch(`${this.apiBaseUrl}/api/frontend/constituencies/?district_id=${districtId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Constituencies API response:', result);

        if (result.status === 'success') {
          this.constituencies = result.data.map(constituency => ({
            value: constituency.id,
            label: constituency.name
          }));
          console.log('Mapped constituencies:', this.constituencies);
        } else {
          console.error('Error fetching constituencies:', result.message);
          this.errors.constituency = 'Failed to load constituencies. Please try again.';
        }
      } catch (error) {
        console.error('Error fetching constituencies:', error);
        this.errors.constituency = 'Failed to load constituencies. Please check your connection.';
      }
    },

    async fetchMandals(constituencyId) {
      try {
        console.log('Fetching mandals for constituency:', constituencyId);
        const response = await fetch(`${this.apiBaseUrl}/api/frontend/mandals/?constituency_id=${constituencyId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Mandals API response:', result);

        if (result.status === 'success') {
          this.mandals = result.data.map(mandal => ({
            value: mandal.id,
            label: mandal.name
          }));
          console.log('Mapped mandals:', this.mandals);
        } else {
          console.error('Error fetching mandals:', result.message);
          this.errors.mandal = 'Failed to load mandals. Please try again.';
        }
      } catch (error) {
        console.error('Error fetching mandals:', error);
        this.errors.mandal = 'Failed to load mandals. Please check your connection.';
      }
    },

    async fetchVillages(mandalId) {
      try {
        console.log('Fetching villages for mandal:', mandalId);
        const response = await fetch(`${this.apiBaseUrl}/api/frontend/villages/?mandal_id=${mandalId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Villages API response:', result);

        if (result.status === 'success') {
          this.villages = result.data.map(village => ({
            value: village.id,
            label: village.name
          }));
          console.log('Mapped villages:', this.villages);
        } else {
          console.error('Error fetching villages:', result.message);
          this.errors.village = 'Failed to load villages. Please try again.';
        }
      } catch (error) {
        console.error('Error fetching villages:', error);
        this.errors.village = 'Failed to load villages. Please check your connection.';
      }
    },

    async handleStateChange() {
      console.log('State changed to:', this.form.state);
      // Reset dependent fields
      this.form.district = '';
      this.form.constituency = '';
      this.form.mandal = '';
      this.form.village = '';
      this.districts = [];
      this.constituencies = [];
      this.mandals = [];
      this.villages = [];

      if (this.form.state) {
        await this.fetchDistricts(this.form.state);
      }
    },

    async handleDistrictChange() {
      console.log('District changed to:', this.form.district);
      // Reset dependent fields
      this.form.constituency = '';
      this.form.mandal = '';
      this.form.village = '';
      this.constituencies = [];
      this.mandals = [];
      this.villages = [];

      if (this.form.district) {
        await this.fetchConstituencies(this.form.district);
      }
    },

    async handleConstituencyChange() {
      console.log('Constituency changed to:', this.form.constituency);
      // Reset dependent fields
      this.form.mandal = '';
      this.form.village = '';
      this.mandals = [];
      this.villages = [];

      if (this.form.constituency) {
        await this.fetchMandals(this.form.constituency);
      }
    },

    async handleMandalChange() {
      console.log('Mandal changed to:', this.form.mandal);
      // Reset dependent fields
      this.form.village = '';
      this.form.manualVillage = '';
      this.villages = [];
      this.addressSuggestions = [];
      this.form.address = '';
      this.form.pincode = '';

      if (this.form.mandal) {
        await this.fetchVillages(this.form.mandal);
      }
    },

    async handleVillageChange() {
      // Reset address fields
      this.form.address = '';
      this.form.pincode = '';
      this.addressSuggestions = [];
      
      // Trigger address search when village is selected
      if (this.form.village) {
        await this.searchAddress();
      }
    },

    allowOnlyNumbers(event) {
      // Allow only number keys (0-9) and navigation keys
      const isNumber = /[0-9]/.test(event.key);
      const isNavigationKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key);
      
      if (!isNumber && !isNavigationKey) {
        event.preventDefault();
      }

      // Prevent input if length is already 6 and not deleting
      if (this.form.pincode.length >= 6 && !isNavigationKey) {
        event.preventDefault();
      }
    },

    validatePincode(event) {
      // Remove any non-numeric characters
      this.form.pincode = event.target.value.replace(/\D/g, '').slice(0, 6);
      
      // Clear error if valid, show error if invalid
      if (this.form.pincode.length === 6) {
        delete this.errors.pincode;
      } else if (this.form.pincode.length > 0) {
        this.errors.pincode = 'Pincode must be exactly 6 digits';
      }
    },

    toggleMandalInput() {
      this.isManualMandal = !this.isManualMandal;
      if (this.isManualMandal) {
        this.form.mandal = '';
        this.form.manualMandal = '';
      } else {
        this.form.manualMandal = '';
      }
      // Clear dependent fields
      this.form.village = '';
      this.form.manualVillage = '';
      this.villages = [];
    },

    toggleVillageInput() {
      this.isManualVillage = !this.isManualVillage;
      if (this.isManualVillage) {
        this.form.village = '';
        this.form.manualVillage = '';
      } else {
        this.form.manualVillage = '';
      }
    },

    handleManualMandalChange() {
      // Clear village when mandal changes
      this.form.village = '';
      this.form.manualVillage = '';
      this.villages = [];
      
      if (this.form.manualMandal) {
        delete this.errors.mandal;
        this.fetchManualMandal(this.form.manualMandal);
      }
    },

    handleManualVillageChange() {
      if (this.form.manualVillage) {
        delete this.errors.village;
        this.fetchManualVillage(this.form.manualVillage);
        this.searchAddressWithManualLocation();
      }
    },

    async fetchManualMandal(mandalName) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/mandals/search/?name=${encodeURIComponent(mandalName)}&constituency_id=${this.form.constituency}`);
        const result = await response.json();
        if (result.status === 'success' && result.data.length > 0) {
          // If exact match found, use it
          const exactMatch = result.data.find(m => m.name.toLowerCase() === mandalName.toLowerCase());
          if (exactMatch) {
            this.form.mandal = exactMatch.id;
            await this.fetchVillages(exactMatch.id);
          }
        }
      } catch (error) {
        console.error('Error fetching manual mandal:', error);
      }
    },

    async fetchManualVillage(villageName) {
      try {
        const mandalId = this.form.mandal || '';
        const response = await fetch(`${this.apiBaseUrl}/villages/search/?name=${encodeURIComponent(villageName)}&mandal_id=${mandalId}`);
        const result = await response.json();
        if (result.status === 'success' && result.data.length > 0) {
          // If exact match found, use it
          const exactMatch = result.data.find(v => v.name.toLowerCase() === villageName.toLowerCase());
          if (exactMatch) {
            this.form.village = exactMatch.id;
            this.searchAddress();
          }
        }
      } catch (error) {
        console.error('Error fetching manual village:', error);
      }
    },

    async searchAddressWithManualLocation() {
      if (!this.googleMapsLoaded) return;

      try {
        // Get the selected location names
        const selectedState = this.states.find(s => s.value === this.form.state)?.label || '';
        const selectedDistrict = this.districts.find(d => d.value === this.form.district)?.label || '';
        const selectedConstituency = this.constituencies.find(c => c.value === this.form.constituency)?.label || '';
        const mandalName = this.isManualMandal ? this.form.manualMandal : 
                          this.mandals.find(m => m.value === this.form.mandal)?.label || '';
        const villageName = this.isManualVillage ? this.form.manualVillage :
                           this.villages.find(v => v.value === this.form.village)?.label || '';

        if (!villageName) return;

        // First try with full address including constituency
        let searchQuery = `${villageName}, ${mandalName}, ${selectedConstituency} constituency, ${selectedDistrict}, ${selectedState}, India`;
        let predictions = await this.getPlacePredictions(searchQuery);

        // If no results, try without constituency
        if (!predictions.length) {
          searchQuery = `${villageName}, ${mandalName}, ${selectedDistrict}, ${selectedState}, India`;
          predictions = await this.getPlacePredictions(searchQuery);
        }

        // If still no results, try with village and district format
        if (!predictions.length) {
          searchQuery = `${villageName} village, ${selectedConstituency} constituency, ${selectedDistrict} district, ${selectedState}, India`;
          predictions = await this.getPlacePredictions(searchQuery);
        }

        this.addressSuggestions = predictions;

        // Auto-select if only one result
        if (predictions.length === 1) {
          await this.selectAddress(predictions[0]);
        }
      } catch (error) {
        console.error('Error in manual location search:', error);
      }
    },

    validateForm() {
      console.log('Validating form...');
      this.errors = {};
      let isValid = true;
      
      // Required fields validation
      if (!this.form.firstName) {
        this.errors.firstName = 'First name is required';
        isValid = false;
      }
      if (!this.form.lastName) {
        this.errors.lastName = 'Last name is required';
        isValid = false;
      }
      // Email validation (only if provided)
      if (this.form.email && !this.isValidEmail(this.form.email)) {
        this.errors.email = 'Please enter a valid email address';
        isValid = false;
      }
      if (!this.form.state) {
        this.errors.state = 'State is required';
        isValid = false;
      }
      if (!this.form.district) {
        this.errors.district = 'District is required';
        isValid = false;
      }
      if (!this.form.constituency) {
        this.errors.constituency = 'Constituency is required';
        isValid = false;
      }
      
      // Mandal validation
      if (!this.isManualMandal && !this.form.mandal) {
        this.errors.mandal = 'Mandal is required';
        isValid = false;
      } else if (this.isManualMandal && !this.form.manualMandal) {
        this.errors.mandal = 'Mandal name is required';
        isValid = false;
      }

      // Village validation
      if (!this.isManualVillage && !this.form.village) {
        this.errors.village = 'Village is required';
        isValid = false;
      } else if (this.isManualVillage && !this.form.manualVillage) {
        this.errors.village = 'Village name is required';
        isValid = false;
      }

      // Address and Pincode validation
      if (!this.form.address) {
        this.errors.address = 'Address is required';
        isValid = false;
      }
      if (!this.form.pincode) {
        this.errors.pincode = 'Pincode is required';
        isValid = false;
      } else if (!/^\d{6}$/.test(this.form.pincode)) {
        this.errors.pincode = 'Pincode must be exactly 6 digits';
        isValid = false;
      }

      // Terms acceptance
      if (!this.form.termsAccepted) {
        this.errors.terms = 'You must accept the Terms & Conditions to continue';
        isValid = false;
      }

      // Referral code validation (only if provided)
      if (this.form.referralCode && !this.referralStatus.valid) {
        this.errors.referralCode = 'Please verify the referral code';
        isValid = false;
      }

      console.log('Validation result:', { isValid, errors: this.errors });
      return isValid;
    },

    isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    initGoogleMaps() {
      return new Promise((resolve, reject) => {
        try {
          console.log('Starting Google Maps initialization');
          this.isLoadingGoogleMaps = true;

          // Check if script is already loaded
          if (window.google && window.google.maps) {
            console.log('Google Maps already loaded, initializing services');
            this.initPlacesService();
            this.isLoadingGoogleMaps = false;
            this.googleMapsLoaded = true;
            resolve();
            return;
          }

          // Create script element
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places&callback=initGoogleCallback`;
          script.async = true;
          script.defer = true;

          // Define callback
          window.initGoogleCallback = () => {
            console.log('Google Maps loaded successfully');
            this.googleMapsScriptLoaded = true;
            this.initPlacesService();
            this.googleMapsLoaded = true;
            this.isLoadingGoogleMaps = false;
            resolve();
          };

          // Error handling
          script.onerror = (error) => {
            console.error('Error loading Google Maps:', error);
            this.errors.maps = 'Failed to load Google Maps. Please check your internet connection.';
            this.isLoadingGoogleMaps = false;
            reject(error);
          };

          // Add script to document
          document.head.appendChild(script);
          console.log('Google Maps script added to document');
        } catch (error) {
          console.error('Error in initGoogleMaps:', error);
          this.errors.maps = 'Failed to initialize Google Maps.';
          this.isLoadingGoogleMaps = false;
          reject(error);
        }
      });
    },

    initPlacesService() {
      try {
        console.log('Initializing Places Service');
        if (!window.google || !window.google.maps) {
          throw new Error('Google Maps not loaded');
        }

        // Remove existing map div if any
        const existingMapDiv = document.getElementById('places-service-map');
        if (existingMapDiv) {
          existingMapDiv.remove();
        }

        // Create hidden div for PlacesService
        const mapDiv = document.createElement('div');
        mapDiv.style.display = 'none';
        mapDiv.id = 'places-service-map';
        document.body.appendChild(mapDiv);

        // Initialize map for PlacesService
        const map = new window.google.maps.Map(mapDiv, {
          center: { lat: -34.397, lng: 150.644 },
          zoom: 8
        });

        // Initialize services
        this.placesService = new window.google.maps.places.AutocompleteService();
        this.geocoder = new window.google.maps.Geocoder();
        this.detailedPlacesService = new window.google.maps.places.PlacesService(map);
        
        console.log('Places service initialized successfully');
        this.googleMapsLoaded = true;
        delete this.errors.maps;
      } catch (error) {
        console.error('Error initializing places service:', error);
        this.errors.maps = 'Failed to initialize location services.';
        this.googleMapsLoaded = false;
      }
    },

    async searchAddress() {
      console.log('searchAddress called with current state:', {
        googleMapsLoaded: this.googleMapsLoaded,
        placesService: !!this.placesService,
        village: this.form.village
      });

      if (!this.googleMapsLoaded || !this.placesService) {
        console.log('Reinitializing Google Maps');
        try {
          await this.initGoogleMaps();
        } catch (error) {
          console.error('Failed to reinitialize Google Maps:', error);
          return;
        }
      }

      if (!this.form.village) {
        console.log('No village selected');
        return;
      }

      try {
        const selectedState = this.states.find(s => s.value === this.form.state)?.label || '';
        const selectedDistrict = this.districts.find(d => d.value === this.form.district)?.label || '';
        const selectedConstituency = this.constituencies.find(c => c.value === this.form.constituency)?.label || '';
        const selectedMandal = this.mandals.find(m => m.value === this.form.mandal)?.label || '';
        const selectedVillage = this.villages.find(v => v.value === this.form.village)?.label || '';

        console.log('Searching with location data:', {
          state: selectedState,
          district: selectedDistrict,
          constituency: selectedConstituency,
          mandal: selectedMandal,
          village: selectedVillage
        });

        // First try with full address including constituency
        let searchQuery = `${selectedVillage}, ${selectedMandal}, ${selectedConstituency} constituency, ${selectedDistrict}, ${selectedState}, India`;
        console.log('Trying search with query:', searchQuery);
        let predictions = await this.getPlacePredictions(searchQuery);

        // If no results, try without constituency
        if (!predictions.length) {
          searchQuery = `${selectedVillage}, ${selectedMandal}, ${selectedDistrict}, ${selectedState}, India`;
          console.log('Retrying with simplified query:', searchQuery);
          predictions = await this.getPlacePredictions(searchQuery);
        }

        this.addressSuggestions = predictions;
        console.log('Got address suggestions:', predictions);

        if (predictions.length === 1) {
          await this.selectAddress(predictions[0]);
        }
      } catch (error) {
        console.error('Error in searchAddress:', error);
        this.errors.maps = 'Unable to fetch address suggestions. Please try again.';
      }
    },

    handleReferralInput() {
      // Convert to uppercase
      this.form.referralCode = this.form.referralCode.toUpperCase();
      // Reset validation status
      this.referralStatus.valid = false;
      this.referralStatus.message = '';
      this.errors.referralCode = '';
    },

    async verifyReferralCode() {
      if (!this.form.referralCode) return;
      
      this.isValidatingReferral = true;
      this.errors.referralCode = '';
      
      try {
        const response = await axios.get(`${this.apiBaseUrl}/users/verify-referral/`, {
          params: {
            code: this.form.referralCode
          },
          headers: {
            'Accept': 'application/json'
          }
        });

        const data = response.data;
        
        if (data.status === 'success') {
          this.referralStatus.valid = true;
          this.referralStatus.message = 'Valid referral code';
          this.errors.referralCode = '';
        } else {
          this.referralStatus.valid = false;
          this.errors.referralCode = data.message || 'Invalid referral code';
        }
      } catch (error) {
        console.error('Error verifying referral code:', error);
        this.errors.referralCode = error.response?.data?.message || 'Failed to verify referral code';
        this.referralStatus.valid = false;
      } finally {
        this.isValidatingReferral = false;
      }
    },
  },

  async created() {
    console.log('Component created - Starting initialization');
    try {
      // Get phone number and token from query params or localStorage
      this.form.phone = this.$route.query.phone || localStorage.getItem('phone') || '';
      
      // Try to get token from multiple sources
      this.token = this.$route.query.token || 
                  localStorage.getItem('token') || 
                  (localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).token);
      
      console.log('Initial token:', this.token);

      if (!this.form.phone) {
        console.error('Missing phone number');
        this.errors.general = 'Missing phone number. Please try logging in again.';
        this.$router.push('/login');
        return;
      }

      if (!this.token) {
        console.error('Missing token');
        this.errors.general = 'Authentication token is missing. Please try logging in again.';
        this.$router.push('/login');
        return;
      }

      // Store phone number in localStorage if not already there
      if (!localStorage.getItem('phone')) {
        localStorage.setItem('phone', this.form.phone);
      }

      // Initialize Google Maps first
      console.log('Initializing Google Maps');
      await this.initGoogleMaps();

      console.log('Starting to fetch states');
      await this.fetchStates();

      // Check for referral code in URL
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');
      
      if (referralCode) {
        this.form.referralCode = referralCode.toUpperCase();
        // Automatically verify the referral code
        await this.verifyReferralCode();
      }
    } catch (error) {
      console.error('Error in component creation:', error);
      this.errors.general = 'Failed to initialize the form. Please refresh the page.';
    }
  },

  mounted() {
    console.log('Component mounted - Checking states:', {
      statesLength: this.states.length,
      states: this.states
    });
    
    // If states are empty, try loading them again
    if (this.states.length === 0 && !this.isLoadingStates) {
      console.log('States are empty, fetching again');
      this.fetchStates();
    }
  },

  beforeUnmount() {
    const mapDiv = document.getElementById('places-service-map');
    if (mapDiv) {
      mapDiv.remove();
    }
  }
};
</script>

<style scoped>
/* Disabled select styling */
select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Custom select arrow */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}

/* Remove autofill background */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px #121212 inset !important;
  -webkit-text-fill-color: white !important;
}

/* Address Suggestions Dropdown Styles */
.suggestions-dropdown {
  scrollbar-width: thin;
  scrollbar-color: #c30059 #1d1d1d;
}

.suggestions-dropdown::-webkit-scrollbar {
  width: 6px;
}

.suggestions-dropdown::-webkit-scrollbar-track {
  background: #1d1d1d;
}

.suggestions-dropdown::-webkit-scrollbar-thumb {
  background-color: #c30059;
  border-radius: 3px;
}

/* Loading overlay */
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

/* Error message styles */
.error-message {
  color: #ff4d4d;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}

.error-message i {
  margin-right: 0.5rem;
}
</style> 