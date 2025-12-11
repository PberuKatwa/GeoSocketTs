<template>
  <button @click="addCenter">Add Center</button>
  <button @click="addTarget">Add Target</button>
  <button @click="requestRoute">Request Route</button>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from "vue";
  import { useMap } from "../composables/use.map";
  import type { mapCoordinates,osrmCoordinates } from "@/types/geo.types";
  import { useSocketClientStore } from "@/stores/socket.client";

  const socketStore = useSocketClientStore()
  const centerCordinates = ref< mapCoordinates>( [ 36.812416481445524, -1.2753196077525502 ] )
  const targetCordinates = ref< mapCoordinates>( [ 36.82374613232531, -1.2991745172969615 ] )
  const mapContainer = ref<HTMLElement | null>(null);
  const { initializeMap, setCenterMarker, chooseCoordinates, setTargetMarker, drawPath } = useMap();

  async function addCenter() {
    const coords = await chooseCoordinates()
    if(!coords || coords===undefined  ) throw new Error(`No coords were found`)
    centerCordinates.value = coords
    setCenterMarker(coords)
  }

  // Watch for route calculation response and draw the path
  watch(() => socketStore.routeResponse, (newRoute) => {

    if (newRoute?.route?.coordinates) {
      // Convert coordinates to mapCoordinates format
      const pathCoords = newRoute?.route?.coordinates
      drawPath(pathCoords);
    }
  });

  async function addTarget(){
    try{
      const coords = await chooseCoordinates()
      if(!coords || coords===undefined  ) throw new Error(`No coords were found`)
      targetCordinates.value = coords
      setTargetMarker(coords)
    }catch(error){
      console.error(`Error in choosing center`, error)
    }
  }

  async function requestRoute(){
    try{
      if(!centerCordinates.value) return;
      if(!targetCordinates.value) return;
      console.log("request route clicked", centerCordinates.value, targetCordinates.value)

      const from:osrmCoordinates = { lat:centerCordinates.value[1], lng:centerCordinates.value[0] } 
      const to:osrmCoordinates = { lat:targetCordinates.value[1], lng:targetCordinates.value[0] }

      socketStore.requestRoute(from,to)
    }catch(error){
      console.error(`errror in requesting route`, error)
    }
  }

  onMounted(() => {
    if (!mapContainer.value) return;

    initializeMap({
      container: mapContainer.value,
      centerCordinates: [36.817223, -1.286389],
      zoom: 12,
    });

    setCenterMarker(centerCordinates.value)
    setTargetMarker(targetCordinates.value)

  });

</script>

<style>
.map-container {
    margin: auto;
    padding: 10px;
    width: 100%;
    height: 87vh;
}
</style>
