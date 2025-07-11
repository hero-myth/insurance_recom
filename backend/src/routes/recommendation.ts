import { Router } from "express";
import { RecommendationController } from "../controllers/recommendationController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// POST /api/recommendations - Get insurance recommendation (requires auth)
router.post(
  "/recommendations",
  authenticateToken,
  RecommendationController.getRecommendation
);

// GET /api/recommendations/history - Get user's recommendation history (requires auth)
router.get(
  "/recommendations/history",
  authenticateToken,
  RecommendationController.getUserHistory
);

// POST /api/recommendations/save - Save a recommendation (requires auth)
router.post(
  "/recommendations/save",
  authenticateToken,
  RecommendationController.saveRecommendation
);

// GET /api/submissions - Get all submissions (for admin/analytics) - requires auth
router.get(
  "/submissions",
  authenticateToken,
  RecommendationController.getSubmissions
);

// GET /api/stats - Get submission statistics - requires auth
router.get("/stats", authenticateToken, RecommendationController.getStats);

export default router;
