// Core data models for The Booksmith

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  genre?: string;
  template?: string;
  goalWords?: number;
  status: 'active' | 'finished' | 'archived';
  coverImageUrl?: string;
  synopsis?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  projectId: string;
  index: number;
  title: string;
  content: string;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  role?: string;
  appearance?: string;
  goals?: string;
  backstory?: string;
  relationships?: string;
  notes?: string;
  createdAt: Date;
}

export interface WorldNote {
  id: string;
  projectId: string;
  type: 'location' | 'rule' | 'timeline' | 'other';
  title: string;
  body: string;
  createdAt: Date;
}

export interface Asset {
  id: string;
  projectId: string;
  type: 'cover' | 'illustration';
  url: string;
  prompt?: string;
  createdAt: Date;
}

// Billing & Subscription Models (Future Implementation)
export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'premium';
  provider: 'stripe';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrintCredit {
  id: string;
  userId: string;
  issuedAt: Date;
  expiresAt: Date;
  status: 'available' | 'redeemed' | 'expired';
  redeemedOrderId?: string;
  createdAt: Date;
}

export interface PrintOrder {
  id: string;
  userId: string;
  projectId: string;
  spec: PrintSpec;
  quote: PrintQuote;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  providerOrderId?: string;
  trackingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrintSpec {
  trimSize: '5x8' | '6x9' | 'A5';
  pageCount: number;
  colorInterior: boolean;
  paperType: 'standard' | 'premium';
  coverFinish: 'matte' | 'gloss';
  binding: 'paperback' | 'hardcover';
}

export interface PrintQuote {
  printCost: number;
  shippingCost: number;
  totalCost: number;
  currency: string;
  estimatedDelivery: string;
}