import { describe, expect, it } from "vitest";
import { isSubmitDisabled } from "./practiceToolbar";

describe("sticky practice toolbar", () => {
  it("disables submit while scoring or when required input is missing", () => {
    expect(isSubmitDisabled({ isSubmitting: true, isSpeakingTask: false, hasAudio: true, isWritingTask: false, hasText: true })).toBe(true);
    expect(isSubmitDisabled({ isSubmitting: false, isSpeakingTask: true, hasAudio: false, isWritingTask: false, hasText: true })).toBe(true);
    expect(isSubmitDisabled({ isSubmitting: false, isSpeakingTask: false, hasAudio: true, isWritingTask: true, hasText: false })).toBe(true);
  });

  it("enables submit when the active task has its required response", () => {
    expect(isSubmitDisabled({ isSubmitting: false, isSpeakingTask: true, hasAudio: true, isWritingTask: false, hasText: false })).toBe(false);
    expect(isSubmitDisabled({ isSubmitting: false, isSpeakingTask: false, hasAudio: false, isWritingTask: true, hasText: true })).toBe(false);
    expect(isSubmitDisabled({ isSubmitting: false, isSpeakingTask: false, hasAudio: false, isWritingTask: false, hasText: false })).toBe(false);
  });
});
