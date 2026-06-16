import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef } from 'react';
import useAppStore from '../../store/useAppStore';
import { MAPTILER_STYLE_URL, INITIAL_VIEW_STATE } from '../../constants/mapConfig';
import { useBoundaryLayers, useDesignationVisibility } from './useBoundaryLayers';
import useMapSetup from './useMapSetup';
//import useMarkerLayers from './useMarkerLayers';

function MapView() {
  const mapContainer = useRef(null);

  useEffect(() => {
    const key = import.meta.env.VITE_MAPTILER_KEY;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAPTILER_STYLE_URL(key),
      center: INITIAL_VIEW_STATE.center,
      zoom: INITIAL_VIEW_STATE.zoom,
      pitch: INITIAL_VIEW_STATE.pitch,
      antialias: true,
    });

    map.on('load', () => {
      useAppStore.getState().setMapInstance(map);
      console.log('[Map] Loaded and ready');
    });

    return () => {
      map.remove();
    };
  }, []);

  // Call the four custom hooks
  useBoundaryLayers();
  useDesignationVisibility();
  useMapSetup();
  //useMarkerLayers();

  return <div ref={mapContainer} className="w-full h-full" />;
}

export default MapView;
