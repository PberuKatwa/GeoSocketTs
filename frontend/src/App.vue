<template>
  <div class="app-container">
    <!-- Map -->
    <div class="map-container">
      <div id="map" ref="mapContainer"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// WebSocket
const ws = ref(null)
const connected = ref(false)

// Route data
const fromCoords = ref({ lat: -1.286389, lng: 36.817223 })
const toCoords = ref({ lat: -1.292066, lng: 36.821946 })
const route = ref(null)
const routeInfo = ref(null)

// Driver tracking
const driverId = ref('driver-001')
const driverLocation = ref(null)
const tracking = ref(false)

// Map
const mapContainer = ref(null)
let map = null
let fromMarker = null
let toMarker = null
let driverMarker = null

// Initialize map
onMounted(() => {
  // Create MapLibre map with OpenStreetMap tiles
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap Contributors',
          maxzoom: 19
        }
      },
      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm'
        }
      ]
    },
    center: [fromCoords.value.lng, fromCoords.value.lat],
    zoom: 15
  })

  map.on('load', () => {
    // Add markers after map loads
    updateMarkers()
  })
  
  // Connect WebSocket
  connectWebSocket()
})

onUnmounted(() => {
  if (ws.value) {
    ws.value.close()
  }
  if (map) {
    map.remove()
  }
})

// Watch for coordinate changes
watch([fromCoords, toCoords], () => {
  updateMarkers()
}, { deep: true })

// Watch for driver location updates
watch(driverLocation, (newLocation) => {
  if (newLocation && map) {
    if (driverMarker) {
      driverMarker.setLngLat([newLocation.lng, newLocation.lat])
    } else {
      // Create driver marker element
      const el = document.createElement('div')
      el.className = 'driver-marker'
      el.style.backgroundColor = '#3b82f6'
      el.style.width = '20px'
      el.style.height = '20px'
      el.style.borderRadius = '50%'
      el.style.border = '3px solid white'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
      
      driverMarker = new maplibregl.Marker({ element: el })
        .setLngLat([newLocation.lng, newLocation.lat])
        .setPopup(new maplibregl.Popup().setText(`Driver: ${driverId.value}`))
        .addTo(map)
    }
    
    map.flyTo({
      center: [newLocation.lng, newLocation.lat],
      zoom: map.getZoom()
    })
  }
})

function connectWebSocket() {
  ws.value = new WebSocket('ws://localhost:4000')
  
  ws.value.onopen = () => {
    console.log('Connected to WebSocket')
    connected.value = true
  }
  
  ws.value.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    
    if (msg.sType === 'RESPONSE_ROUTE') {
      route.value = msg.route.coordinates
      routeInfo.value = {
        distance: msg.distanceKm.toFixed(2),
        eta: msg.etaMinutes.toFixed(1)
      }
      
      // Draw route on map
      drawRoute(msg.route.coordinates)
    }
    
    if (msg.sType === 'RESPONSE_RIDER_LOCATION') {
      driverLocation.value = {
        lat: msg.latitude,
        lng: msg.longitude
      }
    }
  }
  
  ws.value.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
  
  ws.value.onclose = () => {
    console.log('Disconnected from WebSocket')
    connected.value = false
  }
}

function requestRoute() {
  if (!ws.value || !connected.value) return
  
  const message = {
    sType: 'REQUEST_ROUTE',
    from: [fromCoords.value.lng, fromCoords.value.lat],
    to: [toCoords.value.lng, toCoords.value.lat]
  }
  
  ws.value.send(JSON.stringify(message))
}

function startTracking() {
  if (!ws.value || !connected.value) return
  
  const message = {
    sType: 'REQUEST_RIDER_LOCATION',
    driverId: driverId.value
  }
  
  ws.value.send(JSON.stringify(message))
  tracking.value = true
}

function stopTracking() {
  tracking.value = false
  driverLocation.value = null
  
  if (driverMarker) {
    driverMarker.remove()
    driverMarker = null
  }
}

function updateMarkers() {
  if (!map) return
  
  // Remove existing markers
  if (fromMarker) fromMarker.remove()
  if (toMarker) toMarker.remove()
  
  // Create from marker element (green)
  const fromEl = document.createElement('div')
  fromEl.className = 'marker-from'
  fromEl.style.backgroundColor = '#10b981'
  fromEl.style.width = '30px'
  fromEl.style.height = '30px'
  fromEl.style.borderRadius = '50% 50% 50% 0'
  fromEl.style.transform = 'rotate(-45deg)'
  fromEl.style.border = '3px solid white'
  fromEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
  
  fromMarker = new maplibregl.Marker({ element: fromEl })
    .setLngLat([fromCoords.value.lng, fromCoords.value.lat])
    .setPopup(new maplibregl.Popup().setText('From'))
    .addTo(map)
  
  // Create to marker element (red)
  const toEl = document.createElement('div')
  toEl.className = 'marker-to'
  toEl.style.backgroundColor = '#ef4444'
  toEl.style.width = '30px'
  toEl.style.height = '30px'
  toEl.style.borderRadius = '50% 50% 50% 0'
  toEl.style.transform = 'rotate(-45deg)'
  toEl.style.border = '3px solid white'
  toEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
  
  toMarker = new maplibregl.Marker({ element: toEl })
    .setLngLat([toCoords.value.lng, toCoords.value.lat])
    .setPopup(new maplibregl.Popup().setText('To'))
    .addTo(map)
}

function drawRoute(coordinates) {
  if (!map) return
  
  // Remove existing route layer and source
  if (map.getLayer('route')) {
    map.removeLayer('route')
  }
  if (map.getSource('route')) {
    map.removeSource('route')
  }
  
  // Add route source
  map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: coordinates
      }
    }
  })
  
  // Add route layer
  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3b82f6',
      'line-width': 4,
      'line-opacity': 0.7
    }
  })
  
  // Fit map to show entire route
  const bounds = coordinates.reduce((bounds, coord) => {
    return bounds.extend(coord)
  }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]))
  
  map.fitBounds(bounds, { padding: 50 })
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  width: 100vw;
  height: 100vh;
}

.map-container {
  width: 100%;
  height: 100%;
}

#map {
  width: 100%;
  height: 100%;
}
</style>