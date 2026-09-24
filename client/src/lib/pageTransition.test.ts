import { describe, expect, it } from "vitest";
import { getPageTransition } from "./pageTransition";
import { formatScore } from "@/components/AnimatedScoreCounter";

describe("score and page motion policies", () => {
  it("formats PTE scores as rounded values and preserves empty state", () => {
    expect(formatScore(79.6)).toBe("80");
    expect(formatScore(null)).toBe("—");
    expect(formatScore(Number.NaN)).toBe("—");
  });

  it("uses a subtle horizontal fade for normal motion", () => {
    const transition = getPageTransition(false);
    expect(transition.initial).toEqual({ opacity: 0, x: 8 });
    expect(transition.animate).toEqual({ opacity: 1, x: 0 });
    expect(transition.exit).toEqual({ opacity: 0, x: -8 });
    expect(transition.transition.duration).toBeGreaterThan(0);
  });

  it("disables movement and timing for reduced-motion users", () => {
    const transition = getPageTransition(true);
    expect(transition.initial).toEqual({ opacity: 1, x: 0 });
    expect(transition.animate).toEqual({ opacity: 1, x: 0 });
    expect(transition.exit).toEqual({ opacity: 1, x: 0 });
    expect(transition.transition.duration).toBe(0);
  });
});
