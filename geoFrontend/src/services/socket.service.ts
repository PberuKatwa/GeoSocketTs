import { io } from "socket.io-client";
import type { DriverCordinates, RouteResponse } from "@/types/geo.types";

class SocketService{
    private readonly url:string;
    private readonly socket;
    public isConnected:boolean;
    public routeResponse!:RouteResponse;
    public driverLocation!:DriverCordinates;
    public isTracking:boolean;
    public hasJourneyStarted:boolean;

    constructor(url:string){
        this.url = url;
        this.isConnected = false;
        this.socket = io(url);
        this.isTracking = false;
        this.hasJourneyStarted = false;
    }

    public connectIoServer():boolean{
        try{

            this.socket.on( 'connect', ()=> { this.isConnected = true })
            return this.isConnected;

        }catch(error){
            throw error;
        }
    }

    public disconnectIoServer():boolean{
        try{

            this.socket.on( 'disconnect', ()=> { this.isConnected = false; })
            return this.isConnected;

        }catch(error){
            throw error;
        }
    }

    public getRoute():RouteResponse{
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

    public getDriverLocation():DriverCordinates{
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

    public startSimulation(driverId:string, targetLat:number, targetLng:number , startLat:number, startLng:number): {
        isTracking:boolean ,hasJourneyStarted:boolean
    } {
        try{

            this.socket.emit( 'start-tracking', { driverId, targetLat, targetLng , startLat, startLng })
            this.isTracking = true;
            this.hasJourneyStarted = true;   

            return { isTracking:this.isTracking, hasJourneyStarted:this.hasJourneyStarted }
            
        }catch(error){
            throw error;
        }
    }

    public stopSimulation():void{
        try{

            this.socket.emit( 'stop-tracking')
            this.isTracking = false;
            this.hasJourneyStarted = false;   
                      
        }catch(error){
            throw error;
        }
    }

}

export default SocketService;