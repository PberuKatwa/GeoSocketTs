export interface DriverCordinates {
    longitude:number;
    latitude:number;
}

export interface routeResponse {
    distanceKm: number;
    etaMinutes: number,
    route: {
        type: string,
        coordinates: any;  
    }
}