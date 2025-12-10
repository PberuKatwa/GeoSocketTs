<template>
  <button @click="addCenter">Add Center</button>
  <button @click="addTarget">Add Target</button>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from "vue";
  import { useMap } from "../composables/use.map";
  import type { mapCoordinates } from "@/types/geo.types";

  const mapContainer = ref<HTMLElement | null>(null);
  const { initializeMap, setCenterMarker, chooseCoordinates, setTargetMarker } = useMap();

  onMounted(() => {
    if (!mapContainer.value) return;

    initializeMap({
      container: mapContainer.value,
      centerCordinates: [36.817223, -1.286389],
      zoom: 12,
    });
  });

  async function addCenter() {
    const coords = await chooseCoordinates()
    if(!coords || coords===undefined  ) throw new Error(`No coords were found`)
    setCenterMarker(coords)
  }

  async function addTarget(){
    try{
      const coords = await chooseCoordinates()
      if(!coords || coords===undefined  ) throw new Error(`No coords were found`)
      setTargetMarker(coords)
    }catch(error){
      console.error(`Error in choosing center`, error)
    }
  }

</script>

<style>
.map-container {
    margin: auto;
    padding: 10px;
    width: 100%;
    height: 87vh;
}
</style>
