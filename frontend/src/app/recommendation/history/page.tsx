"use client";

import { useEffect, useState } from "react";
import { Loader2, Shield, PlusCircle } from "lucide-react";
import { insuranceApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const response = await insuranceApi.getRecommendationHistory();
        setHistory(response.recommendations || []);
      } catch (err) {
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center sm:text-left">
            Recommendation History
          </h1>
          <button
            onClick={() => router.push("/recommendation")}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition w-full sm:w-auto"
          >
            <PlusCircle className="w-5 h-5" />
            New
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            No recommendations found.
          </div>
        ) : (
          <ul className="space-y-4">
            {history.map((item) => (
              <li key={item.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-primary-700">
                      {item.recommendation.coverageType}
                    </div>
                    <div className="text-sm text-gray-600">
                      Coverage: ${item.recommendation.recommendedCoverage}
                    </div>
                    <div className="text-sm text-gray-600">
                      Premium: ${item.recommendation.estimatedPremium}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {item.recommendation.reasoning}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
