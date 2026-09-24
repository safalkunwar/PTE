import { describe, expect, it } from "vitest";
import { getFeedbackAccordionMotion, toggleFeedbackPanel } from "./feedbackPanel";

describe("AI feedback panel", () => {
  it("expands a collapsed panel and collapses an expanded panel", () => {
    expect(toggleFeedbackPanel(false)).toBe(true);
    expect(toggleFeedbackPanel(true)).toBe(false);
  });

  it("uses animated height transitions when motion is available", () => {
    const motion = getFeedbackAccordionMotion(false);
    expect(motion.initial).toEqual({ opacity: 0, height: 0 });
    expect(motion.animate).toEqual({ opacity: 1, height: "auto" });
    expect(motion.transition.duration).toBe(0.2);
  });

  it("disables movement while preserving the expanded state for reduced motion", () => {
    const motion = getFeedbackAccordionMotion(true);
    expect(motion.initial).toBe(false);
    expect(motion.exit).toBeUndefined();
    expect(motion.transition.duration).toBe(0);
  });
});
