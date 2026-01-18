/**
 * Calculate delivery fee based on distance using tiered pricing
 * @param {number} distance - Distance in kilometers
 * @returns {number} Delivery fee in euros
 */
export const calculateDeliveryFee = (distance) => {
  if (!distance || distance < 0) {
    return 0;
  }

  // Tiered pricing structure
  if (distance <= 10) {
    return 3.00;
  } else if (distance <= 20) {
    return 5.00;
  } else if (distance <= 30) {
    return 8.00;
  } else if (distance <= 40) {
    return 12.00;
  } else {
    // Distance exceeds maximum range
    return null; // Will be handled as error
  }
};

/**
 * Validate if distance is within delivery range
 * @param {number} distance - Distance in kilometers
 * @returns {boolean} True if within range, false otherwise
 */
export const isWithinDeliveryRange = (distance) => {
  const MAX_DISTANCE = 40; // km
  return distance > 0 && distance <= MAX_DISTANCE;
};

/**
 * Get pricing tier information
 * @returns {Array} Array of pricing tiers
 */
export const getPricingTiers = () => {
  return [
    { min: 0, max: 10, price: 3.00 },
    { min: 10, max: 20, price: 5.00 },
    { min: 20, max: 30, price: 8.00 },
    { min: 30, max: 40, price: 12.00 }
  ];
};

export default {
  calculateDeliveryFee,
  isWithinDeliveryRange,
  getPricingTiers
};

