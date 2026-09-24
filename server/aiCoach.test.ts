import { describe, expect, it } from "vitest";
import { MODEL_ANSWER_BANDS, normalizeModelAnswers } from "./aiCoach";

describe("AI coaching model-answer tiers", () => {
  it("keeps only non-empty Pearson 65, 79, and 90 tiers", () => {
    expect(MODEL_ANSWER_BANDS).toEqual(["65", "79", "90"]);
    expect(normalizeModelAnswers([
      { band: "65", response: "Developed answer", commentary: "Adequate coverage" },
      { band: "79", response: "", commentary: "Missing response" },
      { band: "90", response: "Advanced answer", commentary: "Precise and complete" },
      { band: "50", response: "Unsupported", commentary: "Ignore" },
    ])).toEqual([
      { band: "65", response: "Developed answer", commentary: "Adequate coverage" },
      { band: "90", response: "Advanced answer", commentary: "Precise and complete" },
    ]);
  });
});
