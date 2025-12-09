import { ref } from "vue";
import { defineStore } from "pinia";
import SocketService from "@/services/socket.service";
import type { RouteResponse, DriverCordinates } from "@/types/geo.types";

const socketService = new SocketService("http://localhost:4000")

export const useSocketClientStore = defineStore( "socketClient", function(){

    const isConnected = ref(false);
    const routeResponse= ref< RouteResponse| null >(null);
    const driverCordinates = ref< DriverCordinates | null >(null);

    function connectSocket(){
        try{
            return isConnected.value = socketService.connectIoServer()
        }catch(error){
            console.error(`Error in connecting socket io server`, error)
        }
    }

    function disconnectSocket(){
        try{
           return isConnected.value = socketService.disconnectIoServer()
        }catch(error){
            console.error(`Error in connecting socket io server`, error)
        }
    }

    function getRoute(){
        try{
            return routeResponse.value = socketService.getRoute()
        }catch(error){
            console.error(`Error in getting route`, error)
        }
    }

    function getDriverLocation(){
        try{
            return driverCordinates.value = socketService.getDriverLocation()
        }catch(error){
            console.error(`Error in getting driver location`, error)
        }
    }

    function requestRoute( from:[number,number], to:[number,number] ){
        try{
            socketService.requestRoute( from, to )
        }catch(error){
            console.error(`Error in getting driver location`, error)
        }
    }

    function startSimulation( driverId:string, targetLat:number, targetLng:number , startLat:number, startLng:number ){
        try{
            socketService.startSimulation(driverId, targetLat, targetLng, startLat, startLng)
        }catch(error){
            console.error(`Error in getting driver location`, error)
        }
    }

    function stopSimulation(){
        try{
            socketService.stopSimulation()
        }catch(error){
            console.error(`Error in getting driver location`, error)
        }
    }

    return {
        isConnected,


        connectSocket
    }

})