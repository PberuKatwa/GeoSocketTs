<template>
  <div ref="mapContainer" class="map-container"></div>
  <button @click="addCenter">Add Center</button>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useMap } from "../composables/use.map";

const mapContainer = ref<HTMLElement | null>(null);
const { initMap, setCenterMarker } = useMap();

onMounted(() => {
  if (!mapContainer.value) return;

  initMap({
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
  width: 100%;
  height: 80vh;
}
</style>
