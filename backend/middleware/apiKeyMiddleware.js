/**
 * API Key Authentication Middleware
 * Validates API key from header or query parameter
 */

const API_KEY = process.env.API_KEY || '55619ef3-35cb-4971-8c94-caea08d6bb93';

export const validateApiKey = (req, res, next) => {
  // Get API key from header (x-api-key) or query parameter (apiKey)
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required. Please provide x-api-key header or apiKey query parameter.'
    });
  }

  if (apiKey !== API_KEY) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key'
    });
  }

  // Attach API key to request for logging/debugging
  req.apiKey = apiKey;
  next();
};

export default validateApiKey;








