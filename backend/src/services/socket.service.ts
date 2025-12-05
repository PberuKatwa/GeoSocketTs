import { WebSocketServer } from "ws";
import { computeRoute, drivers, startDriverSimulation } from "./deliveryService";
import { ClientRequestRoute, RequestRiderLocation,ClientMessage } from "../types/client.types";
import { ServerRespondRoute, ServerRiderLocation, ServerMessage } from "../types/server.types";

export function createWSServer(port: number) {
  const wss = new WebSocketServer({ port });

  console.log(`WS Server running at ws://localhost:${port}`);

  wss.on("connection", (ws) => {
    console.log("Client connected.");

    ws.on("message", (raw) => {
      let msg: ClientMessage;

      try {
        msg = JSON.parse(raw.toString());
      } catch {
        console.error("Invalid JSON");
        return;
      }

      // Handle ROUTE request
      if (msg.sType === "REQUEST_ROUTE") {
        const result = computeRoute(
          [msg.from[1], msg.from[0]],
          [msg.to[1], msg.to[0]]
        );

        const response: ServerRespondRoute = {
          sType: "RESPONSE_ROUTE",
          distanceKm: result.distanceKm,
          etaMinutes: result.etaMinutes,
          route: result.route
        };

        ws.send(JSON.stringify(response));
      }

      // Handle DRIVER subscription
      if (msg.sType === "REQUEST_RIDER_LOCATION") {
        const driverId = msg.driverId;

        startDriverSimulation(driverId);

        const interval = setInterval(() => {
          const d = drivers.get(driverId);
          if (!d) return;

          const update: ServerMessage = {
            sType: "RESPONSE_RIDER_LOCATION",
            driverId,
            latitude: d.lat,
            longitude: d.lng
          };

          ws.send(JSON.stringify(update));
        }, 1000);

        ws.on("close", () => clearInterval(interval));
      }
    });
  });
}
