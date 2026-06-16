import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchParks } from '../../api/npsClient';
import useAppStore from '../../store/useAppStore';
import { getColorForDesignation } from '../../constants/designations';

/**
 * Renders an autocomplete search bar overlays on top of the map.
 * Users can search national parks by name, see color-coded results,
 * and select a result to fly-to and open its details.
 */
export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);

  // Debouncing input
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length >= 2) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(val);
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Fetch results via TanStack Query
  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: ({ signal }) => searchParks(debouncedQuery, { signal }),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30 * 1000,
  });

  const hasResults = data && data.length > 0;
  const isEmptyState =
    debouncedQuery.trim().length >= 2 && !isLoading && data && data.length === 0;
  const shouldShowDropdown = showDropdown && (hasResults || isEmptyState);

  return (
    <div className="absolute top-4 z-10 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-md">
      <div className="relative w-full">
        {/* Search Icon */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
          🔍
        </span>

        {/* Input Field */}
        <input
          type="text"
          className="w-full bg-slate-800/90 backdrop-blur-sm text-white text-sm rounded-xl border border-slate-700/50 pl-9 pr-9 py-3 outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 placeholder-slate-500 transition-all"
          placeholder="Search national parks, monuments, recreation areas..."
          value={query}
          onChange={handleQueryChange}
          onFocus={() => {
            if (data?.length || isEmptyState) setShowDropdown(true);
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
        )}

        {/* Dropdown Results */}
        {shouldShowDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto z-40 panel-scroll">
            {hasResults &&
              data.slice(0, 10).map((result) => (
                <button
                  key={result.parkCode}
                  type="button"
                  onMouseDown={() => {
                    setQuery(result.fullName);
                    setDebouncedQuery(result.fullName);
                    setShowDropdown(false);
                    useAppStore.getState().setSelectedPark(result);

                    // Fly to park
                    const map = useAppStore.getState().mapInstance;
                    if (map) {
                      const match = result.latLong?.match(/lat:([\d.-]+),\s*long:([\d.-]+)/);
                      if (match) {
                        map.flyTo({
                          center: [parseFloat(match[2]), parseFloat(match[1])],
                          zoom: 9,
                          duration: 1500,
                        });
                      }
                    }
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-700/60 transition-colors flex items-center gap-3 border-b border-slate-700/30 last:border-0 cursor-pointer"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getColorForDesignation(result.designation) }}
                  />
                  <div className="min-w-0">
                    <div className="text-white text-sm font-medium truncate">
                      {result.fullName}
                    </div>
                    <div className="text-slate-500 text-xs truncate">
                      {result.designation} &middot; {result.states}
                    </div>
                  </div>
                </button>
              ))}

            {isEmptyState && (
              <div className="px-4 py-3 text-slate-500 text-sm">
                No results for "{debouncedQuery}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
