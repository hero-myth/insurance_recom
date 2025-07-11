import express from "express";
import dotenv from "dotenv";
import {
  corsOptions,
  rateLimitConfig,
  recommendationRateLimit,
  helmetConfig,
} from "./middleware/security";
import { requestLogger } from "./utils/logger";
import recommendationRoutes from "./routes/recommendation";
import authRoutes from "./routes/auth";
import pool from "./database/connection";
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Run database migration on startup
async function runMigrations() {
  try {
    console.log("Running database migrations...");

    const createUserSubmissionsTable = `
      CREATE TABLE IF NOT EXISTS user_submissions (
        id SERIAL PRIMARY KEY,
        age INTEGER NOT NULL,
        income INTEGER NOT NULL,
        dependents INTEGER NOT NULL,
        risk_tolerance VARCHAR(10) NOT NULL CHECK (risk_tolerance IN ('low', 'medium', 'high')),
        recommendation_type VARCHAR(50) NOT NULL,
        coverage_amount VARCHAR(20) NOT NULL,
        duration INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP
      );
    `;

    const createLogsTable = `
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        level VARCHAR(10) NOT NULL CHECK (level IN ('info', 'warn', 'error')),
        message TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        ip_address INET,
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      );
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_user_submissions_created_at ON user_submissions(created_at);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
      CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
    `;

    const migrateUserSubmissionsTable = `
      DO $$ 
      BEGIN
        -- Add user_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_submissions' AND column_name = 'user_id') THEN
          ALTER TABLE user_submissions ADD COLUMN user_id INTEGER REFERENCES users(id);
        END IF;
        
        -- Add estimated_premium column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_submissions' AND column_name = 'estimated_premium') THEN
          ALTER TABLE user_submissions ADD COLUMN estimated_premium INTEGER NOT NULL DEFAULT 0;
        END IF;
        
        -- Add risk_level column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_submissions' AND column_name = 'risk_level') THEN
          ALTER TABLE user_submissions ADD COLUMN risk_level VARCHAR(10) NOT NULL DEFAULT 'Medium' CHECK (risk_level IN ('Low', 'Medium', 'High'));
        END IF;
        
        -- Change coverage_amount to INTEGER if it's currently VARCHAR
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_submissions' AND column_name = 'coverage_amount' AND data_type = 'character varying') THEN
          ALTER TABLE user_submissions ALTER COLUMN coverage_amount TYPE INTEGER USING REPLACE(coverage_amount, '$', '')::INTEGER;
        END IF;
      END $$;
    `;

    await pool.query(createUserSubmissionsTable);
    console.log("✓ Created user_submissions table");

    await pool.query(createUsersTable);
    console.log("✓ Created users table");

    await pool.query(createLogsTable);
    console.log("✓ Created logs table");

    await pool.query(createIndexes);
    console.log("✓ Created indexes");

    await pool.query(migrateUserSubmissionsTable);
    console.log("✓ Updated user_submissions table");

    console.log("Database migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    // Don't exit in production, just log the error
    if (process.env.NODE_ENV === "development") {
      process.exit(1);
    }
  }
}

// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(rateLimitConfig);

// Request logging middleware
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Insurance Recommendation API is running",
    timestamp: new Date().toISOString(),
  });
});

// Apply specific rate limiting to recommendation endpoint
app.use("/api/recommendations", recommendationRateLimit);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/recommendations", recommendationRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);

    res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    });
  }
);

// Start server with migrations
async function startServer() {
  // Run migrations first
  await runMigrations();

  // Start the server
  app.listen(PORT, () => {
    console.log(`Insurance Recommendation API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API base URL: http://localhost:${PORT}/api`);
    console.log(`Auth endpoints: http://localhost:${PORT}/api/auth`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await pool.end();
  process.exit(0);
});
