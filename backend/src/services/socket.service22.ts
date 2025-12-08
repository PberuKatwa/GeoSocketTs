import socketServer from "../socket";
import Route from "../routeConfig/route.config";
import DriverConfig from "../routeConfig/driver.config";
import logger from "../utils/logger";

class SocketService{

  private drivers: Map<string, DriverConfig> = new Map();

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

  // public async startTracking(){
  //   try{

  //     socketServer.registerEvent( "start-tracking", async function( data, socket ){

  //       const { driverId, targetLat, targetLng, startLat, startLng } = data;
  //       logger.info(`Starting tracking for ${driverId} from (${startLat}, ${startLng}) to (${targetLat}, ${targetLng})`)

  //       const driver = new DriverConfig( "driver-001", startLat, startLng )

  //     })

  //   }catch(error){
  //     throw error;
  //   }
  // }

  public async startTracking(): Promise<void> {
    socketServer.registerEvent("start-tracking", async (payload, socket) => {

      const { driverId, startLat, startLng, targetLat, targetLng, osrmUrl } = payload;

      logger.info(`Starting tracking for driver ${driverId}`);

      socket.join(`driver-${driverId}`);
      let driver = this.drivers.get(driverId);

      if (!driver) {
        driver = new DriverConfig(driverId, startLat, startLng);
        this.drivers.set(driverId, driver);
      }

      await driver.startSimulation(targetLat, targetLng, osrmUrl);

      const emitInterval = setInterval(() => {

        const activeDriver = this.drivers.get(driverId);

        if (!activeDriver) {
          clearInterval(emitInterval);
          return;
        }

        socketServer.io.to(`driver-${driverId}`).emit("driver-location", {
          driverId,
          latitude: activeDriver.latitude,
          longitude: activeDriver.longitude
        });

      }, 1000);

      socket.on("disconnect", () => {
        logger.info(`Client disconnected, stopping driver ${driverId}`);

        clearInterval(emitInterval);
        driver?.stopSimulation();
        socket.leave(`driver-${driverId}`);

      });

      socket.on("stop-tracking", () => {

        logger.info(`Manual stop triggered for driver ${driverId}`);

        clearInterval(emitInterval);
        driver?.stopSimulation();
        socket.leave(`driver-${driverId}`);
        
      });

    });
  }

}

export default SocketService;