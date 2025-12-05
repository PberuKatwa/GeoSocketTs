export type ServerRespondRoute = {
    sType:"RESPONSE_ROUTE";
    distanceKm:number;
    etaMinutes:number;
    route:any;   
}

export type ServerRiderLocation ={
    sType:"RESPONSE_RIDER_LOCATION";
    driverId:string;
    latitude:number;
    longitude:number;
}

export type ServerMessage = ServerRespondRoute | ServerRiderLocation