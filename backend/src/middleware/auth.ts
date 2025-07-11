import { Request, Response, NextFunction } from "express";
import { AuthUtils } from "../utils/auth";
import { UserModel } from "../models/user";
import { logSecurity } from "../utils/logger";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: "Access token required",
      });
      return;
    }

    // Verify token
    const decoded = AuthUtils.verifyToken(token);
    if (!decoded) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
      return;
    }

    // Get user from database
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      logSecurity("Token for non-existent user", { userId: decoded.id });
      res.status(401).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    logSecurity("Authentication middleware error", error);
    res.status(401).json({
      success: false,
      error: "Authentication failed",
    });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = AuthUtils.verifyToken(token);
      if (decoded) {
        const user = await UserModel.findById(decoded.id);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
          };
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail the request for optional auth
    next();
  }
};
