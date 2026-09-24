import { describe, it, expect } from "vitest";
import { generateAiStudyPlan } from "./aiStudyPlanner";

describe("AI Study Planner", () => {
  it("generates a 7-day study plan aligned with target score and weakest module", () => {
    const plan = generateAiStudyPlan({
      targetScore: 79,
      readingAccuracy: 55,
      listeningAccuracy: 75,
    });
    expect(plan.targetScore).toBe(79);
    expect(plan.weakestModule).toBe("reading");
    expect(plan.dailySchedule).toHaveLength(7);
    expect(plan.dailySchedule[0].day).toBe(1);
  });
});
