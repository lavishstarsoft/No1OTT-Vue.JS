<template>
  <transition name="toast">
    <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
      <div class="toast-content">
        <i :class="iconClass"></i>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ToastNotification',
  computed: {
    ...mapState(['toast']),
    iconClass() {
      switch (this.toast.type) {
        case 'success':
          return 'fas fa-check-circle';
        case 'error':
          return 'fas fa-exclamation-circle';
        case 'warning':
          return 'fas fa-exclamation-triangle';
        default:
          return 'fas fa-info-circle';
      }
    }
  }
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  min-width: 250px;
  max-width: 350px;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toast-content i {
  font-size: 1.25rem;
}

.toast-success {
  background-color: #10B981;
}

.toast-error {
  background-color: #EF4444;
}

.toast-warning {
  background-color: #F59E0B;
}

.toast-info {
  background-color: #3B82F6;
}

/* Toast animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style> 