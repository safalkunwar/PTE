import { describe, expect, it } from "vitest";
import { getAttemptScoreLabel, getAttemptScorePercent, hasAttemptScore } from "./attemptHistoryDisplay";

describe("attempt history display", () => {
  it("renders a normal scored attempt", () => {
    expect(hasAttemptScore(72, 90)).toBe(true);
    expect(getAttemptScoreLabel(72, 90)).toBe("72/90");
    expect(getAttemptScorePercent(72, 90)).toBe(80);
  });

  it("labels scoreless familiarization attempts without inventing a score", () => {
    expect(hasAttemptScore(undefined, undefined)).toBe(false);
    expect(getAttemptScoreLabel(undefined, undefined)).toBe("Unscored");
    expect(getAttemptScorePercent(undefined, undefined)).toBe(0);
  });
});
