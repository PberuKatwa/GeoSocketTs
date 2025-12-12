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

            return this.targetMarker
        }catch(error){
            throw error;
        }

    }

    public setDriverMarker(coords: mapCoordinates): Marker {
        try {

        if (!this.map) throw new Error("Map not initialized");

        if (!this.driverMarker) {

            this.driverMarker = new maplibregl.Marker({
                color: "#000",
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