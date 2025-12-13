<template>

  <button @click="addCenterMarker" > Add Center Marker </button>
  <button @click="addTargetMarker" > Add Target Marker </button>
  <button @click="drawRoute" > draw route </button>

  <div ref="mapContainer" class="map-container"></div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const mapContainer = ref(null);
const map = ref(null)

const centerCordinates = [36.817223, -1.286389];
const routeCoordinates = [
  [36.817223, -1.286389], 
  [36.821945, -1.292066], 
  [36.825500, -1.295100], 
  [36.829000, -1.310300], 
  [36.829100, -1.320300],
  [36.829200, -1.330300],
  [36.829300, -1.340300],
];

const centerMarker = ref(null);
const targetMarker = ref(null);

const activeMode = ref(null)

function initializeMap() {
  try {

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

    new maplibregl.Marker()
      .setLngLat(centerCordinates)
      .addTo(map.value);


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

function drawRoute(){
  try{

    if(!map.value) return console.error(`Map was not initialized`);

    if ( map.value.getSource("route") ){
      map.value.removeLayer("route-layer");
      map.value.removeSource("route");
    }

    map.value.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: routeCoordinates,
        },
      },
    });

    map.value.addLayer({
      id: "route-layer",
      type: "line",
      source: "route",
      paint: {
        "line-color": "#ff0000",
        "line-width": 4,
      },
    });


  }catch(error){
    console.error(`Error in drawing route`,error)
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
