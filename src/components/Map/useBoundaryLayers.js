import { useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import {
  DESIGNATION_CONFIG,
  DESIGNATION_ORDER,
  FILL_LAYER_ID,
  STROKE_LAYER_ID,
} from '../../constants/designations';
import { NPS_GEOJSON_PATH } from '../../constants/mapConfig';

/**
 * Custom hook to add the GeoJSON source and fill/stroke layers for all NPS designations.
 */
export function useBoundaryLayers() {
  const mapInstance = useAppStore((state) => state.mapInstance);

  useEffect(() => {
    if (!mapInstance) return;

    // Add boundaries GeoJSON source
    try {
      mapInstance.addSource('nps-boundaries', {
        type: 'geojson',
        data: NPS_GEOJSON_PATH,
        generateId: true,
      });
    } catch (e) {
      console.error('[Map] Failed to add nps-boundaries source:', e);
      return;
    }

    // Add layers for each designation key
    for (const key of DESIGNATION_ORDER) {
      const config = DESIGNATION_CONFIG[key] || DESIGNATION_CONFIG['other'];

      try {
        // Fill Layer
        mapInstance.addLayer({
          id: FILL_LAYER_ID(key),
          type: 'fill',
          source: 'nps-boundaries',
          filter: ['==', ['get', 'designationKey'], key],
          paint: {
            'fill-color': config.color,
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              Math.min(config.fillOpacity + 0.18, 0.65),
              config.fillOpacity,
            ],
          },
        });

        // Stroke Layer
        mapInstance.addLayer({
          id: STROKE_LAYER_ID(key),
          type: 'line',
          source: 'nps-boundaries',
          filter: ['==', ['get', 'designationKey'], key],
          paint: {
            'line-color': config.strokeColor,
            'line-opacity': config.strokeOpacity,
            'line-width': config.strokeWidth,
          },
        });
      } catch (e) {
        console.error(`[Map] Failed to add layers for designation: ${key}`, e);
      }
    }

    // Cleanup and remove all layers and source on unmount
    return () => {
      for (const key of DESIGNATION_ORDER) {
        try {
          mapInstance.removeLayer(FILL_LAYER_ID(key));
        } catch (e) {
          // ignore if layer already removed or doesn't exist
        }
        try {
          mapInstance.removeLayer(STROKE_LAYER_ID(key));
        } catch (e) {
          // ignore
        }
      }

      try {
        mapInstance.removeSource('nps-boundaries');
      } catch (e) {
        // ignore
      }
    };
  }, [mapInstance]);
}

/**
 * Custom hook to control the layout property visibility of designation layers
 * based on activeDesignations in the app state.
 */
export function useDesignationVisibility() {
  const mapInstance = useAppStore((state) => state.mapInstance);
  const activeDesignations = useAppStore((state) => state.activeDesignations);

  useEffect(() => {
    if (!mapInstance) return;

    for (const key of DESIGNATION_ORDER) {
      const vis = activeDesignations.has(key) ? 'visible' : 'none';
      try {
        mapInstance.setLayoutProperty(FILL_LAYER_ID(key), 'visibility', vis);
        mapInstance.setLayoutProperty(STROKE_LAYER_ID(key), 'visibility', vis);
      } catch (e) {
        // layers may not exist yet or are transitioning
      }
    }
  }, [mapInstance, activeDesignations]);
}
