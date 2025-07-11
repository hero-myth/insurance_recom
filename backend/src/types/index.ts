export interface UserProfile {
  age: number;
  income: number;
  dependents: number;
  riskTolerance: "low" | "medium" | "high";
}

export interface InsuranceRecommendation {
  coverageType: "Term" | "Whole" | "Universal";
  recommendedCoverage: number;
  estimatedPremium: number;
  riskLevel: "Low" | "Medium" | "High";
  reasoning?: string;
  policyDuration?: number;
  additionalFeatures?: string[];
}

export interface RecommendationResponse {
  recommendation: InsuranceRecommendation;
}

export interface UserSubmission extends UserProfile {
  id?: number;
  userId?: number;
  recommendationType: string;
  coverageAmount: number;
  estimatedPremium?: number;
  riskLevel?: string;
  duration?: number;
  createdAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Authentication types
export interface User {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
  };
}

export interface RegisterRequest extends AuthRequest {
  confirmPassword: string;
}

// Logging types
export interface LogEntry {
  id: number;
  level: "info" | "warn" | "error";
  message: string;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
