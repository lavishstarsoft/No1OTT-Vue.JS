<template>
  <div class="relative w-full h-full">
    <svg
      viewBox="0 0 800 800"
      class="w-full h-full"
    >
      <!-- Andhra Pradesh Districts -->
      <template v-if="state.name === 'Andhra Pradesh'">
        <path
          v-for="district in state.districts"
          :key="district.id"
          :d="getDistrictPath(district.id)"
          :class="getDistrictClass(district)"
          @click="$emit('select-district', district)"
          @mouseenter="$emit('hover-district', district)"
          @mouseleave="$emit('hover-district', null)"
        >
          <title>{{ district.name }}</title>
        </path>
      </template>

      <!-- Telangana Districts -->
      <template v-if="state.name === 'Telangana'">
        <path
          v-for="district in state.districts"
          :key="district.id"
          :d="getDistrictPath(district.id)"
          :class="getDistrictClass(district)"
          @click="$emit('select-district', district)"
          @mouseenter="$emit('hover-district', district)"
          @mouseleave="$emit('hover-district', null)"
        >
          <title>{{ district.name }}</title>
        </path>
      </template>
    </svg>

    <!-- District Labels -->
    <div class="absolute inset-0 pointer-events-none">
      <div 
        v-for="district in state.districts"
        :key="district.id"
        :style="getDistrictLabelStyle(district)"
        class="absolute text-xs font-medium text-white/60"
      >
        {{ district.name }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StateMap',
  props: {
    state: {
      type: Object,
      required: true
    },
    highlightedDistrict: {
      type: Object,
      default: null
    }
  },
  methods: {
    getDistrictPath(id) {
      // Simplified paths for demonstration
      const baseX = (id % 5) * 150 + 100
      const baseY = Math.floor(id / 5) * 150 + 100
      return `M${baseX} ${baseY} L${baseX + 100} ${baseY} L${baseX + 100} ${baseY + 100} L${baseX} ${baseY + 100} Z`
    },
    getDistrictClass(district) {
      const isHighlighted = this.highlightedDistrict?.id === district.id
      return [
        'cursor-pointer transition-colors duration-200',
        'fill-white/5 hover:fill-[#c30059]/20 stroke-white/20 hover:stroke-[#c30059]',
        isHighlighted ? 'fill-[#c30059]/20 stroke-[#c30059]' : ''
      ]
    },
    getDistrictLabelStyle(district) {
      // Simplified positioning for demonstration
      const x = ((district.id % 5) * 150 + 150) / 8
      const y = (Math.floor(district.id / 5) * 150 + 150) / 8
      return {
        top: `${y}%`,
        left: `${x}%`,
        transform: 'translate(-50%, -50%)'
      }
    }
  }
}
</script>

<style scoped>
path {
  stroke-width: 1;
}
</style> 