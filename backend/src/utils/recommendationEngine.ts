import { UserProfile, InsuranceRecommendation } from "../types";

export function generateRecommendation(
  profile: UserProfile
): InsuranceRecommendation {
  const { age, income, dependents, riskTolerance } = profile;

  // Calculate base coverage amount (typically 10x annual income)
  const baseCoverage = income * 10;

  // Adjust coverage based on dependents
  const dependentMultiplier = 1 + dependents * 0.2;
  let coverageAmount = Math.round(baseCoverage * dependentMultiplier);

  // Round to nearest $50,000
  coverageAmount = Math.round(coverageAmount / 50000) * 50000;

  // Ensure minimum coverage of $100,000
  coverageAmount = Math.max(coverageAmount, 100000);

  // Determine insurance type and duration based on age and risk tolerance
  let coverageType: "Term" | "Whole" | "Universal";
  let policyDuration: number;
  let reasoning: string;
  let riskLevel: "Low" | "Medium" | "High";

  if (age < 40) {
    if (riskTolerance === "low") {
      coverageType = "Term";
      policyDuration = 30;
      reasoning = `Based on your young age and low risk tolerance, we recommend a 30-year term life policy. This provides long-term protection at an affordable rate while you build wealth and your family grows.`;
      riskLevel = "Low";
    } else if (riskTolerance === "medium") {
      coverageType = "Term";
      policyDuration = 25;
      reasoning = `With your moderate risk tolerance and young age, a 25-year term life policy offers excellent value. This covers your peak earning years and major financial obligations.`;
      riskLevel = "Medium";
    } else {
      coverageType = "Term";
      policyDuration = 20;
      reasoning = `Given your high risk tolerance and young age, a 20-year term life policy provides essential protection while allowing you to invest more aggressively elsewhere.`;
      riskLevel = "High";
    }
  } else if (age < 55) {
    if (riskTolerance === "low") {
      coverageType = "Term";
      policyDuration = 20;
      reasoning = `At your age with low risk tolerance, a 20-year term life policy provides solid protection through your remaining working years and major financial commitments.`;
      riskLevel = "Low";
    } else if (riskTolerance === "medium") {
      coverageType = "Term";
      policyDuration = 15;
      reasoning = `With moderate risk tolerance, a 15-year term life policy covers your remaining high-earning years and major financial obligations.`;
      riskLevel = "Medium";
    } else {
      coverageType = "Term";
      policyDuration = 10;
      reasoning = `Your high risk tolerance suggests a 10-year term life policy, providing essential coverage while allowing for more aggressive investment strategies.`;
      riskLevel = "High";
    }
  } else {
    if (riskTolerance === "low") {
      coverageType = "Whole";
      policyDuration = 0; // Lifetime
      reasoning = `At your age with low risk tolerance, a whole life policy provides permanent protection and builds cash value, though at a higher premium.`;
      riskLevel = "Low";
    } else if (riskTolerance === "medium") {
      coverageType = "Term";
      policyDuration = 10;
      reasoning = `A 10-year term life policy provides essential coverage through your remaining working years at an affordable rate.`;
      riskLevel = "Medium";
    } else {
      coverageType = "Term";
      policyDuration = 5;
      reasoning = `With high risk tolerance, a 5-year term life policy provides minimal essential coverage at the lowest cost.`;
      riskLevel = "High";
    }
  }

  // Adjust coverage based on risk tolerance
  if (riskTolerance === "low") {
    coverageAmount = Math.round(coverageAmount * 1.2); // 20% more coverage for low risk tolerance
  } else if (riskTolerance === "high") {
    coverageAmount = Math.round(coverageAmount * 0.8); // 20% less coverage for high risk tolerance
  }

  // Round to nearest $50,000
  coverageAmount = Math.round(coverageAmount / 50000) * 50000;

  // Calculate estimated monthly premium (simplified calculation)
  const basePremiumRate = 0.0005; // 0.05% of coverage amount per month
  let premiumMultiplier = 1;

  // Adjust premium based on age
  if (age < 30) premiumMultiplier = 0.8;
  else if (age < 40) premiumMultiplier = 1.0;
  else if (age < 50) premiumMultiplier = 1.5;
  else if (age < 60) premiumMultiplier = 2.0;
  else premiumMultiplier = 3.0;

  // Adjust premium based on coverage type
  if (coverageType === "Whole") premiumMultiplier *= 3;
  else if (coverageType === "Universal") premiumMultiplier *= 2;

  const estimatedPremium = Math.round(
    coverageAmount * basePremiumRate * premiumMultiplier
  );

  return {
    coverageType,
    recommendedCoverage: coverageAmount,
    estimatedPremium,
    riskLevel,
    reasoning,
    policyDuration: policyDuration > 0 ? policyDuration : undefined,
    additionalFeatures:
      coverageType === "Whole"
        ? ["Cash Value", "Guaranteed Premiums"]
        : coverageType === "Universal"
        ? ["Flexible Premiums", "Cash Value"]
        : ["Convertible", "Renewable"],
  };
}
