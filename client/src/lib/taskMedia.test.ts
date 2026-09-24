import { describe, expect, it } from "vitest";
import { audioFirstTaskTypes, getAudioFallbackText, imageTaskTypes, isUsablePromptAudioUrl, requiresQuestionAudio, requiresQuestionImage } from "./taskMedia";
import { canonicalPracticeTaskTypes } from "./practiceRoutes";

describe("task media requirements", () => {
  it("requires audio for audio-first listening tasks", () => {
    expect(requiresQuestionAudio("summarize_spoken_text")).toBe(true);
    expect(requiresQuestionAudio("write_from_dictation")).toBe(true);
    expect(audioFirstTaskTypes.size).toBeGreaterThan(1);
  });

  it("uses the question section to distinguish listening MCQs from Reading MCQs", () => {
    expect(requiresQuestionAudio("multiple_choice_single", "listening")).toBe(true);
    expect(requiresQuestionAudio("multiple_choice_multiple", "listening")).toBe(true);
    expect(requiresQuestionAudio("multiple_choice_single", "reading")).toBe(false);
  });

  it("does not block text-first or image-first tasks", () => {
    expect(requiresQuestionAudio("read_aloud")).toBe(false);
    expect(requiresQuestionAudio("describe_image")).toBe(false);
    expect(requiresQuestionAudio("write_essay")).toBe(false);
  });

  it("covers the complete canonical task catalog", () => {
    const allTaskTypes = new Set(Object.values(canonicalPracticeTaskTypes).flat());
    expect(allTaskTypes.size).toBe(21);
    expect(audioFirstTaskTypes.has("summarize_spoken_text")).toBe(true);
    expect(requiresQuestionAudio("summarize_spoken_text")).toBe(true);
    expect(requiresQuestionImage("describe_image")).toBe(true);
    expect(imageTaskTypes.has("describe_image")).toBe(true);
  });

  it("recognizes persisted legacy listening aliases as audio-first tasks", () => {
    expect(requiresQuestionAudio("fill_in_blanks_listening")).toBe(true);
    expect(getAudioFallbackText("fill_in_blanks_listening")).toContain("Listen");
  });

  it("provides a usable synthesized fallback for every audio-first task", () => {
    for (const taskType of audioFirstTaskTypes) {
      expect(getAudioFallbackText(taskType).trim().length).toBeGreaterThan(8);
    }
  });

  it("prefers the question content for synthesized listening audio", () => {
    expect(getAudioFallbackText("summarize_spoken_text", "A lecture about renewable energy.", "Listen now"))
      .toBe("A lecture about renewable energy.");
  });

  it("rejects placeholder music URLs so the topic-matched synthesized fallback is used", () => {
    expect(isUsablePromptAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3")).toBe(false);
    expect(isUsablePromptAudioUrl("https://example.com/prompt.mp3")).toBe(false);
    expect(isUsablePromptAudioUrl("/manus-storage/original-prompt.mp3")).toBe(true);
  });
});
