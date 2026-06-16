import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllParks } from '../../api/npsClient';
import useAppStore from '../../store/useAppStore';

/**
 * Renders a "Surprise Me" button that preloads a batch of parks,
 * selects one at random, opens its panel, and flies the map viewport to it.
 */
export default function SurpriseButton() {
  const [isAnimating, setIsAnimating] = useState(false);

  // Preload a sample batch of parks once per session
  const { data, isLoading } = useQuery({
    queryKey: ['parks-sample'],
    queryFn: ({ signal }) => fetchAllParks({ limit: 100, signal }),
    staleTime: Infinity,
  });

  const handleSurprise = () => {
    setIsAnimating(true);
    const parks = data?.data || [];

    if (!parks.length) {
      setIsAnimating(false);
      return;
    }

    const randomPark = parks[Math.floor(Math.random() * parks.length)];

    // Update global store
    useAppStore.getState().setSelectedPark(randomPark);

    // Fly to park
    const map = useAppStore.getState().mapInstance;
    if (map && randomPark.latLong) {
      const match = randomPark.latLong.match(/lat:([\d.-]+),\s*long:([\d.-]+)/);
      if (match) {
        map.flyTo({
          center: [parseFloat(match[2]), parseFloat(match[1])],
          zoom: 9,
          duration: 1500,
        });
      }
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
  };

  return (
    <button
      type="button"
      onClick={handleSurprise}
      disabled={isLoading || isAnimating}
      className="absolute bottom-6 right-4 z-10 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-slate-700/80 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      <span className={`inline-block ${isAnimating ? 'animate-spin' : ''}`} role="img" aria-label="dice">
        🎲
      </span>
      <span>Surprise Me</span>
    </button>
  );
}
