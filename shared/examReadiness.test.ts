import { describe, expect, it } from "vitest";
import { evaluateExamReadiness } from "./examReadiness";

describe("exam readiness evaluation engine", () => {
  it("evaluates readiness percentage and identifies weakest sections accurately", () => {
    const result = evaluateExamReadiness({
      totalSessions: 6,
      avgScore: 72,
      targetScore: 79,
      speakingAvg: 75,
      writing: 68,
      reading: 74,
      listening: 73,
    });

    expect(result.predictedScore).toBeGreaterThanOrEqual(72);
    expect(result.weakestSection).toBe("Writing");
    expect(result.readinessPercentage).toBeGreaterThan(50);
    expect(result.recommendations.length).toBe(3);
  });
});
