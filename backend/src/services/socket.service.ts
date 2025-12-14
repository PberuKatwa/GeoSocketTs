import socketServer from "../socket/index.js";
import Route from "../routeConfig/route.config.js";
import DriverConfig from "../routeConfig/driver.config.js";
import logger from "../utils/logger.js";

class SocketService{

  private drivers: Map<string, DriverConfig> = new Map();

  public async calculateRoute(): Promise<void> {
    try{

      socketServer.registerEvent( "calculate-route", async function( data, socket ) {

        const { from, to } = data;

        logger.SocketIo(`Event calculate-route has been received and is being processed`)

        const tripRoute = new Route( 
          [from.lng, from.lat],
          [to.lng, to.lat] ,
          "http://localhost:5000"
        )

        const result = await tripRoute.computeRoute()

        logger.info(`Route has been successfully calculated`)

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

  public async startTracking(): Promise<void> {
    socketServer.registerEvent("start-tracking", async (payload, socket) => {

      const { driverId, startLat, startLng, targetLat, targetLng, routeChanged } = payload;

      logger.info(`Starting tracking for driver ${driverId}`);

      socket.join(`driver-${driverId}`);
      let driver = this.drivers.get(driverId);

      if (!driver) {
        driver = new DriverConfig(driverId, startLat, startLng);
        this.drivers.set(driverId, driver);
      }

      await driver.startSimulation( startLat,startLng,targetLat, targetLng, "http://localhost:5000");

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