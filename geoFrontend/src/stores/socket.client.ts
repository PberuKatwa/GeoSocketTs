import { ref } from "vue";
import { defineStore } from "pinia";
import SocketService from "@/services/socket.service";
import type { RouteResponse, DriverCordinates } from "@/types/geo.types";
import type { mapCoordinates, osrmCoordinates } from "@/types/geo.types";

const socketService = new SocketService("http://localhost:4000")

export const useSocketClientStore = defineStore( "socketClient", function(){

    const isConnected = ref(false);
    const routeResponse= ref< RouteResponse| null >(null);
    const driverCordinates = ref< DriverCordinates | null >(null);
    const isTracking = ref<boolean>(false)
    const hasJourneyStarted = ref<boolean>(false)

    socketService.onRoute(function(route){
        routeResponse.value = route
    })

    socketService.onDriverLocation(function(driverLocation){
        // console.log("driver locationnnn", driverLocation)
        driverCordinates.value = driverLocation
    })

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
            return routeResponse.value
        }catch(error){
            console.error(`Error in getting route`, error)
        }
    }

    function getDriverLocation(){
        try{
            return driverCordinates.value 
        }catch(error){
            console.error(`Error in getting driver location`, error)
        }
    }

    function requestRoute( from:osrmCoordinates, to:osrmCoordinates){
        try{
            socketService.requestRoute( from, to )
        }catch(error){
            console.error(`Error in getting driver location`, error)
        }
    }

    function startSimulation( driverId:string, targetLat:number, targetLng:number , startLat:number, startLng:number ){
        try{
            const{ isTracking:tracking, hasJourneyStarted:started } = socketService.startSimulation(driverId, targetLat, targetLng, startLat, startLng)

            isTracking.value = tracking;
            hasJourneyStarted.value = started;

            return { isTracking, hasJourneyStarted }
        }catch(error){
            console.error(`Error in getting driver location`, error)
        }
    }

    function stopSimulation(){
        try{
            const{ isTracking:tracking, hasJourneyStarted:started } = socketService.stopSimulation()

            isTracking.value = tracking;
            hasJourneyStarted.value = started;

            return { isTracking, hasJourneyStarted }
        }catch(error){
            console.error(`Error in getting driver location`, error)
        }
    }

    return {
        // State
        isConnected,
        isTracking,
        hasJourneyStarted,
        routeResponse,
        driverCordinates,

        // 
        connectSocket,
        disconnectSocket,
        getRoute,
        requestRoute,
        getDriverLocation,
        startSimulation,stopSimulation
    }

})