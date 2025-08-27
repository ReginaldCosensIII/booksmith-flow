import { useEffect } from 'react';
import { applySecurityHeaders } from '@/lib/csp';

/**
 * Hook to apply Content Security Policy and security headers
 * In development, this logs the headers that would be applied in production
 */
export function useCSP() {
  useEffect(() => {
    // Apply security headers (in development, this just logs them)
    applySecurityHeaders();

    // Add nonce-based CSP if needed for inline scripts
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!metaCSP && process.env.NODE_ENV === 'production') {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = document.querySelector('[data-csp-content]')?.getAttribute('data-csp-content') || '';
      document.head.appendChild(meta);
    }

    // Monitor for potential XSS attempts
    const originalAppendChild = Element.prototype.appendChild;
    Element.prototype.appendChild = function<T extends Node>(newChild: T): T {
      // Log suspicious script injections
      if (newChild.nodeName === 'SCRIPT' && newChild instanceof HTMLScriptElement && !newChild.src) {
        console.warn('[CSP] Inline script detected:', newChild);
      }
      return originalAppendChild.call(this, newChild);
    };

    return () => {
      // Restore original appendChild
      Element.prototype.appendChild = originalAppendChild;
    };
  }, []);
}