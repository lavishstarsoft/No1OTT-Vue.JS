<template>
  <div>
    <Header />
    <div class="min-h-screen bg-gray-900 text-white p-4 md:p-8 pt-32 md:pt-36 lg:pt-28">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div class="space-y-6">
          <section>
            <h2 class="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p class="text-gray-300">By accessing or using our service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">2. Subscription and Payments</h2>
            <ul class="list-disc pl-6 text-gray-300">
              <li>Subscription fees are billed in advance</li>
              <li>We may change subscription fees with 30 days notice</li>
              <li>Refunds are provided according to our refund policy</li>
              <li>You are responsible for all charges incurred under your account</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">3. User Account</h2>
            <ul class="list-disc pl-6 text-gray-300">
              <li>You must be at least 18 years old to create an account</li>
              <li>You are responsible for maintaining account security</li>
              <li>Account sharing is not permitted</li>
              <li>We may terminate accounts that violate our terms</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">4. Content Usage Rights</h2>
            <ul class="list-disc pl-6 text-gray-300">
              <li>Content is for personal, non-commercial use only</li>
              <li>You may not download or copy content unless explicitly permitted</li>
              <li>Content availability may vary by region</li>
              <li>We reserve the right to modify available content</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">5. Prohibited Activities</h2>
            <ul class="list-disc pl-6 text-gray-300">
              <li>Sharing account credentials</li>
              <li>Recording or redistributing content</li>
              <li>Using VPNs to circumvent regional restrictions</li>
              <li>Any form of harassment or abuse</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">6. Service Availability</h2>
            <p class="text-gray-300">We strive to provide uninterrupted service but do not guarantee continuous, error-free access. We may modify or discontinue features without notice.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">7. Changes to Terms</h2>
            <p class="text-gray-300">We may modify these terms at any time. Continued use of our service after changes constitutes acceptance of new terms.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">8. Contact Information</h2>
            <p class="text-gray-300">For questions about these Terms of Service, please contact us at support@yourott.com</p>
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
  name: 'TermsOfService',
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