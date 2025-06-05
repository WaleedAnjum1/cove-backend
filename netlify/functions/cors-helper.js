// List of allowed origins
const allowedOrigins = [
  'https://covechildcare.co.uk',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8000',
  'http://localhost:8080'
];

/**
 * Generate CORS headers based on the request origin
 * @param {string} requestOrigin - The origin from the request
 * @returns {object} - CORS headers
 */
export const getCorsHeaders = (requestOrigin) => {
  let origin = '*';
  
  // If we have a specific origin and it's in our allowed list, use it
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    origin = requestOrigin;
  }
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400' // 24 hours cache for preflight requests
  };
}; 