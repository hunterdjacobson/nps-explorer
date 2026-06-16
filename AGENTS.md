# NPS Explorer — Project Context

## What this project is
A dark-mode, cinematic, map-first web application that renders all ~430
NPS-managed units across the US as color-coded boundary polygons on a
WebGL map. Users filter by designation type, click any unit for a fly-in
animation, and see a detail panel with park photos, active NPS alerts,
and visitor center locations. Zero backend — all NPS API calls made
directly from the browser (CORS is allowed).

## Tech stack
- React 18 + Vite (framework — use pnpm, never npm or yarn)
- MapLibre GL JS (map engine — NOT Mapbox, NOT Leaflet, NOT react-map-gl)
- MapTiler Cloud (dark tile style via style URL)
- Zustand (global state — mapInstance, selectedPark, activeDesignations)
- TanStack Query v5 (NPS API fetching and caching)
- Tailwind CSS v3 (dark mode via 'class' strategy — always dark)
- Vercel (hosting — static Vite build, no SSR)

## Critical file purposes
- src/store/useAppStore.js — Zustand store; single source of truth
- src/constants/designations.js — DESIGNATION_CONFIG maps slug to color/label/layerID
- src/constants/mapConfig.js — style URL helper, FLY_TO_OPTIONS, zoom thresholds
- src/api/npsClient.js — ALL NPS API calls; components never call fetch directly
- src/components/Map/MapView.jsx — creates the Map instance once; calls custom hooks
- public/data/nps_boundaries.geojson — static pre-processed GeoJSON; never regenerate
  from inside components

## MapLibre GL JS rules
- Map instance created ONCE in MapView.jsx in useEffect([], [])
- Store map instance in Zustand immediately: store.setMapInstance(map)
- ALL addSource / addLayer calls go inside map.on('load', () => {...})
- Layer IDs: 'nps-fill-{key}' and 'nps-stroke-{key}' where key is the designation slug
- Hover brightness uses featureState: setFeatureState({ source, id }, { hover: true })
- flyTo park: map.fitBounds(bounds, FLY_TO_OPTIONS) from mapConfig.js
- To toggle designation visibility: map.setLayoutProperty(layerId, 'visibility', 'visible'|'none')
- Never add layers before 'load' fires — wrap all layer logic in useBoundaryLayers hook

## NPS API rules
- Base URL: https://developer.nps.gov/api/v1
- API key: import.meta.env.VITE_NPS_API_KEY
- NPS allows CORS — call directly from browser, no proxy needed
- All fetch functions live in src/api/npsClient.js; accept optional { signal }
- Park images are at park.images[0..N] = { url, title, caption, credit }
- latLong field format: "lat:37.84883584, long:-119.5571873"
- alert categories: "Closure" | "Danger" | "Caution" | "Information"

## Zustand store shape
{
  mapInstance: null,
  selectedPark: null,         // null or NPS park object (may have _loading: true)
  panelOpen: false,
  activeDesignations: Set(['national-park', 'national-monument', ...all keys]),
  hoveredParkCode: null,
  hoveredParkName: null,
  searchResults: [],
  // Actions: setMapInstance, setSelectedPark, closePanel, toggleDesignation,
  //          enableAllDesignations, disableAllDesignations,
  //          setHoveredParkCode, setHoveredParkName, setSearchResults
}

## Designation slug → color mapping (MUST match designationKey in GeoJSON)
national-park      → #F4A261 (amber)
national-monument  → #9B72CF (violet)
recreation-area    → #4CC9F0 (cyan)
seashore           → #43E8D8 (aquamarine)
historic           → #E07A5F (rose)
parkway            → #81B29A (sage)
preserve           → #A8DADC (light teal)
memorial           → #F7D1CD (blush)
riverway           → #6FFFE9 (mint)
trail              → #FFBE0B (yellow)
other              → #B0B0B0 (gray)

## Tailwind conventions
- Always use dark: variants — html element has class="dark" at all times
- App background: bg-slate-900
- Panel/card background: bg-slate-800 or bg-slate-900/90 with backdrop-blur
- Borders: border-slate-700/50
- Primary text: text-white; secondary: text-slate-400
- Never inline styles except for dynamic designation colors

## What to never do
- Never use Mapbox GL JS — always maplibre-gl
- Never use npm or yarn — always pnpm
- Never call NPS API from component JSX — always via npsClient.js
- Never use localStorage — keep state in Zustand
- Never add map layers outside map.on('load') handler
- Never hardcode designation colors — always reference DESIGNATION_CONFIG
- Never use class components — hooks only
- Never commit .env.local