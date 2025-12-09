import { io } from "socket.io-client";
import type { DriverCordinates, routeResponse } from "@/types/geo.types";

class SocketService{
    private readonly url:string;
    private readonly socket;
    public isConnected:boolean;
    public routeResponse!:routeResponse;
    public driverLocation!:DriverCordinates;

    constructor(url:string){
        this.url = url;
        this.isConnected = false;
        this.socket = io(url)
    }

    private connectIoServer(){
        try{

            this.socket.on( 'connect', ()=> { this.isConnected = true })
                
        }catch(error){
            throw error;
        }
    }

    private disconnectIoServer(){
        try{

            this.socket.on( 'disconnect', ()=> { this.isConnected = false; })
                           
        }catch(error){
            throw error;
        }
    }

    public getRoute(){
        try{

            this.socket.on( 'route-calculated', data => {
                const coords = data.route?.coordinates
                if (!coords) return
                this.routeResponse = {
                    distanceKm:data.distanceKm,
                    etaMinutes:data.etaMinutes,
                    route:data.route
                }
            })

            return this.routeResponse

        }catch(error){
            throw error;
        }
    }

    public getDriverLocation(){
        try{

            this.socket.on( 'driver-location', data => {
                this.driverLocation = {
                    longitude:data.longitude,
                    latitude:data.latitude
                }
            })

            return this.driverLocation;

        }catch(error){
            throw error;
        }
    }

    public requestRoute( from:[ number, number ], to:[ number, number ] ){
        try{

            this.socket.emit( 'calculate-route', { from,to })
                         
        }catch(error){
            throw error;
        }
    }

    public startSimulation(driverId:string, targetLat:number, targetLng:number , startLat:number, startLng:number){
        try{

            this.socket.emit( 'start-tracking', { driverId, targetLat, targetLng , startLat, startLng })
                          
        }catch(error){
            throw error;
        }
    }

//     function startJourney() {
//   if (!socket.value) return
//   socket.value.emit('start-tracking', { 
//     driverId: driverId.value, 
//     targetLat: toCoords.value.lat, 
//     targetLng: toCoords.value.lng,
//     startLat: fromCoords.value.lat,
//     startLng: fromCoords.value.lng
//   })
//   tracking.value = true
//   journeyStarted.value = true
//   sidebarOpen.value = false
// }


// function stopJourney() {
//   if (!socket.value) return
//   socket.value.emit('stop-tracking')
//   tracking.value = false
//   journeyStarted.value = false
//   driverLocation.value = null
//   if (animationFrame) cancelAnimationFrame(animationFrame)
//   if (driverMarker) { driverMarker.remove(); driverMarker = null }
// }

}

export default SocketService;