"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Shield,
  DollarSign,
  Users,
  TrendingUp,
  Loader2,
  LogOut,
  User,
  History,
} from "lucide-react";
import { UserProfile, InsuranceRecommendation } from "@/types";
import { insuranceApi } from "@/lib/api";
import RecommendationCard from "@/components/RecommendationCard";

export default function RecommendationPage() {
  const [recommendation, setRecommendation] =
    useState<InsuranceRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserProfile>();

  // Check authentication on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/auth");
        return;
      }

      // Validate token and get user info
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp < currentTime) {
          // Token expired
          localStorage.removeItem("authToken");
          router.push("/auth");
          return;
        }

        setAuthToken(token);
        setUser({ id: payload.id, email: payload.email });
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("authToken");
        router.push("/auth");
        return;
      }
    }
    setIsLoadingAuth(false);
  }, [router]);

  const onSubmit = async (data: UserProfile) => {
    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const response = await insuranceApi.getRecommendation(data);
      setRecommendation(response.recommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setRecommendation(null);
    setError(null);
  };

  const handleLogout = () => {
    console.log("Click");
    localStorage.removeItem("authToken");
    setAuthToken(null);
    setUser(null);
    router.push("/auth");
  };

  // Show loading while checking authentication
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with Auth */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Life Insurance Recommendation
            </h1>
            <p className="text-lg text-gray-600">
              Get a personalized life insurance recommendation based on your
              profile
            </p>
          </div>
          {/* Auth Section */}
          <div className="flex justify-center sm:justify-end">
            <div className="relative">
              <button
                ref={avatarRef}
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 hover:bg-primary-200 border border-primary-200 focus:outline-none"
                aria-label="User menu"
              >
                <User className="w-6 h-6 text-primary-600" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 py-2 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-500">Signed in</p>
                  </div>
                  <button
                    onClick={() => {
                      router.push("/recommendation/history");
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    <History className="w-4 h-4 mr-2" />
                    History
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-primary-600" />
              Your Profile
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Age Field */}
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Age
                </label>
                <input
                  {...register("age", {
                    required: "Age is required",
                    min: { value: 18, message: "Age must be at least 18" },
                    max: { value: 100, message: "Age must be at most 100" },
                  })}
                  type="number"
                  id="age"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.age ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your age"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.age.message}
                  </p>
                )}
              </div>

              {/* Income Field */}
              <div>
                <label
                  htmlFor="income"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Annual Income
                </label>
                <input
                  {...register("income", {
                    required: "Income is required",
                    min: {
                      value: 10000,
                      message: "Income must be at least $10,000",
                    },
                    max: {
                      value: 10000000,
                      message: "Income must be at most $10,000,000",
                    },
                  })}
                  type="number"
                  id="income"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.income ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your annual income"
                />
                {errors.income && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.income.message}
                  </p>
                )}
              </div>

              {/* Dependents Field */}
              <div>
                <label
                  htmlFor="dependents"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Number of Dependents
                </label>
                <input
                  {...register("dependents", {
                    required: "Number of dependents is required",
                    min: {
                      value: 0,
                      message: "Number of dependents cannot be negative",
                    },
                    max: {
                      value: 20,
                      message: "Number of dependents cannot exceed 20",
                    },
                  })}
                  type="number"
                  id="dependents"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.dependents ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter number of dependents"
                />
                {errors.dependents && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.dependents.message}
                  </p>
                )}
              </div>

              {/* Risk Tolerance Field */}
              <div>
                <label
                  htmlFor="riskTolerance"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Risk Tolerance
                </label>
                <select
                  {...register("riskTolerance", {
                    required: "Risk tolerance is required",
                  })}
                  id="riskTolerance"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.riskTolerance ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select risk tolerance</option>
                  <option value="low">Low - Conservative approach</option>
                  <option value="medium">Medium - Balanced approach</option>
                  <option value="high">High - Aggressive approach</option>
                </select>
                {errors.riskTolerance && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.riskTolerance.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Getting Recommendation...
                  </>
                ) : (
                  "Get Recommendation"
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Recommendation Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-success-600" />
              Your Recommendation
            </h2>

            {recommendation ? (
              <RecommendationCard
                recommendation={recommendation}
                onReset={handleReset}
              />
            ) : (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  Fill out the form to get your personalized life insurance
                  recommendation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
