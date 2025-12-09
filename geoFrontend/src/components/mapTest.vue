<template>

  <button @click="addCenterMarker" > Add Center Marker </button>
  <button @click="addTargetMarker" > Add Target Marker </button>

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

const centerMarker = ref(null);
const targetMarker = ref(null);

const activeMode = ref(null)

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
      center: centerCordinates, 
      zoom: 12
    });

    map.value.addControl(new maplibregl.NavigationControl());
    map.value.resize(); // ensure correct centering

    // new maplibregl.Marker()
    //   .setLngLat(centerCoords)
    //   .addTo(map.value);

    map.value.on( "click", function(event) {

      if(!activeMode.value) return console.error(`No active mode was selected`);

      const cordinates = [ event.lngLat.lng, event.lngLat.lat ];

      if( activeMode.value === "centre" ){
        placeCenterMarker(cordinates)
      }else if(activeMode.value === "target" ){
        placeTargetMarker(cordinates)
      }

      activeMode.value = null;

    })

  } catch (error) {
    console.error('Error initializing map', error);
  }
}

function addCenterMarker(){
  activeMode.value = "centre";
}

function addTargetMarker(){
  activeMode.value = "target";
}

function placeCenterMarker(cordinates){
  try{

    if(!map.value) return console.error(`Map was not loaded`)
    if(centerMarker.value) centerMarker.value.remove();

    centerMarker.value = new maplibregl.Marker( { color:"green" } ).setLngLat(cordinates).addTo(map.value)

  }catch(error){
    console.error(`Error in adding center marker`,error)
  }
}

function placeTargetMarker(cordinates){
  try{

    if(!map.value) return console.error(`Map was not loaded`)
    if(targetMarker.value) targetMarker.value.remove();

    targetMarker.value = new maplibregl.Marker( { color:"yellow" } ).setLngLat(cordinates).addTo(map.value)
    
  }catch(error){
    console.error(`Error in adding center marker`,error)
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
