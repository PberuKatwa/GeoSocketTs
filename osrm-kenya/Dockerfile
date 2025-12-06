# ---- Stage 1: Build OSRM data for Kenya ----
FROM osrm/osrm-backend:latest AS builder

WORKDIR /data

# Download Kenya map (Geofabrik)
ADD https://download.geofabrik.de/africa/kenya-latest.osm.pbf /data/kenya.osm.pbf

# Extract
RUN osrm-extract -p /opt/car.lua /data/kenya.osm.pbf

# Partition & Customize (MLD)
RUN osrm-partition /data/kenya.osrm
RUN osrm-customize /data/kenya.osrm

# ---- Stage 2: Minimal runtime image ----
FROM osrm/osrm-backend:latest

WORKDIR /data

# Copy preprocessed OSRM graph from builder
COPY --from=builder /data /data

# Expose OSRM default port
EXPOSE 5150

# Run OSRM server instantly
CMD ["osrm-routed", "--algorithm", "mld", "/data/kenya.osrm"]
