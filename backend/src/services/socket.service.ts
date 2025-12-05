import { Server } from "socket.io";
import { createServer } from "http";
import { computeRoute, startDriverSimulation, stopDriverSimulation, drivers } from "./deliveryService.js";

export function createSocketIOServer(port: number) {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  console.log(`Socket.IO Server running at http://localhost:${port}`);

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle route calculation
    socket.on("calculate-route", ({ from, to }) => {
      try {
        const result = computeRoute(
          [from.lng, from.lat],
          [to.lng, to.lat]
        );

        // IMPORTANT: Return coordinates properly
        socket.emit("route-calculated", {
          distanceKm: result.distanceKm,
          etaMinutes: result.etaMinutes,
          route: {
            type: result.route.geometry.type,
            coordinates: result.route.geometry.coordinates  // Access the geometry.coordinates
          }
        });
      } catch (error) {
        console.error("Route calculation error:", error);
        socket.emit("error", { message: "Failed to calculate route" });
      }
    });

    // Handle driver tracking start
    socket.on("start-tracking", ({ driverId, targetLat, targetLng }) => {
      console.log(`Starting tracking for ${driverId}`);
      
      socket.join(`driver-${driverId}`);
      
      startDriverSimulation(driverId, targetLat, targetLng);

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

      socket.on("disconnect", () => {
        clearInterval(interval);
        socket.leave(`driver-${driverId}`);
      });

      socket.on("stop-tracking", () => {
        clearInterval(interval);
        stopDriverSimulation(driverId);
        socket.leave(`driver-${driverId}`);
      });
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port);
}