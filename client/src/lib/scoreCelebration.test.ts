import { describe, expect, it } from "vitest";
import { CELEBRATION_PARTICLES, shouldCelebrateScore } from "./scoreCelebration";

describe("score celebration", () => {
  it("celebrates only scores in the 79+ upper band", () => {
    expect(shouldCelebrateScore(78.9)).toBe(false);
    expect(shouldCelebrateScore(79)).toBe(true);
    expect(shouldCelebrateScore(90)).toBe(true);
    expect(shouldCelebrateScore(null)).toBe(false);
  });

  it("uses a stable, finite particle set", () => {
    expect(CELEBRATION_PARTICLES).toHaveLength(7);
    expect(new Set(CELEBRATION_PARTICLES.map((particle) => particle.color)).size).toBe(7);
  });
});
