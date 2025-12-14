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
- **Docker** (for OSRM server)
- **Git** (for cloning)

### 1. Start OSRM Server (Required)

The OSRM server provides real-world routing calculations. We've included a pre-configured Dockerfile for Kenya.

#### Option A: Using Docker (Recommended)

```bash
# Build the OSRM image for Kenya
docker build -t osrm-kenya ./osrm-kenya

# Run the OSRM server
docker run -t -i -p 5000:5000 osrm-kenya
```

The server will:
- Download Kenya's OpenStreetMap data
- Extract and process the routing graph
- Start the OSRM server on port 5000

#### Option B: Using Pre-built OSRM Image

```bash
# For Kenya (or replace with your region)
docker run -t -i -p 5000:5000 -v "${PWD}/osrm-data:/data" osrm/osrm-backend osrm-routed --algorithm mld /data/kenya.osrm
```

**Note:** First run will download and process the map data (~500MB for Kenya).

### 2. Start Backend (Node.js)

```bash
cd backend
npm install
npm run dev
```

The backend will:
- Start Socket.IO server on port 4000
- Connect to OSRM on port 5000
- Listen for route and tracking requests

### 3. Start Frontend (Vue 3)

```bash
cd frontend
npm install
npm run dev
```

The frontend will:
- Start Vite dev server (typically `http://localhost:5173`)
- Connect to backend on `http://localhost:4000`
- Load interactive map interface

### Verify Everything is Running

```bash
# Check OSRM server
curl http://localhost:5000/status

# Check backend
curl http://localhost:4000

# Open frontend
open http://localhost:5173
```

## Quick Start

Once all services are running, open `http://localhost:5173` in your browser:

### Desktop Workflow

1. **View the Landing Page** - QuickStart component with getting started guide
2. **Launch the App** - Click "Launch App" button to enter the map interface
3. **Set Center Point** - Click "Add Center" button, then click on map to place green marker
4. **Set Target Point** - Click "Add Target" button, then click on map to place red marker
5. **Calculate Route** - Click "Request Route" to compute optimal path (blue line appears)
6. **Start Simulation** - Click "Start Simulation" to watch the motorcycle move in real-time
7. **Monitor Progress** - Watch the driver marker animate smoothly along the route
8. **Stop Simulation** - Click "Stop Simulation" to pause the movement

### Mobile Experience

- **Hamburger Menu** (☰) - Toggle sidebar with all controls
- **Bottom Navigation Bar** - Shows distance, ETA, and quick action buttons
- **Toast Notifications** - Feedback for each action
- **Responsive Layout** - Optimized for touch and smaller screens
- **Full-Screen Map** - Maximized viewing area on mobile

### Key Features in Action

- **Real-Time Updates** - Driver position updates every second via WebSocket
- **Smooth Animation** - Custom interpolation between GPS points for fluid movement
- **Road-Based Routing** - OSRM ensures driver follows actual roads, not straight lines
- **Interactive Controls** - Click-to-set locations, no manual coordinate entry needed
- **Visual Feedback** - Toast notifications confirm each action

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

#### OSRM Server URL

```typescript
// backend/src/routeConfig/route.config.ts
const OSRM_URL = "http://localhost:5000"; // Change to your OSRM instance
```

#### Driver Movement Speed

```typescript
// backend/src/routeConfig/driver.config.ts
this.interval = setInterval(() => this.moveDriver(), 1000); // 1 second = 1 waypoint per second
```

Adjust the interval (in milliseconds) to control how fast the driver moves along the route.

#### Socket.IO Server Port

```typescript
// backend/src/socket/index.ts
const socketServer = new SocketServer(4000); // Change port if needed
```

### Frontend Configuration

#### Backend Connection URL

```typescript
// frontend/src/stores/socket.client.ts
const socketService = new SocketService("http://localhost:4000"); // Backend URL
```

#### Default Map Center

```typescript
// frontend/src/views/index.vue
const centerCordinates = ref<mapCoordinates>([36.82374613232531, -1.2991745172969615]);
const targetCordinates = ref<mapCoordinates>([36.812416481445524, -1.2753196077525502]);
```

#### Map Initialization

```typescript
// frontend/src/views/index.vue
initializeMap({
  container: mapContainer.value,
  centerCordinates: [36.817223, -1.286389], // Nairobi, Kenya
  zoom: 12,
});
```

### OSRM Configuration

#### Using Different Regions

Replace the Kenya map with your region:

```dockerfile
# osrm-kenya/Dockerfile
# Change this line to your region
ADD https://download.geofabrik.de/africa/kenya-latest.osm.pbf /data/region.osm.pbf
```

Available regions: [Geofabrik Downloads](https://download.geofabrik.de/)

#### OSRM Server Port

```dockerfile
# osrm-kenya/Dockerfile
EXPOSE 5150  # Change if needed
```

Then update backend to match:

```bash
docker run -p YOUR_PORT:5150 osrm-kenya
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

// Animate driver movement
mapService.animateDriverTo([36.819551, -1.284109]);
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

// Listen for route updates
socketStore.onRoute((route) => {
  console.log(`Route calculated: ${route.distanceKm}km, ${route.etaMinutes}min`);
});

// Listen for driver location updates
socketStore.onDriverLocation((location) => {
  console.log(`Driver at: ${location.latitude}, ${location.longitude}`);
});
```

### 5. Frontend Component Usage

```vue
<template>
  <div class="map-view">
    <MapSidebar :actions="mapActions" />
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
import { useMap } from '@/composables/use.map';
import { useSocketClientStore } from '@/stores/socket.client';

const socketStore = useSocketClientStore();
const { initializeMap, setCenterMarker, drawPath, updateDriver } = useMap();

// Initialize map on mount
onMounted(() => {
  initializeMap({
    container: mapContainer.value,
    centerCoordinates: [36.817223, -1.286389],
    zoom: 12
  });
});

// Watch for route updates
watch(() => socketStore.routeResponse, (newRoute) => {
  if (newRoute?.route?.coordinates) {
    drawPath(newRoute.route.coordinates);
  }
});

// Watch for driver location updates
watch(() => socketStore.driverCoordinates, (coordinates) => {
  if (coordinates) {
    updateDriver([coordinates.longitude, coordinates.latitude]);
  }
});
</script>
```

## Architecture Highlights

### Frontend Architecture

#### Components

- **QuickStart.vue** - Landing page with getting started guide and feature overview
- **LibreMap.vue** - Main map interface with marker management and route visualization
- **MapSidebar.vue** - Control panel with action buttons and toast notifications
- **mapTest.vue** - Testing component (optional)

#### Services

- **MapService** - Encapsulates all MapLibre GL operations (markers, routes, animations)
- **SocketService** - Manages WebSocket communication with backend

#### Composables

- **use.map.ts** - Vue 3 composition function for map management

#### State Management

- **socket.client.ts** - Pinia store for socket state and actions

### Backend Architecture

#### Services

- **SocketService** - Registers and handles Socket.IO events
- **DriverConfig** - Manages individual driver simulation and movement
- **RouteConfig** - Calculates routes using OSRM API

#### Socket Server

- **create.server.ts** - Socket.IO server factory with dynamic event registration
- **index.ts** - Server instance initialization

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

interface MapInitializationOptions {
  container: HTMLElement;
  centerCoordinates: mapCoordinates;
  zoom?: number;
}
```

### Responsive Design

- **Desktop** - Sidebar on left with full controls, map takes remaining space
- **Tablet** - Collapsible sidebar with hamburger menu
- **Mobile** - Bottom navigation bar with essential info, full-screen map
- **Touch-friendly** - Large tap targets (44px+), smooth animations, gesture support

## User Interface

### Landing Page (QuickStart)

The landing page provides:
- **Hero Section** - Project overview and quick launch button
- **Getting Started Guide** - Step-by-step workflow instructions
- **Feature Overview** - Key capabilities and tech stack
- **Marker Guide** - Visual explanation of map markers
- **Sidebar Controls** - Documentation of all control buttons

### Map Interface (LibreMap)

The main application features:
- **Interactive Map** - MapLibre GL with OpenStreetMap tiles
- **Marker System**:
  - Green marker (center/start point)
  - Red marker (target/destination)
  - Blue motorcycle icon (driver position)
- **Route Visualization** - Blue line showing calculated path
- **Responsive Layout** - Adapts to desktop, tablet, and mobile

### Control Sidebar (MapSidebar)

Action buttons with visual feedback:
- **Add Center** - Place starting point marker
- **Add Target** - Place destination marker
- **Request Route** - Calculate optimal path
- **Start Simulation** - Begin driver movement
- **Stop Simulation** - Pause driver movement

Features:
- Toast notifications for user feedback
- Active state indicators (green highlight)
- Mobile-responsive with hamburger toggle
- Marker guide with visual examples

### Toast Notifications

Real-time feedback system:
- **Info** - Action initiated (blue)
- **Success** - Action completed (green)
- **Warning** - Simulation stopped (orange)
- **Error** - Action failed (red)

## Contributing

We welcome contributions!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- **TypeScript First**: Maintain strict type safety across frontend and backend
- **Service Pattern**: Keep business logic in services, not components
- **Composables**: Use Vue 3 composition API for reusable logic
- **Error Handling**: Implement proper try/catch blocks with user feedback
- **Logging**: Use Winston for structured backend logging
- **Responsive Design**: Test on mobile, tablet, and desktop
- **Code Style**: Follow existing patterns and conventions
- **Testing**: Add tests for new features when possible


## Troubleshooting

### OSRM Server Issues

**Problem**: "Cannot connect to OSRM server"
```bash
# Check if OSRM is running
curl http://localhost:5000/status

# Restart OSRM container
docker restart osrm-kenya
```

**Problem**: "Route calculation failed"
- Ensure both coordinates are within Kenya
- Check OSRM server logs: `docker logs osrm-kenya`
- Verify OSRM port matches backend configuration

### Backend Connection Issues

**Problem**: "Cannot connect to backend"
```bash
# Check if backend is running
curl http://localhost:4000

# Verify Socket.IO connection in browser console
# Should see: "Connected to socket server successfully"
```

### Frontend Issues

**Problem**: "Map not loading"
- Clear browser cache
- Check browser console for errors
- Verify MapLibre GL CSS is loaded
- Check that map container has height/width

**Problem**: "Markers not appearing"
- Ensure coordinates are valid [lng, lat] format
- Check map zoom level (should be 12-15)
- Verify map is initialized before setting markers

## Performance Tips

- **Reduce Update Frequency**: Increase driver movement interval for slower updates
- **Optimize Map Rendering**: Reduce route line complexity for large routes
- **Mobile Performance**: Disable animations on low-end devices
- **Network**: Use WebSocket compression for large payloads

## License

ISC
