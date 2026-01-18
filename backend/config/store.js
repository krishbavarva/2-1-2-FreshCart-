// Store configuration
export const STORE_CONFIG = {
  address: {
    street: '4 allée Carpentier',
    city: 'Créteil',
    zipCode: '94000',
    country: 'France',
    fullAddress: '4 allée Carpentier, Créteil, 94000, France'
  },
  coordinates: {
    // Will be populated via geocoding if needed
    lat: null,
    lng: null
  },
  deliveryRange: {
    maxDistance: 40, // km
    unit: 'km'
  }
};

export default STORE_CONFIG;

