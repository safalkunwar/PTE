import { describe, expect, it } from "vitest";
import { getConfidenceMetadata } from "./aiConfidence";

describe("AI confidence metadata", () => {
  it("flags confidence below the review threshold", () => {
    expect(getConfidenceMetadata({ confidence: 0.69 })).toEqual({ scoreConfidence: 0.69, needsReview: true });
    expect(getConfidenceMetadata({ confidence: 0.7 })).toEqual({ scoreConfidence: 0.7, needsReview: false });
  });

  it("clamps invalid score confidence to the supported range", () => {
    expect(getConfidenceMetadata({ confidence: 2 })).toEqual({ scoreConfidence: 1, needsReview: false });
    expect(getConfidenceMetadata({ confidence: -1 })).toEqual({ scoreConfidence: 0, needsReview: true });
  });

  it("does not invent confidence when the model omits it", () => {
    expect(getConfidenceMetadata({})).toEqual({ needsReview: false });
  });
});
