<template>
  <div class="relative w-full h-full" ref="mapContainer">
    <div class="absolute inset-0 flex items-center justify-center" v-if="loading">
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 border-4 border-[#c30059] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-white/60">Loading map data...</p>
      </div>
    </div>

    <!-- Map Container -->
    <svg ref="mapSvg" class="w-full h-full"></svg>

    <!-- Tooltip -->
    <div
      v-if="hoveredState"
      class="absolute pointer-events-none bg-[#1d1d1d] px-4 py-2 rounded-lg shadow-lg text-sm"
      :style="tooltipStyle"
    >
      <p class="font-medium">{{ hoveredState.properties.NAME_1 }}</p>
      <p class="text-white/60 text-xs">{{ getStateDistricts(hoveredState.properties.NAME_1) }} districts</p>
    </div>

    <!-- Legend -->
    <div class="absolute bottom-4 right-4 bg-[#1d1d1d] rounded-lg p-4 shadow-lg">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-4 h-4 rounded bg-[#c30059]"></div>
        <span class="text-sm">Selected State</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded bg-white/10"></div>
        <span class="text-sm">Available States</span>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { onMounted, ref, watch } from 'vue'
import indiaGeoJson from '@/assets/geojson/india-states.json'

export default {
  name: 'IndiaMap',
  props: {
    highlightedState: {
      type: Object,
      default: null
    }
  },
  setup(props, { emit }) {
    const mapContainer = ref(null)
    const mapSvg = ref(null)
    const loading = ref(true)
    const hoveredState = ref(null)
    const tooltipStyle = ref({
      top: '0px',
      left: '0px'
    })

    const states = ref([
      { id: 1, name: 'Andhra Pradesh', count: 26 },
      { id: 2, name: 'Telangana', count: 33 },
      { id: 3, name: 'Tamil Nadu', count: 38 },
      { id: 4, name: 'Kerala', count: 14 },
      { id: 5, name: 'Karnataka', count: 31 },
      { id: 6, name: 'Maharashtra', count: 36 },
      { id: 7, name: 'Madhya Pradesh', count: 52 },
      { id: 8, name: 'Uttar Pradesh', count: 75 },
      { id: 9, name: 'Rajasthan', count: 33 },
      { id: 10, name: 'Odisha', count: 30 },
      { id: 11, name: 'West Bengal', count: 23 },
      { id: 12, name: 'Bihar', count: 38 }
    ])

    const getStateDistricts = (stateName) => {
      const state = states.value.find(s => s.name === stateName)
      return state ? state.count : 0
    }

    const initMap = () => {
      try {
        // Clear previous content
        const svg = d3.select(mapSvg.value)
        svg.selectAll('*').remove()

        // Get container dimensions
        const { width, height } = mapContainer.value.getBoundingClientRect()
        svg.attr('width', width).attr('height', height)

        // Set up projection
        const projection = d3.geoMercator()
          .fitSize([width * 0.8, height * 0.8], indiaGeoJson)
          .center([83, 23])
          .translate([width / 2, height / 2])
          .scale(width * 1.5)

        const path = d3.geoPath().projection(projection)

        // Create container group
        const g = svg.append('g')

        // Draw states
        g.selectAll('path')
          .data(indiaGeoJson.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('class', d => `state ${d.properties.NAME_1.replace(/\s+/g, '-')}`)
          .classed('state-path', true)
          .on('mouseenter', (event, d) => {
            hoveredState.value = d
            const [x, y] = d3.pointer(event)
            tooltipStyle.value = {
              top: `${y + 10}px`,
              left: `${x + 10}px`
            }
          })
          .on('mouseleave', () => {
            hoveredState.value = null
          })
          .on('click', (event, d) => {
            const state = states.value.find(s => s.name === d.properties.NAME_1)
            if (state) {
              emit('select-state', state)
            }
          })

        // Add state labels
        g.selectAll('text')
          .data(indiaGeoJson.features)
          .enter()
          .append('text')
          .attr('class', 'state-label')
          .attr('transform', d => `translate(${path.centroid(d)})`)
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .style('fill', 'rgba(255, 255, 255, 0.8)')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .text(d => d.properties.NAME_1)

        loading.value = false
      } catch (error) {
        console.error('Error initializing map:', error)
        loading.value = false
      }
    }

    // Watch for window resize
    const handleResize = () => {
      if (mapContainer.value && mapSvg.value) {
        initMap() // Reinitialize map on resize
      }
    }

    onMounted(() => {
      window.addEventListener('resize', handleResize)
      initMap()

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    })

    // Watch for highlighted state changes
    watch(() => props.highlightedState, (newState) => {
      if (!mapSvg.value) return

      d3.selectAll('.state-path')
        .classed('highlighted', false)

      if (newState) {
        d3.select(`.state.${newState.name.replace(/\s+/g, '-')}`)
          .classed('highlighted', true)
      }
    })

    return {
      mapContainer,
      mapSvg,
      loading,
      hoveredState,
      tooltipStyle,
      getStateDistricts
    }
  }
}
</script>

<style scoped>
.state-path {
  fill: rgba(255, 255, 255, 0.15);
  stroke: rgba(255, 255, 255, 0.4);
  stroke-width: 1.5;
  transition: all 0.2s;
  cursor: pointer;
}

.state-path:hover {
  fill: rgba(195, 0, 89, 0.3);
  stroke: rgb(195, 0, 89);
}

.state-path.highlighted {
  fill: rgba(195, 0, 89, 0.3);
  stroke: rgb(195, 0, 89);
}

.state-label {
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style> 