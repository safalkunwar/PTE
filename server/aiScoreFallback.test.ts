import { describe, expect, it } from "vitest";
import { deterministicScoreFallback, withScoringTimeout } from "./aiScoreFallback";

describe("AI scoring timeout fallback", () => {
  it("returns the AI result when it finishes before the timeout", async () => {
    await expect(withScoringTimeout(Promise.resolve({ overallScore: 72 }), () => ({ overallScore: 10 }), 50)).resolves.toEqual({
      value: { overallScore: 72 },
      timedOut: false,
    });
  });

  it("uses the fallback when the scorer rejects", async () => {
    const result = await withScoringTimeout(Promise.reject(new Error("upstream unavailable")), () => deterministicScoreFallback("write_essay"), 50);
    expect(result.timedOut).toBe(true);
    expect(result.value.overallScore).toBe(10);
  });

  it("returns a low-confidence deterministic result after timeout", async () => {
    const result = await withScoringTimeout(
      new Promise(resolve => setTimeout(() => resolve({ overallScore: 90 }), 30)),
      () => deterministicScoreFallback("read_aloud"),
      5,
    );
    expect(result.timedOut).toBe(true);
    expect(result.value.overallScore).toBe(10);
    expect(result.value.confidence).toBe(0.1);
  });
});
