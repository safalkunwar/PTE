import { describe, it, expect } from "vitest";
import { generateDiagnosticReport } from "./examDiagnosticReport";

describe("Exam Diagnostic Report", () => {
  it("generates structured readiness and module advice", () => {
    const report = generateDiagnosticReport({
      speakingAccuracy: 80,
      writingAccuracy: 70,
      readingAccuracy: 60,
      listeningAccuracy: 75,
    });
    expect(report.overallReadinessIndex).toBeGreaterThan(0);
    expect(report.predictedScore).toBeGreaterThan(0);
    expect(report.moduleBreakdown.reading.status).toBe("Moderate");
    expect(report.priorityActionItems).toHaveLength(3);
  });
});
