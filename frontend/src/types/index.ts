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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: number;
      email: string;
      createdAt: string;
    };
  };
  error?: string;
}

export interface RecommendationHistory {
  id: number;
  userId: number;
  recommendation: InsuranceRecommendation;
  createdAt: string;
}

// Legacy types for backward compatibility
export interface RecommendationResponse {
  recommendation: InsuranceRecommendation;
}

export interface User {
  id: number;
  email: string;
  createdAt: string;
}
