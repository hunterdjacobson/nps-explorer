import { useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import { DESIGNATION_ORDER, FILL_LAYER_ID } from '../../constants/designations';
import { FLY_TO_OPTIONS } from '../../constants/mapConfig';
import { fetchParkByCode } from '../../api/npsClient';

/**
 * Custom hook to set up hover (tooltip/highlight) and click event listeners
 * on the park boundary fill layers.
 */
export default function useMapSetup() {
  const mapInstance = useAppStore((state) => state.mapInstance);

  useEffect(() => {
    if (!mapInstance) return;

    const layerIds = DESIGNATION_ORDER.map(FILL_LAYER_ID);
    let hoveredId = null;

    const handleMouseMove = (e) => {
      if (!e.features || !e.features.length) return;

      // Clear previous hover
      if (hoveredId !== null) {
        mapInstance.setFeatureState(
          { source: 'nps-boundaries', id: hoveredId },
          { hover: false }
        );
      }

      hoveredId = e.features[0].id;
      mapInstance.setFeatureState(
        { source: 'nps-boundaries', id: hoveredId },
        { hover: true }
      );

      // Update store for tooltip
      const { parkCode, parkName } = e.features[0].properties;
      useAppStore.getState().setHoveredParkCode(parkCode);
      useAppStore.getState().setHoveredParkName(parkName);

      // Update cursor
      mapInstance.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      if (hoveredId !== null) {
        mapInstance.setFeatureState(
          { source: 'nps-boundaries', id: hoveredId },
          { hover: false }
        );
        hoveredId = null;
      }

      useAppStore.getState().setHoveredParkCode(null);
      useAppStore.getState().setHoveredParkName(null);

      // Reset cursor
      mapInstance.getCanvas().style.cursor = '';
    };

    const handleClick = async (e) => {
      if (!e.features || !e.features.length) return;

      const { parkCode, parkName, designationType } = e.features[0].properties;

      // Immediately open panel with placeholder so user sees something
      useAppStore.getState().setSelectedPark({
        parkCode,
        fullName: parkName,
        designation: designationType,
        _loading: true,
      });

      // Fly to click location (center on the click point, not park centroid)
      mapInstance.flyTo({
        center: [e.lngLat.lng, e.lngLat.lat],
        zoom: Math.max(mapInstance.getZoom(), 8),
        duration: FLY_TO_OPTIONS.duration,
        essential: true,
        padding: FLY_TO_OPTIONS.padding,
      });

      // Fetch full park data in background
      try {
        const fullPark = await fetchParkByCode(parkCode);
        if (fullPark) {
          useAppStore.getState().setSelectedPark(fullPark);
        }
      } catch (err) {
        console.error('[useMapSetup] Park fetch failed:', err.message);
      }
    };

    // Attach listeners
    mapInstance.on('mousemove', layerIds, handleMouseMove);
    mapInstance.on('mouseleave', layerIds, handleMouseLeave);
    mapInstance.on('click', layerIds, handleClick);

    // Cleanup listeners
    return () => {
      mapInstance.off('mousemove', layerIds, handleMouseMove);
      mapInstance.off('mouseleave', layerIds, handleMouseLeave);
      mapInstance.off('click', layerIds, handleClick);
    };
  }, [mapInstance]);
}
