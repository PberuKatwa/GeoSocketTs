import maplibregl from "maplibre-gl";

class MapService{

    private map:maplibregl.Map | null;
    private centerMarker: maplibregl.Marker| null;
    private targetMarker: maplibregl.Marker|null;
    private waypointMarkers: Array<maplibregl.Marker>|null;

    constructor(){
        this.map = null;
        this.centerMarker = null;
        this.targetMarker = null;
        this.waypointMarkers = null;
    }

    initializeMap(){
        try{

        }catch(error){
            throw error;
        }
    }

}

export default MapService;