export type ClientRequestRoute = {
    requestType:'REQUEST_ROUTE';
    from:[number,number];
    to:[number, number];
}

export type RequestRiderLocation = {
   requestType:"REQUEST_RIDER_LOCATION";
   driverId:string;
}