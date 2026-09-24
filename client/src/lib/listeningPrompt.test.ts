import { describe, expect, it } from "vitest";
import { getTextResponseTaskConfig, isListeningAudioPrompt, isTextResponseTask } from "./listeningPrompt";

describe("listening prompt routing", () => {
  it("treats listening MCQ variants as audio-first without changing Reading MCQs", () => {
    expect(isListeningAudioPrompt("listening", "multiple_choice_single")).toBe(true);
    expect(isListeningAudioPrompt("listening", "multiple_choice_multiple")).toBe(true);
    expect(isListeningAudioPrompt("reading", "multiple_choice_single")).toBe(false);
  });

  it("keeps legacy listening Fill in the Blanks usable after normalization", () => {
    expect(isListeningAudioPrompt("listening", "fill_in_blanks_listening")).toBe(true);
    expect(isTextResponseTask("fill_in_blanks_listening")).toBe(true);
    expect(isTextResponseTask("fill_blanks_listening")).toBe(true);
  });

  it("provides Summarize Spoken Text with its own bounded written-response contract", () => {
    expect(isTextResponseTask("summarize_spoken_text")).toBe(true);
    expect(getTextResponseTaskConfig("summarize_spoken_text")).toEqual({
      placeholder: "Write a 50–70 word summary of the recording...",
      minHeightClass: "min-h-[160px]",
      wordTarget: "50–70 words",
    });
  });
});
