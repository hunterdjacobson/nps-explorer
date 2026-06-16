import { create } from 'zustand';
import { DESIGNATION_ORDER } from '../constants/designations';

const useAppStore = create((set) => ({
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
