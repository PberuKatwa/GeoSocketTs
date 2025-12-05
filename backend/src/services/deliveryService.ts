import * as turf from "@turf/turf";

export function computeRoute(
    from:[number,number],
    to:[number,number]
){
    try{

        const fromPoint = turf.point(from);
        const toPoint = turf.point(to);

        const distanceKm = turf.distance( fromPoint, toPoint, { units:"kilometers" })
        const etaMinutes = (distanceKm / 30) * 60;

        const route = turf.lineString([ from, to ] );

        return {
            distanceKm,
            etaMinutes,
            route
        }

    }catch(error){
        throw error
    }

}

// Simulated drivers
export const drivers = new Map<
  string,
  { lat: number; lng: number; interval?: NodeJS.Timeout }
>();

export function startDriverSimulation(driverId: string) {
  if (drivers.has(driverId)) return;

  let lat = -1.286389;
  let lng = 36.817223;

  const interval = setInterval(() => {
    lat += (Math.random() - 0.5) * 0.0002;
    lng += (Math.random() - 0.5) * 0.0002;

    const d = drivers.get(driverId);
    if (d) {
      d.lat = lat;
      d.lng = lng;
    }
  }, 1000);

  drivers.set(driverId, { lat, lng, interval });
}