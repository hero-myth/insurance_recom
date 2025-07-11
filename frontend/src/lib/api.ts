import { UserProfile, InsuranceRecommendation } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  const result = await response.json();

  return result.data;
};

export const insuranceApi = {
  async getRecommendation(
    userProfile: UserProfile
  ): Promise<{ recommendation: InsuranceRecommendation }> {
    return makeAuthenticatedRequest("/api/recommendations", {
      method: "POST",
      body: JSON.stringify(userProfile),
    });
  },

  async getRecommendationHistory(): Promise<{
    recommendations: InsuranceRecommendation[];
  }> {
    return makeAuthenticatedRequest("/api/recommendations/history");
  },

  async saveRecommendation(
    recommendation: InsuranceRecommendation
  ): Promise<{ success: boolean }> {
    return makeAuthenticatedRequest("/api/recommendations/save", {
      method: "POST",
      body: JSON.stringify(recommendation),
    });
  },
};

export const authApi = {
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; data: { token: string; user: any } }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Login failed");
    }

    return result;
  },

  async register(userData: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; data: { token: string; user: any } }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Registration failed");
    }

    return result;
  },

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  },

  async validateToken(): Promise<{ valid: boolean; user?: any }> {
    const token = getAuthToken();

    if (!token) {
      return { valid: false };
    }

    try {
      const response = await makeAuthenticatedRequest("/api/auth/validate");
      return { valid: true, user: response.user };
    } catch (error) {
      return { valid: false };
    }
  },
};
