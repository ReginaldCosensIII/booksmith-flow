// Security utilities and rate limiting helpers

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.store[identifier];

    if (!record || now > record.resetTime) {
      this.store[identifier] = {
        count: 1,
        resetTime: now + this.windowMs
      };
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const record = this.store[identifier];
    if (!record) return 0;
    return Math.max(0, record.resetTime - Date.now());
  }

  reset(identifier: string): void {
    delete this.store[identifier];
  }
}

// Rate limiters for different actions
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const formRateLimiter = new RateLimiter(10, 5 * 60 * 1000); // 10 attempts per 5 minutes

// Content Security Policy helpers
export const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // Vite needs unsafe-inline for dev
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "https:"],
  'font-src': ["'self'", "https:"],
  'connect-src': ["'self'", "https://gfgpkwbjigghtxnrmdha.supabase.co"],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
} as const;

export function generateCSPHeader(): string {
  return Object.entries(cspDirectives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

// Secure headers for production
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

// Log security events with enhanced monitoring
export function logSecurityEvent(event: string, details: Record<string, any> = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[SECURITY] ${event}:`, details);
  }
  
  // Send to monitoring service
  try {
    // Dynamic import to avoid circular dependencies
    import('@/lib/monitoring').then(({ reportSecurityIncident }) => {
      // Map events to incident types
      if (event.includes('rate_limit')) {
        reportSecurityIncident('rate_limit', { event, ...details });
      } else if (event.includes('suspicious') || event.includes('long_session')) {
        reportSecurityIncident('suspicious_activity', { event, ...details });
      } else if (event.includes('auth_failure')) {
        reportSecurityIncident('auth_failure', { event, ...details });
      }
    });
  } catch (error) {
    console.error('Failed to report security incident:', error);
  }
}

// Sanitize user content for safe display
export function sanitizeForDisplay(content: string): string {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}