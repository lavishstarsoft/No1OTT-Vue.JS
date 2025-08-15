<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Phone Number</label>
          <input 
            type="text" 
            v-model="phone" 
            placeholder="Enter your phone number"
            required
          />
        </div>
        
        <div v-if="showOTP" class="form-group">
          <label>OTP</label>
          <input 
            type="text" 
            v-model="otp" 
            placeholder="Enter OTP"
            required
          />
        </div>

        <button type="submit" class="login-btn">
          {{ showOTP ? 'Verify OTP' : 'Get OTP' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapMutations } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      phone: '',
      otp: '',
      showOTP: false
    }
  },
  methods: {
    ...mapMutations(['setUser', 'setAuthenticated']),
    
    async handleLogin() {
      try {
        if (!this.showOTP) {
          // Request OTP
          await axios.post('/api/users/request-otp/', {
            phone: this.phone,
            otp_type: 'login'
          })
          this.showOTP = true
        } else {
          // Verify OTP
          const response = await axios.post('/api/users/login/', {
            phone: this.phone,
            otp: this.otp
          })

          if (response.data.status === 'success') {
            // Store user data
            this.setUser(response.data.user)
            this.setAuthenticated(true)
            localStorage.setItem('isAuthenticated', 'true')
            localStorage.setItem('user', JSON.stringify(response.data.user))

            // Handle redirect
            const redirectPath = this.$route.query.redirect || '/'
            this.$router.push(redirectPath)
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        alert(error.response?.data?.message || 'Login failed')
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: #3399cc;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover {
  background: #2980b9;
}
</style> 