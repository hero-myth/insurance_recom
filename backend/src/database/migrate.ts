import pool from "./connection";

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
  );
`;

const createUserSubmissionsTable = `
  CREATE TABLE IF NOT EXISTS user_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    age INTEGER NOT NULL,
    income INTEGER NOT NULL,
    dependents INTEGER NOT NULL,
    risk_tolerance VARCHAR(10) NOT NULL CHECK (risk_tolerance IN ('low', 'medium', 'high')),
    recommendation_type VARCHAR(50) NOT NULL,
    coverage_amount INTEGER NOT NULL,
    estimated_premium INTEGER NOT NULL DEFAULT 0,
    risk_level VARCHAR(10) NOT NULL DEFAULT 'Medium' CHECK (risk_level IN ('Low', 'Medium', 'High')),
    duration VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  CREATE INDEX IF NOT EXISTS idx_user_submissions_user_id ON user_submissions(user_id);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
  CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
  CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
`;

// Migration to add new columns to existing user_submissions table
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

async function runMigrations() {
  try {
    console.log("Running database migrations...");

    // Create tables
    await pool.query(createUsersTable);
    console.log("✓ Created users table");

    await pool.query(createUserSubmissionsTable);
    console.log("✓ Created user_submissions table");

    await pool.query(createLogsTable);
    console.log("✓ Created logs table");

    // Run migration for existing tables
    await pool.query(migrateUserSubmissionsTable);
    console.log("✓ Migrated user_submissions table");

    // Create indexes
    await pool.query(createIndexes);
    console.log("✓ Created indexes");

    console.log("Database migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
