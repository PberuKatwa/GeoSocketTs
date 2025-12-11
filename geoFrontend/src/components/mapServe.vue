<template>
  <button @click="addCenter">Add Center</button>
  <button @click="addTarget">Add Target</button>
  <button @click="requestRoute">Request Route</button>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from "vue";
  import { useMap } from "../composables/use.map";
  import type { mapCoordinates,osrmCoordinates } from "@/types/geo.types";
  import { useSocketClientStore } from "@/stores/socket.client";

  const fromCoords = ref({ lat: -1.286389, lng: 36.817223 })
  const toCoords = ref({ lat: -1.292066, lng: 36.821946 })

  const socketStore = useSocketClientStore()
  const centerCordinates = ref< mapCoordinates>( [ 36.817223, -1.286389 ] )
  const targetCordinates = ref< mapCoordinates>( [ 36.821946, -1.292066 ] )
  const mapContainer = ref<HTMLElement | null>(null);
  const { initializeMap, setCenterMarker, chooseCoordinates, setTargetMarker } = useMap();

  async function addCenter() {
    const coords = await chooseCoordinates()
    if(!coords || coords===undefined  ) throw new Error(`No coords were found`)
    centerCordinates.value = coords
    setCenterMarker(coords)
  }

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
