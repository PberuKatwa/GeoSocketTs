<template>

  <button @click="addCenterMarker" > Add Center Marker </button>

  <div ref="mapContainer" class="map-container"></div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const mapContainer = ref(null);
const map = ref(null)

const centerCordinates = [36.817223, -1.286389];
const targetCordinates = [36.827223, -1.296389];

const centerMarker = ref< [Number,Number] >(null);
const targetMarker = ref< [Number,Number] >(null);

function initializeMap() {
  try {
    const centerCoords = [36.817223, -1.286389];

    map.value = new maplibregl.Map({
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

    map.value.addControl(new maplibregl.NavigationControl());
    map.value.resize(); // ensure correct centering

    new maplibregl.Marker()
      .setLngLat(centerCoords)
      .addTo(map.value);
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
