const API_KEY = import.meta.env.VITE_NPS_API_KEY;
const BASE_URL = 'https://developer.nps.gov/api/v1';

// In-memory cache for performance
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;


/**
 * Parses a latLong string from the NPS API (e.g. "lat:37.84883584, long:-119.5571873")
 * and extracts the coordinates as float numbers.
 * @param {string} latLongStr - The coordinate string to parse
 * @returns {{lat: number|null, lon: number|null}} Parsed float coordinates or nulls on failure
 */
function parseLatLon(latLongStr) {
  if (!latLongStr || typeof latLongStr !== 'string') {
    return { lat: null, lon: null };
  }

  const latMatch = latLongStr.match(/lat:\s*([0-9.-]+)/i);
  const lonMatch = latLongStr.match(/(?:long|lon|lng):\s*([0-9.-]+)/i);

  if (!latMatch || !lonMatch) {
    return { lat: null, lon: null };
  }

  const lat = parseFloat(latMatch[1]);
  const lon = parseFloat(lonMatch[1]);

  if (isNaN(lat) || isNaN(lon)) {
    return { lat: null, lon: null };
  }

  return { lat, lon };
}

/**
 * Constructs a full request URL with query parameters, always appending the API key.
 * @param {string} path - Endpoint path (e.g., '/parks')
 * @param {object} params - Key-value search params
 * @returns {string} Fully qualified URL string
 */
function buildUrl(path, params = {}) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, value);
    }
  }

  if (API_KEY) {
    searchParams.set('api_key', API_KEY);
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}?${searchParams.toString()}`;
}

/**
 * Searches for parks by query string.
 * @param {string} query - The search query term
 * @param {{limit?: number, signal?: AbortSignal}} options
 * @returns {Promise<Array>} List of park objects
 */
export async function searchParks(query, { limit = 50, signal } = {}) {
  const path = '/parks';
  console.log('[NPS] GET', path);

  try {
    const url = buildUrl(path, { q: query, limit });
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return json.data || [];
  } catch (err) {
    throw new Error('Failed to search parks: ' + err.message);
  }
}

/**
 * Fetches all parks using paginated requests (useful for "Surprise Me").
 * @param {{limit?: number, start?: number, signal?: AbortSignal}} options
 * @returns {Promise<object>} Response envelope containing data, total, limit, start
 */
export async function fetchAllParks({ limit = 50, start = 0, signal } = {}) {
  const path = '/parks';
  console.log('[NPS] GET', path);

  try {
    const url = buildUrl(path, { limit, start });
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return {
      data: json.data || [],
      total: parseInt(json.total, 10) || 0,
      limit: parseInt(json.limit, 10) || limit,
      start: parseInt(json.start, 10) || start,
    };
  } catch (err) {
    throw new Error('Failed to fetch all parks: ' + err.message);
  }
}

/**
 * Fetches a single park detail by its code.
 * @param {string} parkCode - NPS park code (e.g. "yose")
 * @param {{signal?: AbortSignal}} options
 * @returns {Promise<object|null>} Park data object or null if not found
 */
export async function fetchParkByCode(parkCode, { signal } = {}) {
  const path = '/parks';
  console.log('[NPS] GET', path);

  try {
    const url = buildUrl(path, { parkCode, limit: 1 });
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return json.data && json.data.length > 0 ? json.data[0] : null;
  } catch (err) {
    throw new Error(`Failed to fetch park by code ${parkCode}: ` + err.message);
  }
}

/**
 * Fetches active alerts for a given park.
 * @param {string} parkCode - NPS park code
 * @param {{signal?: AbortSignal}} options
 * @returns {Promise<Array>} List of alerts (non-critical, returns empty array on error)
 */
export async function fetchParkAlerts(parkCode, { signal } = {}) {
  const cacheKey = `fetchParkAlerts:${parkCode}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const path = '/alerts';
  console.log('[NPS] GET', path);

  try {
    const url = buildUrl(path, { parkCode });
    const response = await fetch(url, { signal });

    if (!response.ok) {
      return [];
    }

    const json = await response.json();
    const result = json.data || [];
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.error('[NPS] Failed to fetch alerts:', err);
    return [];
  }
}

/**
 * Fetches visitor centers inside a given park.
 * Parses and maps valid geographic coordinates.
 * @param {string} parkCode - NPS park code
 * @param {{signal?: AbortSignal}} options
 * @returns {Promise<Array>} List of visitor centers with valid lat/lon
 */
export async function fetchVisitorCenters(parkCode, { signal } = {}) {
  const cacheKey = `fetchVisitorCenters:${parkCode}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const path = '/visitorcenters';
  console.log('[NPS] GET', path);

  try {
    const url = buildUrl(path, { parkCode });
    const response = await fetch(url, { signal });

    if (!response.ok) {
      return [];
    }

    const json = await response.json();
    const data = json.data || [];

    const result = data
      .map((item) => {
        const { lat, lon } = parseLatLon(item.latLong);
        return { ...item, lat, lon };
      })
      .filter((item) => item.lat !== null);

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.error('[NPS] Failed to fetch visitor centers:', err);
    return [];
  }
}

/**
 * Fetches campgrounds inside a given park.
 * Parses and maps valid geographic coordinates.
 * @param {string} parkCode - NPS park code
 * @param {{signal?: AbortSignal}} options
 * @returns {Promise<Array>} List of campgrounds with valid lat/lon
 */
export async function fetchCampgrounds(parkCode, { signal } = {}) {
  const cacheKey = `fetchCampgrounds:${parkCode}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const path = '/campgrounds';
  console.log('[NPS] GET', path);

  try {
    const url = buildUrl(path, { parkCode });
    const response = await fetch(url, { signal });

    if (!response.ok) {
      return [];
    }

    const json = await response.json();
    const data = json.data || [];

    const result = data
      .map((item) => {
        const { lat, lon } = parseLatLon(item.latLong);
        return { ...item, lat, lon };
      })
      .filter((item) => item.lat !== null);

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.error('[NPS] Failed to fetch campgrounds:', err);
    return [];
  }
}

/**
 * Fetches standard "Things To Do" in a given park.
 * @param {string} parkCode - NPS park code
 * @param {{limit?: number, signal?: AbortSignal}} options
 * @returns {Promise<Array>} List of activities
 */
export async function fetchThingsToDo(parkCode, { limit = 10, signal } = {}) {
  const path = '/thingstodo';
  console.log('[NPS] GET', path);

  try {
    const url = buildUrl(path, { parkCode, limit });
    const response = await fetch(url, { signal });

    if (!response.ok) {
      return [];
    }

    const json = await response.json();
    return json.data || [];
  } catch (err) {
    console.error('[NPS] Failed to fetch things to do:', err);
    return [];
  }
}
