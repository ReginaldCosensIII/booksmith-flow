// Content Security Policy configuration for The Booksmith

export const cspConfig = {
  // Enhanced CSP directives for production security
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    // Allow inline scripts for Vite in development
    ...(process.env.NODE_ENV === 'development' ? ["'unsafe-inline'"] : []),
    // Allow Supabase and other trusted domains
    "https://gfgpkwbjigghtxnrmdha.supabase.co",
    "https://*.supabase.co"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS and Tailwind
    "https://fonts.googleapis.com"
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "https://gfgpkwbjigghtxnrmdha.supabase.co",
    "https://*.supabase.co"
  ],
  'font-src': [
    "'self'",
    "data:",
    "https://fonts.gstatic.com"
  ],
  'connect-src': [
    "'self'",
    "https://gfgpkwbjigghtxnrmdha.supabase.co",
    "https://*.supabase.co",
    "wss://gfgpkwbjigghtxnrmdha.supabase.co",
    "wss://*.supabase.co"
  ],
  'media-src': ["'self'", "blob:", "data:"],
  'object-src': ["'none'"],
  'frame-src': ["'none'"],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': process.env.NODE_ENV === 'production' ? [] : null
} as const;

export function generateCSPHeader(): string {
  return Object.entries(cspConfig)
    .filter(([, value]) => value !== null)
    .map(([directive, sources]) => {
      if (Array.isArray(sources) && sources.length > 0) {
        return `${directive} ${sources.join(' ')}`;
      } else if (!Array.isArray(sources)) {
        return directive; // For directives like upgrade-insecure-requests
      }
      return '';
    })
    .filter(Boolean)
    .join('; ');
}

// Security headers for enhanced protection
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': generateCSPHeader()
} as const;

// Helper to apply security headers in development
export function applySecurityHeaders() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Security headers would be applied in production:', securityHeaders);
  }
}

// Feature Policy for granular permissions control
export const featurePolicy = {
  camera: "'none'",
  microphone: "'none'",
  geolocation: "'none'",
  payment: "'none'",
  usb: "'none'",
  accelerometer: "'none'",
  gyroscope: "'none'",
  magnetometer: "'none'"
};