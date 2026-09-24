import { describe, expect, it } from "vitest";
import { hasUsableSpeakingTranscription } from "./aiScoreEligibility";

describe("speaking AI score eligibility", () => {
  it("accepts meaningful transcriptions", () => {
    expect(hasUsableSpeakingTranscription("The lecture explains climate policy.")).toBe(true);
  });

  it("rejects empty and whitespace-only transcriptions", () => {
    expect(hasUsableSpeakingTranscription("")).toBe(false);
    expect(hasUsableSpeakingTranscription("   \n\t")).toBe(false);
    expect(hasUsableSpeakingTranscription(undefined)).toBe(false);
  });
});
