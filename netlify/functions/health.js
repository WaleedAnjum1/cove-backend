import { getCorsHeaders } from './cors-helper.js';

export const handler = async (event, context) => {
  // Get CORS headers based on the request origin
  const headers = getCorsHeaders(event.headers.origin || event.headers.Origin);
  
  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ status: 'ok' })
  };
}; 