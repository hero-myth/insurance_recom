import Joi from "joi";
import { UserProfile } from "../types";

export const userProfileSchema = Joi.object({
  age: Joi.number().integer().min(18).max(100).required().messages({
    "number.base": "Age must be a number",
    "number.integer": "Age must be a whole number",
    "number.min": "Age must be at least 18",
    "number.max": "Age must be at most 100",
    "any.required": "Age is required",
  }),
  income: Joi.number().integer().min(10000).max(10000000).required().messages({
    "number.base": "Income must be a number",
    "number.integer": "Income must be a whole number",
    "number.min": "Income must be at least $10,000",
    "number.max": "Income must be at most $10,000,000",
    "any.required": "Income is required",
  }),
  dependents: Joi.number().integer().min(0).max(20).required().messages({
    "number.base": "Number of dependents must be a number",
    "number.integer": "Number of dependents must be a whole number",
    "number.min": "Number of dependents cannot be negative",
    "number.max": "Number of dependents cannot exceed 20",
    "any.required": "Number of dependents is required",
  }),
  riskTolerance: Joi.string()
    .valid("low", "medium", "high")
    .required()
    .messages({
      "string.base": "Risk tolerance must be a string",
      "any.only": "Risk tolerance must be low, medium, or high",
      "any.required": "Risk tolerance is required",
    }),
});

export function validateUserProfile(data: any): {
  error?: string;
  value?: UserProfile;
} {
  const { error, value } = userProfileSchema.validate(data);

  if (error) {
    return { error: error.details[0].message };
  }

  return { value };
}
