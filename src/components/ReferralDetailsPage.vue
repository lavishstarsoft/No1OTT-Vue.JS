<template>
  <div class="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] pb-24 md:pb-8">
    <!-- Header Section -->
    <div class="bg-[#1a1a1a]/50 p-4 pt-16 pb-8 md:p-8 text-center relative">
      <!-- Back Button -->
      <button 
        @click="$router.push('/referral')"
        class="absolute top-6 left-6 text-white/70 hover:text-white"
      >
        <i class="fas fa-arrow-left text-xl"></i>
      </button>

      <h1 class="text-3xl font-bold text-white mb-2">Referral Details</h1>
      <p class="text-white/60">View all your referral statistics and history</p>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto p-4 md:p-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total Referrals Card -->
        <div class="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-white/60 text-sm">Total Referrals</p>
              <h3 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mt-1">
                {{ totalReferrals }}
              </h3>
            </div>
            <div class="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500/10 to-violet-500/10 flex items-center justify-center">
              <i class="fas fa-users text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500"></i>
            </div>
          </div>
        </div>

        <!-- Your Referral Code Card -->
        <div class="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <p class="text-white/60 text-sm mb-2">Your Referral Code</p>
          <div class="flex items-center gap-3">
            <span class="text-xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
              {{ referralCode }}
            </span>
            <button 
              @click="copyToClipboard(referralCode)"
              class="text-white/60 hover:text-white transition-colors"
            >
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>

        <!-- QR Code Card -->
        <div class="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <p class="text-white/60 text-sm mb-2">QR Code</p>
          <div class="flex items-center gap-3">
            <img 
              v-if="qrCodeUrl" 
              :src="qrCodeUrl" 
              alt="Referral QR Code" 
              class="w-12 h-12 rounded-lg"
            />
            <button 
              @click="downloadQR"
              class="text-white/60 hover:text-white transition-colors"
            >
              <i class="fas fa-download"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Referral History Table/Cards -->
      <div class="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden mb-safe">
        <div class="p-6 border-b border-white/10">
          <h2 class="text-xl font-semibold text-white">Referral History</h2>
        </div>
        
        <!-- Desktop Table View -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-[#1d1d1d]">
                <th class="px-6 py-4 text-left text-sm font-medium text-white/70">Phone Number</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-white/70">First Name</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-white/70">Joined Date</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-white/70">Subscription</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-white/70">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="(user, index) in referredUsers" 
                  :key="index"
                  class="hover:bg-white/5 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500/10 to-violet-500/10 flex items-center justify-center">
                      <i class="fas fa-user text-sm text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500"></i>
                    </div>
                    <span class="text-white font-medium">{{ maskPhone(user.phone) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-white/90">
                    {{ user.first_name || '-' }}{{ user.last_name ? ' ' + user.last_name : '' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-white/70">{{ formatDate(user.joined_at) }}</td>
                <td class="px-6 py-4">
                  <span 
                    :class="user.is_subscribed ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    <i :class="user.is_subscribed ? 'fas fa-crown' : 'fas fa-user'" class="mr-1"></i>
                    {{ user.is_subscribed ? 'Premium' : 'Free' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                    <i class="fas fa-check-circle mr-1"></i>
                    Joined
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div class="md:hidden">
          <div v-for="(user, index) in referredUsers" 
               :key="index" 
               class="p-5 border-b border-white/5 hover:bg-white/5 transition-all duration-300 animate-fade-in">
            <!-- User Info Header -->
            <div class="flex items-start gap-4">
              <div class="relative">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500/10 to-violet-500/10 flex items-center justify-center backdrop-blur-xl">
                  <i class="fas fa-user text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500"></i>
                </div>
                <div class="absolute -bottom-1 -right-1">
                  <span 
                    :class="user.is_subscribed ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'"
                    class="flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
                  >
                    <i :class="user.is_subscribed ? 'fas fa-crown' : 'fas fa-user'"></i>
                  </span>
                </div>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-white font-medium text-base">{{ maskPhone(user.phone) }}</div>
                    <div class="text-white/50 text-sm mt-0.5">{{ formatDate(user.joined_at) }}</div>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                    <i class="fas fa-check-circle mr-1"></i>
                    Joined
                  </span>
                </div>
              </div>
            </div>

            <!-- User Details -->
            <div class="mt-4 pl-16">
              <div class="space-y-3">
                <!-- Name -->
                <div class="flex items-center justify-between">
                  <div class="text-white/50 text-sm">Name</div>
                  <div class="text-white font-medium">
                    {{ user.first_name || '-' }}{{ user.last_name ? ' ' + user.last_name : '' }}
                  </div>
                </div>

                <!-- Subscription Status -->
                <div class="flex items-center justify-between">
                  <div class="text-white/50 text-sm">Subscription</div>
                  <div>
                    <span 
                      :class="user.is_subscribed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'"
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg"
                    >
                      {{ user.is_subscribed ? 'Premium Member' : 'Free User' }}
                    </span>
                  </div>
                </div>

                <!-- Join Time -->
                <div class="flex items-center justify-between">
                  <div class="text-white/50 text-sm">Joined</div>
                  <div class="text-white/80 text-sm">
                    {{ formatTimeAgo(user.joined_at) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="referredUsers.length === 0" class="p-12 text-center">
          <div class="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500/10 to-violet-500/10 flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-users text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500"></i>
          </div>
          <h3 class="text-white font-medium mb-2">No Referrals Yet</h3>
          <p class="text-white/60 text-sm">Share your referral code to start earning rewards!</p>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div v-if="showCopySuccess" 
      class="fixed bottom-24 md:bottom-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
      <i class="fas fa-check-circle text-xl"></i>
      <span class="font-medium">Copied to clipboard!</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReferralDetailsPage',
  data() {
    return {
      referralCode: '',
      qrCodeUrl: '',
      totalReferrals: 0,
      referredUsers: [],
      showCopySuccess: false,
      baseUrl: 'https://ott.no1news.in'
    }
  },
  methods: {
    async fetchReferralData() {
      try {
        const phone = localStorage.getItem('phone')
        if (!phone) {
          console.error('Phone number not found in localStorage')
          return
        }

        const response = await fetch(`${this.baseUrl}/users/referral-info/?phone=${phone}`, {
          headers: {
            'Accept': 'application/json'
          }
        })
        const data = await response.json()
        if (data.status === 'success') {
          this.referralCode = data.referral_code
          this.qrCodeUrl = data.qr_code_url
          this.totalReferrals = data.total_referrals
          this.referredUsers = data.referred_users.map(user => ({
            ...user,
            first_name: user.first_name || '-',
            last_name: user.last_name || '',
            is_subscribed: user.is_subscribed || false
          }))
        } else {
          console.error('Error fetching referral data:', data.message)
        }
      } catch (error) {
        console.error('Error fetching referral data:', error)
      }
    },
    maskPhone(phone) {
      if (!phone) return '';
      return `${phone.slice(0, 4)}****${phone.slice(-4)}`;
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      
      // For mobile screens
      if (window.innerWidth < 768) {
        return date.toLocaleString('en-US', { 
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }).replace(',', '');
      }
      
      // For desktop screens
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    },
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.showCopySuccess = true;
        setTimeout(() => {
          this.showCopySuccess = false;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    },
    downloadQR() {
      if (!this.qrCodeUrl) return;
      
      const link = document.createElement('a');
      link.href = this.qrCodeUrl;
      link.download = `referral_qr_${this.referralCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    formatTimeAgo(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return this.formatDate(dateString);
    }
  },
  async created() {
    await this.fetchReferralData();
  }
}
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Add smooth hover effect for cards */
.hover\:bg-white\/5:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Add safe area margin for mobile devices */
.mb-safe {
  margin-bottom: env(safe-area-inset-bottom, 0px);
}

/* Adjust bottom padding for mobile */
@media (max-width: 768px) {
  .pb-24 {
    padding-bottom: calc(6rem + env(safe-area-inset-bottom, 0px));
  }
}
</style> 