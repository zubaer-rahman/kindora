/**
 * CORS middleware for mobile app compatibility
 * Use this in your API routes or middleware to enable mobile requests
 */

export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:8081', // Expo dev server
  'http://localhost:19000', // Expo web preview
];

export const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

export const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'X-Api-Key',
  'Accept',
];

export interface CORSOptions {
  origins?: string[];
  methods?: string[];
  headers?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Apply CORS headers to a response
 */
export const applyCORSHeaders = (
  req: Request,
  res: Response,
  options: CORSOptions = {}
) => {
  const {
    origins = ALLOWED_ORIGINS,
    methods = ALLOWED_METHODS,
    headers = ALLOWED_HEADERS,
    credentials = true,
    maxAge = 86400, // 24 hours
  } = options;

  const origin = req.headers.get('origin');
  const isDevelopment = process.env.NODE_ENV === 'development';

  // In development, allow all origins; in production, check against allowlist
  const isOriginAllowed =
    isDevelopment ||
    !origin ||
    origins.includes(origin) ||
    origins.includes('*');

  if (isOriginAllowed) {
    res.headers.set('Access-Control-Allow-Origin', origin || '*');
  }

  res.headers.set('Access-Control-Allow-Methods', methods.join(', '));
  res.headers.set('Access-Control-Allow-Headers', headers.join(', '));

  if (credentials) {
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  res.headers.set('Access-Control-Max-Age', maxAge.toString());
  res.headers.set('Access-Control-Expose-Headers', 'Content-Length, Authorization');

  return res;
};

/**
 * Handle CORS preflight requests
 */
export const handleCORSPreflight = (req: Request): Response | null => {
  if (req.method === 'OPTIONS') {
    const res = new Response(null, { status: 204 });
    return applyCORSHeaders(req, res);
  }
  return null;
};

/**
 * Middleware function for Next.js middleware.ts
 * Example usage:
 * export function middleware(request: NextRequest) {
 *   return corsMiddleware(request);
 * }
 */
export const corsMiddleware = (request: Request) => {
  const preflightResponse = handleCORSPreflight(request);
  if (preflightResponse) {
    return preflightResponse;
  }

  // For non-preflight requests, CORS headers are applied in the response
  return undefined;
};
