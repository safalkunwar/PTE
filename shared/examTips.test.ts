import { describe, expect, it } from "vitest";
import { DAILY_EXAM_TIPS, getTipOfTheDay } from "./examTips";

describe("Daily Exam Tips Helper", () => {
  it("provides valid daily exam strategy tips", () => {
    expect(DAILY_EXAM_TIPS.length).toBeGreaterThan(0);
    const tip = getTipOfTheDay(0);
    expect(tip.title).toBeDefined();
    expect(tip.actionableAdvice).toBeDefined();
  });
});
