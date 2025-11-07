<template>
  <div class="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-4 pb-24 md:pb-8 flex items-center justify-center">
    <div class="w-full max-w-md mb-safe">
      <!-- Back Button - Only show when not in profile page -->
      <div v-if="!isInProfilePage" class="absolute top-6 left-6">
        <button 
          @click="$router.push('/')"
          class="text-white/70 hover:text-white"
        >
          <i class="fas fa-arrow-left text-xl"></i>
        </button>
      </div>

      <!-- Header Section -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Invite Friends</h1>
        <p class="text-white/60">Share the joy of entertainment with your friends</p>
      </div>

      <!-- Main Card -->
      <div class="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
        <!-- Referral Code Section -->
        <div class="text-center mb-6">
          <h2 class="text-white/80 text-xl mb-4">Your Unique Code</h2>
          <div class="bg-gradient-to-r from-[#333] to-[#404040] rounded-xl p-5 flex items-center justify-between gap-4 transform hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg" @click="copyToClipboard">
            <span class="text-3xl md:text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 tracking-wider flex-1">
              {{ referralCode || 'Loading...' }}
            </span>
            <div class="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-violet-500 hover:to-pink-500 transition-all duration-500">
              <i class="fas fa-copy text-white text-xl"></i>
            </div>
          </div>
        </div>

        <!-- QR Code Section -->
        <div class="flex flex-col items-center gap-6 mb-5">
          <div class="bg-gradient-to-r from-[#333] to-[#404040] rounded-xl p-8 transform hover:scale-105 transition-all duration-300">
            <div v-if="qrCodeUrl" class="relative group">
              <img :src="qrCodeUrl" alt="Referral QR Code" class="w-48 h-48 rounded-xl"/>
              <button @click="downloadQR" 
                class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex flex-col items-center justify-center gap-2">
                <i class="fas fa-download text-white text-2xl"></i>
                <span class="text-white text-sm">Download QR</span>
              </button>
            </div>
            <div v-else class="w-48 h-48 bg-[#444] rounded-xl flex items-center justify-center">
              <i class="fas fa-qrcode text-4xl text-white/30"></i>
            </div>
          </div>
        </div>

        <!-- Referral Stats Section -->
        <div class="mb-10">
          <div class="bg-gradient-to-r from-[#2a2a2a] to-[#333] rounded-xl p-4 border border-white/5">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-white/70 text-sm mb-1">Total Referrals</h3>
                <div class="flex items-baseline gap-2">
                  <span 
                    class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-300"
                    :class="{ 'animate-bounce': isCountUpdating }"
                  >
                    {{ totalReferrals }}
                  </span>
                  <span class="text-white/50 text-sm">people joined</span>
                </div>
                <!-- View Details Link -->
                <button 
                  @click="$router.push('/referral/details')"
                  class="mt-3 text-sm text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 hover:opacity-80 transition-opacity flex items-center gap-1"
                >
                  View Details
                  <i class="fas fa-arrow-right text-xs"></i>
                </button>
                <!-- Referred Users List -->
                <div v-if="referredUsers.length > 0" class="mt-3 space-y-2 max-h-32 overflow-y-auto">
                  <div v-for="(user, index) in latestTwoReferrals" 
                    :key="index" 
                    class="text-sm text-white/60 flex items-center gap-2 animate-fade-in">
                    <i class="fas fa-user-check text-green-500"></i>
                    <span>{{ maskPhone(user.phone) }} joined</span>
                    <span class="text-white/40">{{ formatDate(user.joined_at) }}</span>
                  </div>
                  <div v-if="referredUsers.length > 2" 
                    class="text-sm text-white/40 flex items-center gap-2 cursor-pointer hover:text-white/60 transition-colors"
                    @click="$router.push('/referral/details')">
                    <i class="fas fa-ellipsis-h"></i>
                    <span>View {{ referredUsers.length - 2 }} more</span>
                  </div>
                </div>
              </div>
              <div class="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500/10 to-violet-500/10 flex items-center justify-center">
                <i class="fas fa-users text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500"></i>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Share Section -->
        <div class="space-y-4">
          <button @click="shareWhatsApp" 
            class="w-full py-4 px-6 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] rounded-xl transition-all duration-500 flex items-center justify-center gap-3 transform hover:scale-105 shadow-lg">
            <i class="fab fa-whatsapp text-xl"></i>
            <span class="font-semibold">Share via WhatsApp</span>
          </button>
          
          <button @click="shareGeneral" 
            class="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-violet-500 hover:to-pink-500 rounded-xl transition-all duration-500 flex items-center justify-center gap-3 transform hover:scale-105 shadow-lg">
            <i class="fas fa-share-alt text-xl"></i>
            <span class="font-semibold">Share with Friends</span>
          </button>
        </div>
      </div>

      <!-- Success Toast -->
      <div v-if="showCopySuccess" 
        class="fixed bottom-24 md:bottom-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
        <i class="fas fa-check-circle text-xl"></i>
        <span class="font-medium">Code copied successfully!</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReferralCard',
  props: {
    isInProfilePage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      referralCode: '',
      qrCodeUrl: '',
      totalReferrals: 0,
      referredUsers: [],
      showCopySuccess: false,
      baseUrl: 'https://ott.no1news.in',
      websiteUrl: 'https://ott.no1news.in',
      pollingInterval: null,
      isCountUpdating: false
    }
  },
  computed: {
    referralUrl() {
      return `${this.websiteUrl}/#/login?ref=${this.referralCode}`;
    },
    shareMessage() {
      return `🎬 Join our OTT platform!\n\nUse my referral code: *${this.referralCode}*\n\n📱 Join using this link: ${this.referralUrl}\n\nEnjoy unlimited entertainment!`;
    },
    latestTwoReferrals() {
      return this.referredUsers.slice(0, 2);
    }
  },
  async created() {
    await this.fetchReferralData()
    this.startPolling()
  },
  beforeUnmount() {
    this.stopPolling()
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
          if (this.totalReferrals !== data.total_referrals) {
            this.isCountUpdating = true
            setTimeout(() => {
              this.isCountUpdating = false
            }, 1000)
          }
          this.referralCode = data.referral_code
          this.qrCodeUrl = data.qr_code_url
          this.totalReferrals = data.total_referrals
          this.referredUsers = data.referred_users
        } else {
          console.error('Error fetching referral data:', data.message)
        }
      } catch (error) {
        console.error('Error fetching referral data:', error)
      }
    },
    startPolling() {
      this.pollingInterval = setInterval(() => {
        this.fetchReferralData()
      }, 30000)
    },
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
    },
    async copyToClipboard() {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          // Modern way - using Clipboard API
          await navigator.clipboard.writeText(this.referralCode)
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea')
          textArea.value = this.referralCode
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          
          try {
            document.execCommand('copy')
            textArea.remove()
          } catch (err) {
            console.error('Fallback: Oops, unable to copy', err)
            textArea.remove()
            return
          }
        }
        
        this.showCopySuccess = true
        setTimeout(() => {
          this.showCopySuccess = false
        }, 2000)
      } catch (err) {
        console.error('Failed to copy text:', err)
      }
    },
    downloadQR() {
      if (!this.qrCodeUrl) return
      
      const link = document.createElement('a')
      link.href = this.qrCodeUrl
      link.download = `referral_qr_${this.referralCode}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    async downloadQRCodeImage() {
      try {
        // Fetch the image
        const response = await fetch(this.qrCodeUrl);
        const blob = await response.blob();
        
        // Create object URL
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `referral_qr_${this.referralCode}.png`;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        
        return true;
      } catch (error) {
        console.error('Error downloading QR code:', error);
        return false;
      }
    },
    async shareWhatsApp() {
      try {
        // Create WhatsApp share URL with the referral link
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(this.shareMessage)}`;
        window.open(whatsappUrl, '_blank');
      } catch (error) {
        console.error('Error sharing on WhatsApp:', error);
      }
    },
    shareGeneral() {
      if (navigator.share) {
        navigator.share({
          title: 'Join our OTT Platform',
          text: this.shareMessage,
          url: this.referralUrl
        })
      }
    },
    async share() {
      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Join our OTT Platform',
            text: this.shareMessage,
            url: this.referralUrl
          });
        } else {
          // Fallback to copying to clipboard
          await navigator.clipboard.writeText(this.shareMessage);
          this.showCopySuccess = true;
          setTimeout(() => {
            this.showCopySuccess = false;
          }, 2000);
        }
      } catch (error) {
        console.error('Error sharing:', error);
      }
    },
    maskPhone(phone) {
      if (!phone) return '';
      return `${phone.slice(0, 4)}****${phone.slice(-4)}`;
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}
</script>

<style>
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
  animation: fadeIn 0.5s ease-in-out;
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

/* Add smooth transitions for all interactive elements */
button, .hover\:scale-105 {
  will-change: transform;
  backface-visibility: hidden;
}

/* Scrollbar styling for referred users list */
.max-h-32 {
  scrollbar-width: thin;
  scrollbar-color: rgba(195, 0, 89, 0.5) rgba(45, 45, 45, 0.5);
}

.max-h-32::-webkit-scrollbar {
  width: 4px;
}

.max-h-32::-webkit-scrollbar-track {
  background: rgba(45, 45, 45, 0.5);
  border-radius: 2px;
}

.max-h-32::-webkit-scrollbar-thumb {
  background-color: rgba(195, 0, 89, 0.5);
  border-radius: 2px;
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