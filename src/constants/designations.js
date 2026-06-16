/**
 * Single source of truth for all NPS designation types.
 * Drives map layer colors, filter chip labels, and tooltip badge colors.
 */

export const DESIGNATION_CONFIG = {
  'national-park': {
    label: 'National Park',
    color: '#F4A261',
    fillOpacity: 0.25,
    strokeColor: '#F9C784',
    strokeOpacity: 0.9,
    strokeWidth: 1.5,
  },
  'national-monument': {
    label: 'National Monument',
    color: '#9B72CF',
    fillOpacity: 0.25,
    strokeColor: '#C4A4F0',
    strokeOpacity: 0.9,
    strokeWidth: 1.2,
  },
  'recreation-area': {
    label: 'National Recreation Area',
    color: '#4CC9F0',
    fillOpacity: 0.2,
    strokeColor: '#7FDBFF',
    strokeOpacity: 0.9,
    strokeWidth: 1.2,
  },
  'seashore': {
    label: 'National Seashores & Lakeshores',
    color: '#43E8D8',
    fillOpacity: 0.2,
    strokeColor: '#80FFF5',
    strokeOpacity: 0.9,
    strokeWidth: 1.2,
  },
  'historic': {
    label: 'Historic Sites & Parks',
    color: '#E07A5F',
    fillOpacity: 0.25,
    strokeColor: '#F0A090',
    strokeOpacity: 0.9,
    strokeWidth: 1.2,
  },
  'parkway': {
    label: 'National Parkways',
    color: '#81B29A',
    fillOpacity: 0.25,
    strokeColor: '#A5D0B8',
    strokeOpacity: 0.9,
    strokeWidth: 1.5,
  },
  'preserve': {
    label: 'Preserves & Reserves',
    color: '#A8DADC',
    fillOpacity: 0.2,
    strokeColor: '#C8F0F2',
    strokeOpacity: 0.8,
    strokeWidth: 1.0,
  },
  'memorial': {
    label: 'National Memorials',
    color: '#F7D1CD',
    fillOpacity: 0.25,
    strokeColor: '#FFE0DC',
    strokeOpacity: 0.8,
    strokeWidth: 1.0,
  },
  'riverway': {
    label: 'Wild & Scenic Riverways',
    color: '#6FFFE9',
    fillOpacity: 0.3,
    strokeColor: '#A0FFF0',
    strokeOpacity: 0.9,
    strokeWidth: 2.0,
  },
  'trail': {
    label: 'National Trails',
    color: '#FFBE0B',
    fillOpacity: 0.2,
    strokeColor: '#FFD54F',
    strokeOpacity: 0.8,
    strokeWidth: 1.5,
  },
  'other': {
    label: 'Other NPS Units',
    color: '#B0B0B0',
    fillOpacity: 0.15,
    strokeColor: '#D0D0D0',
    strokeOpacity: 0.7,
    strokeWidth: 1.0,
  },
};

export const DESIGNATION_ORDER = [
  'national-park',
  'national-monument',
  'recreation-area',
  'seashore',
  'historic',
  'parkway',
  'preserve',
  'memorial',
  'riverway',
  'trail',
  'other',
];

/**
 * Returns the designation configuration for a given key, defaulting to the 'other' config.
 * @param {string} key - Designation slug key
 * @returns {object} Designation configuration
 */
export function getDesignationConfig(key) {
  return DESIGNATION_CONFIG[key] || DESIGNATION_CONFIG['other'];
}

/**
 * Returns the MapLibre fill layer ID for a designation slug.
 * @param {string} key - Designation slug key
 * @returns {string} Fill layer ID
 */
export function FILL_LAYER_ID(key) {
  return `nps-fill-${key}`;
}

/**
 * Returns the MapLibre stroke layer ID for a designation slug.
 * @param {string} key - Designation slug key
 * @returns {string} Stroke layer ID
 */
export function STROKE_LAYER_ID(key) {
  return `nps-stroke-${key}`;
}

// Internal map matching process_boundaries.py keys to their respective slugs
const DESIGNATION_MAP = {
  'National Park': 'national-park',
  'National Monument': 'national-monument',
  'National Recreation Area': 'recreation-area',
  'National Seashore': 'seashore',
  'National Lakeshore': 'seashore',
  'National Historic Site': 'historic',
  'National Historical Park': 'historic',
  'National Historical Park and Ecological Preserve': 'historic',
  'International Historic Site': 'historic',
  'National Parkway': 'parkway',
  'National Preserve': 'preserve',
  'National Reserve': 'preserve',
  'National Memorial': 'memorial',
  'National Wild and Scenic River': 'riverway',
  'Wild & Scenic Riverway': 'riverway',
  'National Scenic Trail': 'trail',
  'National Historic Trail': 'trail',
};

/**
 * Normalizes a raw designation string into one of our app's slugs.
 * Matches the logic in process_boundaries.py exactly.
 * @param {string} rawType - Raw designation string from the NPS API
 * @returns {string} Normalization slug
 */
function normalizeDesignation(rawType) {
  if (!rawType) {
    return 'other';
  }

  const trimmed = rawType.trim();

  // 1. Check for exact matches first
  if (DESIGNATION_MAP[trimmed]) {
    return DESIGNATION_MAP[trimmed];
  }

  const lower = trimmed.toLowerCase();

  // 2. PRIORITY OVERRIDES: Handle combined types (like 'National Park & Preserve')
  if (lower.includes('national park')) {
    return 'national-park';
  }

  if (lower.includes('national monument')) {
    return 'national-monument';
  }

  // 3. Check for remaining partial sub-strings (Preserves, Historic, Riverways, etc.)
  for (const [key, value] of Object.entries(DESIGNATION_MAP)) {
    if (lower.includes(key.toLowerCase())) {
      return value;
    }
  }

  return 'other';
}

/**
 * Maps the raw NPS API designation field to the correct color hex.
 * Normalizes the string using normalizeDesignation.
 * @param {string} rawDesignationString - Raw designation string
 * @returns {string} Color hex
 */
export function getColorForDesignation(rawDesignationString) {
  if (!rawDesignationString) {
    return DESIGNATION_CONFIG['other'].color;
  }
  if (DESIGNATION_CONFIG[rawDesignationString]) {
    return DESIGNATION_CONFIG[rawDesignationString].color;
  }
  const slug = normalizeDesignation(rawDesignationString);
  return DESIGNATION_CONFIG[slug]?.color || DESIGNATION_CONFIG['other'].color;
}
