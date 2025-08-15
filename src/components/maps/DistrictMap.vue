<template>
  <div class="relative w-full h-full">
    <svg
      viewBox="0 0 800 800"
      class="w-full h-full"
    >
      <!-- Constituencies -->
      <path
        v-for="area in constituencies"
        :key="area.id"
        :d="getAreaPath(area.id)"
        :class="getAreaClass(area)"
        @click="$emit('select-area', area)"
        @mouseenter="$emit('hover-area', area)"
        @mouseleave="$emit('hover-area', null)"
      >
        <title>{{ area.name }}</title>
      </path>
    </svg>

    <!-- Area Labels -->
    <div class="absolute inset-0 pointer-events-none">
      <div 
        v-for="area in constituencies"
        :key="area.id"
        :style="getAreaLabelStyle(area)"
        class="absolute text-xs font-medium text-white/60"
      >
        {{ area.name }}
      </div>
    </div>

    <!-- District Boundary -->
    <div class="absolute inset-0 pointer-events-none">
      <svg
        viewBox="0 0 800 800"
        class="w-full h-full"
      >
        <path
          :d="getDistrictBoundaryPath()"
          class="fill-none stroke-[#c30059] stroke-2 opacity-50"
        />
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DistrictMap',
  props: {
    district: {
      type: Object,
      required: true
    },
    highlightedArea: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      constituencies: [
        { id: 1, name: 'Constituency 1' },
        { id: 2, name: 'Constituency 2' },
        { id: 3, name: 'Constituency 3' },
        { id: 4, name: 'Constituency 4' },
        { id: 5, name: 'Constituency 5' },
        { id: 6, name: 'Constituency 6' }
      ]
    }
  },
  methods: {
    getAreaPath(id) {
      // Simplified paths for demonstration
      const baseX = (id % 3) * 200 + 100
      const baseY = Math.floor(id / 3) * 200 + 100
      return `M${baseX} ${baseY} L${baseX + 150} ${baseY} L${baseX + 150} ${baseY + 150} L${baseX} ${baseY + 150} Z`
    },
    getAreaClass(area) {
      const isHighlighted = this.highlightedArea?.id === area.id
      return [
        'cursor-pointer transition-colors duration-200',
        'fill-white/5 hover:fill-[#c30059]/20 stroke-white/20 hover:stroke-[#c30059]',
        isHighlighted ? 'fill-[#c30059]/20 stroke-[#c30059]' : ''
      ]
    },
    getAreaLabelStyle(area) {
      // Simplified positioning for demonstration
      const x = ((area.id % 3) * 200 + 175) / 8
      const y = (Math.floor(area.id / 3) * 200 + 175) / 8
      return {
        top: `${y}%`,
        left: `${x}%`,
        transform: 'translate(-50%, -50%)'
      }
    },
    getDistrictBoundaryPath() {
      // Simplified district boundary for demonstration
      return 'M50 50 L750 50 L750 750 L50 750 Z'
    }
  }
}
</script>

<style scoped>
path {
  stroke-width: 1;
}
</style> 