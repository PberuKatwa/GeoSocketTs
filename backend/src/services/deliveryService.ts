import * as turf from "@turf/turf";

export function computeRoute(
    from: [number, number],
    to: [number, number]
) {
    try {
        const fromPoint = turf.point(from);
        const toPoint = turf.point(to);

        const distanceKm = turf.distance(fromPoint, toPoint, { units: "kilometers" });
        const etaMinutes = (distanceKm / 30) * 60;

        const route = turf.lineString([from, to]);

        return {
            distanceKm,
            etaMinutes,
            route
        }
    } catch (error) {
        throw error;
    }
}

interface Driver {
    lat: number;
    lng: number;
    targetLat?: number;
    targetLng?: number;
    interval?: NodeJS.Timeout;
    path?: [number, number][];
    currentPathIndex?: number;
}

export const drivers = new Map<string, Driver>();

export function startDriverSimulation(
    driverId: string,
    targetLat?: number,
    targetLng?: number
) {
    // If driver already exists, update target and restart simulation
    if (drivers.has(driverId)) {
        const driver = drivers.get(driverId)!;
        if (driver.interval) {
            clearInterval(driver.interval);
        }
        if (targetLat !== undefined && targetLng !== undefined) {
            driver.targetLat = targetLat;
            driver.targetLng = targetLng;
            // Generate new path
            driver.path = generatePath(
                [driver.lng, driver.lat],
                [targetLng, targetLat]
            );
            driver.currentPathIndex = 0;
        }
    } else {
        // Initialize new driver at starting position
        const startLat = -1.286389;
        const startLng = 36.817223;
        
        const path = targetLat !== undefined && targetLng !== undefined
            ? generatePath([startLng, startLat], [targetLng, targetLat])
            : undefined;

        drivers.set(driverId, {
            lat: startLat,
            lng: startLng,
            targetLat,
            targetLng,
            path,
            currentPathIndex: 0
        });
    }

    const driver = drivers.get(driverId)!;

    const interval = setInterval(() => {
        if (driver.path && driver.currentPathIndex !== undefined) {
            // Move along predefined path
            moveAlongPath(driver);
        } else if (driver.targetLat !== undefined && driver.targetLng !== undefined) {
            // Move directly towards target
            moveTowardsTarget(driver, driver.targetLat, driver.targetLng);
        } else {
            // Random movement (original behavior)
            driver.lat += (Math.random() - 0.5) * 0.0002;
            driver.lng += (Math.random() - 0.5) * 0.0002;
        }
    }, 1000);

    driver.interval = interval;
}

function generatePath(
    from: [number, number],
    to: [number, number],
    numPoints: number = 50
): [number, number][] {
    const line = turf.lineString([from, to]);
    const length = turf.length(line, { units: "kilometers" });
    const path: [number, number][] = [];

    for (let i = 0; i <= numPoints; i++) {
        const along = turf.along(line, (length * i) / numPoints, { units: "kilometers" });
        path.push(along.geometry.coordinates as [number, number]);
    }

    return path;
}

function moveAlongPath(driver: Driver) {
    if (!driver.path || driver.currentPathIndex === undefined) return;

    if (driver.currentPathIndex < driver.path.length) {
        const [lng, lat] = driver.path[driver.currentPathIndex];
        driver.lng = lng;
        driver.lat = lat;
        driver.currentPathIndex++;
    } else {
        // Reached destination - stop moving
        if (driver.targetLat !== undefined && driver.targetLng !== undefined) {
            driver.lat = driver.targetLat;
            driver.lng = driver.targetLng;
        }
    }
}

function moveTowardsTarget(driver: Driver, targetLat: number, targetLng: number) {
    const from = turf.point([driver.lng, driver.lat]);
    const to = turf.point([targetLng, targetLat]);
    
    const distance = turf.distance(from, to, { units: "kilometers" });
    
    // If very close to target, snap to it
    if (distance < 0.01) {
        driver.lat = targetLat;
        driver.lng = targetLng;
        return;
    }
    
    // Move a small step towards target (approximately 30 km/h = 0.00833 km/s)
    const stepSize = 0.01; // km per second
    const bearing = turf.bearing(from, to);
    const destination = turf.destination(from, stepSize, bearing, { units: "kilometers" });
    
    driver.lat = destination.geometry.coordinates[1];
    driver.lng = destination.geometry.coordinates[0];
}

// Add this function to your existing deliveryService.ts
export function stopDriverSimulation(driverId: string) {
  const driver = drivers.get(driverId);
  if (driver?.interval) {
    clearInterval(driver.interval);
    driver.interval = undefined;
  }
  drivers.delete(driverId);
}