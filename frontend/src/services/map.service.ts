import maplibregl from "maplibre-gl";
import { LngLatBounds } from "maplibre-gl";
import type { Marker, Map as LibreMap } from "maplibre-gl";
import type { mapCoordinates, MapInitializationOptions } from "@/types/geo.types";

class MapService{

    private map:LibreMap | null;
    public centerMarker: Marker| null;
    public targetMarker: Marker|null;
    public waypointMarkers: Array<Marker>|[];
    private driverMarker: Marker | null = null;
    private animationFrame: number | null = null;

    constructor(){
        this.map = null;
        this.centerMarker = null;
        this.targetMarker = null;
        this.waypointMarkers = [];
    }

    private destroy():void{
        try{

            this.map = null;
            this.centerMarker = null;
            this.targetMarker = null;
            this.waypointMarkers = [];

        }catch(error){
            throw error;
        }
    }

    public initializeMap( initOptions:MapInitializationOptions ):LibreMap{
        try{

            if(this.map) this.destroy();

            const { container, zoom ,centerCordinates } = initOptions;

            this.map = new maplibregl.Map({
                container: container,
                style: {
                    version: 8,
                    sources: {
                    osm: {
                        type: 'raster',
                        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '© OSM',
                        maxzoom: 19
                    }
                    },
                    layers: [
                    { id: 'osm', type: 'raster', source: 'osm' }
                    ]
                },
                center: centerCordinates, 
                zoom: zoom
            })

            this.map.addControl( new maplibregl.NavigationControl() );
            this.map.resize();

            return this.map

        }catch(error){
            throw error;
        }
    }

    public setCenterMarker(coordinates: mapCoordinates):Marker {
        try{

            if (!this.map) throw new Error(`The map was not initialized`);

            if (this.centerMarker) this.centerMarker.remove();

            this.centerMarker = new maplibregl.Marker({ color: "green" })
            .setLngLat(coordinates)
            .addTo(this.map);

            if(!this.centerMarker) throw new Error(`NO center marker was set`)
            
            this.fitBoundsToAllMarkers()
            return this.centerMarker;

        }catch(error){
            throw error;
        }

    }

    public setTargetMarker(coordinates:mapCoordinates):Marker {
        try{

            if (!this.map) throw new Error(`No map was initialized`);

            if (this.targetMarker) this.targetMarker.remove();

            this.targetMarker = new maplibregl.Marker({ color: "red" })
            .setLngLat(coordinates)
            .addTo(this.map);

            if(!this.targetMarker) throw new Error(`The target marker was not set`)
            this.fitBoundsToAllMarkers()
            return this.targetMarker
        }catch(error){
            throw error;
        }

    }

private getResponsivePadding(): { top: number; bottom: number; left: number; right: number } {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Mobile (portrait)
        if (width <= 480) {
            return {
                top: 80,
                bottom: 80,
                left: 20,
                right: 20
            };
        }
        
        // Mobile (landscape) and tablets
        if (width <= 768) {
            return {
                top: 60,
                bottom: 60,
                left: 40,
                right: 40
            };
        }
        
        // Desktop - account for sidebar
        return {
            top: 100,
            bottom: 100,
            left: 320, // Sidebar width + some margin
            right: 100
        };
    }

    /**
     * Fit map bounds to show all active markers (center, target, driver, waypoints)
     * @param options - Custom padding and animation options
     */
    public fitBoundsToAllMarkers(options?: {
        padding?: number | { top: number; bottom: number; left: number; right: number };
        maxZoom?: number;
        duration?: number;
    }): void {
        try {
            if (!this.map) return;

            const coordinates: mapCoordinates[] = [];

            // Collect all marker coordinates
            if (this.centerMarker) {
                const lngLat = this.centerMarker.getLngLat();
                coordinates.push([lngLat.lng, lngLat.lat]);
            }

            if (this.targetMarker) {
                const lngLat = this.targetMarker.getLngLat();
                coordinates.push([lngLat.lng, lngLat.lat]);
            }

            if (this.driverMarker) {
                const lngLat = this.driverMarker.getLngLat();
                coordinates.push([lngLat.lng, lngLat.lat]);
            }

            // Add waypoint markers
            if (this.waypointMarkers && this.waypointMarkers.length > 0) {
                this.waypointMarkers.forEach(marker => {
                    const lngLat = marker.getLngLat();
                    coordinates.push([lngLat.lng, lngLat.lat]);
                });
            }

            // If we have no markers, do nothing
            if (coordinates.length === 0) return;

            // If only one marker, just center on it
            if (coordinates.length === 1) {
                if (coordinates[0] === undefined) throw new Error(`No coordinates were provided`);

                this.map.flyTo({
                    center: [coordinates[0][0], coordinates[0][1]],
                    zoom: 14,
                    duration: options?.duration ?? 1000
                });
                return;
            }

            // Create bounds from all coordinates
            const bounds = new LngLatBounds();
            coordinates.forEach(coord => {
                bounds.extend([coord[0], coord[1]]);
            });

            // Get responsive padding or use custom
            let padding: { top: number; bottom: number; left: number; right: number };
            
            if (options?.padding !== undefined) {
                // Use custom padding if provided
                padding = typeof options.padding === 'number'
                    ? { 
                        top: options.padding, 
                        bottom: options.padding, 
                        left: options.padding, 
                        right: options.padding 
                    }
                    : options.padding;
            } else {
                // Use responsive padding
                padding = this.getResponsivePadding();
            }

            // Safety check: ensure padding doesn't exceed map container size
            const container = this.map.getContainer();
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            // Reduce padding if it's too large for the container
            const totalHorizontalPadding = padding.left + padding.right;
            const totalVerticalPadding = padding.top + padding.bottom;

            if (totalHorizontalPadding >= containerWidth * 0.9) {
                const scale = (containerWidth * 0.7) / totalHorizontalPadding;
                padding.left = Math.floor(padding.left * scale);
                padding.right = Math.floor(padding.right * scale);
            }

            if (totalVerticalPadding >= containerHeight * 0.9) {
                const scale = (containerHeight * 0.7) / totalVerticalPadding;
                padding.top = Math.floor(padding.top * scale);
                padding.bottom = Math.floor(padding.bottom * scale);
            }

            // Fit bounds with safe padding
            this.map.fitBounds(bounds, {
                padding,
                maxZoom: options?.maxZoom ?? 15,
                duration: options?.duration ?? 1000
            });

        } catch (error) {
            console.error('Error fitting bounds to markers:', error);
        }
    }

    public setDriverMarker(coords: mapCoordinates): Marker {
        try {

        if (!this.map) throw new Error("Map not initialized");

        if (!this.driverMarker) {

            const el = document.createElement("div");
            el.innerHTML = `<i class="fa-solid fa-motorcycle"></i>`;
            // el.innerHTML = `<i class="fa-solid fa-car-side"></i>`;


            el.style.fontSize = "22px";
            el.style.color = "#20395aff";
            el.style.transform = "translate(-50%, -50%)";

            this.driverMarker = new maplibregl.Marker({
                element: el,
            })
                .setLngLat(coords)
                .addTo(this.map);

            return this.driverMarker;
        }

        this.driverMarker.setLngLat(coords);
        return this.driverMarker;
            
        } catch (error) {
           throw error; 
        }

    }

    public animateDriverTo(newCoords: mapCoordinates) {
        try {

            if (!this.map) return;
            if (!this.driverMarker) {
                this.setDriverMarker(newCoords);
                return;
            }

            const start = this.driverMarker.getLngLat();
            const end = { lng: newCoords[0], lat: newCoords[1] };

            const duration = 900; // ms
            const startTime = performance.now();

            const animate = (now: number) => {
                const progress = Math.min((now - startTime) / duration, 1);

                const lng = start.lng + (end.lng - start.lng) * progress;
                const lat = start.lat + (end.lat - start.lat) * progress;

                this.driverMarker?.setLngLat([lng, lat]);

                if (progress < 1) {
                    this.animationFrame = requestAnimationFrame(animate);
                }
            };

            if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
            this.animationFrame = requestAnimationFrame(animate);
            
        } catch (error) {
            throw error;      
        }
    }


    public updateDriverMarker(coords: mapCoordinates) {
        this.animateDriverTo(coords);
    }


    public drawPath(pathCoordinates: mapCoordinates[]): LibreMap {
        try {
            if (!this.map) throw new Error("The map was not initialized");

            const sourceId = "route";
            const layerId = "route";

            const layersToRemove = [layerId, `${layerId}-glow`, `${layerId}-shadow`];
            
            layersToRemove.forEach(layer => {
                if (!this.map) throw new Error("The map was not initialized");
                if (this.map.getLayer(layer)) {
                    this.map.removeLayer(layer);
                }
            });

            if (this.map.getSource(sourceId)) {
                this.map.removeSource(sourceId);
            }

            this.map.addSource(sourceId, {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: pathCoordinates,
                    }
                }
            });

            this.map.addLayer({
                id: `${layerId}-glow`,
                type: "line",
                source: sourceId,
                layout: {
                    "line-join": "round",
                    "line-cap": "round"
                },
                paint: {
                    "line-color": "#2563eb",
                    "line-width": 8,
                    "line-opacity": 0.15,
                    "line-blur": 4
                }
            });

            this.map.addLayer({
                id: layerId,
                type: "line",
                source: sourceId,
                layout: {
                    "line-join": "round",
                    "line-cap": "round"
                },
                paint: {
                    "line-color": "#3b82f6",
                    "line-width": 3.5,
                    "line-opacity": 1
                }
            });

            this.fitBoundsToCoordinates(pathCoordinates)
            return this.map;

        } catch (error) {
            throw error;
        }
    }

    public chooseCoordinates(): Promise<mapCoordinates> {
        if (!this.map) throw new Error(`The maap was not initialized`);

        return new Promise((resolve) => {
            const handler = (event: maplibregl.MapMouseEvent ) => {
                const coords: mapCoordinates = [
                    event.lngLat.lng,
                    event.lngLat.lat,
                ];
                this.map?.off("click", handler);  
                resolve(coords);
            };

            if (!this.map) throw new Error(`The map was not initialized`);
            
            this.map.on("click", handler);
        });
    }

    private fitBoundsToCoordinates(coordinates: mapCoordinates[]): void {
        if (!this.map || coordinates.length === 0) return;

        const bounds = new LngLatBounds();

        coordinates.forEach(coord => { bounds.extend([coord[0], coord[1]]); });
            
        this.map.fitBounds(bounds, {
            padding: {
                top: 80,    
                bottom: 80, 
                left: 80,   
                right: 80   
            },
            maxZoom: 15,  
            duration: 1000 
        });
    }

}

export default MapService;