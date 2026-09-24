import { describe, expect, it } from "vitest";
import { shouldApplyImmediateObjectiveScore } from "./responseScoringPolicy";

describe("response scoring policy", () => {
  it("defers Summarize Spoken Text to the listening scorer instead of assigning a generic objective score", () => {
    expect(shouldApplyImmediateObjectiveScore("listening", "summarize_spoken_text")).toBe(false);
  });

  it("keeps deterministic scoring immediate for objective Reading and Listening responses", () => {
    expect(shouldApplyImmediateObjectiveScore("listening", "write_from_dictation")).toBe(true);
    expect(shouldApplyImmediateObjectiveScore("reading", "fill_blanks_reading")).toBe(true);
  });
});
