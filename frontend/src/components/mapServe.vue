<template>
  <button @click="addCenter">Add Center</button>
  <button @click="addTarget">Add Target</button>
  <button @click="requestRoute">Request Route</button>
  <button @click="startSimulation">Start Simulation</button>
  <button @click="stopSimulation">Stop Simulation</button>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from "vue";
  import { useMap } from "../composables/use.map";
  import type { mapCoordinates,osrmCoordinates } from "@/types/geo.types";
  import { useSocketClientStore } from "@/stores/socket.client";

  const socketStore = useSocketClientStore()
  const targetCordinates = ref< mapCoordinates>( [ 36.812416481445524, -1.2753196077525502 ] )
  const centerCordinates = ref< mapCoordinates>( [ 36.82374613232531, -1.2991745172969615 ] )
  const mapContainer = ref<HTMLElement | null>(null);
  const { initializeMap, setCenterMarker, chooseCoordinates, setTargetMarker, drawPath, updateDriver } = useMap();

  async function addCenter() {
    const coords = await chooseCoordinates()
    if(!coords || coords===undefined  ) throw new Error(`No coords were found`)
    centerCordinates.value = coords
    setCenterMarker(coords)
  }

  watch(() => socketStore.routeResponse, (newRoute) => {
    if (newRoute?.route?.coordinates) {
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

      const from:osrmCoordinates = { lat:centerCordinates.value[1], lng:centerCordinates.value[0] } 
      const to:osrmCoordinates = { lat:targetCordinates.value[1], lng:targetCordinates.value[0] }

      socketStore.requestRoute(from,to)
    }catch(error){
      console.error(`errror in requesting route`, error)
    }
  }

  async function startSimulation(){
    try{

      if(!centerCordinates.value) return;
      if(!targetCordinates.value) return;



      socketStore.startSimulation("driver-001",targetCordinates.value[1], targetCordinates.value[0], centerCordinates.value[1], centerCordinates.value[0])
      console.log("driverr", socketStore.driverCordinates)
    }catch(error){
      console.error(`Error in starting simulation`,error)
    }
  }

  async function stopSimulation(){
    try{

      socketStore.stopSimulation()
    }catch(error){
      console.error(`Error in starting simulation`,error)
    }
  }

  watch(() => socketStore.driverCordinates , (coordinates) => {
    if (coordinates) {
        console.log(`Cooordinatessssss`, coordinates)
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
