import { Driver } from "../types/geo.types";
import Route from "./route";
import socketServer from "../socket";
import logger from "../utils/logger";

class DriverConfig{

    // private readonly driver:Driver;
    private readonly driverId:string;
    private latitude:number;
    private longitude:number;

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

    public async startSimulation( targetLatitude:number, targetLongitude:number, osrmUrl:string ){
        try{

            if(!targetLatitude) throw new Error(`No target latitude was provided`);
            if(!targetLongitude) throw new Error(`No target longitude was provided`);
            if(!osrmUrl) throw new Error(`No osm url was provided.`);
                
            const tripRoute = new Route(
                [ this.longitude, this.latitude  ],
                [ targetLongitude, targetLongitude ],
                osrmUrl
            )

            const { path } = await tripRoute.computeRoute() 

            if (!path || path.length === 0) throw new Error("OSRM did not return a valid route");
                


        }catch(error){
            throw error;
        }
    }

}

export default DriverConfig;