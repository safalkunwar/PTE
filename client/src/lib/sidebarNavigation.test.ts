import { describe, expect, it } from "vitest";
import { getSidebarHighlightMotion } from "./sidebarNavigation";

describe("sidebar navigation highlight motion", () => {
  it("uses spring motion for active-route changes", () => {
    const motion = getSidebarHighlightMotion(false);
    expect(motion.initial.scaleY).toBe(0.35);
    expect(motion.animate.scaleY).toBe(1);
    expect(motion.transition).toMatchObject({ type: "spring", stiffness: 420, damping: 30 });
  });

  it("disables motion when the user prefers reduced motion", () => {
    const motion = getSidebarHighlightMotion(true);
    expect(motion.transition).toEqual({ duration: 0 });
    expect(motion.initial).toEqual(motion.animate);
  });
});
