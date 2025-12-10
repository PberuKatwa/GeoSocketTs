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

export type coordinates = [number, number]

export interface MapInitializationOptions {
    container:HTMLElement,
    centerCordinates:coordinates,
    zoom?:number
}