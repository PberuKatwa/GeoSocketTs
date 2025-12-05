export type ClientRequestRoute = {
    sType:'REQUEST_ROUTE';
    from:[number,number];
    to:[number, number];
}

export type RequestRiderLocation = {
   sType:"REQUEST_RIDER_LOCATION";
   driverId:string;
}