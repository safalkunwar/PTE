import { describe, expect, it } from "vitest";
import { simulateTargetScores } from "./scoreSimulation";

describe("target score simulation engine", () => {
  it("projects higher scores with additional practice hours", () => {
    const result = simulateTargetScores({
      currentOverall: 58,
      targetScore: 79,
      speaking: 60,
      writing: 55,
      reading: 58,
      listening: 56,
      grammar: 60,
      vocabulary: 58,
      oralFluency: 62,
      pronunciation: 57,
      spelling: 65,
      writtenDiscourse: 60,
    }, 15);

    expect(result.projectedOverall).toBeGreaterThan(58);
    expect(result.projections.length).toBe(8);
    expect(result.projections[0].projected).toBeGreaterThanOrEqual(result.projections[0].current);
  });
});
