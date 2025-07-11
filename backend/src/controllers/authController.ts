import { Request, Response } from "express";
import { AuthUtils } from "../utils/auth";
import { UserModel } from "../models/user";
import {
  AuthRequest,
  RegisterRequest,
  ApiResponse,
  AuthResponse,
} from "../types";
import { logInfo, logError, logSecurity } from "../utils/logger";

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, confirmPassword }: RegisterRequest = req.body;

      // Validate input
      if (!email || !password || !confirmPassword) {
        res.status(400).json({
          success: false,
          error: "Email, password, and confirm password are required",
        } as ApiResponse<null>);
        return;
      }

      if (password !== confirmPassword) {
        res.status(400).json({
          success: false,
          error: "Passwords do not match",
        } as ApiResponse<null>);
        return;
      }

      // Validate email format
      if (!AuthUtils.isValidEmail(email)) {
        res.status(400).json({
          success: false,
          error: "Invalid email format",
        } as ApiResponse<null>);
        return;
      }

      // Validate password strength
      const passwordValidation = AuthUtils.validatePassword(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: "Password validation failed",
          details: passwordValidation.errors,
        } as ApiResponse<null>);
        return;
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: "User with this email already exists",
        } as ApiResponse<null>);
        return;
      }

      // Hash password and create user
      const passwordHash = await AuthUtils.hashPassword(password);
      const user = await UserModel.create(email, passwordHash);

      // Generate token
      const token = AuthUtils.generateToken({ id: user.id, email: user.email });

      const response: AuthResponse = {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      };

      logInfo("User registered successfully", {
        userId: user.id,
        email: user.email,
      });

      res.status(201).json({
        success: true,
        data: response,
      } as ApiResponse<AuthResponse>);
    } catch (error) {
      logError("Registration failed", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>);
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: AuthRequest = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: "Email and password are required",
        } as ApiResponse<null>);
        return;
      }

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        logSecurity("Login attempt with non-existent email", { email });
        res.status(401).json({
          success: false,
          error: "Invalid email or password",
        } as ApiResponse<null>);
        return;
      }

      // Verify password
      const isValidPassword = await AuthUtils.comparePassword(
        password,
        user.passwordHash
      );
      if (!isValidPassword) {
        logSecurity("Login attempt with wrong password", {
          email,
          userId: user.id,
        });
        res.status(401).json({
          success: false,
          error: "Invalid email or password",
        } as ApiResponse<null>);
        return;
      }

      // Update last login
      await UserModel.updateLastLogin(user.id);

      // Generate token
      const token = AuthUtils.generateToken({ id: user.id, email: user.email });

      const response: AuthResponse = {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      };

      logInfo("User logged in successfully", {
        userId: user.id,
        email: user.email,
      });

      res.status(200).json({
        success: true,
        data: response,
      } as ApiResponse<AuthResponse>);
    } catch (error) {
      logError("Login failed", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>);
    }
  }

  static async me(req: Request, res: Response): Promise<void> {
    try {
      // User is already attached to req by auth middleware
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: "Not authenticated",
        } as ApiResponse<null>);
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
        },
      } as ApiResponse<any>);
    } catch (error) {
      logError("Get user profile failed", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>);
    }
  }
}
