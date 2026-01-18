import axios from 'axios';
import { STORE_CONFIG } from '../config/store.js';

const OPENROUTESERVICE_API_KEY = process.env.OPENROUTESERVICE_API_KEY || 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImRlMDQ0YTZiMzAzYzRlZDRhNmJlZWYwMWFhM2Y0YWRkIiwiaCI6Im11cm11cjY0In0=';

/**
 * Calculate distance and travel time between store and delivery address
 * @param {string} deliveryAddress - Full delivery address
 * @returns {Promise<{distance: number, duration: number, error?: string}>}
 */
export const calculateDistance = async (deliveryAddress) => {
  console.log('\n📍 ========== Starting distance calculation ==========');
  console.log('   Store:', STORE_CONFIG.address.fullAddress);
  console.log('   Delivery:', deliveryAddress);
  console.log('   OpenRouteService API Key:', OPENROUTESERVICE_API_KEY ? 'Set (' + OPENROUTESERVICE_API_KEY.substring(0, 20) + '...)' : 'NOT SET');

  if (!OPENROUTESERVICE_API_KEY) {
    console.warn('⚠️ OPENROUTESERVICE_API_KEY not set. Using fallback calculation.');
    return calculateStraightLineDistance(deliveryAddress);
  }

  try {
    // First, geocode both addresses to get coordinates using Nominatim (free, no API key needed)
    // Nominatim has rate limiting (1 request per second), so add delay between requests
    let storeCoords, deliveryCoords;
    
    try {
      storeCoords = await geocodeAddressNominatim(STORE_CONFIG.address.fullAddress);
    } catch (error) {
      console.error('❌ Failed to geocode store address:', error.message);
      return {
        distance: null,
        duration: null,
        success: false,
        error: `Unable to find store address: ${error.message}. Please check configuration.`
      };
    }

    if (!storeCoords) {
      console.error('❌ Failed to geocode store address:', STORE_CONFIG.address.fullAddress);
      return {
        distance: null,
        duration: null,
        success: false,
        error: `Unable to find store address. Please check configuration.`
      };
    }

    await new Promise(resolve => setTimeout(resolve, 1100)); // Wait 1.1 seconds for rate limiting
    
    try {
      deliveryCoords = await geocodeAddressNominatim(deliveryAddress);
    } catch (error) {
      console.error('❌ Failed to geocode delivery address:', error.message);
      return {
        distance: null,
        duration: null,
        success: false,
        error: `Unable to find delivery address: "${deliveryAddress}". ${error.message}. Please check the address format (street, city, zip code, country).`
      };
    }

    if (!deliveryCoords) {
      console.error('❌ Failed to geocode delivery address:', deliveryAddress);
      return {
        distance: null,
        duration: null,
        success: false,
        error: `Unable to find delivery address: "${deliveryAddress}". Please check the address format (street, city, zip code, country).`
      };
    }

    console.log('   Store coordinates:', storeCoords);
    console.log('   Delivery coordinates:', deliveryCoords);

    // OpenRouteService Directions API expects [longitude, latitude] format
    const url = `https://api.openrouteservice.org/v2/directions/driving-car`;
    const coordinates = [
      [storeCoords.lng, storeCoords.lat],  // [longitude, latitude]
      [deliveryCoords.lng, deliveryCoords.lat]
    ];

    console.log('   Calling OpenRouteService Directions API...');
    const response = await axios.post(url, {
      coordinates: coordinates
    }, {
      headers: {
        'Authorization': OPENROUTESERVICE_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('   OpenRouteService response status:', response.status);
    console.log('   Response keys:', Object.keys(response.data || {}));
    
    // OpenRouteService response format: response.data.routes[0].summary (according to reference)
    // But also check for features format (GeoJSON format)
    let summary = null;
    
    if (response.data?.routes?.[0]?.summary) {
      // Standard OpenRouteService format
      summary = response.data.routes[0].summary;
    } else if (response.data?.features?.[0]?.properties?.summary) {
      // GeoJSON format
      summary = response.data.features[0].properties.summary;
    }
    
    if (summary && summary.distance && summary.duration) {
      const distanceKm = summary.distance / 1000; // Convert meters to km
      const durationMinutes = Math.ceil(summary.duration / 60); // Convert seconds to minutes

      console.log(`   ✅ OpenRouteService Success: ${distanceKm.toFixed(2)}km, ${durationMinutes} minutes`);

      return {
        distance: parseFloat(distanceKm.toFixed(2)),
        duration: durationMinutes,
        success: true
      };
    } else {
      console.error('❌ OpenRouteService API error: Invalid response format', {
        hasRoutes: !!response.data?.routes,
        routesLength: response.data?.routes?.length,
        hasFeatures: !!response.data?.features,
        featuresLength: response.data?.features?.length,
        responseKeys: Object.keys(response.data || {}),
        fullResponse: JSON.stringify(response.data).substring(0, 500)
      });
      // Fallback to straight-line distance
      return calculateStraightLineDistance(deliveryAddress);
    }
  } catch (error) {
    console.error('❌ Error calling OpenRouteService API:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    // Fallback to straight-line distance
    return calculateStraightLineDistance(deliveryAddress);
  }
};

/**
 * Geocode an address using OpenStreetMap Nominatim to get coordinates
 * @param {string} address - Address to geocode
 * @returns {Promise<{lat: number, lng: number}|null>}
 */
export const geocodeAddressNominatim = async (address) => {
  try {
    console.log('   Geocoding address with Nominatim:', address);
    const url = `https://nominatim.openstreetmap.org/search`;
    const response = await axios.get(url, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'freshcart-app', // REQUIRED for Nominatim
        'Accept-Language': 'en'
      },
      timeout: 10000 // 10 second timeout
    });

    // Check if response has data (following reference pattern)
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.warn('   ⚠️ Nominatim geocoding returned no results for:', address);
      throw new Error(`Address not found: ${address}`);
    }

    const result = response.data[0];
    
    if (!result.lat || !result.lon) {
      console.warn('   ⚠️ Nominatim result missing lat/lon:', result);
      throw new Error(`Invalid geocoding result for: ${address}`);
    }

    const coords = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };
    
    console.log('   ✅ Nominatim geocoding success:', coords);
    console.log('   Result display name:', result.display_name);
    
    return coords;
  } catch (error) {
    console.error('❌ Error geocoding address with Nominatim:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      address: address
    });
    
    // Re-throw "Address not found" errors so they can be caught and returned properly
    if (error.message && error.message.includes('Address not found')) {
      throw error;
    }
    
    // For other errors (network issues, etc.), try OpenRouteService fallback
    if (!error.message || !error.message.includes('Address not found')) {
      try {
        const fallbackCoords = await geocodeAddressOpenRoute(address);
        if (fallbackCoords) {
          console.log('   ✅ Using OpenRouteService geocoding fallback');
          return fallbackCoords;
        }
      } catch (fallbackError) {
        console.warn('   ⚠️ OpenRouteService geocoding fallback failed');
      }
    }
    
    // Re-throw "Address not found" errors
    if (error.message && error.message.includes('Address not found')) {
      throw error;
    }
    
    // For other errors, return null (will be handled by caller)
    return null;
  }
};

/**
 * Geocode an address using OpenRouteService to get coordinates (fallback)
 * @param {string} address - Address to geocode
 * @returns {Promise<{lat: number, lng: number}|null>}
 */
export const geocodeAddressOpenRoute = async (address) => {
  if (!OPENROUTESERVICE_API_KEY) {
    return null;
  }

  try {
    const url = `https://api.openrouteservice.org/geocoding/search`;
    const response = await axios.get(url, {
      params: {
        text: address
      },
      headers: {
        'Authorization': OPENROUTESERVICE_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.data?.features?.[0]?.geometry?.coordinates) {
      // OpenRouteService returns [longitude, latitude]
      const [lng, lat] = response.data.features[0].geometry.coordinates;
      return {
        lat: lat,
        lng: lng
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error geocoding address with OpenRouteService:', error.message);
    return null;
  }
};

/**
 * Fallback: Calculate straight-line distance using Haversine formula
 * This is less accurate but works without API key
 * @param {string} deliveryAddress - Full delivery address
 * @returns {Promise<{distance: number, duration: number, success: boolean}>}
 */
const calculateStraightLineDistance = async (deliveryAddress) => {
  // For fallback, we'll estimate based on a simple calculation
  // In a real scenario, you might want to geocode both addresses first
  // For now, return a conservative estimate
  console.warn('⚠️ Using fallback distance calculation. Results may be approximate.');
  
  // Try to geocode both addresses for better accuracy using Nominatim and OpenRouteService
  console.log('   Attempting geocoding for fallback calculation...');
  let storeCoords = await geocodeAddressNominatim(STORE_CONFIG.address.fullAddress).catch(() => null);
  if (!storeCoords) {
    storeCoords = await geocodeAddressOpenRoute(STORE_CONFIG.address.fullAddress).catch(() => null);
  }
  
  let deliveryCoords = await geocodeAddressNominatim(deliveryAddress).catch(() => null);
  if (!deliveryCoords) {
    deliveryCoords = await geocodeAddressOpenRoute(deliveryAddress).catch(() => null);
  }

  console.log('   Store coordinates:', storeCoords);
  console.log('   Delivery coordinates:', deliveryCoords);

  if (storeCoords && deliveryCoords) {
    const distance = haversineDistance(
      storeCoords.lat,
      storeCoords.lng,
      deliveryCoords.lat,
      deliveryCoords.lng
    );
    
    // Estimate duration: assume average speed of 30 km/h in city
    const duration = Math.max(15, Math.ceil((distance / 30) * 60)); // Minimum 15 minutes

    console.log(`   ✅ Fallback calculation: ${distance.toFixed(2)}km, ${duration} minutes`);

    return {
      distance: parseFloat(distance.toFixed(2)),
      duration: duration,
      success: true,
      fallback: true
    };
  }

  // If geocoding fails, return a default estimate based on address matching
  console.warn('   ⚠️ Geocoding failed. Using default estimate.');
    // Default estimate: assume 5km distance, 20 minutes for safety
  return {
    distance: 5.0,
    duration: 20,
    success: true,
    fallback: true,
    warning: 'Using default estimate. Geocoding services may be temporarily unavailable.'
  };
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

export default {
  calculateDistance,
  geocodeAddressOpenRoute,
  geocodeAddressNominatim
};

