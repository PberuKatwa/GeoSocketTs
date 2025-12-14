<template>
  <div class="map-view">
    <MapSidebar ref="sidebarRef" :actions="mapActions" />
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useMap } from "../composables/use.map";
import type { mapCoordinates, osrmCoordinates } from "@/types/geo.types";
import { useSocketClientStore } from "@/stores/socket.client";
import MapSidebar from "./MapSidebar.vue";
import type { MapSide } from "./MapSidebar.vue";

const route = useRoute();
const driverId = Array.isArray(route.params.id) 
  ? route.params.id.join('') 
  : route.params.id;
const socketStore = useSocketClientStore();

const sidebarRef = ref<InstanceType<typeof MapSidebar> | null>(null);
const targetCordinates = ref<mapCoordinates>([36.812416481445524, -1.2753196077525502]);
const centerCordinates = ref<mapCoordinates>([36.82374613232531, -1.2991745172969615]);
const mapContainer = ref<HTMLElement | null>(null);
const isRouteLoaded = ref<boolean>(false)

const { 
  initializeMap, 
  setCenterMarker, 
  chooseCoordinates, 
  setTargetMarker, 
  drawPath, 
  updateDriver,
  fitMapToCoordinates
} = useMap();

async function addCenter() {
  try {
    const coords = await chooseCoordinates();
    if (!coords || coords === undefined) throw new Error(`No coords were found`);
    
    centerCordinates.value = coords;
    setCenterMarker(coords);
    
    if (sidebarRef.value) {
      sidebarRef.value.clearActiveState();
    }
  } catch (error) {
    console.error(`Error in choosing center`, error);
  }
}

async function addTarget() {
  try {
    const coords = await chooseCoordinates();
    if (!coords || coords === undefined) throw new Error(`No coords were found`);
    
    targetCordinates.value = coords;
    setTargetMarker(coords);
    
    if (sidebarRef.value) {
      sidebarRef.value.clearActiveState();
    }
  } catch (error) {
    console.error(`Error in choosing target`, error);
  }
}

async function requestRoute() {
  try {
    if (!centerCordinates.value) return;
    if (!targetCordinates.value) return;

    isRouteLoaded.value = false
    const from: osrmCoordinates = { 
      lat: centerCordinates.value[1], 
      lng: centerCordinates.value[0] 
    };
    const to: osrmCoordinates = { 
      lat: targetCordinates.value[1], 
      lng: targetCordinates.value[0] 
    };

    socketStore.requestRoute(from, to);
  } catch (error) {
    console.error(`Error in requesting route`, error);
  }
}

async function startSimulation() {
  try {
    if (!centerCordinates.value) return;
    if (!targetCordinates.value) return;
    if (!driverId) return;
    
    socketStore.startSimulation(
      driverId,
      targetCordinates.value[1],
      targetCordinates.value[0],
      centerCordinates.value[1],
      centerCordinates.value[0]
    );
    
    console.log("Driver simulation started", socketStore.driverCordinates);
  } catch (error) {
    console.error(`Error in starting simulation`, error);
  }
}

async function stopSimulation() {
  try {
    socketStore.stopSimulation();
    
    if (sidebarRef.value) {
      sidebarRef.value.clearActiveState();
    }
  } catch (error) {
    console.error(`Error in stopping simulation`, error);
  }
}

const mapActions: MapSide[] = [
  {
    label: 'Add Center',
    handler: addCenter,
    icon: 'fas fa-crosshairs'
  },
  {
    label: 'Add Target',
    handler: addTarget,
    icon: 'fas fa-bullseye'
  },
  {
    label: 'Request Route',
    handler: requestRoute,
    icon: 'fas fa-route'
  },
  {
    label: 'Start Simulation',
    handler: startSimulation,
    icon: 'fas fa-play'
  },
  {
    label: 'Stop Simulation',
    handler: stopSimulation,
    icon: 'fas fa-stop'
  }
];

watch(() => socketStore.routeResponse, (newRoute) => {
  if (newRoute?.route?.coordinates) {
    isRouteLoaded.value = true
    const pathCoords = newRoute.route.coordinates;
    drawPath(pathCoords);
  }
});

watch(() => socketStore.driverCordinates, (coordinates) => {
  if (coordinates) {
    // console.log(`Driver coordinates updated`, coordinates);

    if(!isRouteLoaded.value){
        requestRoute()
    }

    const mapped: mapCoordinates = [coordinates.longitude, coordinates.latitude];
    updateDriver(mapped);
  }
});

onMounted(() => {
  if (!mapContainer.value) return;

  initializeMap({
    container: mapContainer.value,
    centerCordinates: [36.817223, -1.286389],
    zoom: 12,
  });

  setCenterMarker(centerCordinates.value);
  setTargetMarker(targetCordinates.value);
  fitMapToCoordinates()
  
});
</script>

<style scoped>
.map-view {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

@media (min-width: 769px) {
  .map-container {
    padding-left: 300px;
  }
}
</style>