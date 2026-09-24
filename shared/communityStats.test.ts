import { describe, expect, it } from "vitest";
import { MOCK_LEADERBOARD, calculateCommunityAverages } from "./communityStats";

describe("Community Leaderboard & Stats Helper", () => {
  it("calculates community averages accurately", () => {
    const averages = calculateCommunityAverages(MOCK_LEADERBOARD);
    expect(averages.avgHours).toBeGreaterThan(0);
    expect(averages.avgStreak).toBeGreaterThan(0);
    expect(MOCK_LEADERBOARD.length).toBe(5);
  });
});
