<template>
  <div class="fixed bottom-0 left-0 right-0 bg-[#121212]/95 backdrop-blur-md border-t border-white/10 md:hidden z-40">
    <div class="flex items-center justify-around p-0">
      <!-- Home -->
      <router-link to="/" class="nav-link pb" active-class="active">
        <i class="fas fa-home text-xl"></i>
        <span class="text-xs">Home</span>
      </router-link>

      <!-- Regional -->
      <router-link to="/regional" class="nav-link" active-class="active">
        <i class="fas fa-globe-asia text-xl"></i>
        <span class="text-xs">Regional</span>
      </router-link>

      <!-- Search -->
      <router-link to="/search" class="nav-link" active-class="active">
        <i class="fas fa-search text-xl"></i>
        <span class="text-xs">Search</span>
      </router-link>

      <!-- News -->
      <router-link to="/news" class="nav-link" active-class="active">
        <i class="fas fa-newspaper text-xl"></i>
        <span class="text-xs">News</span>
      </router-link>

      <!-- Profile/Menu -->
      <button 
        @click="toggleMenu"
        class="nav-link"
        :class="{ 'active': isMenuOpen }"
      >
        <i class="fas fa-user text-xl"></i>
        <span class="text-xs">Profile</span>
      </button>
    </div>
  </div>

  <!-- Profile Menu Overlay -->
  <ProfileMenu 
    :is-open="isMenuOpen"
    @close="isMenuOpen = false"
  />
</template>

<script>
import ProfileMenu from './ProfileMenu.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'MobileNav',
  components: {
    ProfileMenu
  },
  computed: {
    ...mapGetters(['currentUser']),
    isUserLoggedIn() {
      return !!this.currentUser;
    }
  },
  data() {
    return {
      isMenuOpen: false
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
      // Force Vuex store update
      if (this.isMenuOpen) {
        this.$store.dispatch('initializeStore');
      }
    }
  }
}
</script>

<style scoped>
.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  padding: 0.5rem;
  border: none;
  background: transparent;
  font-size: inherit;
  cursor: pointer;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.9);
}

.nav-link.active {
  color: transparent;
  background: linear-gradient(to right, #c30059, #ff4d4d);
  -webkit-background-clip: text;
  background-clip: text;
}

.nav-link.active i,
.nav-link.active span {
  background: linear-gradient(to right, #c30059, #ff4d4d);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
</style> 