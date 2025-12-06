<template>
  <div class="app-layout">
    <!-- Map Container -->
    <div class="map-wrapper">
      <div id="map" ref="mapContainer"></div>
      <div class="status-pill" :class="{ connected: connected, disconnected: !connected }">
        <span class="status-dot"></span>
        {{ connected ? 'Live' : 'Offline' }}
      </div>
      
      <!-- Location Picker Mode -->
      <div class="picker-mode" v-if="pickerMode !== 'none'">
        <div class="picker-content">
          <span class="picker-icon">{{ pickerMode === 'driver' ? '🚗' : '📍' }}</span>
          <span class="picker-text">Tap map to set {{ pickerMode === 'driver' ? 'Driver' : 'User' }} location</span>
          <button @click="pickerMode = 'none'" class="picker-close">✕</button>
        </div>
      </div>
    </div>

    <!-- Sidebar / Panel -->
    <div class="nav-panel" :class="{ 'is-expanded': showDetails }">
      <!-- Handle for mobile -->
      <div class="panel-handle" @click="togglePanel">
        <div class="handle-bar"></div>
      </div>

      <!-- Compact Header for Mobile -->
      <div class="compact-header" v-show="!isDesktop && !showDetails">
        <div class="trip-summary">
          <div class="driver-badge">
            <span class="icon">🚗</span>
            <span class="text">{{ driverId }}</span>
          </div>
          <div class="meta" v-if="routeInfo">
            <span>{{ routeInfo.eta }} min</span>
            <span class="divider">•</span>
            <span>{{ routeInfo.distance }} km</span>
          </div>
          <div class="meta placeholder" v-else>Ready to route</div>
        </div>
        <div class="compact-actions">
          <button @click.stop="togglePanel" class="btn-icon">⚙️</button>
          <button @click.stop="mainAction" class="btn-icon primary" :disabled="!connected">
            {{ journeyStarted ? '⏹️' : '▶️' }}
          </button>
        </div>
      </div>

      <!-- Panel Content -->
      <div class="panel-content" v-show="isDesktop || showDetails">
        <div class="section-title">Trip Configuration</div>

        <!-- Driver ID -->
        <div class="input-group">
          <div class="input-field">
            <label>Driver ID</label>
            <input v-model="driverId" type="text" :disabled="tracking" placeholder="ID..." />
          </div>
        </div>

        <!-- Location Inputs -->
        <div class="location-inputs">
          <div class="location-header">
            <span class="location-label">🚗 Driver Location</span>
            <button @click="setPickerMode('driver')" class="btn-map-pick" :disabled="tracking">
              📍 Pick on Map
            </button>
          </div>
          <div class="input-row">
            <div class="coord-group">
              <input v-model.number="fromCoords.lat" type="number" step="0.000001" placeholder="Latitude" :disabled="tracking" />
              <input v-model.number="fromCoords.lng" type="number" step="0.000001" placeholder="Longitude" :disabled="tracking" />
            </div>
          </div>
          
          <div class="connector-line"></div>
          
          <div class="location-header">
            <span class="location-label">📍 User Location</span>
            <button @click="setPickerMode('user')" class="btn-map-pick" :disabled="tracking">
              📍 Pick on Map
            </button>
          </div>
          <div class="input-row">
            <div class="coord-group">
              <input v-model.number="toCoords.lat" type="number" step="0.000001" placeholder="Latitude" :disabled="tracking" />
              <input v-model.number="toCoords.lng" type="number" step="0.000001" placeholder="Longitude" :disabled="tracking" />
            </div>
          </div>
        </div>

        <!-- Route Stats -->
        <div class="stats-card" v-if="routeInfo">
          <div class="stat-item">
            <span class="label">Distance</span>
            <span class="value">{{ routeInfo.distance }} <small>km</small></span>
          </div>
          <div class="vertical-divider"></div>
          <div class="stat-item">
            <span class="label">Est. Time</span>
            <span class="value">{{ routeInfo.eta }} <small>min</small></span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-grid">
          <button @click="requestRoute" class="btn btn-secondary" :disabled="!connected">
            Calculate Route
          </button>
          <button v-if="!journeyStarted" @click="startJourney" class="btn btn-primary" :disabled="!connected || !routeInfo">
            Start Journey
          </button>
          <button v-else @click="stopJourney" class="btn btn-danger">End Journey</button>
        </div>

        <!-- Live Debug Info -->
        <div class="debug-info" v-if="driverLocation">
          📍 Live: {{ driverLocation.lat.toFixed(5) }}, {{ driverLocation.lng.toFixed(5) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { io } from 'socket.io-client'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

/* ---------- UI State ---------- */
const showDetails = ref(false)
const windowWidth = ref(window.innerWidth)
const isDesktop = computed(() => windowWidth.value >= 768)

function handleResize() {
  windowWidth.value = window.innerWidth
  if (isDesktop.value) showDetails.value = true
}

/* ---------- Map & Markers ---------- */
const mapContainer = ref(null)
let map = null
let fromMarker = null
let toMarker = null
let driverMarker = null

const fromCoords = ref({ lat: -1.286389, lng: 36.817223 })
const toCoords = ref({ lat: -1.292066, lng: 36.821946 })
const route = ref(null)
const routeInfo = ref(null)
const driverLocation = ref(null)
const driverId = ref('driver-001')
const pickerMode = ref('none') // 'none', 'driver', 'user'

/* ---------- WebSocket ---------- */
const socket = ref(null)
const connected = ref(false)
const tracking = ref(false)
const journeyStarted = ref(false)

/* ---------- Smooth animation ---------- */
let animationFrame = null
let currentPosition = { lat: 0, lng: 0 }
let targetPosition = { lat: 0, lng: 0 }

function lerp(start, end, factor) { return start + (end - start) * factor }

function smoothUpdatePosition() {
  const factor = 0.15
  currentPosition.lat = lerp(currentPosition.lat, targetPosition.lat, factor)
  currentPosition.lng = lerp(currentPosition.lng, targetPosition.lng, factor)

  if (driverMarker) driverMarker.setLngLat([currentPosition.lng, currentPosition.lat])

  const distance = Math.hypot(targetPosition.lat - currentPosition.lat, targetPosition.lng - currentPosition.lng)
  if (distance > 0.000001) animationFrame = requestAnimationFrame(smoothUpdatePosition)
}

/* ---------- Panel Actions ---------- */
function togglePanel() { showDetails.value = !showDetails.value }
function mainAction() { journeyStarted.value ? stopJourney() : (routeInfo.value ? startJourney() : requestRoute()) }

function setPickerMode(mode) {
  pickerMode.value = mode
  if (!isDesktop.value) showDetails.value = false
}

/* ---------- Map Interaction ---------- */
function updateMarkers() {
  if (!map) return
  if (fromMarker) fromMarker.remove()
  if (toMarker) toMarker.remove()

  fromMarker = new maplibregl.Marker({ color: '#10b981' }).setLngLat([fromCoords.value.lng, fromCoords.value.lat]).addTo(map)
  toMarker = new maplibregl.Marker({ color: '#ef4444' }).setLngLat([toCoords.value.lng, toCoords.value.lat]).addTo(map)
}

function drawRoute(coords) {
  if (!map) return
  if (map.getLayer('route')) map.removeLayer('route')
  if (map.getSource('route')) map.removeSource('route')

  map.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords }}})
  map.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-join': 'round','line-cap':'round'}, paint: {'line-color':'#3b82f6','line-width':5,'line-opacity':0.8}})
  const bounds = coords.reduce((b, c) => b.extend(c), new maplibregl.LngLatBounds(coords[0], coords[0]))
  map.fitBounds(bounds, { padding: 100 })
}

/* ---------- Socket & Journey ---------- */
function connectSocket() {
  socket.value = io('http://localhost:4000')
  socket.value.on('connect', () => connected.value = true)
  socket.value.on('disconnect', () => connected.value = false)
  socket.value.on('route-calculated', data => {
    const coords = data.route?.coordinates || data.route?.geometry?.coordinates
    if (!coords) return
    route.value = coords
    routeInfo.value = { distance: data.distanceKm.toFixed(2), eta: data.etaMinutes.toFixed(1) }
    drawRoute(coords)
  })
  socket.value.on('driver-location', data => { driverLocation.value = { lat: data.latitude, lng: data.longitude } })
}

function requestRoute() {
  if (!socket.value) return
  socket.value.emit('calculate-route', { from: fromCoords.value, to: toCoords.value })
  if (!isDesktop.value) showDetails.value = false
}

function startJourney() {
  if (!socket.value) return
  socket.value.emit('start-tracking', { 
    driverId: driverId.value, 
    targetLat: toCoords.value.lat, 
    targetLng: toCoords.value.lng,
    startLat: fromCoords.value.lat,      // <-- add
    startLng: fromCoords.value.lng       // <-- add
  })
  tracking.value = true
  journeyStarted.value = true
  if (!isDesktop.value) showDetails.value = false
}


function stopJourney() {
  if (!socket.value) return
  socket.value.emit('stop-tracking')
  tracking.value = false
  journeyStarted.value = false
  driverLocation.value = null
  if (animationFrame) cancelAnimationFrame(animationFrame)
  if (driverMarker) { driverMarker.remove(); driverMarker = null }
}

/* ---------- Watchers ---------- */
watch([fromCoords, toCoords], updateMarkers, { deep: true })

watch(driverLocation, newLoc => {
  if (!newLoc || !map) return
  targetPosition = { ...newLoc }

  if (!driverMarker) {
    currentPosition = { ...targetPosition }
    const el = document.createElement('div')
    el.className = 'driver-marker'
    el.innerHTML = '🚗'
    el.style.fontSize = '24px'
    driverMarker = new maplibregl.Marker({ element: el }).setLngLat([currentPosition.lng, currentPosition.lat]).addTo(map)
  }

  if (animationFrame) cancelAnimationFrame(animationFrame)
  animationFrame = requestAnimationFrame(smoothUpdatePosition)

  map.easeTo({ center: [newLoc.lng, newLoc.lat], zoom: 15, duration: 1000, easing: t => t*(2-t) })
})

/* ---------- Map Setup ---------- */
onMounted(() => {
  window.addEventListener('resize', handleResize)
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: { version: 8, sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution:'© OSM', maxzoom:19 }}, layers:[{id:'osm', type:'raster', source:'osm'}] },
    center: [fromCoords.value.lng, fromCoords.value.lat],
    zoom: 14
  })

  map.on('load', updateMarkers)
  map.on('click', (e) => {
    if (pickerMode.value === 'driver') {
      fromCoords.value = { lat: e.lngLat.lat, lng: e.lngLat.lng }
      pickerMode.value = 'none'
    } else if (pickerMode.value === 'user') {
      toCoords.value = { lat: e.lngLat.lat, lng: e.lngLat.lng }
      pickerMode.value = 'none'
    }
  })
  connectSocket()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (animationFrame) cancelAnimationFrame(animationFrame)
  if (socket.value) socket.value.disconnect()
  if (map) map.remove()
})
</script>

<style scoped>
/* Keep your existing styles here, optionally remove duplicates */
</style>


<style scoped>
* {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

.app-layout {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
}

.map-wrapper {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 1;
}

#map { width: 100%; height: 100%; }

.status-pill {
  position: absolute;
  top: 16px; right: 16px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  backdrop-filter: blur(8px);
}

.status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #ccc;
  transition: all 0.3s ease;
}

.status-pill.connected .status-dot { 
  background: #10b981; 
  box-shadow: 0 0 8px #10b981;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-pill.connected { color: #064e3b; }
.status-pill.disconnected .status-dot { background: #ef4444; }
.status-pill.disconnected { color: #7f1d1d; }

.nav-panel {
  position: absolute;
  z-index: 20;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: 0 -5px 25px rgba(0,0,0,0.1);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (max-width: 767px) {
  .nav-panel {
    bottom: 0;
    left: 0;
    width: 100%;
    border-radius: 24px 24px 0 0;
    max-height: 85vh;
    transform: translateY(0);
  }

  .nav-panel:not(.is-expanded) {
    transform: translateY(0); 
  }
  
  .panel-content {
    padding: 0 20px 30px 20px;
    max-height: 60vh;
    overflow-y: auto;
  }
}

@media (min-width: 768px) {
  .nav-panel {
    top: 20px;
    left: 20px;
    width: 380px;
    bottom: auto;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.12);
  }

  .panel-handle, .compact-header {
    display: none;
  }

  .panel-content {
    display: block !important;
    padding: 24px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
  }
}

.panel-handle {
  width: 100%;
  padding: 12px 0;
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.handle-bar {
  width: 40px; height: 5px;
  background: #e5e7eb;
  border-radius: 10px;
  transition: background 0.2s;
}

.panel-handle:active .handle-bar {
  background: #d1d5db;
}

.compact-header {
  padding: 0 20px 20px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trip-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.driver-badge {
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta {
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.compact-actions {
  display: flex;
  gap: 12px;
}

.btn-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  border: none;
  background: #f3f4f6;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:active { transform: scale(0.95); }
.btn-icon.primary { background: #3b82f6; color: white; }

.section-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 700;
  color: #9ca3af;
  margin-bottom: 16px;
}

.input-group { margin-bottom: 16px; }
.input-field input {
  width: 100%;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.input-field input:focus {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.location-inputs {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  position: relative;
  margin-bottom: 20px;
}

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.location-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.btn-map-pick {
  padding: 6px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-map-pick:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-map-pick:active:not(:disabled) {
  transform: scale(0.95);
}

.btn-map-pick:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.input-row:last-child {
  margin-bottom: 0;
}

.coord-group {
  display: flex;
  gap: 8px;
  flex: 1;
}

.coord-group input {
  width: 100%;
  border: none;
  background: white;
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s ease;
}

.coord-group input:focus {
  box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
}

.point-icon { 
  width: 10px; height: 10px; 
  border-radius: 50%; 
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.point-icon.start { background: #10b981; }
.point-icon.end { background: #ef4444; }

.connector-line {
  width: 2px; height: 16px;
  background: #e5e7eb;
  margin: 8px 0 8px 8px;
}

.picker-mode {
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.picker-content {
  background: rgba(59, 130, 246, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  padding: 12px 20px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  font-size: 14px;
  font-weight: 600;
}

.picker-icon {
  font-size: 20px;
}

.picker-text {
  white-space: nowrap;
}

.picker-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background 0.2s ease;
  margin-left: 4px;
}

.picker-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.picker-close:active {
  transform: scale(0.9);
}

@media (max-width: 767px) {
  .picker-mode {
    top: 60px;
    left: 16px;
    right: 16px;
    transform: none;
  }
  
  .picker-content {
    width: 100%;
    justify-content: center;
    font-size: 13px;
    padding: 10px 16px;
  }
  
  .picker-text {
    white-space: normal;
    text-align: center;
    flex: 1;
  }
  
  .location-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .btn-map-pick {
    width: 100%;
  }
}

.stats-card {
  display: flex;
  background: #eff6ff;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item .label { font-size: 11px; color: #60a5fa; margin-bottom: 4px; }
.stat-item .value { font-size: 18px; font-weight: 700; color: #1e40af; }
.vertical-divider { width: 1px; height: 30px; background: rgba(59, 130, 246, 0.2); }

.action-grid {
  display: grid;
  gap: 10px;
}

.btn {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:active { transform: scale(0.98); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary { background: #3b82f6; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
.btn-secondary { background: white; border: 1px solid #e5e7eb; color: #374151; }
.btn-danger { background: #fee2e2; color: #dc2626; }

.debug-info {
  margin-top: 20px;
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
  font-family: monospace;
}

/* Smooth marker animation */
.driver-marker {
  will-change: transform;
}
</style>