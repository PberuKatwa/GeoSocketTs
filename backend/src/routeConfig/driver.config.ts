import { Driver } from "../types/geo.types";
import Route from "./route.config.js";
import logger from "../utils/logger.js";

class DriverConfig{

    // private readonly driver:Driver;
    private readonly driverId:string;
    latitude:number;
    longitude:number;

    private path: [number, number][] | null = null;
    private currentIndex: number = 0;
    private interval?: NodeJS.Timeout;

    constructor( driverId:string, latitude:number, longitude:number ){
        this.driverId = driverId;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    private async moveDriver(){
        try{

            if (!this.interval) return;

            if (!this.path || this.currentIndex >= this.path.length) {
                logger.info(`Driver ${this.driverId} reached destination.`);
                clearInterval(this.interval);
                return;
            }

            const [ nextLongitude, nextLatitude ] = this.path[this.currentIndex];

            this.longitude = nextLongitude;
            this.latitude = nextLatitude;
            this.currentIndex ++;

        }catch(error){
            throw error;
        }
    }

    public async startSimulation(
        startLatitude:number,
        startLongitude:number,
        targetLatitude:number,
        targetLongitude:number,
        osrmUrl:string,
        routeChanged:boolean = false 
    ){
        try{

            // this.stopSimulation()
            if(!startLatitude) throw new Error(`No starting latitude was provided`);
            if(!startLongitude) throw new Error(`No start longitude was provided`);
            if(!targetLatitude) throw new Error(`No target latitude was provided`);
            if(!targetLongitude) throw new Error(`No target longitude was provided`);
            if(!osrmUrl) throw new Error(`No osm url was provided.`);
          
            // if(routeChanged){
                this.latitude = startLatitude;
                this.longitude = startLongitude;
            // }
            

            const tripRoute = new Route(
                [ this.longitude, this.latitude  ],
                [ targetLongitude, targetLatitude ],
                osrmUrl
            )

            const { path } = await tripRoute.computeRoute() 

            if (!path || path.length === 0) throw new Error("OSRM did not return a valid route");

            this.path = path;
            this.currentIndex = 0;

            logger.info(`Starting driver simulation at latitude:${this.latitude} and longitude:${this.longitude}`)

            this.interval = setInterval( () => this.moveDriver() , 1000 )
                
        }catch(error){
            throw error;
        }
    }

    public stopSimulation() {
        try {
            if (this.interval) {
                clearInterval(this.interval);
                this.currentIndex = 0
                this.path = null;
                this.interval = undefined;
                logger.info(`Driver ${this.driverId} simulation stopped.`);
            }
        } catch (error) {
            throw error;
        }
    }

}

export default DriverConfig;