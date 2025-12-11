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

export type mapCoordinates = [number, number]

export interface MapInitializationOptions {
    container:HTMLElement,
    centerCordinates:mapCoordinates,
    zoom?:number
}

export interface osrmCoordinates {
    lat:number;
    lng:number;
}