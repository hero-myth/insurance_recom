'use client';

import { InsuranceRecommendation } from '@/types';
import { Shield, DollarSign, TrendingUp, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface RecommendationCardProps {
    recommendation: InsuranceRecommendation;
    onReset: () => void;
}

export default function RecommendationCard({ recommendation, onReset }: RecommendationCardProps) {
    const getRiskColor = (risk: string) => {
        switch (risk.toLowerCase()) {
            case 'low':
                return 'text-green-600 bg-green-100';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            case 'high':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getCoverageTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'term':
                return 'text-blue-600 bg-blue-100';
            case 'whole':
                return 'text-purple-600 bg-purple-100';
            case 'universal':
                return 'text-indigo-600 bg-indigo-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-primary-600" />
                        Recommended Coverage
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCoverageTypeColor(recommendation.coverageType)}`}>
                        {recommendation.coverageType} Life
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                            ${recommendation.recommendedCoverage.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Coverage Amount</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                            ${recommendation.estimatedPremium.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Monthly Premium</p>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Recommendation Details</h4>

                {/* Coverage Type */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Shield className="w-5 h-5 mr-3 text-primary-600" />
                            <div>
                                <p className="font-medium text-gray-900">Coverage Type</p>
                                <p className="text-sm text-gray-600">{recommendation.coverageType} Life Insurance</p>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCoverageTypeColor(recommendation.coverageType)}`}>
                            {recommendation.coverageType}
                        </span>
                    </div>
                </div>

                {/* Risk Level */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <TrendingUp className="w-5 h-5 mr-3 text-primary-600" />
                            <div>
                                <p className="font-medium text-gray-900">Risk Level</p>
                                <p className="text-sm text-gray-600">Based on your risk tolerance</p>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(recommendation.riskLevel)}`}>
                            {recommendation.riskLevel}
                        </span>
                    </div>
                </div>

                {/* Coverage Amount */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <DollarSign className="w-5 h-5 mr-3 text-primary-600" />
                            <div>
                                <p className="font-medium text-gray-900">Coverage Amount</p>
                                <p className="text-sm text-gray-600">Recommended coverage based on your profile</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-gray-900">
                                ${recommendation.recommendedCoverage.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Monthly Premium */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <DollarSign className="w-5 h-5 mr-3 text-primary-600" />
                            <div>
                                <p className="font-medium text-gray-900">Estimated Monthly Premium</p>
                                <p className="text-sm text-gray-600">Based on current market rates</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-gray-900">
                                ${recommendation.estimatedPremium.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reasoning */}
            {recommendation.reasoning && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <Info className="w-5 h-5 mr-3 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-blue-900 mb-2">Why This Recommendation?</h4>
                            <p className="text-sm text-blue-800">{recommendation.reasoning}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Next Steps */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-green-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-green-900 mb-2">Next Steps</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                            <li>• Contact a licensed insurance agent</li>
                            <li>• Compare quotes from multiple providers</li>
                            <li>• Review policy terms and conditions</li>
                            <li>• Consider additional riders if needed</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 mr-3 text-yellow-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-yellow-900 mb-2">Important Disclaimer</h4>
                        <p className="text-sm text-yellow-800">
                            This is a recommendation based on the information provided. Actual premiums and coverage may vary.
                            Please consult with a licensed insurance professional for personalized advice.
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
                <button
                    onClick={onReset}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Get New Recommendation
                </button>
            </div>
        </div>
    );
} 