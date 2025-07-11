import { Request, Response } from "express";
import { validateUserProfile } from "../utils/validation";
import { generateRecommendation } from "../utils/recommendationEngine";
import { UserSubmissionModel } from "../models/userSubmission";
import { UserProfile, InsuranceRecommendation, ApiResponse } from "../types";

// Extend Request to include user from auth middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export class RecommendationController {
  static async getRecommendation(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      // Validate input
      const validation = validateUserProfile(req.body);
      if (validation.error) {
        res.status(400).json({
          success: false,
          error: validation.error,
        } as ApiResponse<null>);
        return;
      }

      const userProfile: UserProfile = validation.value!;

      // Generate recommendation
      const recommendation = generateRecommendation(userProfile);

      // Save to database with user ID
      if (req.user) {
        await UserSubmissionModel.create({
          userId: req.user.id,
          ...userProfile,
          recommendationType: recommendation.coverageType,
          coverageAmount: recommendation.recommendedCoverage,
          estimatedPremium: recommendation.estimatedPremium,
          riskLevel: recommendation.riskLevel,
          duration: recommendation.policyDuration,
        });
      }

      // Return response
      res.status(200).json({
        success: true,
        data: {
          recommendation,
        },
      } as ApiResponse<{ recommendation: InsuranceRecommendation }>);
    } catch (error) {
      console.error("Error generating recommendation:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>);
    }
  }

  static async getUserHistory(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        } as ApiResponse<null>);
        return;
      }

      const submissions = await UserSubmissionModel.findByUserId(req.user.id);

      // Convert to recommendation format
      const recommendations = submissions.map((submission) => ({
        id: submission.id,
        userId: submission.userId,
        recommendation: {
          coverageType: submission.recommendationType,
          recommendedCoverage: submission.coverageAmount,
          estimatedPremium: submission.estimatedPremium,
          riskLevel: submission.riskLevel,
          reasoning: `Based on age: ${submission.age}, income: $${submission.income}, dependents: ${submission.dependents}, risk tolerance: ${submission.riskTolerance}`,
        },
        createdAt: submission.createdAt,
      }));

      res.status(200).json({
        success: true,
        data: {
          recommendations,
        },
      } as ApiResponse<{ recommendations: any[] }>);
    } catch (error) {
      console.error("Error fetching user history:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>);
    }
  }

  static async saveRecommendation(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        } as ApiResponse<null>);
        return;
      }

      const { recommendation } = req.body;

      // Save recommendation to database
      await UserSubmissionModel.create({
        userId: req.user.id,
        age: 0, // These would be filled from the original user profile
        income: 0,
        dependents: 0,
        riskTolerance: "medium",
        recommendationType: recommendation.coverageType,
        coverageAmount: recommendation.recommendedCoverage,
        estimatedPremium: recommendation.estimatedPremium,
        riskLevel: recommendation.riskLevel,
      });

      res.status(200).json({
        success: true,
        data: {
          message: "Recommendation saved successfully",
        },
      } as ApiResponse<{ message: string }>);
    } catch (error) {
      console.error("Error saving recommendation:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>);
    }
  }

  static async getSubmissions(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const submissions = await UserSubmissionModel.findAll(limit, offset);

      res.status(200).json({
        success: true,
        data: submissions,
      } as ApiResponse<any>);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>);
    }
  }

  static async getStats(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const stats = await UserSubmissionModel.getStats();

      res.status(200).json({
        success: true,
        data: stats,
      } as ApiResponse<any>);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>);
    }
  }
}
