<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black/95 z-50 flex flex-col overflow-y-auto profile-menu"
  >
    <!-- Header -->
    <div class="flex justify-between items-center p-6">
      <h1 class="text-4xl font-bold text-white">MENU<span class="text-[#ff4d4d]">.</span></h1>
      <button @click="close" class="text-white/80 hover:text-white">
        <i class="fas fa-times text-2xl"></i>
      </button>
    </div>

    <!-- User Profile Section (if logged in) -->
    <div v-if="user" class="px-6 py-4 border-b border-white/10">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-gradient-to-r from-[#c30059] to-[#ff4d4d] flex items-center justify-center text-white">
          <span class="text-2xl font-semibold">{{ userInitials }}</span>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-white">{{ userName }}</h2>
          <p class="text-white/60">{{ user.phone }}</p>
        </div>
      </div>
    </div>

    <!-- Menu Items -->
    <div class="flex-1 px-6 py-4">
      <div class="space-y-6">
        <!-- My Profile (if logged in) -->
        <router-link 
          v-if="user" 
          to="/profile" 
          class="flex items-center gap-4 text-white/80 hover:text-white group"
          @click="handleProfileClick"
        >
          <div class="w-8 h-8 flex items-center justify-center text-[#ff4d4d]">
            <i class="fas fa-user text-xl"></i>
          </div>
          <span class="text-lg">My Profile</span>
        </router-link>

        <!-- My List (if logged in) -->
        <a 
          v-if="user" 
          @click.prevent 
          class="flex items-center gap-4 text-white/80 hover:text-white group cursor-pointer"
        >
          <div class="w-8 h-8 flex items-center justify-center text-[#ff4d4d]">
            <i class="fas fa-heart text-xl"></i>
          </div>
          <span class="text-lg">My List</span>
        </a>

        <!-- Referral -->
        <router-link 
          v-if="user" 
          to="/referral" 
          class="flex items-center gap-4 text-white/80 hover:text-white group"
          @click="close"
        >
          <div class="w-8 h-8 flex items-center justify-center text-[#ff4d4d]">
            <i class="fas fa-users text-xl"></i>
          </div>
          <span class="text-lg">Referral</span>
        </router-link>

        <!-- Wallet -->
        <router-link 
          to="/wallet" 
          class="flex items-center gap-4 text-white/80 hover:text-white group"
          @click="close"
        >
          <div class="w-8 h-8 flex items-center justify-center text-[#ff4d4d]">
            <i class="fas fa-wallet text-xl"></i>
          </div>
          <span class="text-lg">Wallet</span>
        </router-link>

        <!-- Help -->
        <a 
          @click.prevent 
          class="flex items-center gap-4 text-white/80 hover:text-white group cursor-pointer"
        >
          <div class="w-8 h-8 flex items-center justify-center text-[#ff4d4d]">
            <i class="fas fa-headphones text-xl"></i>
          </div>
          <span class="text-lg">Help</span>
        </a>

        <!-- Offers -->
        <a 
          @click.prevent 
          class="flex items-center gap-4 text-white/80 hover:text-white group cursor-pointer"
        >
          <div class="w-8 h-8 flex items-center justify-center text-[#ff4d4d]">
            <i class="fas fa-gift text-xl"></i>
          </div>
          <span class="text-lg">Offers</span>
        </a>

        <!-- Terms and Conditions -->
        <a 
          @click.prevent 
          class="flex items-center gap-4 text-white/80 hover:text-white group cursor-pointer"
        >
          <div class="w-8 h-8 flex items-center justify-center text-[#ff4d4d]">
            <i class="fas fa-file-alt text-xl"></i>
          </div>
          <span class="text-lg">Terms and Conditions</span>
        </a>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="p-6 space-y-4 pb-24 md:pb-6">
      <template v-if="user">
        <button 
          @click="handleLogout"
          class="w-full py-4 px-6 bg-[#1d1d1d] text-white font-semibold rounded-lg hover:bg-[#2d2d2d] transition-colors"
        >
          Logout
        </button>
      </template>
      <template v-else>
        <button 
          @click="handleSignIn"
          class="w-full py-4 px-6 bg-[#1d1d1d] text-white font-semibold rounded-lg hover:bg-[#2d2d2d] transition-colors"
        >
          Sign In
        </button>
        <button 
          @click="handleSubscribe"
          class="w-full py-4 px-6 bg-[#ff4d4d] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Subscribe Now
        </button>
      </template>
      <p class="text-center text-white/40 text-sm">Version 0.1.38</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { handleLogout } from '@/utils/auth'

export default {
  name: 'ProfileMenu',
  props: {
    isOpen: {
      type: Boolean,
      default: false
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
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        // Refresh store data when menu is opened
        this.$store.dispatch('initializeStore')
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    handleProfileClick() {
      this.close()
      this.$nextTick(() => {
        this.$router.push('/profile')
      })
    },
    handleSignIn() {
      this.$router.push('/login')
      this.close()
    },
    handleSubscribe() {
      this.$router.push('/plans')
      this.close()
    },
    async handleLogout() {
      try {
        this.$emit('loading', true)
        await handleLogout()
        this.$store.commit('setUser', null)
        this.$store.commit('setAuthenticated', false)
        localStorage.removeItem('hasCompletedRegistration')
        this.close()
        this.$router.push('/login')
      } catch (error) {
        console.error('Logout failed:', error)
        alert('Logout failed. Please try again.')
      } finally {
        this.$emit('loading', false)
      }
    }
  }
}
</script> 