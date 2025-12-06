import { Server } from "socket.io";
import { createServer } from "http";
import { 
  computeRoute, 
  startDriverSimulation, 
  stopDriverSimulation, 
  drivers 
} from "./deliveryService.js";

export function createSocketIOServer(port: number) {
  const httpServer = createServer();

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  console.log(`Socket.IO Server running at http://localhost:${port}`);

  // -----------------------------------------------------
  // CONNECTION
  // -----------------------------------------------------
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // -----------------------------------------------------
    // CALCULATE ROUTE USING OSRM
    // -----------------------------------------------------
    socket.on("calculate-route", async ({ from, to }) => {
      try {
        const result = await computeRoute(
          [from.lng, from.lat],
          [to.lng, to.lat]
        );

        socket.emit("route-calculated", {
          distanceKm: result.distanceKm,
          etaMinutes: result.etaMinutes,
          // Return OSRM polyline as GeoJSON-style LineString
          route: {
            type: "LineString",
            coordinates: result.path  // path is already [lng,lat][]
          }
        });
      } catch (error) {
        console.error("Route calculation error:", error);
        socket.emit("error", { message: "Failed to calculate route" });
      }
    });

    // -----------------------------------------------------
    // DRIVER TRACKING (REAL ROAD MOVEMENT)
    // -----------------------------------------------------
    socket.on("start-tracking", async ({ driverId, targetLat, targetLng }) => {
      console.log(`Starting tracking for ${driverId}`);

      socket.join(`driver-${driverId}`);

      // Start simulation → fetch OSRM route
      await startDriverSimulation(driverId, targetLat, targetLng);

      // Emit driver position every second
      const interval = setInterval(() => {
        const driver = drivers.get(driverId);
        if (!driver) {
          clearInterval(interval);
          return;
        }

        io.to(`driver-${driverId}`).emit("driver-location", {
          driverId,
          latitude: driver.lat,
          longitude: driver.lng
        });
      }, 1000);

      // When this socket disconnects
      socket.on("disconnect", () => {
        clearInterval(interval);
        socket.leave(`driver-${driverId}`);
      });

      // Stop tracking manually
      socket.on("stop-tracking", () => {
        clearInterval(interval);
        stopDriverSimulation(driverId);
        socket.leave(`driver-${driverId}`);
      });
    });

    // -----------------------------------------------------
    // HANDLE DISCONNECT
    // -----------------------------------------------------
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port);
}
