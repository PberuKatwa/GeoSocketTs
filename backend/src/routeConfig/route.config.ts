import axios from "axios";

class Route{

    private readonly from:[number,number];
    private readonly to:[number,number];
    private readonly osrmUrl:string;

    constructor( from:[number,number], to:[number,number], osrmUrl:string ){

        this.from = from;
        this.to = to;
        this.osrmUrl = osrmUrl;

    }

    public async computeRoute():Promise< {
        distanceKm:number,
        etaMinutes:number,
        path:any
    } >{
        try{

            const url = `${this.osrmUrl}/route/v1/driving/${this.from[0]},${this.from[1]};${this.to[0]},${this.to[1]}?overview=full&geometries=geojson`;
            const res = await axios.get(url);

            if (res.data.code !== "Ok") {
                throw new Error("OSRM routing failed");
            }

            const route = res.data.routes[0];
            const distanceKm = route.distance / 1000;
            const etaMinutes = route.duration / 60;

            const path = route.geometry.coordinates;

            return { distanceKm, etaMinutes, path };
                
        }catch(error){
            throw error
        }
    }


}

export default Route;