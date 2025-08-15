<template>
  <div>
    <Header />
    <div class="min-h-screen bg-gray-900 text-white p-4 md:p-8 pt-32 md:pt-36 lg:pt-28">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div class="space-y-6">
          <section>
            <h2 class="text-xl font-semibold mb-4">1. Information We Collect</h2>
            <p class="text-gray-300">We collect information that you provide directly to us, including:</p>
            <ul class="list-disc pl-6 mt-2 text-gray-300">
              <li>Name and contact information</li>
              <li>Account credentials</li>
              <li>Payment information</li>
              <li>Viewing history and preferences</li>
              <li>Device information and IP address</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p class="text-gray-300">We use the collected information to:</p>
            <ul class="list-disc pl-6 mt-2 text-gray-300">
              <li>Provide and maintain our services</li>
              <li>Process your payments</li>
              <li>Personalize your viewing experience</li>
              <li>Send you updates and notifications</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">3. Data Security</h2>
            <p class="text-gray-300">We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">4. Data Sharing</h2>
            <p class="text-gray-300">We may share your information with:</p>
            <ul class="list-disc pl-6 mt-2 text-gray-300">
              <li>Service providers and partners</li>
              <li>Payment processors</li>
              <li>Legal authorities when required</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">5. Your Rights</h2>
            <p class="text-gray-300">You have the right to:</p>
            <ul class="list-disc pl-6 mt-2 text-gray-300">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request data deletion</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">6. Contact Us</h2>
            <p class="text-gray-300">If you have any questions about this Privacy Policy, please contact us at support@yourott.com</p>
          </section>

          <p class="text-sm text-gray-400 mt-8">Last updated: {{ currentDate }}</p>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'PrivacyPolicy',
  components: {
    Header,
    Footer
  },
  data() {
    return {
      currentDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}
</script> 