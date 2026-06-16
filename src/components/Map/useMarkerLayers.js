import { useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import { fetchVisitorCenters, fetchCampgrounds } from '../../api/npsClient';
import {
  VISITOR_CENTER_ZOOM_THRESHOLD,
  CAMPGROUND_ZOOM_THRESHOLD,
} from '../../constants/mapConfig';

/**
 * Custom hook to dynamically add visitor center circles/labels and campground markers
 * as MapLibre layers when a park is selected.
 */
export default function useMarkerLayers() {
  const selectedPark = useAppStore((state) => state.selectedPark);
  const mapInstance = useAppStore((state) => state.mapInstance);

  useEffect(() => {
    if (!mapInstance) return;

    let active = true;

    // Helper to cleanup all layers and sources
    const cleanup = () => {
      try {
        if (mapInstance.getLayer('vc-circles')) mapInstance.removeLayer('vc-circles');
      } catch (e) {
        // ignore
      }
      try {
        if (mapInstance.getLayer('vc-labels')) mapInstance.removeLayer('vc-labels');
      } catch (e) {
        // ignore
      }
      try {
        if (mapInstance.getLayer('camp-circles')) mapInstance.removeLayer('camp-circles');
      } catch (e) {
        // ignore
      }
      try {
        if (mapInstance.getSource('visitor-centers')) mapInstance.removeSource('visitor-centers');
      } catch (e) {
        // ignore
      }
      try {
        if (mapInstance.getSource('campgrounds')) mapInstance.removeSource('campgrounds');
      } catch (e) {
        // ignore
      }
    };

    // If no park selected or it is loading, perform cleanup and exit
    if (!selectedPark || selectedPark._loading) {
      cleanup();
      return;
    }

    // Helper to dynamically add or update a GeoJSON source
    const addOrUpdateSource = (id, geojson) => {
      try {
        const source = mapInstance.getSource(id);
        if (source) {
          source.setData(geojson);
        } else {
          mapInstance.addSource(id, { type: 'geojson', data: geojson });
        }
      } catch (e) {
        console.error(`[useMarkerLayers] Source error for ${id}:`, e);
      }
    };

    // Fetch visitor centers and campgrounds concurrently
    Promise.all([
      fetchVisitorCenters(selectedPark.parkCode),
      fetchCampgrounds(selectedPark.parkCode),
    ])
      .then(([vcs, camps]) => {
        if (!active) return;

        // -- Visitor Centers --
        const vcGeoJSON = {
          type: 'FeatureCollection',
          features: vcs.map((vc) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [vc.lon, vc.lat] },
            properties: {
              name: vc.name,
              isStamp: vc.isPassportStampLocation === 'true',
            },
          })),
        };
        addOrUpdateSource('visitor-centers', vcGeoJSON);

        // Add circle layer for visitor centers
        try {
          if (!mapInstance.getLayer('vc-circles')) {
            mapInstance.addLayer({
              id: 'vc-circles',
              type: 'circle',
              source: 'visitor-centers',
              minzoom: VISITOR_CENTER_ZOOM_THRESHOLD,
              paint: {
                'circle-radius': 7,
                'circle-color': '#90E0EF',
                'circle-stroke-color': '#FFFFFF',
                'circle-stroke-width': 2,
                'circle-opacity': 0.95,
              },
            });
          }
        } catch (e) {
          console.error('[useMarkerLayers] Error adding vc-circles:', e);
        }

        // Add text labels for visitor centers (visible at higher zoom)
        try {
          if (!mapInstance.getLayer('vc-labels')) {
            mapInstance.addLayer({
              id: 'vc-labels',
              type: 'symbol',
              source: 'visitor-centers',
              minzoom: VISITOR_CENTER_ZOOM_THRESHOLD + 1,
              layout: {
                'text-field': ['get', 'name'],
                'text-size': 11,
                'text-offset': [0, 1.4],
                'text-anchor': 'top',
              },
              paint: {
                'text-color': '#FFFFFF',
                'text-halo-color': '#0F172A',
                'text-halo-width': 1.5,
              },
            });
          }
        } catch (e) {
          console.error('[useMarkerLayers] Error adding vc-labels:', e);
        }

        // -- Campgrounds --
        const campGeoJSON = {
          type: 'FeatureCollection',
          features: camps.map((c) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [c.lon, c.lat] },
            properties: { name: c.name },
          })),
        };
        addOrUpdateSource('campgrounds', campGeoJSON);

        // Add circle layer for campgrounds
        try {
          if (!mapInstance.getLayer('camp-circles')) {
            mapInstance.addLayer({
              id: 'camp-circles',
              type: 'circle',
              source: 'campgrounds',
              minzoom: CAMPGROUND_ZOOM_THRESHOLD,
              paint: {
                'circle-radius': 6,
                'circle-color': '#0e6e40',
                'circle-stroke-color': '#FFFFFF',
                'circle-stroke-width': 1.5,
                'circle-opacity': 0.9,
              },
            });
          }
        } catch (e) {
          console.error('[useMarkerLayers] Error adding camp-circles:', e);
        }
      })
      .catch((err) => {
        console.error('[useMarkerLayers] Failed to fetch marker details:', err);
      });

    return () => {
      active = false;
      cleanup();
    };
  }, [selectedPark, mapInstance]);
}
