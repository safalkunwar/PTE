import { describe, expect, it } from "vitest";
import { groupAttemptsByTask } from "./attemptHistory";

describe("attempt history analysis engine", () => {
  it("groups past user attempts and calculates average score distribution accurately", () => {
    const attempts = [
      { id: 1, questionId: 101, audioUrl: "https://s3/audio1.mp3", normalizedScore: 78, createdAt: new Date() },
      { id: 2, questionId: 102, audioUrl: null, normalizedScore: 62, createdAt: new Date() },
      { id: 3, questionId: 103, audioUrl: "https://s3/audio3.mp3", normalizedScore: 45, createdAt: new Date() },
    ];

    const result = groupAttemptsByTask(attempts);
    expect(result.totalAttempts).toBe(3);
    expect(result.scoredAttempts).toBe(3);
    expect(result.audioCount).toBe(2);
    expect(result.avgAttemptScore).toBe(62);
    expect(result.distribution.high).toBe(1);
    expect(result.distribution.medium).toBe(1);
    expect(result.distribution.low).toBe(1);
  });

  it("does not turn an unscored familiarization attempt into an artificial midpoint score", () => {
    const attempts = [
      { id: 1, questionId: 101, audioUrl: "https://s3/intro.webm", normalizedScore: null, createdAt: new Date() },
      { id: 2, questionId: 102, audioUrl: null, normalizedScore: 80, createdAt: new Date() },
    ];

    const result = groupAttemptsByTask(attempts);
    expect(result.totalAttempts).toBe(2);
    expect(result.scoredAttempts).toBe(1);
    expect(result.avgAttemptScore).toBe(80);
    expect(result.distribution).toEqual({ high: 1, medium: 0, low: 0 });
  });
});
