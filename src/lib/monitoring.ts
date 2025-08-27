// Enhanced monitoring and analytics for security events

interface SecurityAlert {
  id: string;
  type: 'rate_limit' | 'suspicious_activity' | 'auth_failure' | 'xss_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  details: Record<string, any>;
}

class SecurityMonitor {
  private alerts: SecurityAlert[] = [];
  private readonly maxAlerts = 100;

  createAlert(type: SecurityAlert['type'], severity: SecurityAlert['severity'], details: Record<string, any>): void {
    const alert: SecurityAlert = {
      id: crypto.randomUUID(),
      type,
      severity,
      timestamp: Date.now(),
      details
    };

    this.alerts.unshift(alert);
    
    // Keep only recent alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts);
    }

    // Log critical alerts immediately
    if (severity === 'critical') {
      console.error('[SECURITY CRITICAL]', alert);
    }

    // In production, this would send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(alert);
    }
  }

  getRecentAlerts(hours: number = 24): SecurityAlert[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.alerts.filter(alert => alert.timestamp > cutoff);
  }

  getSeverityCount(severity: SecurityAlert['severity'], hours: number = 24): number {
    return this.getRecentAlerts(hours).filter(alert => alert.severity === severity).length;
  }

  private async sendToMonitoringService(alert: SecurityAlert): Promise<void> {
    // Placeholder for production monitoring integration
    // This could send to services like Sentry, LogRocket, etc.
    try {
      // Example: await fetch('/api/security-alerts', { method: 'POST', body: JSON.stringify(alert) });
      console.log('Would send to monitoring service:', alert);
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  // Generate security report
  generateReport(): {
    summary: Record<string, number>;
    recentAlerts: SecurityAlert[];
    recommendations: string[];
  } {
    const recent = this.getRecentAlerts();
    const summary = {
      total: recent.length,
      critical: this.getSeverityCount('critical'),
      high: this.getSeverityCount('high'),
      medium: this.getSeverityCount('medium'),
      low: this.getSeverityCount('low')
    };

    const recommendations: string[] = [];
    
    if (summary.critical > 0) {
      recommendations.push('Immediate action required: Critical security alerts detected');
    }
    
    if (summary.high > 5) {
      recommendations.push('Review authentication and access controls');
    }
    
    if (this.getRecentAlerts(1).length > 10) {
      recommendations.push('High alert frequency - consider implementing additional protections');
    }

    return {
      summary,
      recentAlerts: recent.slice(0, 10), // Most recent 10
      recommendations
    };
  }
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor();

// Helper functions
export function reportSecurityIncident(type: SecurityAlert['type'], details: Record<string, any> = {}) {
  const severityMap: Record<SecurityAlert['type'], SecurityAlert['severity']> = {
    rate_limit: 'medium',
    suspicious_activity: 'high',
    auth_failure: 'low',
    xss_attempt: 'critical'
  };

  securityMonitor.createAlert(type, severityMap[type], details);
}

export function getSecurityStatus() {
  return securityMonitor.generateReport();
}
