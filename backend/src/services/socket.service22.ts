import socketServer from "../socket";
import Route from "../routeConfig/route.config";

class SocketService{

  public async calculateRoute(): Promise<void> {
    try{

      socketServer.registerEvent( "calculate-route", async function( data, socket ) {

        const { from, to } = data;

        const tripRoute = new Route( 
          [from.lng, from.lat],
          [to.lng, to.lat] ,
          "http://localhost:5000"
        )

        const result = await tripRoute.computeRoute()

        socket.emit("route-calculated", {

          distanceKm: result.distanceKm,
          etaMinutes: result.etaMinutes,
          route: {
            type: "LineString",
            coordinates: result.path  
          }

        });

      })

    }catch(error){
      throw error
    }

  }

  public async startTracking(){
    try{

      socketServer.registerEvent( "start-tracking", async function( data, socket ){

        const { driverId, targetLat, targetLng, startLat, startLng } = data;
        
      })

    }catch(error){
      throw error;
    }
  }

}

export default SocketService;