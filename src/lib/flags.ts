// Feature flags for The Booksmith
// These control the availability of premium features and future integrations

export const flags = {
  // Subscription & Billing Features
  enablePremium: false,
  enableStripeIntegration: false,
  
  // Print-on-Demand Features
  enablePOD: false,
  enablePrintQuotes: false,
  
  // AI Features
  enableAdvancedAI: false,
  enableAICoach: false,
  
  // Export Features
  enableAdvancedExports: false,
  enablePublishingPartners: false,
  
  // Development & Testing
  enableDebugPanel: process.env.NODE_ENV === 'development',
  enableMockData: process.env.NODE_ENV === 'development',
} as const;

export type FeatureFlag = keyof typeof flags;

export function isEnabled(flag: FeatureFlag): boolean {
  return flags[flag];
}

// Helper functions for common feature checks
export const features = {
  isPremiumEnabled: () => isEnabled('enablePremium'),
  isPODEnabled: () => isEnabled('enablePOD'),
  isAdvancedAIEnabled: () => isEnabled('enableAdvancedAI'),
  isDebugMode: () => isEnabled('enableDebugPanel'),
};