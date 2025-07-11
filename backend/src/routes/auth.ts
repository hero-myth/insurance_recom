import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// POST /api/auth/register - Register new user
router.post("/register", AuthController.register);

// POST /api/auth/login - Login user
router.post("/login", AuthController.login);

// GET /api/auth/me - Get current user profile (protected)
router.get("/me", authenticateToken, AuthController.me);

export default router;
