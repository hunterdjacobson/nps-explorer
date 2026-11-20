import { create } from 'zustand';
import { DESIGNATION_ORDER } from '../constants/designations';
import { fetchParkByCode } from '../api/npsClient';

const useAppStore = create((set, get) => ({
  // State
  mapInstance: null,
  selectedPark: null,
  panelOpen: false,
  activeDesignations: new Set(DESIGNATION_ORDER),
  hoveredParkCode: null,
  hoveredParkName: null,
  searchResults: [],

  // Actions
  setMapInstance: (map) => set({ mapInstance: map }),

  setSelectedPark: (park) => set({ selectedPark: park, panelOpen: park !== null }),

  /**
   * Opens the panel with a loading placeholder, then replaces it with the full
   * park or an `_error` placeholder. Skips the update if the selection changed
   * in the meantime. Never rejects.
   */
  openPark: async ({ parkCode, fullName, designation }) => {
    const placeholder = { parkCode, fullName, designation, _loading: true };
    set({ selectedPark: placeholder, panelOpen: true });

    let park = null;
    let error = 'not-found';
    try {
      park = await fetchParkByCode(parkCode);
    } catch (err) {
      error = 'fetch-failed';
      console.error('[openPark] Park fetch failed:', err.message);
    }

    if (get().selectedPark !== placeholder) return;

    set({ selectedPark: park ?? { parkCode, fullName, designation, _error: error } });
  },

  closePanel: () => set({ panelOpen: false, selectedPark: null }),

  toggleDesignation: (key) => set((state) => {
    const next = new Set(state.activeDesignations);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    return { activeDesignations: next };
  }),

  enableAllDesignations: () => set({ activeDesignations: new Set(DESIGNATION_ORDER) }),

  disableAllDesignations: () => set({ activeDesignations: new Set() }),

  setHoveredParkCode: (code) => set({ hoveredParkCode: code }),
  setHoveredParkName: (name) => set({ hoveredParkName: name }),
  setSearchResults: (results) => set({ searchResults: results }),
}));

export default useAppStore;
