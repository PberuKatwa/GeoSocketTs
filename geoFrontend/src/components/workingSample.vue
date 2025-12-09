<template>
  <div class="app-layout">
    <!-- Map Container -->
    <div class="map-wrapper">
      <div id="map" ref="mapContainer"></div>
      
      <!-- Top Bar Controls -->
      <div class="top-bar">
        <button @click="toggleSidebar" class="hamburger-btn" :class="{ active: sidebarOpen }">
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div class="status-indicator" :class="{ connected: connected }">
          <span class="dot"></span>
          <span class="text">{{ connected ? 'Live' : 'Offline' }}</span>
        </div>
      </div>
      
      <!-- Location Picker Mode -->
      <div class="picker-banner" v-if="pickerMode !== 'none'">
        <span class="icon">{{ pickerMode === 'driver' ? '🚗' : '📍' }}</span>
        <span class="text">Tap map to set {{ pickerMode === 'driver' ? 'driver' : 'user' }} location</span>
        <button @click="pickerMode = 'none'" class="close-btn">✕</button>
      </div>
    </div>

    <!-- Bottom Nav (Mobile) -->
    <div class="bottom-nav">
      <div class="nav-content">
        <button @click="toggleSidebar" class="nav-menu-btn">
          <span class="icon">☰</span>
        </button>
        
        <div class="nav-info" v-if="routeInfo">
          <div class="nav-stat">
            <span class="stat-icon">📏</span>
            <span class="stat-text">{{ routeInfo.distance }} km</span>
          </div>
          <div class="nav-divider"></div>
          <div class="nav-stat">
            <span class="stat-icon">⏱️</span>
            <span class="stat-text">{{ routeInfo.eta }} min</span>
          </div>
        </div>
        
        <div class="nav-info placeholder" v-else>
          <span class="placeholder-text">Set route to begin</span>
        </div>
        
        <button 
          v-if="!journeyStarted" 
          @click="routeInfo ? startJourney() : toggleSidebar()" 
          class="nav-action-btn"
          :class="{ active: routeInfo }"
          :disabled="!connected"
        >
          <span class="icon">▶️</span>
        </button>
        <button 
          v-else 
          @click="stopJourney" 
          class="nav-action-btn danger"
        >
          <span class="icon">⏹️</span>
        </button>
      </div>
      
      <div class="nav-progress" v-if="journeyStarted">
        <div class="progress-bar"></div>
      </div>
    </div>

    <!-- Overlay -->
    <div class="overlay" v-if="sidebarOpen" @click="toggleSidebar"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <h2>Trip Control</h2>
        <button @click="toggleSidebar" class="close-sidebar">✕</button>
      </div>

      <div class="sidebar-content">
        <!-- Driver ID -->
        <div class="form-group">
          <label class="form-label">Driver ID</label>
          <input v-model="driverId" type="text" :disabled="tracking" placeholder="Enter driver ID" class="form-input" />
        </div>

        <!-- Locations -->
        <div class="form-group">
          <div class="location-row">
            <label class="form-label">🚗 Driver</label>
            <button @click="setPickerMode('driver')" class="pick-btn" :disabled="tracking">
              <span>📍</span> Pick
            </button>
          </div>
          <div class="coords-input">
            <input v-model.number="fromCoords.lat" type="number" step="0.000001" placeholder="Lat" :disabled="tracking" class="coord-field" />
            <input v-model.number="fromCoords.lng" type="number" step="0.000001" placeholder="Lng" :disabled="tracking" class="coord-field" />
          </div>
        </div>

        <div class="form-group">
          <div class="location-row">
            <label class="form-label">📍 User</label>
            <button @click="setPickerMode('user')" class="pick-btn" :disabled="tracking">
              <span>📍</span> Pick
            </button>
          </div>
          <div class="coords-input">
            <input v-model.number="toCoords.lat" type="number" step="0.000001" placeholder="Lat" :disabled="tracking" class="coord-field" />
            <input v-model.number="toCoords.lng" type="number" step="0.000001" placeholder="Lng" :disabled="tracking" class="coord-field" />
          </div>
        </div>

        <!-- Route Info -->
        <div class="route-info" v-if="routeInfo">
          <div class="info-item">
            <span class="info-label">Distance</span>
            <span class="info-value">{{ routeInfo.distance }} km</span>
          </div>
          <div class="info-item">
            <span class="info-label">Est. Time</span>
            <span class="info-value">{{ routeInfo.eta }} min</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button @click="requestRoute" class="action-btn secondary" :disabled="!connected">
            Calculate Route
          </button>
          <button v-if="!journeyStarted" @click="startJourney" class="action-btn primary" :disabled="!connected || !routeInfo">
            Start Journey
          </button>
          <button v-else @click="stopJourney" class="action-btn danger">
            End Journey
          </button>
        </div>

        <!-- Live Position -->
        <div class="live-position" v-if="driverLocation">
          <span class="live-dot"></span>
          <span class="live-text">{{ driverLocation.lat.toFixed(5) }}, {{ driverLocation.lng.toFixed(5) }}</span>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { io } from 'socket.io-client'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

/* ---------- UI State ---------- */
const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
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
  sidebarOpen.value = false
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
}

function startJourney() {
  if (!socket.value) return
  socket.value.emit('start-tracking', { 
    driverId: driverId.value, 
    targetLat: toCoords.value.lat, 
    targetLng: toCoords.value.lng,
    startLat: fromCoords.value.lat,
    startLng: fromCoords.value.lng
  })
  tracking.value = true
  journeyStarted.value = true
  sidebarOpen.value = false
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
  if (animationFrame) cancelAnimationFrame(animationFrame)
  if (socket.value) socket.value.disconnect()
  if (map) map.remove()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app-layout {
  position: fixed;
  inset: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

.map-wrapper {
  position: absolute;
  inset: 0;
  z-index: 1;
}

#map {
  width: 100%;
  height: 100%;
}

/* Top Bar */
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;
  pointer-events: none;
}

.top-bar > * {
  pointer-events: auto;
}

/* Hamburger Button */
.hamburger-btn {
  width: 44px;
  height: 44px;
  background: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.hamburger-btn span {
  width: 20px;
  height: 2px;
  background: #1f2937;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-btn.active span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger-btn.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.hamburger-btn:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Status Indicator */
.status-indicator {
  background: white;
  padding: 10px 16px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.status-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  transition: all 0.3s ease;
}

.status-indicator.connected .dot {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

.status-indicator.connected {
  color: #059669;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

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

/* Picker Banner */
.picker-banner {
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  font-size: 14px;
  font-weight: 500;
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

.picker-banner .icon {
  font-size: 18px;
}

.picker-banner .text {
  white-space: nowrap;
}

.picker-banner .close-btn {
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
  font-size: 14px;
  transition: all 0.2s ease;
  margin-left: 4px;
}

.picker-banner .close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 640px) {
  .picker-banner {
    left: 16px;
    right: 16px;
    transform: none;
    font-size: 13px;
  }
}

/* Overlay */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 30;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 360px;
  max-width: 85vw;
  background: white;
  z-index: 40;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-sidebar {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-sidebar:hover {
  background: #e5e7eb;
  color: #111827;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Form Elements */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.location-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pick-btn {
  padding: 6px 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.pick-btn:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #3b82f6;
  color: #3b82f6;
}

.pick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.coords-input {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.coord-field {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #111827;
  outline: none;
  transition: all 0.2s ease;
}

.coord-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.coord-field:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

/* Route Info */
.route-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 11px;
  font-weight: 500;
  color: #60a5fa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 18px;
  font-weight: 700;
  color: #1e40af;
}

/* Actions */
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-btn.primary:hover:not(:disabled) {
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.action-btn.secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.action-btn.danger {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn.danger:hover:not(:disabled) {
  background: #fecaca;
}

/* Live Position */
.live-position {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: #6b7280;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s ease-in-out infinite;
}

/* Driver Marker */
.driver-marker {
  will-change: transform;
}

/* Bottom Navigation (Mobile) */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  z-index: 25;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
  border-radius: 20px 20px 0 0;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
}

.nav-menu-btn {
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.nav-menu-btn:active {
  transform: scale(0.95);
  background: #e5e7eb;
}

.nav-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
}

.nav-info.placeholder {
  justify-content: center;
}

.placeholder-text {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
}

.nav-stat {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-icon {
  font-size: 16px;
}

.stat-text {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.nav-divider {
  width: 1px;
  height: 20px;
  background: #e5e7eb;
}

.nav-action-btn {
  width: 48px;
  height: 48px;
  background: #e5e7eb;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.nav-action-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.nav-action-btn.danger {
  background: #fee2e2;
}

.nav-action-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.nav-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-progress {
  height: 3px;
  background: #f3f4f6;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb, #3b82f6);
  background-size: 200% 100%;
  animation: progressFlow 2s linear infinite;
}

@keyframes progressFlow {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Hide bottom nav on desktop */
@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
}

/* Adjust map padding on mobile to account for bottom nav */
@media (max-width: 767px) {
  #map {
    padding-bottom: 80px;
  }
}
</style>