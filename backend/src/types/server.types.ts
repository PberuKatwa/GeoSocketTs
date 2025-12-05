export type ServerRespondRoute = {
    responseType:"RESPONSE_ROUTE";
    distanceKm:number;
    etaMinutes:number;
    route:any;   
}

export type ServerRiderLocation ={
    responseType:"RESPONSE_RIDER_LOCATION";
    driverId:string;
    latitude:number;
    longitude:number;
}