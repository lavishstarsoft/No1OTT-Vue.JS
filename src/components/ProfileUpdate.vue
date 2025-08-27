<template>
  <div class="min-h-screen bg-[#121212] text-white relative">
    <!-- Back Button -->
    <button 
      @click="$router.push('/profile')"
      class="fixed top-4 left-4 z-10 text-white/70 hover:text-white bg-[#1a1a1a] p-2 rounded-full shadow-lg"
    >
      <i class="fas fa-arrow-left text-xl"></i>
    </button>

    <div class="max-w-4xl mx-auto p-4 md:p-6 pb-32 md:pb-12 mb-safe">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 pt-16 md:pt-8">
        <div class="text-center md:text-left mb-6 md:mb-0">
          <h2 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#c30059] to-[#ff4d4d] bg-clip-text text-transparent">
            Profile Settings
          </h2>
          <p class="text-gray-400 mt-2 text-sm md:text-base">Manage your account information</p>
        </div>
        <div class="relative mx-auto md:mx-0">
          <div class="w-28 h-28 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-[#c30059] shadow-lg">
            <img 
              v-if="formData.profile_picture"
              :src="formData.profile_picture" 
              alt="Profile Picture"
              class="w-full h-full object-cover"
            />
            <div 
              v-else 
              class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#c30059] to-[#ff4d4d] text-white text-4xl md:text-3xl font-bold"
            >
              {{ getInitials }}
            </div>
          </div>
          <label class="absolute bottom-0 right-0 bg-[#c30059] p-3 rounded-full cursor-pointer hover:bg-[#ff4d4d] transition-colors shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <input type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
          </label>
        </div>
      </div>

      <!-- Main Content -->
      <div class="bg-[#1a1a1a] rounded-xl shadow-2xl p-4 md:p-6 backdrop-blur-lg bg-opacity-50">
        <form @submit.prevent="updateProfile" class="space-y-6 md:space-y-8">
          <!-- Personal Information Section -->
          <div class="space-y-4 md:space-y-6">
            <h3 class="text-lg md:text-xl font-semibold text-[#c30059] border-b border-[#c30059] pb-2">
              Personal Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">First Name</label>
                <input
                  v-model="formData.first_name"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white"
                  placeholder="Enter your first name"
                  required
                />
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Last Name</label>
                <input
                  v-model="formData.last_name"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white"
                  placeholder="Enter your last name"
                  required
                />
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Email <span class="text-gray-500">(Optional)</span></label>
                <input
                  v-model="formData.email"
                  type="email"
                  class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white"
                  placeholder="Enter your email (optional)"
                />
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Phone</label>
                <input
                  v-model="formData.phone"
                  type="tel"
                  class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white"
                  placeholder="Enter your phone number"
                  required
                  readonly
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Gender</label>
                <select
                  v-model="formData.gender"
                  class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white"
                >
                  <option value="" class="bg-[#2a2a2a]">Select Gender</option>
                  <option value="M" class="bg-[#2a2a2a]">Male</option>
                  <option value="F" class="bg-[#2a2a2a]">Female</option>
                  <option value="O" class="bg-[#2a2a2a]">Other</option>
                </select>
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Year of Birth</label>
                <select
                  v-model="formData.date_of_birth"
                  class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white"
                >
                  <option value="">Select Year</option>
                  <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                </select>
              </div>

              <!-- Referral Code Section - Always show -->
              <div class="space-y-2 md:col-span-2">
                <label class="block text-sm font-medium text-gray-300">
                  Referral Phone Number <span class="text-gray-500">(Optional)</span>
                </label>
                <div class="flex gap-4">
                  <div class="relative flex-1">
                    <input
                      v-model="formData.referral_code"
                      type="text"
                      class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white uppercase"
                      placeholder="Enter referral Phone Number"
                      @input="handleReferralInput"
                      :readonly="hasReferralCode"
                      :disabled="hasReferralCode"
                    />
                    <div v-if="isValidatingReferral" class="absolute right-3 top-1/2 -translate-y-1/2">
                      <div class="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-[#c30059]"></div>
                    </div>
                  </div>
                  <button
                    v-if="!hasReferralCode"
                    type="button"
                    @click="verifyReferralCode"
                    :disabled="!formData.referral_code || isValidatingReferral"
                    class="px-6 py-2 rounded-lg bg-[#c30059] text-white hover:bg-[#ff4d4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Verify</span>
                  </button>
                </div>
                <p v-if="referralError" class="text-[#ff4d4d] text-sm mt-1">{{ referralError }}</p>
                <p v-if="referralSuccess" class="text-green-500 text-sm mt-1 flex items-center gap-2">
                  <i class="fas fa-check-circle"></i>
                  Valid referral code
                </p>
              </div>
            </div>
          </div>

          <!-- Location Details Section -->
          <div class="space-y-4 md:space-y-6">
            <h3 class="text-lg md:text-xl font-semibold text-[#c30059] border-b border-[#c30059] pb-2">
              Location Details
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

              <div class="space-y-2 relative">
                <label class="block text-sm font-medium text-gray-300">State</label>
                <select
                  v-model="formData.state"
                  @change="handleStateChange"
                  class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white"
                  :disabled="isLoadingStates"
                  required
                >
                  <option value="">{{ isLoadingStates ? 'Loading states...' : 'Select State' }}</option>
                  <option v-for="state in states" :key="state.value" :value="state.value">
                    {{ state.label }}
                  </option>
                </select>
                <div v-if="isLoadingStates" class="absolute right-4 top-1/2 -translate-y-1/2">
                  <div class="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-[#c30059]"></div>
                </div>
              </div>

              <div class="space-y-2 relative">
                <label class="block text-sm font-medium text-gray-300">District</label>
                <select
                  v-model="formData.district"
                  @change="handleDistrictChange"
                  class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white"
                  :disabled="!formData.state || isLoadingDistricts"
                  required
                >
                  <option value="">{{ isLoadingDistricts ? 'Loading districts...' : 'Select District' }}</option>
                  <option v-for="district in districts" :key="district.value" :value="district.value">
                    {{ district.label }}
                  </option>
                </select>
                <div v-if="isLoadingDistricts" class="absolute right-4 top-1/2 -translate-y-1/2">
                  <div class="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-[#c30059]"></div>
                </div>
              </div>

              <div class="space-y-2 relative">
                <label class="block text-sm font-medium text-gray-300">Constituency</label>
                <select
                  v-model="formData.constituency"
                  @change="handleConstituencyChange"
                  class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white"
                  :disabled="!formData.district || isLoadingConstituencies"
                  required
                >
                  <option value="">{{ isLoadingConstituencies ? 'Loading constituencies...' : 'Select Constituency' }}</option>
                  <option v-for="constituency in constituencies" :key="constituency.value" :value="constituency.value">
                    {{ constituency.label }}
                  </option>
                </select>
                <div v-if="isLoadingConstituencies" class="absolute right-4 top-1/2 -translate-y-1/2">
                  <div class="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-[#c30059]"></div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Mandal</label>
                <input
                  v-model="formData.mandal"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white"
                  placeholder="Enter your mandal (optional)"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Village</label>
                <input
                  v-model="formData.village"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white"
                  placeholder="Enter your village (optional)"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-300">Pincode</label>
                <input
                  v-model="formData.pincode"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white"
                  placeholder="Enter your pincode (optional)"
                  maxlength="6"
                />
              </div>

              <div class="space-y-2 md:col-span-2">
                <label class="block text-sm font-medium text-gray-300">Complete Address</label>
                <textarea
                  v-model="formData.address"
                  class="w-full px-4 py-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:border-[#c30059] focus:ring-2 focus:ring-[#c30059] text-white"
                  placeholder="Enter your complete address"
                  rows="2"
                ></textarea>
              </div>
              
            </div>
          </div>

          <!-- Add extra padding at bottom for mobile -->
          <div class="h-3 md:h-0"></div>

          <!-- Action Buttons -->
          <div class="fixed bottom-0 left-0 right-0 p-4 bg-[#121212]/95 backdrop-blur-md border-t border-white/10 flex justify-end space-x-4 md:relative md:bg-transparent md:border-0 md:p-0 md:mt-6 z-50">
            <button
              type="button"
              @click="$router.push('/profile')"
              class="flex-1 md:flex-none px-6 py-3 md:py-2 rounded-lg bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] transition-colors text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 md:flex-none px-6 py-3 md:py-2 rounded-lg bg-gradient-to-r from-[#c30059] to-[#ff4d4d] text-white hover:from-[#d40063] hover:to-[#ff5c5c] transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
              :disabled="loading"
            >
              <span>{{ loading ? 'Updating...' : 'Submit' }}</span>
              <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="fixed bottom-[88px] md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-[#c30059] text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out">
        <div class="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-sm md:text-base">Profile updated successfully!</span>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="fixed bottom-[88px] md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-[#ff4d4d] text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out">
        <div class="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span class="text-sm md:text-base">{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ProfileUpdate',
  data() {
    return {
      formData: {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: '',
        date_of_birth: '',
        profile_picture: null,
        address: '',
        state: '',
        district: '',
        constituency: '',
        mandal: '',
        village: '',
        pincode: '',
        referral_code: ''
      },
      baseUrl: 'https://ott.no1news.in',
      loading: false,
      success: false,
      error: null,
      isValidatingReferral: false,
      referralError: null,
      referralSuccess: false,
      hasReferralCode: false,
      states: [],
      districts: [],
      constituencies: [],
      mandals: [],
      villages: [],
      isLoadingStates: false,
      isLoadingDistricts: false,
      isLoadingConstituencies: false,
      years: Array.from({length: (new Date().getFullYear() - 1940 + 1)}, (_, i) => new Date().getFullYear() - i),
    };
  },
  computed: {
    getInitials() {
      const firstName = this.formData.first_name || '';
      const lastName = this.formData.last_name || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.formData.profile_picture = file;
      }
    },
    handleReferralInput() {
      // Convert to uppercase
      this.formData.referral_code = this.formData.referral_code.toUpperCase();
      // Clear messages
      this.referralError = null;
      this.referralSuccess = false;
    },
    async verifyReferralCode() {
      if (!this.formData.referral_code) return;
      
      this.isValidatingReferral = true;
      this.referralError = null;
      this.referralSuccess = false;

      try {
        const response = await axios.get(`${this.baseUrl}/users/verify-referral/`, {
          params: {
            code: this.formData.referral_code
          },
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.data.status === 'success') {
          this.referralSuccess = true;
          this.referralError = null;
        } else {
          this.referralError = 'Invalid referral code';
          this.referralSuccess = false;
        }
      } catch (error) {
        console.error('Error verifying referral code:', error);
        this.referralError = 'Error verifying referral code';
        this.referralSuccess = false;
      } finally {
        this.isValidatingReferral = false;
      }
    },
    async updateProfile() {
      // Referral code verification logic updated
      if (this.formData.referral_code && !this.referralSuccess && !this.hasReferralCode) {
        this.error = 'Please verify the referral code first';
        return;
      }

      this.loading = true;
      this.success = false;
      this.error = null;

      try {
        // Get phone from localStorage
        const phone = localStorage.getItem('phone');
        if (!phone) {
          throw new Error('Please login again');
        }

        // Validate email format only if email is provided
        if (this.formData.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(this.formData.email)) {
            throw new Error('Please enter a valid email address');
          }
        }

        // Create FormData object
        const formData = new FormData();
        
        // Add phone number
        formData.append('phone', phone);
        
        // Append all form fields to FormData
        Object.keys(this.formData).forEach(key => {
          let value = this.formData[key];
          if (key === 'referral_code' && this.hasReferralCode) {
            // already referred, don't send referral_code
            return;
          }
          if (key === 'date_of_birth' && value && value.toString().length === 4) {
            // Convert year to YYYY-01-01 for backend
            value = `${value}-01-01`;
          }
          // profile_picture: append only if it's a File object
          if (key === 'profile_picture') {
            if (value && typeof value !== 'string') {
              formData.append(key, value);
            }
            return;
          }
          // Skip phone as it's already added
          if (key !== 'phone' && value !== null && value !== '') {
            formData.append(key, value);
          }
        });

        // Make the API call
        const response = await axios.post(
          `${this.baseUrl}/users/update-profile/`,
          formData,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.status === 'success') {
          this.success = true;
          // Show success message
          this.error = null;
          
          // Wait for 2 seconds before redirecting
          setTimeout(() => {
            this.$router.push('/profile');
          }, 2000);
        } else {
          throw new Error(response.data.message || 'Failed to update profile');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        this.error = error.response?.data?.message || error.message || 'Failed to update profile. Please try again.';
        
        if (error.response?.status === 403) {
          setTimeout(() => {
            localStorage.removeItem('phone');
            this.$router.push('/login');
          }, 2000);
        }
      } finally {
        this.loading = false;
      }
    },
    async loadUserProfile() {
      try {
        const phone = localStorage.getItem('phone');
        if (!phone) {
          this.$router.push('/login');
          return;
        }

        // Get profile data
        const response = await axios.get(`${this.baseUrl}/users/profile/`, {
          params: { phone },
          headers: {
            'Accept': 'application/json'
          }
        });

        console.log('Profile Response:', response.data); // Debug log
        
        if (response.data && response.data.status === 'success' && response.data.user) {
          const userData = response.data.user;
          // Update form data with user profile
          this.formData = {
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email || '',
            phone: phone,
            gender: userData.gender || '',
            date_of_birth: userData.date_of_birth ? userData.date_of_birth.substring(0, 4) : '',
            profile_picture: userData.profile_picture || null,
            address: userData.address || '',
            state: userData.state || '',
            district: userData.district || '',
            constituency: userData.constituency || '',
            mandal: userData.mandal || '',
            village: userData.village || '',
            pincode: userData.pincode || '',
            referral_code: userData.referral_code || ''
          };

          // Check for referral code
          if (response.data.referral_relationships && 
              response.data.referral_relationships.referred_by && 
              response.data.referral_relationships.referred_by.length > 0) {
            const referredBy = response.data.referral_relationships.referred_by[0];
            this.formData.referral_code = referredBy.referral_code_used || '';
            this.hasReferralCode = true;
          }

          // Load location data if available
          if (this.formData.state) {
            await this.fetchDistricts(this.formData.state);
          }
          if (this.formData.district) {
            await this.fetchConstituencies(this.formData.district);
          }
          if (this.formData.constituency) {
            await this.fetchMandals(this.formData.constituency);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        if (error.response?.status === 403) {
          this.error = 'Session expired. Please login again.';
          setTimeout(() => {
            localStorage.removeItem('phone');
            this.$router.push('/login');
          }, 2000);
        } else {
          this.error = error.response?.data?.message || 'Failed to load profile data. Please try again.';
        }
      }
    },
    async fetchStates() {
      this.isLoadingStates = true;
      try {
        const response = await axios.get(`${this.baseUrl}/api/states/`);
        this.states = response.data.map(state => ({ value: state.id, label: state.name }));
      } catch (error) {
        this.error = 'Failed to load states. Please try again.';
      } finally {
        this.isLoadingStates = false;
      }
    },
    async fetchDistricts(stateId) {
      this.isLoadingDistricts = true;
      if (!stateId) {
        this.districts = [];
        this.formData.district = '';
        this.isLoadingDistricts = false;
        return;
      }
      try {
        const response = await axios.get(`${this.baseUrl}/api/frontend/districts/?state_id=${stateId}`);
        if (response.data.status === 'success') {
          this.districts = response.data.data.map(district => ({
            value: district.id,
            label: district.name
          }));
        } else {
          this.districts = [];
          this.error = 'Failed to load districts. Please try again.';
        }
      } catch (error) {
        this.error = 'Failed to load districts. Please try again.';
      } finally {
        this.isLoadingDistricts = false;
      }
    },
    async fetchConstituencies(districtId) {
      this.isLoadingConstituencies = true;
      if (!districtId) {
        this.constituencies = [];
        this.formData.constituency = '';
        this.isLoadingConstituencies = false;
        return;
      }
      try {
        const response = await axios.get(`${this.baseUrl}/api/frontend/constituencies/?district_id=${districtId}`);
        if (response.data.status === 'success') {
          this.constituencies = response.data.data.map(constituency => ({
            value: constituency.id,
            label: constituency.name
          }));
        } else {
          this.constituencies = [];
          this.error = 'Failed to load constituencies. Please try again.';
        }
      } catch (error) {
        this.error = 'Failed to load constituencies. Please try again.';
      } finally {
        this.isLoadingConstituencies = false;
      }
    },
    async fetchMandals(constituencyId) {
      if (!constituencyId) {
        this.mandals = [];
        this.formData.mandal = '';
        return;
      }
      try {
        const response = await axios.get(`${this.baseUrl}/api/mandals/?constituency=${constituencyId}`);
        this.mandals = response.data.map(mandal => ({ value: mandal.id, label: mandal.name }));
        // Removed self-assignment
      } catch (error) {
        console.error('Error fetching mandals:', error);
        this.error = 'Failed to load mandals. Please try again.';
      }
    },
    handleStateChange() {
      this.formData.district = '';
      this.formData.constituency = '';
      this.formData.mandal = '';
      this.formData.village = '';
      this.fetchDistricts(this.formData.state);
    },
    handleDistrictChange() {
      this.formData.constituency = '';
      this.formData.mandal = '';
      this.formData.village = '';
      this.fetchConstituencies(this.formData.district);
    },
    handleConstituencyChange() {
      this.formData.mandal = '';
      this.formData.village = '';
      this.fetchMandals(this.formData.constituency);
    },
    handleMandalChange() {
      // No specific action needed here, just update the mandal
    },
    handleVillageChange() {
      // No specific action needed here, just update the village
    }
  },
  async created() {
    await this.loadUserProfile();
    await this.fetchStates();
    if (this.formData.state) {
      await this.fetchDistricts(this.formData.state);
    }
    if (this.formData.district) {
      await this.fetchConstituencies(this.formData.district);
    }
    if (this.formData.constituency) {
      await this.fetchMandals(this.formData.constituency);
    }
    if (this.formData.mandal) {
      // Removed fetchVillages
    }
  }
};
</script>

<style scoped>
/* Add smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #c30059;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #ff4d4d;
}

/* Input focus styles */
input:focus, select:focus, textarea:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(195, 0, 89, 0.3);
}

/* Button hover effects */
button {
  transition: transform 0.2s;
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* Add safe area margin for mobile devices */
.mb-safe {
  margin-bottom: env(safe-area-inset-bottom, 0px);
}

/* Adjust bottom padding for mobile */
@media (max-width: 768px) {
  input, select, textarea {
    font-size: 16px; /* Prevent zoom on iOS */
  }

  .pb-32 {
    padding-bottom: calc(6rem + env(safe-area-inset-bottom, 0px));
  }

  /* Improve touch targets */
  button {
    min-height: 44px;
  }

  /* Add smooth bottom padding for fixed elements */
  .mb-safe {
    margin-bottom: calc(env(safe-area-inset-bottom, 0px) + 60px);
  }

  /* Improve form field spacing */
  .space-y-4 > * {
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
  }

  /* Make inputs more touch-friendly */
  input, select, textarea {
    padding: 0.75rem 1rem;
  }

  /* Ensure content doesn't get hidden behind fixed buttons */
  .space-y-6 {
    margin-bottom: 60px;
  }

  /* Adjust textarea height */
  textarea {
    max-height: 60px;
    resize: none;
  }

  /* Ensure fixed elements stay on top */
  .fixed {
    z-index: 50;
  }
}
</style> 