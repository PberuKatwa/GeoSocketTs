<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const mapContainer = ref(null);

function initializeMap() {
  try {
    const map = new maplibregl.Map({
      container: mapContainer.value,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OSM',
            maxzoom: 19
          }
        },
        layers: [
          { id: 'osm', type: 'raster', source: 'osm' }
        ]
      },
      center: [36.817223, -1.286389], // Nairobi: lng, lat
      zoom: 12
    });

    map.addControl(new maplibregl.NavigationControl());
    map.resize(); // ensure correct centering
  } catch (error) {
    console.error('Error initializing map', error);
  }
}

onMounted(initializeMap);
</script>

<style>
.map-container {
    margin: auto;
    padding: 10px;
    width: 100%;
    height: 90vh;
}
</style>
