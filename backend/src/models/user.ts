import pool from "../database/connection";
import { User } from "../types";

export class UserModel {
  static async create(email: string, passwordHash: string): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, password_hash, created_at, last_login_at
    `;

    const result = await pool.query(query, [email, passwordHash]);
    const row = result.rows[0];

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
    };
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, created_at, last_login_at
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
    };
  }

  static async findById(id: number): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, created_at, last_login_at
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
    };
  }

  static async updateLastLogin(id: number): Promise<void> {
    const query = `
      UPDATE users
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await pool.query(query, [id]);
  }

  static async emailExists(email: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    return parseInt(result.rows[0].count) > 0;
  }
}
