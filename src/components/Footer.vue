<template>
  <footer class="bg-[#181c23] text-white w-full min-w-full">
    <!-- App Download & Promo Row -->
    <div class="w-full px-4 sm:px-6 md:px-8 lg:px-10 pb-20 md:pb-0">
      <div class="w-full flex flex-col md:flex-row items-center justify-between p-3 md:p-4 gap-4">
        <!-- OTT Promo Left (desktop) -->
        <div class="w-full md:w-1/2 flex items-center justify-center md:justify-start mb-4 md:mb-0">
          <div class="flex items-center gap-4">
            <svg class="h-12 w-12 text-pink-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A2 2 0 0122 9.618v4.764a2 2 0 01-2.447 1.894L15 14M4 6v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" /></svg>
            <div>
              <div class="text-lg md:text-2xl font-bold">Stream the Latest Movies & Shows</div>
              <div class="text-sm md:text-base text-gray-300">Watch anywhere, anytime, on any device. Experience entertainment like never before!</div>
            </div>
          </div>
        </div>
        <!-- App Download Badges Right (desktop) -->
        <div class="w-full md:w-1/2 flex justify-center md:justify-end">
          <div class="flex flex-row gap-2 w-full md:w-auto justify-center">
            <a href="https://play.google.com/store/apps/details?id=com.sagiam.vagmi.no1ott&hl=en  " target="_blank" class="flex-1 flex justify-center md:justify-end">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" class="h-14 w-full max-w-xs object-contain"/>
            </a>
            <a href="https://www.apple.com/app-store/" target="_blank" class="flex-1 flex justify-center md:justify-end">
              <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" class="h-14 w-full max-w-xs object-contain"/>
            </a>
          </div>
        </div>
      </div>

      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-5 gap-4 md:gap-8 py-10 border-b border-gray-700 mt-6">
        <!-- Need Help Section -->
        <div class="rounded-xl bg-[#23272f] p-4 shadow-sm xs:col-span-2 md:col-span-1">
          <div class="font-bold mb-3 text-lg">NEED HELP?</div>
          <div class="text-sm text-gray-300">
            <p class="mb-2">Having trouble? We're here to help you!</p>
            <p class="mb-4">Contact our support team:</p>
            <a href="mailto:support@https://ott.no1news.in" class="block text-white hover:text-blue-400 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-center font-semibold rounded-lg py-2.5 px-6 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <div class="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@no1ott.com
              </div>
            </a>
          </div>
        </div>

        <!-- Help Center -->
        <div class="rounded-xl bg-[#23272f] p-4 shadow-sm xs:col-span-1 md:col-span-1">
          <div class="font-bold mb-3 text-lg">HELP CENTER</div>
          <ul class="space-y-2 text-sm text-gray-300">
            <li>Account & Billing</li>
            <li><router-link to="/plans" class="hover:text-white transition-colors">Subscription Plans</router-link></li>
            <li>Supported Devices</li>
            <li>FAQs</li>
            <li>Report a Problem</li>
            <li>Accessibility</li>
          </ul>
        </div>

        <!-- Company -->
        <div class="rounded-xl bg-[#23272f] p-4 shadow-sm xs:col-span-1 md:col-span-1">
          <div class="font-bold mb-3 text-lg">COMPANY</div>
          <ul class="space-y-2 text-sm text-gray-300">
            <li>About Us</li>
            <li>Careers</li>
            <li>Press & Media</li>
            <li>Contact</li>
            <li>Investor Relations</li>
          </ul>
        </div>

        <!-- Legal -->
        <div class="rounded-xl bg-[#23272f] p-4 shadow-sm xs:col-span-1 md:col-span-1">
          <div class="font-bold mb-3 text-lg">LEGAL</div>
          <ul class="space-y-2 text-sm text-gray-300">
            <li><router-link to="/terms-of-service" class="hover:text-white transition-colors">Terms of Service</router-link></li>
            <li><router-link to="/privacy-policy" class="hover:text-white transition-colors">Privacy Policy</router-link></li>
            <li><router-link to="/cookie-policy" class="hover:text-white transition-colors">Cookie Policy</router-link></li>
            <li>Content Guidelines</li>
            <li>DMCA</li>
          </ul>
        </div>

        <!-- Explore -->
        <div class="rounded-xl bg-[#23272f] p-4 shadow-sm xs:col-span-1 md:col-span-1">
          <div class="font-bold mb-3 text-lg">EXPLORE</div>
          <ul class="space-y-2 text-sm text-gray-300">
            <li>Trending Now</li>
            <li>Top Rated</li>
            <li>New Releases</li>
            <li>Genres</li>
            <li>Watchlist</li>
            <li>Gift Cards</li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="flex flex-col md:flex-row justify-between items-center py-6 text-xs text-gray-400 gap-4">
        <div class="flex items-center gap-2">
          <span>&copy; 2025 No.1 OTT. All rights reserved.</span>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <a href="#" class="hover:underline">Sitemap</a>
          <router-link to="/privacy-policy" class="hover:underline">Privacy Policy</router-link>
          <router-link to="/terms-of-service" class="hover:underline">Terms of Service</router-link>
        </div>
        <div class="flex items-center gap-3 text-xl">
          <a href="https://www.facebook.com/profile.php?id=61573190087478" target="_blank" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="https://www.instagram.com/no1newsteluguofficial/" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
          <a href="https://www.youtube.com/@no1newstelugu5" target="_blank" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
}
</script>

<style scoped>
footer {
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  width: 100vw;
  min-width: 100vw;
  margin: 0;
  padding: 0;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  box-sizing: border-box;
}

@media screen and (max-width: 640px) {
  footer {
    width: 100%;
    min-width: 100%;
    left: 0;
    right: 0;
    margin-left: 0;
    margin-right: 0;
  }
}
</style> 