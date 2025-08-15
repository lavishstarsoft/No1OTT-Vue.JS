<template>
  <div>
    <Header />
    <div class="min-h-screen bg-gray-900 text-white p-4 md:p-8 pt-32 md:pt-36 lg:pt-28">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Cookie Policy</h1>
        
        <div class="space-y-6">
          <section>
            <h2 class="text-xl font-semibold mb-4">1. What Are Cookies?</h2>
            <p class="text-gray-300">Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by:</p>
            <ul class="list-disc pl-6 mt-2 text-gray-300">
              <li>Remembering your preferences and settings</li>
              <li>Keeping you signed in to your account</li>
              <li>Understanding how you use our service</li>
              <li>Improving our platform based on your behavior</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">2. Types of Cookies We Use</h2>
            <div class="space-y-4">
              <div>
                <h3 class="text-lg font-medium mb-2">Essential Cookies</h3>
                <p class="text-gray-300">These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website.</p>
              </div>
              
              <div>
                <h3 class="text-lg font-medium mb-2">Preference Cookies</h3>
                <p class="text-gray-300">These cookies remember your preferences and choices to provide a more personalized experience.</p>
              </div>
              
              <div>
                <h3 class="text-lg font-medium mb-2">Analytics Cookies</h3>
                <p class="text-gray-300">These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
              </div>
              
              <div>
                <h3 class="text-lg font-medium mb-2">Marketing Cookies</h3>
                <p class="text-gray-300">These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">3. How We Use Cookies</h2>
            <p class="text-gray-300">We use cookies to:</p>
            <ul class="list-disc pl-6 mt-2 text-gray-300">
              <li>Remember your login details</li>
              <li>Remember your preferences (language, region, etc.)</li>
              <li>Analyze how our website is used</li>
              <li>Personalize content and ads</li>
              <li>Provide social media features</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">4. Managing Cookies</h2>
            <p class="text-gray-300">You can control and manage cookies in various ways:</p>
            <ul class="list-disc pl-6 mt-2 text-gray-300">
              <li>Browser settings: You can modify your browser settings to accept or reject cookies</li>
              <li>Our cookie preferences tool: Use our cookie settings to customize your preferences</li>
              <li>Third-party tools: Various tools are available to manage cookies across all websites</li>
            </ul>
            <p class="text-gray-300 mt-4">Please note that blocking some types of cookies may impact your experience on our website.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">5. Third-Party Cookies</h2>
            <p class="text-gray-300">Some cookies are placed by third-party services that appear on our pages. We do not control these third-party cookies. You can learn more about these cookies and how to manage them by visiting the respective third party's privacy policy.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">6. Updates to This Policy</h2>
            <p class="text-gray-300">We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold mb-4">7. Contact Us</h2>
            <p class="text-gray-300">If you have any questions about our Cookie Policy, please contact us at support@yourott.com</p>
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
  name: 'CookiePolicy',
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