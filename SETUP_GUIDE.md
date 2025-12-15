# GeoSocketTs Setup Guide - Update Summary

## What Was Updated

Your README.md has been completely updated to reflect the new Docker Compose setup while maintaining all existing documentation.

### 📋 Key Changes

#### 1. **Installation Section Restructured**
- Added Prerequisites table
- Added Quick Reference comparison (Docker vs Local)
- Clear separation between Docker and Local development

#### 2. **Docker Compose (Primary Method)**
```bash
# 4 simple steps:
1. mkdir -p osrm-kenya/data
2. wget -O osrm-kenya/data/kenya-latest.osm.pbf https://download.geofabrik.de/africa/kenya-latest.osm.pbf
3. cp .env.example .env
4. docker-compose up --build
```

#### 3. **Local Development (Alternative)**
- Still fully supported
- Clear instructions for 3 separate terminals
- OSRM, Backend, and Frontend setup

#### 4. **New Sections Added**
- Docker Compose Architecture (with ASCII diagram)
- Docker Setup Details (multi-stage builds explained)
- Common Commands (quick reference)
- Troubleshooting Docker Setup

#### 5. **Project Structure Updated**
- Added all new files:
  - `docker-compose.yaml`
  - `.env.example`
  - `backend/Dockerfile`
  - `frontend/Dockerfile`
  - `backend/src/config.ts`

---

## Quick Start

### For Docker Compose Users (Recommended)

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/GeoSocketTs.git
cd GeoSocketTs

# 2. Download OSRM data (one-time)
mkdir -p osrm-kenya/data
wget -O osrm-kenya/data/kenya-latest.osm.pbf https://download.geofabrik.de/africa/kenya-latest.osm.pbf

# 3. Setup environment
cp .env.example .env

# 4. Start everything
docker-compose up --build

# 5. Open browser
# http://localhost:8158
```

### For Local Development Users

```bash
# Terminal 1: OSRM
docker run -t -i -p 5000:5000 -v "${PWD}/osrm-kenya/data:/data" osrm/osrm-backend osrm-routed --algorithm mld /data/kenya.osrm

# Terminal 2: Backend
cd backend
npm install
npm run dev

# Terminal 3: Frontend
cd frontend
npm install
npm run dev

# Open browser
# http://localhost:5173
```

---

## File Structure

```
GeoSocketTs/
├── docker-compose.yaml          ← Orchestrates all services
├── .env.example                 ← Environment template
├── backend/
│   ├── Dockerfile               ← Multi-stage Node.js build
│   ├── src/
│   │   ├── config.ts            ← Environment config loader
│   │   └── ...
│   └── package.json
├── frontend/
│   ├── Dockerfile               ← Multi-stage Vue + Nginx build
│   ├── src/
│   │   └── ...
│   └── package.json
├── osrm-kenya/
│   ├── Dockerfile               ← Multi-stage OSRM build
│   ├── data/
│   │   └── kenya-latest.osm.pbf ← Download required
│   └── ...
└── README.md                    ← Updated with Docker info
```

---

## Environment Variables

### Docker Compose (.env)
```env
OSRM_URL=http://geosocket-osrm:5000    # Docker service name
PORT=4000
FRONTEND_PORT=8158
BACKEND_PORT=4000
```

### Local Development (backend/.env)
```env
OSRM_URL=http://localhost:5000         # Localhost
PORT=4000
```

---

## Docker Network

Services communicate via Docker's internal network:

```
┌─────────────────────────────────────────┐
│         Docker Network (geonet)         │
├─────────────────────────────────────────┤
│                                         │
│  geosocket-osrm:5000                   │
│  geosocket-backend:4000                │
│  geosocket-frontend:8158               │
│                                         │
└─────────────────────────────────────────┘
         ↓           ↓           ↓
    localhost:5000  :4000      :8158
```

---

## Common Commands

### Docker Compose
```bash
docker-compose up --build              # Start all services
docker-compose up -d --build           # Start in background
docker-compose logs -f                 # View logs
docker-compose logs -f backend         # View backend logs
docker-compose down                    # Stop all services
docker-compose down -v                 # Stop and remove volumes
docker-compose ps                      # View running containers
```

### Local Development
```bash
cd backend && npm run dev              # Start backend
cd frontend && npm run dev             # Start frontend
npm run build                          # Build for production
```

---

## Troubleshooting

### OSRM Data Download
```bash
# If wget fails, use curl
curl -o osrm-kenya/data/kenya-latest.osm.pbf https://download.geofabrik.de/africa/kenya-latest.osm.pbf

# Verify file
ls -lh osrm-kenya/data/kenya-latest.osm.pbf
```

### Port Conflicts
```bash
# Change ports in .env
FRONTEND_PORT=8159
BACKEND_PORT=4001

# Or find process using port
lsof -i :8158
kill -9 <PID>
```

### Docker Build Issues
```bash
# Clean rebuild
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Service Communication
```bash
# Check if services can reach each other
docker-compose exec backend ping geosocket-osrm
docker-compose exec frontend ping geosocket-backend
```

---

## Performance Notes

- **First OSRM build**: 5-10 minutes (data processing)
- **Subsequent builds**: 1-2 minutes
- **Frontend**: Nginx serves static files (~50MB image)
- **Backend**: Compiled Node.js (~200MB image)

---

## Next Steps

1. ✅ Download OSRM data
2. ✅ Copy `.env.example` to `.env`
3. ✅ Run `docker-compose up --build`
4. ✅ Open `http://localhost:8158`
5. ✅ Start tracking!

---

## Documentation

Full documentation available in README.md:
- Installation methods
- Architecture details
- API overview
- Configuration options
- Examples
- Contributing guidelines
