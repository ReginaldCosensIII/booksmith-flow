import { ReactNode } from 'react';
import { useCSP } from '@/hooks/useCSP';

interface SecurityProviderProps {
  children: ReactNode;
}

/**
 * Security provider that initializes CSP and security monitoring
 */
export function SecurityProvider({ children }: SecurityProviderProps) {
  useCSP();
  
  return <>{children}</>;
}