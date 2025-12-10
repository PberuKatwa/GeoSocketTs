<template>
  <button @click="addCenter">Add Center</button>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useMap } from "../composables/use.map";

const mapContainer = ref<HTMLElement | null>(null);
const { initializeMap, setCenterMarker } = useMap();

onMounted(() => {
  if (!mapContainer.value) return;

  initializeMap({
    container: mapContainer.value,
    centerCordinates: [36.817223, -1.286389],
    zoom: 12,
  });
});

function addCenter() {
  setCenterMarker([36.817223, -1.286389]);
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
