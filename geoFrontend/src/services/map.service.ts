import maplibregl from "maplibre-gl";
import type { Marker, Map as LibreMap } from "maplibre-gl";
import type { mapCoordinates, MapInitializationOptions } from "@/types/geo.types";

class MapService{

    private map:LibreMap | null;
    public centerMarker: Marker| null;
    public targetMarker: Marker|null;
    public waypointMarkers: Array<Marker>|[];

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

    public drawPath(pathCoordinates: mapCoordinates[]): LibreMap {
        try {
            if (!this.map) throw new Error("The map was not initialized");

            const sourceId = "route";
            const layerId = "route";

            if (this.map.getLayer(layerId)) {
                this.map.removeLayer(layerId);
            }
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
                id: `${layerId}-shadow`,
                type: "line",
                source: sourceId,
                paint: {
                    "line-color": "#1d4ed8",      
                    "line-width": 12,
                    "line-opacity": 0.25,
                    "line-blur": 2
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
                    "line-width": 6,
                    "line-opacity": 0.95
                }
            });

            return this.map;

        } catch (error) {
            throw error;
        }
    }

    public chooseCoordinates(): Promise<mapCoordinates> {
        if (!this.map) throw new Error(`The map was not initialized`);

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


}

export default MapService;