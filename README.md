# GeoSocketTs

A production-ready, real-time geolocation tracking system built with Vue 3, Node.js, and TypeScript. GeoSocketTs demonstrates how modern delivery and ride-sharing apps track vehicles and provide live location updates with smooth animations and real-world routing.

The system features OSRM-powered route calculation, real-time driver simulation following actual road networks, and a responsive mobile-first interface with interactive map controls.

## Features

- **OSRM Integration**: Real-world route calculation using OpenStreetMap Routing Machine for accurate road-based navigation.
- **Real-Time Tracking**: Live driver position streaming with smooth animations using Socket.IO and custom interpolation.
- **Interactive Map Controls**: Click-to-set locations, route visualization, and responsive map interface built with MapLibre GL.
- **Mobile-First Design**: Bottom navigation bar, hamburger sidebar, and touch-friendly controls optimized for mobile devices.
- **Modular Architecture**: Clean separation of concerns with services, stores, and composables for maintainable code.
- **Full TypeScript Support**: End-to-end type safety with shared interfaces between frontend and backend.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [API Overview](#api-overview)
- [Configuration](#configuration)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/GeoSocketTs.git

# Navigate to project
cd GeoSocketTs
```

### Prerequisites

- **Node.js** (v20.19.0+ or v22.12.0+)
- **OSRM Server** (for route calculation)

### Start OSRM Server (Required)

```bash
# Using Docker (recommended)
docker run -t -i -p 5000:5000 -v "${PWD}/osrm-kenya:/data" osrm/osrm-backend osrm-routed --algorithm mld /data/kenya-latest.osrm

# Or follow OSRM installation guide for your region
```

### Start Backend (Node.js)

```bash
cd backend
npm install
npm run dev
```

### Start Frontend (Vue 3)

```bash
cd frontend
npm install
npm run dev
```

## Quick Start

Once the OSRM server, backend, and frontend are running:

1. **Open the Vue app** in your browser (typically `http://localhost:5173`)
2. **Set Locations**: 
   - Click the hamburger menu (☰) to open the sidebar
   - Use "Pick on Map" buttons to set driver and user locations
   - Or manually enter coordinates
3. **Calculate Route**: Click "Calculate Route" to get distance and ETA
4. **Start Journey**: Click "Start Journey" to begin real-time tracking
5. **Watch Live Movement**: The driver marker moves along actual roads with smooth animations

### Mobile Experience

- **Bottom Navigation**: Shows trip stats (distance, ETA) and quick actions
- **Hamburger Menu**: Access full controls via the sidebar
- **Touch Controls**: Tap map to set locations, swipe-friendly interface

## How It Works

### 1. Route Calculation (OSRM Integration)

The system uses OSRM for real-world routing:

```typescript
// Backend: Route calculation
const url = `${OSRM_URL}/route/v1/driving/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson`;
const route = await axios.get(url);
const path = route.data.routes[0].geometry.coordinates; // Real road coordinates
```

### 2. Driver Simulation (Road-Based Movement)

Driver follows actual road network:

```typescript
// DriverConfig class manages simulation
class DriverConfig {
  async startSimulation(startLat, startLng, targetLat, targetLng) {
    this.path = await fetchOsrmPath([startLng, startLat], [targetLng, targetLat]);
    this.interval = setInterval(() => this.moveAlongPath(), 1000);
  }
}
```

### 3. Real-Time Updates (Socket.IO)

Bi-directional communication:

```typescript
// Frontend: Listen for driver updates
socket.on('driver-location', (data) => {
  driverLocation.value = { lat: data.latitude, lng: data.longitude };
});

// Backend: Emit position updates
io.to(`driver-${driverId}`).emit('driver-location', {
  driverId, latitude: driver.latitude, longitude: driver.longitude
});
```

### 4. Smooth Animation (Custom Interpolation)

Frontend smoothly animates between GPS points:

```typescript
function smoothUpdatePosition() {
  const factor = 0.15; // Smooth interpolation
  currentPosition.lat = lerp(currentPosition.lat, targetPosition.lat, factor);
  if (driverMarker) driverMarker.setLngLat([currentPosition.lng, currentPosition.lat]);
}
```

### 5. State Management (Pinia + Composables)

Reactive state management with Vue 3 composition API:

```typescript
// Pinia store for socket management
export const useSocketClientStore = defineStore('socketClient', () => {
  const routeResponse = ref<RouteResponse | null>(null);
  const driverCoordinates = ref<DriverCoordinates | null>(null);
  // ... reactive state and actions
});
```

## Project Structure

```
GeoSocketTs/
├── frontend/                   # Vue 3 frontend
│   ├── src/
│   │   ├── components/         # Reusable Vue components
│   │   ├── composables/        # Vue composition functions
│   │   │   └── use.map.ts      # Map management composable
│   │   ├── services/           # Business logic services
│   │   │   ├── map.service.ts  # MapLibre GL wrapper
│   │   │   └── socket.service.ts # Socket.IO client
│   │   ├── stores/             # Pinia state management
│   │   │   └── socket.client.ts # Socket state store
│   │   ├── types/              # TypeScript definitions
│   │   │   └── geo.types.ts    # Geospatial interfaces
│   │   ├── App.vue             # Main application component
│   │   └── main.ts             # Application entry point
│   └── package.json
│
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── routeConfig/        # Route and driver management
│   │   │   ├── driver.config.ts # Driver simulation logic
│   │   │   └── route.config.ts  # OSRM route calculation
│   │   ├── services/           # Business services
│   │   │   └── socket.service.ts # Socket event handlers
│   │   ├── socket/             # Socket.IO server setup
│   │   │   ├── create.server.ts # Socket server factory
│   │   │   └── index.ts        # Server instance
│   │   ├── utils/              # Utility functions
│   │   │   └── logger.ts       # Winston logging
│   │   └── server.ts           # Application entry point
│   └── package.json
│
├── osrm-kenya/                 # OSRM data (optional)
│   └── Dockerfile              # OSRM server configuration
│
└── README.md
```

## Tech Stack

### Frontend

- **Vue 3** - Composition API with `<script setup>`
- **TypeScript** - Full type safety
- **MapLibre GL** - High-performance map rendering
- **Pinia** - State management
- **Socket.IO Client** - Real-time communication
- **Vite** - Fast development and building

### Backend

- **Node.js + TypeScript** - Server runtime with ES modules
- **Socket.IO** - WebSocket communication
- **Axios** - HTTP client for OSRM API calls
- **Winston** - Structured logging
- **Custom Architecture** - Modular service-based design

### External Services

- **OSRM** - OpenStreetMap Routing Machine for route calculation
- **OpenStreetMap** - Base map tiles

## API Overview

### WebSocket Events

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `route-calculated` | `{ distanceKm, etaMinutes, route }` | OSRM route calculation result with GeoJSON coordinates |
| `driver-location` | `{ driverId, latitude, longitude }` | Real-time driver position updates |

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `calculate-route` | `{ from: {lat, lng}, to: {lat, lng} }` | Request route calculation between two points |
| `start-tracking` | `{ driverId, startLat, startLng, targetLat, targetLng }` | Begin driver simulation |
| `stop-tracking` | `{}` | Stop current driver simulation |

### OSRM Integration

The backend integrates with OSRM for realistic routing:

```typescript
// Route calculation endpoint
GET /route/v1/driving/{lng},{lat};{lng},{lat}?overview=full&geometries=geojson
```

## Configuration

### Backend Configuration

Update OSRM server URL in route calculation:

```typescript
// backend/src/routeConfig/route.config.ts
const OSRM_URL = "http://localhost:5000"; // Change to your OSRM instance
```

### Simulation Speed

Adjust driver movement interval:

```typescript
// backend/src/routeConfig/driver.config.ts
this.interval = setInterval(() => this.moveDriver(), 1000); // 1 second intervals
```

### Frontend Configuration

Update backend connection:

```typescript
// frontend/src/stores/socket.client.ts
const socketService = new SocketService("http://localhost:4000"); // Backend URL
```

### Default Coordinates

Set initial map center (Nairobi, Kenya):

```typescript
// frontend/src/App.vue
const fromCoords = ref({ lat: -1.286389, lng: 36.817223 });
const toCoords = ref({ lat: -1.292066, lng: 36.821946 });
```

## Examples

### 1. Route Calculation Response

```json
{
  "distanceKm": 2.34,
  "etaMinutes": 8.5,
  "route": {
    "type": "LineString",
    "coordinates": [
      [36.817223, -1.286389],
      [36.817445, -1.286123],
      [36.821946, -1.292066]
    ]
  }
}
```

### 2. Driver Location Update

```json
{
  "driverId": "driver-001",
  "latitude": -1.284109,
  "longitude": 36.819551
}
```

### 3. Using the Map Service

```typescript
// Initialize map
const mapService = new MapService();
mapService.initializeMap({
  container: mapContainer.value,
  centerCoordinates: [36.817223, -1.286389],
  zoom: 14
});

// Set markers and draw route
mapService.setCenterMarker([36.817223, -1.286389]);
mapService.setTargetMarker([36.821946, -1.292066]);
mapService.drawPath(routeCoordinates);
```

### 4. Socket Integration

```typescript
// Start tracking with the socket store
const socketStore = useSocketClientStore();
socketStore.startSimulation(
  'driver-001',
  targetLat, targetLng,
  startLat, startLng,
  false // hasRouteChanged
);
```

## Architecture Highlights

### Service-Oriented Design

- **MapService**: Encapsulates all MapLibre GL operations
- **SocketService**: Manages WebSocket communication
- **DriverConfig**: Handles individual driver simulation
- **RouteConfig**: Manages OSRM route calculations

### Type Safety

Shared TypeScript interfaces ensure consistency:

```typescript
interface DriverCoordinates {
  longitude: number;
  latitude: number;
}

interface RouteResponse {
  distanceKm: number;
  etaMinutes: number;
  route: {
    type: string;
    coordinates: mapCoordinates[];
  };
}
```

### Responsive Design

- **Desktop**: Sidebar with full controls
- **Mobile**: Bottom navigation with essential info
- **Touch-friendly**: Large tap targets and smooth animations

## Contributing

We welcome contributions!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- **TypeScript First**: Maintain strict type safety
- **Service Pattern**: Keep business logic in services
- **Composables**: Use Vue 3 composition API patterns
- **Error Handling**: Implement proper try/catch blocks
- **Logging**: Use Winston for structured backend logging
