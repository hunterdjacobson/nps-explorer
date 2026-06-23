import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchParkByCode } from '../../api/npsClient';
import useAppStore from '../../store/useAppStore';

/**
 * Helper to get a representative coordinate from a GeoJSON geometry.
 */
function getRepresentativeCoordinate(geometry) {
  if (!geometry) return null;
  const { type, coordinates } = geometry;
  if (!coordinates || !coordinates.length) return null;

  if (type === 'Point') {
    return coordinates;
  }
  if (type === 'Polygon') {
    const ring = coordinates[0];
    return ring && ring.length ? ring[0] : null;
  }
  if (type === 'MultiPolygon') {
    const polygon = coordinates[0];
    if (polygon && polygon.length) {
      const ring = polygon[0];
      return ring && ring.length ? ring[0] : null;
    }
  }
  return null;
}

/**
 * Renders a "Surprise Me" button that loads all park boundaries via GeoJSON,
 * filters them based on active designations, selects one at random, opens
 * its panel with a placeholder, flies the map viewport to it, and loads full details.
 */
export default function SurpriseButton() {
  const [isAnimating, setIsAnimating] = useState(false);
  const activeDesignations = useAppStore((state) => state.activeDesignations);

  // Fetch the static boundaries GeoJSON to get all parks and their designation keys
  const { data: geojsonData, isLoading } = useQuery({
    queryKey: ['boundaries-geojson'],
    queryFn: async ({ signal }) => {
      const res = await fetch('/data/nps_boundaries.geojson', { signal });
      if (!res.ok) {
        throw new Error('Failed to load boundaries geojson');
      }
      return res.json();
    },
    staleTime: Infinity,
  });

  const handleSurprise = async () => {
    setIsAnimating(true);
    const features = geojsonData?.features || [];

    if (!features.length || activeDesignations.size === 0) {
      setIsAnimating(false);
      return;
    }

    // Filter features based on active designations
    const filteredFeatures = features.filter((feature) => {
      const key = feature.properties?.designationKey;
      return activeDesignations.has(key);
    });

    if (!filteredFeatures.length) {
      setIsAnimating(false);
      return;
    }

    const randomFeature = filteredFeatures[Math.floor(Math.random() * filteredFeatures.length)];
    const { parkCode, parkName, designationType } = randomFeature.properties;

    // Immediately open panel with a placeholder so the user sees a loading state
    useAppStore.getState().setSelectedPark({
      parkCode,
      fullName: parkName,
      designation: designationType,
      _loading: true,
    });

    // Fly to the park immediately
    const map = useAppStore.getState().mapInstance;
    const coord = getRepresentativeCoordinate(randomFeature.geometry);
    if (map && coord) {
      map.flyTo({
        center: coord,
        zoom: 9,
        duration: 1500,
      });
    }

    // Fetch full park data in the background
    try {
      const fullPark = await fetchParkByCode(parkCode);
      const currentSelected = useAppStore.getState().selectedPark;
      if (fullPark && currentSelected?.parkCode === parkCode) {
        useAppStore.getState().setSelectedPark(fullPark);
      }
    } catch (err) {
      console.error('[SurpriseButton] Park fetch failed:', err.message);
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
  };

  return (
    <button
      type="button"
      onClick={handleSurprise}
      disabled={isLoading || isAnimating || activeDesignations.size === 0}
      className="absolute bottom-6 right-4 z-10 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-slate-700/80 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      <span className={`inline-block ${isAnimating ? 'animate-spin' : ''}`} role="img" aria-label="dice">
        🎲
      </span>
      <span>Surprise Me</span>
    </button>
  );
}

