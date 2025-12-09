export interface DriverCordinates {
    longitude:number;
    latitude:number;
}

export interface RouteResponse {
    distanceKm: number;
    etaMinutes: number,
    route: {
        type: string,
        coordinates: any;  
    }
}