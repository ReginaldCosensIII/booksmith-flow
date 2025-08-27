// Validation utilities for enhanced security

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // Character variety checks
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Common password patterns check
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters (3+ times)
    /123456|password|qwerty|abc123/i, // Common sequences
    /keyboard|admin|login|welcome/i, // Common words
  ];

  commonPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      errors.push('Password contains common patterns that are easily guessed');
      score = Math.max(0, score - 2);
    }
  });

  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    isValid: errors.length === 0 && score >= 3,
    errors,
    strength
  };
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }
  
  return { isValid: true };
}

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters for XSS prevention
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

export function validateDisplayName(name: string): { isValid: boolean; error?: string } {
  const sanitized = sanitizeInput(name);
  
  if (!sanitized) {
    return { isValid: false, error: 'Display name is required' };
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, error: 'Display name must be at least 2 characters long' };
  }
  
  if (sanitized.length > 50) {
    return { isValid: false, error: 'Display name must be less than 50 characters' };
  }
  
  // Only allow letters, numbers, spaces, and basic punctuation
  if (!/^[a-zA-Z0-9\s\-_.]+$/.test(sanitized)) {
    return { isValid: false, error: 'Display name can only contain letters, numbers, spaces, hyphens, underscores, and periods' };
  }
  
  return { isValid: true };
}