import { useEffect, useRef } from 'react';
import { logSecurityEvent } from '@/lib/security';

interface SecurityMetrics {
  failedAttempts: number;
  lastFailure: number | null;
  suspiciousActivity: boolean;
}

export function useSecurityMonitoring() {
  const metrics = useRef<SecurityMetrics>({
    failedAttempts: 0,
    lastFailure: null,
    suspiciousActivity: false
  });

  const logAuthFailure = (reason: string, email?: string) => {
    metrics.current.failedAttempts++;
    metrics.current.lastFailure = Date.now();
    
    // Check for suspicious patterns
    if (metrics.current.failedAttempts > 3) {
      metrics.current.suspiciousActivity = true;
      logSecurityEvent('suspicious_auth_activity', {
        attempts: metrics.current.failedAttempts,
        timeframe: '5min',
        email: email?.replace(/(.{2}).*(@.*)/, '$1***$2') // Mask email for privacy
      });
    }

    logSecurityEvent('auth_failure', {
      reason,
      attemptCount: metrics.current.failedAttempts,
      timestamp: Date.now()
    });
  };

  const logAuthSuccess = (method: 'login' | 'register', email?: string) => {
    // Reset failure metrics on successful auth
    metrics.current.failedAttempts = 0;
    metrics.current.lastFailure = null;
    metrics.current.suspiciousActivity = false;

    logSecurityEvent('auth_success', {
      method,
      timestamp: Date.now(),
      email: email?.replace(/(.{2}).*(@.*)/, '$1***$2')
    });
  };

  const logSuspiciousActivity = (activity: string, details: Record<string, any> = {}) => {
    logSecurityEvent('suspicious_activity', {
      activity,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      ...details
    });
  };

  // Monitor for potential session hijacking
  useEffect(() => {
    const checkSessionIntegrity = () => {
      const sessionStart = sessionStorage.getItem('session_start');
      if (!sessionStart) {
        sessionStorage.setItem('session_start', Date.now().toString());
      } else {
        const elapsed = Date.now() - parseInt(sessionStart);
        // Log if session is unusually long (24+ hours)
        if (elapsed > 24 * 60 * 60 * 1000) {
          logSuspiciousActivity('long_session', { duration: elapsed });
        }
      }
    };

    checkSessionIntegrity();
    const interval = setInterval(checkSessionIntegrity, 30 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    logAuthFailure,
    logAuthSuccess,
    logSuspiciousActivity,
    metrics: metrics.current
  };
}