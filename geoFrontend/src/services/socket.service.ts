import { io } from "socket.io-client";
import type { DriverCordinates, RouteResponse, osrmCoordinates } from "@/types/geo.types";

class SocketService{
    private readonly url:string;
    private readonly socket;
    public isConnected:boolean;
    public routeResponse:RouteResponse | null = null;
    public driverLocation:DriverCordinates | null = null;
    public isTracking:boolean;
    public hasJourneyStarted:boolean;

    private onRouteCalculated?: (route: RouteResponse) => void;
    private onDriverLocationUpdate?: (location: DriverCordinates) => void;

    constructor(url:string){
        this.url = url;
        this.isConnected = false;
        this.socket = io(url);
        this.isTracking = false;
        this.hasJourneyStarted = false;
        this.setupListeners()
    }

    private setupListeners(){
        try{

            this.socket.on( 'connect', ()=> {
                this.isConnected = true 
                console.log(`Connected to socket server successfully`)
            })

            this.socket.on( 'disconnect', ()=> {
                this.isConnected = false;
                console.log(`Socket has been disconnected`) 
            })

            this.socket.on( 'route-calculated', data => {
                const coords = data.route?.coordinates
                if (!coords) return

                this.routeResponse = {
                    distanceKm:data.distanceKm,
                    etaMinutes:data.etaMinutes,
                    route:data.route
                }

                if (this.onRouteCalculated) {
                    this.onRouteCalculated(this.routeResponse);
                }

                
            })

            this.socket.on( 'driver-location', data => {
                this.driverLocation = {
                    longitude:data.longitude,
                    latitude:data.latitude
                }

                if (this.onDriverLocationUpdate) {
                    this.onDriverLocationUpdate(this.driverLocation);
                }

                console.log(`Socket found driver location`, this.driverLocation)
            })



        }catch(error){
            throw error;
        }
    }

    public connectIoServer():boolean{
        try{

            if(!this.isConnected){
                this.socket.connect()
                this.isConnected = true
                return this.isConnected = true
            }
            
            return this.isConnected;

        }catch(error){
            throw error;
        }
    }

    public disconnectIoServer():boolean{
        try{

            if(this.isConnected){
                this.socket.disconnect()
                this.isConnected = false
                return this.isConnected
            }
            return this.isConnected;

        }catch(error){
            throw error;
        }
    }

    public onRoute(callback: (route: RouteResponse) => void) {
        this.onRouteCalculated = callback;
    }

    public onDriverLocation(callback: (location: DriverCordinates) => void) {
        this.onDriverLocationUpdate = callback;
    }

    public requestRoute( from:osrmCoordinates, to:osrmCoordinates ){
        try{

            this.socket.emit( 'calculate-route', { from,to })
                      
        }catch(error){
            throw error;
        }
    }

    public startSimulation(driverId:string, targetLat:number, targetLng:number , startLat:number, startLng:number): {
        isTracking:boolean ,hasJourneyStarted:boolean
    } 

    {
        try{

            this.socket.emit( 'start-tracking', { driverId, targetLat, targetLng , startLat, startLng })
            this.isTracking = true;
            this.hasJourneyStarted = true;   

            return { isTracking:this.isTracking, hasJourneyStarted:this.hasJourneyStarted }

        }catch(error){
            throw error;
        }
    }

    public stopSimulation(): {
        isTracking:boolean ,hasJourneyStarted:boolean
    } 
    {
        try{

            this.socket.emit( 'stop-tracking')
            this.isTracking = false;
            this.hasJourneyStarted = false;  
            
            return { isTracking:this.isTracking, hasJourneyStarted:this.hasJourneyStarted }
                      
        }catch(error){
            throw error;
        }
    }

}

export default SocketService;