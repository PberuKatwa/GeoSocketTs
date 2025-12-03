# GeoSocketTs

A lightweight, open-source real-time geolocation tracking demo built with Vue 3, Node.js, and TypeScript. GeoSocketTs demonstrates how modern delivery apps (e.g., Uber Eats, Glovo, Bolt Food) track drivers and update users with live map movement.

The project simulates a moving delivery driver, streams location updates through WebSockets, and visualizes the route, distance, and real-time position using MapLibre GL and Turf.js.

## Features

- **Real-Time Tracking**: Live driver position streaming using Socket.IO.
- **Driver Movement Simulation**: Automated fake GPS coordinates demonstrating real-time delivery tracking.
- **Interactive Map Interface**: Built with MapLibre GL for high-performance, open-source map rendering.
- **Geospatial Logic**: Movement interpolation, distance calculation, and bearings powered by Turf.js.
- **Modern Vue 3 Architecture**: Includes Pinia for state management and Vue Router for navigation.
- **Full TypeScript Codebase**: Shared types between client and server for consistency and reliability.

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

# Install dependencies (client + server)
npm install
```

### Start Backend (Node.js)

```bash
cd server
npm install
npm run dev
```

### Start Frontend (Vue 3)

```bash
cd client
npm install
npm run dev
```

## Quick Start

Once both the frontend and backend are running:

1. Open the Vue app in your browser
2. A map will load with:
   - A user location
   - A simulated driver
3. The driver icon will begin moving along a generated route
4. All movement updates occur in real-time through Socket.IO

## How It Works

### 1. Driver Simulation (Node.js Backend)

The backend generates a route using Turf.js:

- Creates a starting coordinate
- Builds a sequence of interpolated waypoints
- Emits each "GPS position" over Socket.IO
- Notifies the frontend every few hundred milliseconds

```typescript
const steps = turf.lineString([...points]);
const interpolated = turf.along(steps, distance);
io.emit("driver:update", { lat, lng });
```

### 2. Realtime Updates (WebSockets)

Frontend listens for updates:

```typescript
socket.on("driver:update", (coords) => {
  driverStore.updatePosition(coords);
});
```

### 3. Map Visualization (Vue + MapLibre)

MapLibre GL renders:

- Driver marker
- User marker
- Animated movement
- Route path

### 4. State Management (Pinia)

Driver & user positions stored globally for easy UI syncing.

## Project Structure

```
GeoSocketTs/
├── client/                     # Vue 3 frontend
│   ├── src/
│   │   ├── components/
│   │   ├── stores/             # Pinia stores
│   │   ├── views/
│   │   ├── router/
│   │   ├── utils/
│   │   └── main.ts
│   └── package.json
│
├── server/                     # Node.js backend
│   ├── src/
│   │   ├── index.ts            # Main server file
│   │   ├── simulation/         # Driver movement logic
│   │   ├── sockets/            # Socket.IO configuration
│   │   └── types/
│   └── package.json
│
└── README.md
```

## Tech Stack

### Frontend

- Vue 3
- TypeScript
- MapLibre GL
- @turf/turf
- Pinia
- Vue Router
- socket.io-client

### Backend

- Node.js + TypeScript
- Socket.IO
- Turf.js

## API Overview

### WebSocket Events

#### Server → Client

| Event | Description |
|-------|-------------|
| `driver:update` | Sends real-time latitude/longitude of driver |
| `driver:route` | Sends full simulated route |

#### Client → Server

| Event | Description |
|-------|-------------|
| `user:location` | (Optional) send user coordinates |
| `request:route` | Ask backend to generate a route |

## Configuration

### Update Simulation Speed

`server/src/simulation/config.ts`:

```typescript
export const SIMULATION_SPEED = 800; // ms per update
```

### Change Route Length

```typescript
export const ROUTE_DISTANCE_KM = 3;
```

### Customize User Location

```typescript
export const USER_COORDS = {
  lat: -1.286389,
  lng: 36.817223
};
```

## Examples

### 1. Driver Movement Packet

```json
{
  "lat": -1.284109,
  "lng": 36.819551,
  "bearing": 78.2,
  "speed": 12
}
```

### 2. Map Marker Update (Vue Component)

```typescript
marker.setLngLat([coords.lng, coords.lat]);
```

## Contributing

We welcome contributions!

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Push and open a PR

### Guidelines

- Use TypeScript consistently
- Keep frontend and backend types aligned
- Ensure simulations remain deterministic
- Keep dependencies lightweight
