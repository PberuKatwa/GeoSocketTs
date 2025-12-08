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

    public async startSimulation( targetLatitude:number, targetLongitude:number, osrmUrl:string ){
        try{

            const tripRoute = new Route(
                [ this.longitude, this.latitude  ],
                [ targetLongitude, targetLongitude ],
                osrmUrl
            )

            

        }catch(error){
            throw error;
        }
    }

}

export default DriverConfig;