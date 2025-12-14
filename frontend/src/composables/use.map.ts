import { ref, shallowRef } from "vue";
import MapService from "../services/map.service";
import type { MapInitializationOptions, mapCoordinates } from "@/types/geo.types";
import type { Map as LibreMap } from "maplibre-gl"

export function useMap() {
  const map = shallowRef<MapService | null>(null);

  function initializeMap( options:MapInitializationOptions ){
    try{
        map.value = new MapService()
        map.value.initializeMap(options)
    }catch(error){
        console.error(`Error in initializing libre map`, error )
    }
  }

  function setCenterMarker(coordinates:mapCoordinates){
    try{
        map.value?.setCenterMarker(coordinates)
    }catch(error){
        console.error( `Error in setting center marker`,error)
    }
  }

  function setTargetMarker( coordinates:mapCoordinates){
    try{
        map.value?.setTargetMarker(coordinates)
    }catch(error){
        console.error(`Error in setting target marker`, error)
    }

  }

  function drawPath( pathCordinates: Array<mapCoordinates> ){
    try{
        map.value?.drawPath(pathCordinates)
    }catch(error){
        console.error(`error in drawing path`, error)
    }

  }

  async function chooseCoordinates(){
    try{
        if(!map.value || map.value === undefined) throw new Error()
        return await map.value?.chooseCoordinates()
    }catch(error){
        console.error(`Error in choosing coordinates`, error)
    }
  }

  function updateDriver(coords: mapCoordinates) {
    try{
      map.value?.updateDriverMarker(coords);
    }catch(error){
      console.error(`Error in updating driver location on map`, error)
    }
    
  }

  function fitMapToCoordinates(){
    try{
      map.value?.fitBoundsToAllMarkers()
    }catch(error){
      console.error(`Error in fitting map to coordinates`, error)
    }
  }

  return {
    map,
    initializeMap,
    setCenterMarker,
    setTargetMarker,
    drawPath,
    chooseCoordinates,
    updateDriver,
    fitMapToCoordinates
  };
}
