/**
 * MapLibre and MapTiler configuration options for the NPS Explorer map view.
 */

export const MAPTILER_STYLE_URL = (maptilerKey) =>
  `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${maptilerKey}`;

export const INITIAL_VIEW_STATE = {
  center: [-98.35, 39.5],
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

export const FLY_TO_OPTIONS = {
  padding: { top: 80, bottom: 80, left: 420, right: 80 },
  maxZoom: 12,
  duration: 1800,
  essential: true,
};

export const VISITOR_CENTER_ZOOM_THRESHOLD = 8;

export const CAMPGROUND_ZOOM_THRESHOLD = 9;

export const NPS_GEOJSON_PATH = '/data/nps_boundaries.geojson';
