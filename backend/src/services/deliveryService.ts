import axios from "axios";

const OSRM_URL = "http://localhost:5000";

// ------------------------------
// Compute route using OSRM
// ------------------------------
export async function computeRoute(
    from: [number, number],
    to: [number, number]
) {
    try {
        const url = `${OSRM_URL}/route/v1/driving/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson`;

        const res = await axios.get(url);

        if (res.data.code !== "Ok") {
            throw new Error("OSRM routing failed");
        }

        const route = res.data.routes[0];
        const distanceKm = route.distance / 1000;
        const etaMinutes = route.duration / 60;

        // Coordinates as [lng, lat][]
        const path = route.geometry.coordinates;

        return {
            distanceKm,
            etaMinutes,
            path
        };
    } catch (err) {
        console.error("OSRM route error", err);
        throw err;
    }
}

// --------------------------------------------------
// Driver Simulation
// --------------------------------------------------

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

// ----------------------------------------------------------------
// Start simulation (uses OSRM to fetch an actual road-path)
// ----------------------------------------------------------------
export async function startDriverSimulation(
    driverId: string,
    targetLat?: number,
    targetLng?: number
) {
    let driver: Driver;

    if (drivers.has(driverId)) {
        driver = drivers.get(driverId)!;

        if (driver.interval) clearInterval(driver.interval);

        if (targetLat !== undefined && targetLng !== undefined) {
            driver.targetLat = targetLat;
            driver.targetLng = targetLng;

            driver.path = await fetchOsrmPath(
                [driver.lng, driver.lat],
                [targetLng, targetLat]
            );
            driver.currentPathIndex = 0;
        }
    } else {
        const startLat = -1.286389;
        const startLng = 36.817223;

        let path: [number, number][] | undefined;

        if (targetLat !== undefined && targetLng !== undefined) {
            path = await fetchOsrmPath([startLng, startLat], [targetLng, targetLat]);
        }

        driver = {
            lat: startLat,
            lng: startLng,
            targetLat,
            targetLng,
            path,
            currentPathIndex: 0
        };

        drivers.set(driverId, driver);
    }

    driver.interval = setInterval(() => {
        tickDriver(driver);
    }, 1000);
}

// ------------------------------------------------------------
// Fetch OSRM geometry only
// ------------------------------------------------------------
async function fetchOsrmPath(
    from: [number, number],
    to: [number, number]
): Promise<[number, number][]> {
    try {
        const data = await computeRoute(from, to);
        return data.path;
    } catch (err) {
        console.error("Failed to fetch OSRM path, driver will not move.", err);
        return [];
    }
}

// ------------------------------------------------------------
// Move 1 step along OSRM polyline
// ------------------------------------------------------------
function tickDriver(driver: Driver) {
    if (!driver.path || driver.currentPathIndex === undefined || driver.path.length === 0) {
        // No route available → stand still
        return;
    }

    const index = driver.currentPathIndex;

    // Still moving
    if (index < driver.path.length - 1) {
        const [lng, lat] = driver.path[index];
        driver.lng = lng;
        driver.lat = lat;
        driver.currentPathIndex++;
        return;
    }

    // Reached destination
    if (driver.targetLat !== undefined && driver.targetLng !== undefined) {
        driver.lat = driver.targetLat;
        driver.lng = driver.targetLng;
    }
}

// --------------------------------------------------
// Stop driver simulation
// --------------------------------------------------
export function stopDriverSimulation(driverId: string) {
    const driver = drivers.get(driverId);
    if (driver?.interval) {
        clearInterval(driver.interval);
    }
    drivers.delete(driverId);
}
