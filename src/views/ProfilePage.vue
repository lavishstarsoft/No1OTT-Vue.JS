<template>
  <div class="min-h-screen bg-[#121212] text-white">
    <AppHeader />
    
    <!-- Main Content -->
    <main class="container mx-auto px-4 pt-12 md:pt-24 pb-32 md:pb-12 mb-safe">
      <!-- Profile Header -->
      <div class="relative">
        <!-- Background Banner -->
        <div class="h-32 md:h-64 w-full bg-gradient-to-r from-[#c30059] to-[#ff4d4d] rounded-xl"></div>
        
        <!-- Profile Info -->
        <div class="relative -mt-12 md:-mt-16 px-4 sm:px-6">
          <div class="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
            <!-- Profile Picture -->
            <div class="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-[#c30059] to-[#ff4d4d] flex items-center justify-center text-white border-4 border-[#121212]">
              <span class="text-3xl md:text-4xl font-bold">{{ userInitials }}</span>
            </div>
            
            <!-- User Info -->
            <div class="text-center md:text-left flex-1">
              <h1 class="text-xl md:text-3xl font-bold">{{ userName }}</h1>
              <p class="text-white/60 mt-1">{{ user?.phone || 'No phone number' }}</p>
            </div>

            <!-- Edit Profile Button -->
            <button 
              @click="$router.push('/profile/update')"
              class="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <i class="fas fa-edit"></i>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <!-- Content Sections -->
      <div class="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- Left Column -->
        <div class="md:col-span-4 space-y-6">
          <!-- Membership Details -->
          <div class="bg-white/5 rounded-xl p-6">
            <h2 class="text-xl font-semibold mb-4">Membership Details</h2>
            <div class="space-y-4">
              <div>
                <p class="text-white/60">Membership Plan</p>
                <p class="font-medium">{{ user?.subscription_type || 'Free Plan' }}</p>
              </div>
              <div>
                <p class="text-white/60">Valid From</p>
                <p class="font-medium">{{ formatSubscriptionDate(user?.subscription_start_date) }}</p>
              </div>
              <div>
                <p class="text-white/60">Valid Until</p>
                <p class="font-medium">{{ formatSubscriptionDate(user?.subscription_end_date) }}</p>
              </div>
              <div>
                <p class="text-white/60">Status</p>
                <p :class="isSubscriptionActive ? 'text-green-500' : 'text-red-500'" class="font-medium">
                  {{ isSubscriptionActive ? 'Active' : 'Expired' }}
                </p>
              </div>
              <div v-if="daysRemaining > 0" class="bg-white/10 rounded-lg p-3 text-center">
                <p class="text-sm">
                  <span class="text-[#c30059] font-bold">{{ daysRemaining }}</span> 
                  <span class="text-white/60">days remaining</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Account Settings -->
          <div class="bg-white/5 rounded-xl p-6">
            <h2 class="text-xl font-semibold mb-4">Account Settings</h2>
            <div class="space-y-3">
              <router-link 
                to="/activate"
                class="w-full py-3 px-4 bg-gradient-to-r from-[#c30059] to-[#ff4d4d] hover:from-[#d10065] hover:to-[#ff5c5c] rounded-lg text-left flex items-center justify-between transition-all group"
              >
                <div class="flex items-center gap-3">
                  <i class="fas fa-tv text-white"></i>
                  <span class="text-white font-medium">Activate TV Device</span>
                </div>
                <i class="fas fa-arrow-right text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all"></i>
              </router-link>
              <button class="w-full py-3 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-left flex items-center justify-between">
                <span>Language</span>
                <span class="text-white/60">English</span>
              </button>
              <button class="w-full py-3 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-left flex items-center justify-between">
                <span>Video Quality</span>
                <span class="text-white/60">Auto</span>
              </button>
              <button class="w-full py-3 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-left flex items-center justify-between">
                <span>Downloads</span>
                <span class="text-white/60">WiFi Only</span>
              </button>
            </div>
          </div>

          <!-- Referral Section -->
          <ReferralCard :isInProfilePage="true" />
        </div>

        <!-- Right Column -->
        <div class="md:col-span-8 space-y-6">
          <!-- My List -->
          <div class="bg-white/5 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold">My List</h2>
              <button class="text-white/60 hover:text-white">View All</button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div v-for="i in 4" :key="i" class="aspect-[2/3] rounded-lg bg-white/10 animate-pulse"></div>
            </div>
          </div>

          <!-- Watch History -->
          <div class="bg-white/5 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold">Continue Watching</h2>
              <button class="text-white/60 hover:text-white">View All</button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div v-for="i in 4" :key="i" class="aspect-[2/3] rounded-lg bg-white/10 animate-pulse"></div>
            </div>
          </div>

          <!-- Device Management -->
          <div class="bg-white/5 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold">Device Management</h2>
              <div class="text-sm text-white/60">
                {{ devices.length }}/3 Devices Active
              </div>
            </div>
            
            <div v-if="isLoadingDevices" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>

            <div v-else-if="devices.length === 0" class="text-center py-8 text-white/60">
              No devices found
            </div>

            <div v-else class="space-y-4">
              <div v-for="device in devices" :key="device.id" 
                class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <i :class="getDeviceIcon(device.device_type)" class="text-[#ff4d4d]"></i>
                  </div>
                  <div>
                    <p class="font-medium">{{ device.device_name }}</p>
                    <p class="text-sm text-white/60">
                      {{ device.device_type }} • Last active {{ formatDate(device.last_active) }}
                    </p>
                    <p v-if="device.device_model" class="text-xs text-white/40">
                      {{ device.device_model }} • {{ device.os_version || 'Unknown OS' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <span :class="device.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'" 
                    class="px-3 py-1 rounded-full text-sm">
                    {{ device.is_active ? 'Active' : 'Inactive' }}
                  </span>
                  <button v-if="device.is_active && devices.length > 1" 
                    @click="deactivateDevice(device.id)"
                    class="text-red-500 hover:text-red-400 transition-colors"
                    :disabled="isDeactivating"
                  >
                    <i class="fas fa-times-circle"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="deviceError" class="mt-4 p-4 bg-red-500/20 text-red-500 rounded-lg text-sm">
              {{ deviceError }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Edit Profile Modal -->
    <div v-if="isEditModalOpen" class="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 mb-safe">
      <div class="bg-[#1d1d1d] rounded-xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">Edit Profile</h2>
          <button @click="isEditModalOpen = false" class="text-white/60 hover:text-white">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-white/60 mb-1">First Name</label>
            <input 
              v-model="editForm.firstName"
              type="text"
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#ff4d4d]"
              placeholder="Enter your first name"
              :class="{ 'border-red-500': errors.firstName }"
              required
            >
            <p v-if="errors.firstName" class="mt-1 text-sm text-red-500">{{ errors.firstName }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-white/60 mb-1">Last Name</label>
            <input 
              v-model="editForm.lastName"
              type="text"
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#ff4d4d]"
              placeholder="Enter your last name"
              :class="{ 'border-red-500': errors.lastName }"
              required
            >
            <p v-if="errors.lastName" class="mt-1 text-sm text-red-500">{{ errors.lastName }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-white/60 mb-1">Phone Number</label>
            <input 
              v-model="editForm.phone"
              type="tel"
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#ff4d4d] opacity-50 cursor-not-allowed"
              placeholder="Enter your phone number"
              disabled
            >
            <p class="mt-1 text-sm text-white/60">Phone number cannot be changed</p>
          </div>

          <div class="pt-4">
            <button 
              type="submit"
              class="w-full py-3 bg-gradient-to-r from-[#c30059] to-[#ff4d4d] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              :disabled="isLoading || !isFormValid"
            >
              <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
              <span>{{ isLoading ? 'Saving...' : 'Save Changes' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import AppHeader from '../components/Header.vue'
import ReferralCard from '../components/ReferralCard.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'ProfilePage',
  components: {
    AppHeader,
    ReferralCard
  },
  data() {
    return {
      isEditModalOpen: false,
      editForm: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      },
      errors: {},
      devices: [],
      isLoadingDevices: false,
      deviceError: null,
      isDeactivating: false
    }
  },
  computed: {
    ...mapGetters(['currentUser']),
    user() {
      return this.currentUser
    },
    userInitials() {
      if (!this.user) return ''
      const firstName = this.user.first_name || ''
      const lastName = this.user.last_name || ''
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || this.user.phone.slice(0, 2)
    },
    userName() {
      if (!this.user) return ''
      if (this.user.first_name || this.user.last_name) {
        return `${this.user.first_name || ''} ${this.user.last_name || ''}`.trim()
      }
      return this.user.phone
    },
    isSubscriptionActive() {
      if (!this.user?.subscription_end_date) return false
      return new Date(this.user.subscription_end_date) > new Date()
    },
    daysRemaining() {
      if (!this.user?.subscription_end_date) return 0
      const end = new Date(this.user.subscription_end_date)
      const now = new Date()
      const diff = end - now
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }
  },
  async created() {
    // Ensure user data is loaded
    if (!this.user) {
      await this.$store.dispatch('initializeStore')
    }
    
    // If still no user data, redirect to home
    if (!this.user) {
      console.error('Failed to load user data')
      this.$router.push('/')
      return
    }

    this.loadDevices()
  },
  methods: {
    formatDate(date) {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    formatSubscriptionDate(date) {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    getDeviceIcon(type) {
      const icons = {
        mobile: 'fa-mobile-alt',
        tablet: 'fa-tablet-alt',
        desktop: 'fa-desktop',
        tv: 'fa-tv',
        default: 'fa-device'
      }
      return icons[type.toLowerCase()] || icons.default
    },
    async loadDevices() {
      this.isLoadingDevices = true
      this.deviceError = null
      try {
        const response = await fetch(`https://ott.no1news.in/users/devices-info/?phone=${this.user.phone}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Failed to load devices')
        }

        const data = await response.json()
        if (data.status === 'success' && data.devices) {
          this.devices = data.devices
        } else {
          this.devices = []
          this.deviceError = data.message || 'No devices found'
        }
      } catch (error) {
        console.error('Failed to load devices:', error)
        this.deviceError = 'Failed to load devices. Please try again.'
      } finally {
        this.isLoadingDevices = false
      }
    },
    async deactivateDevice(deviceId) {
      if (this.isDeactivating) return
      this.isDeactivating = true
      try {
        // Add device deactivation logic here
        const response = await fetch(`https://ott.no1news.in/users/deactivate-device/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRFToken': localStorage.getItem('csrfToken')
          },
          credentials: 'include',
          body: JSON.stringify({
            device_id: deviceId,
            phone: this.user.phone
          })
        })

        if (!response.ok) {
          throw new Error('Failed to deactivate device')
        }

        await this.loadDevices()
      } catch (error) {
        console.error('Failed to deactivate device:', error)
        this.deviceError = 'Failed to deactivate device. Please try again.'
      } finally {
        this.isDeactivating = false
      }
    }
  }
}
</script>

<style scoped>
/* Add safe area margin for mobile devices */
.mb-safe {
  margin-bottom: env(safe-area-inset-bottom, 0px);
}

/* Adjust bottom padding for mobile */
@media (max-width: 768px) {
  .pb-32 {
    padding-bottom: calc(8rem + env(safe-area-inset-bottom, 0px));
  }
}
</style> 