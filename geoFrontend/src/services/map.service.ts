import maplibregl from "maplibre-gl";

class MapService{

    private map:maplibregl.Map | null;
    public centerMarker: maplibregl.Marker| null;
    public targetMarker: maplibregl.Marker|null;
    public waypointMarkers: Array<maplibregl.Marker>|null;

    constructor(){
        this.map = null;
        this.centerMarker = null;
        this.targetMarker = null;
        this.waypointMarkers = null;
    }

    public initializeMap( container:HTMLElement, centerCordinates:[number,number], zoom = 12 ):maplibregl.Map{
        try{

            if(this.map) this.map = null;

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
                zoom: 12
            })

            this.centerMarker = new maplibregl.Marker()
            .setLngLat(centerCordinates)
            .addTo(this.map)

            this.map.addControl( new maplibregl.NavigationControl() );
            this.map.resize();

            return this.map

        }catch(error){
            throw error;
        }
    }

    public setCenterMarker(coordinates: [number, number]):maplibregl.Marker {
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

    public setTargetMarker(coordinates: [number, number]):maplibregl.Marker {
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

}

export default MapService;