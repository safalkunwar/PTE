import { describe, expect, it } from "vitest";
import { calculateDaysRemaining, getRecommendedDailyMinutes } from "./examCountdown";

describe("Exam Countdown & Target Date Helper", () => {
  it("calculates positive days remaining", () => {
    const futureDate = new Date(Date.now() + 14 * 86400000).toISOString();
    const days = calculateDaysRemaining(futureDate);
    expect(days).toBeGreaterThanOrEqual(13);
    expect(days).toBeLessThanOrEqual(14);
  });

  it("recommends daily practice minutes based on urgency", () => {
    expect(getRecommendedDailyMinutes(5, 79)).toBe(90);
    expect(getRecommendedDailyMinutes(30, 65)).toBe(45);
  });
});
