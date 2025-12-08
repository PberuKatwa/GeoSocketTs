import { Driver } from "../types/geo.types";
import Route from "./route";
import socketServer from "../socket";
import logger from "../utils/logger";

class DriverConfig{

    // private readonly driver:Driver;
    private readonly driverId:string;
    private readonly latitude:number;
    private readonly longitude:number;

    constructor( driverId:string, latitude:number, longitude:number ){
        this.driverId = driverId;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    private async moveDriver(){
        try{

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



        }catch(error){
            throw error;
        }
    }

}

export default DriverConfig;