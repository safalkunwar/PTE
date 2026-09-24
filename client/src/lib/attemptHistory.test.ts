import { describe, expect, it } from "vitest";
import { applyAttemptScore } from "./attemptHistory";
import type { Attempt } from "@/components/AttemptHistory";

const baseAttempt: Attempt = {
  id: 7,
  timestamp: new Date("2026-08-14T00:00:00Z"),
  score: 1,
  maxScore: 1,
  transcription: "initial transcript",
  taskType: "read_aloud",
};

describe("attempt history score updates", () => {
  it("replaces the initial result with the normalized AI score", () => {
    const updated = applyAttemptScore([baseAttempt], 7, 82, "final transcript");
    expect(updated[0]).toMatchObject({
      id: 7,
      score: 82,
      maxScore: 90,
      transcription: "final transcript",
    });
  });

  it("leaves unrelated attempts unchanged", () => {
    const other: Attempt = { ...baseAttempt, id: 8, score: 65 };
    const updated = applyAttemptScore([baseAttempt, other], 7, 82);
    expect(updated[1]).toEqual(other);
  });
});
