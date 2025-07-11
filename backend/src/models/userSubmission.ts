import pool from "../database/connection";
import { UserSubmission } from "../types";

export class UserSubmissionModel {
  static async create(
    submission: Omit<UserSubmission, "id" | "createdAt">
  ): Promise<UserSubmission> {
    const query = `
      INSERT INTO user_submissions 
      (user_id, age, income, dependents, risk_tolerance, recommendation_type, coverage_amount, estimated_premium, risk_level, duration)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, user_id, age, income, dependents, risk_tolerance, recommendation_type, coverage_amount, estimated_premium, risk_level, duration, created_at
    `;

    const values = [
      submission.userId || null,
      submission.age,
      submission.income,
      submission.dependents,
      submission.riskTolerance,
      submission.recommendationType,
      submission.coverageAmount,
      submission.estimatedPremium || 0,
      submission.riskLevel || "Medium",
      submission.duration || null,
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    return {
      id: row.id,
      userId: row.user_id,
      age: row.age,
      income: row.income,
      dependents: row.dependents,
      riskTolerance: row.risk_tolerance,
      recommendationType: row.recommendation_type,
      coverageAmount: row.coverage_amount,
      estimatedPremium: row.estimated_premium,
      riskLevel: row.risk_level,
      duration: row.duration,
      createdAt: row.created_at,
    };
  }

  static async findByUserId(userId: number): Promise<UserSubmission[]> {
    const query = `
      SELECT id, user_id, age, income, dependents, risk_tolerance, recommendation_type, coverage_amount, estimated_premium, risk_level, duration, created_at
      FROM user_submissions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    return result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      age: row.age,
      income: row.income,
      dependents: row.dependents,
      riskTolerance: row.risk_tolerance,
      recommendationType: row.recommendation_type,
      coverageAmount: row.coverage_amount,
      estimatedPremium: row.estimated_premium,
      riskLevel: row.risk_level,
      duration: row.duration,
      createdAt: row.created_at,
    }));
  }

  static async findAll(
    limit: number = 100,
    offset: number = 0
  ): Promise<UserSubmission[]> {
    const query = `
      SELECT id, user_id, age, income, dependents, risk_tolerance, recommendation_type, coverage_amount, estimated_premium, risk_level, duration, created_at
      FROM user_submissions
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);

    return result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      age: row.age,
      income: row.income,
      dependents: row.dependents,
      riskTolerance: row.risk_tolerance,
      recommendationType: row.recommendation_type,
      coverageAmount: row.coverage_amount,
      estimatedPremium: row.estimated_premium,
      riskLevel: row.risk_level,
      duration: row.duration,
      createdAt: row.created_at,
    }));
  }

  static async findById(id: number): Promise<UserSubmission | null> {
    const query = `
      SELECT id, user_id, age, income, dependents, risk_tolerance, recommendation_type, coverage_amount, estimated_premium, risk_level, duration, created_at
      FROM user_submissions
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      age: row.age,
      income: row.income,
      dependents: row.dependents,
      riskTolerance: row.risk_tolerance,
      recommendationType: row.recommendation_type,
      coverageAmount: row.coverage_amount,
      estimatedPremium: row.estimated_premium,
      riskLevel: row.risk_level,
      duration: row.duration,
      createdAt: row.created_at,
    };
  }

  static async getStats(): Promise<{
    totalSubmissions: number;
    averageAge: number;
    averageIncome: number;
    averageDependents: number;
    riskToleranceDistribution: { [key: string]: number };
  }> {
    const totalQuery = "SELECT COUNT(*) as total FROM user_submissions";
    const avgQuery =
      "SELECT AVG(age) as avg_age, AVG(income) as avg_income, AVG(dependents) as avg_dependents FROM user_submissions";
    const distributionQuery = `
      SELECT risk_tolerance, COUNT(*) as count 
      FROM user_submissions 
      GROUP BY risk_tolerance
    `;

    const [totalResult, avgResult, distributionResult] = await Promise.all([
      pool.query(totalQuery),
      pool.query(avgQuery),
      pool.query(distributionQuery),
    ]);

    const riskToleranceDistribution: { [key: string]: number } = {};
    distributionResult.rows.forEach((row) => {
      riskToleranceDistribution[row.risk_tolerance] = parseInt(row.count);
    });

    return {
      totalSubmissions: parseInt(totalResult.rows[0].total),
      averageAge: parseFloat(avgResult.rows[0].avg_age) || 0,
      averageIncome: parseFloat(avgResult.rows[0].avg_income) || 0,
      averageDependents: parseFloat(avgResult.rows[0].avg_dependents) || 0,
      riskToleranceDistribution,
    };
  }
}
