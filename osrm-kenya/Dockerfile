# ---- Stage 1: Build OSRM data for Kenya ----
FROM osrm/osrm-backend:latest AS builder

WORKDIR /data

# Copy local PBF into the image
COPY ./data/kenya-latest.osm.pbf /data/kenya.osm.pbf

# Extract, partition, and customize
RUN osrm-extract -p /opt/car.lua /data/kenya.osm.pbf
RUN osrm-partition /data/kenya.osrm
RUN osrm-customize /data/kenya.osrm

# ---- Stage 2: Minimal runtime image ----
FROM osrm/osrm-backend:latest

WORKDIR /data

# Copy preprocessed OSRM graph from builder
COPY --from=builder /data /data

# Expose OSRM default port
EXPOSE 5000

# Run OSRM server
CMD ["osrm-routed", "--algorithm", "mld", "/data/kenya.osrm"]
