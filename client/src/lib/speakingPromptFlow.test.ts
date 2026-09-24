import { describe, expect, it } from "vitest";
import {
  getInitialSpeakingPhase,
  getPhaseAfterPromptPlayback,
  isAudioLedSpeakingTask,
} from "./speakingPromptFlow";

describe("audio-led speaking prompt flow", () => {
  it("holds audio-led tasks at the prompt phase before preparation or recording", () => {
    expect(isAudioLedSpeakingTask("read_aloud")).toBe(false);
    expect(getInitialSpeakingPhase("repeat_sentence")).toBe("prompt");
    expect(getInitialSpeakingPhase("summarize_group_discussion")).toBe("prompt");
    expect(getInitialSpeakingPhase("respond_to_situation")).toBe("prompt");
  });

  it("starts recording directly after zero-preparation prompt audio", () => {
    expect(getPhaseAfterPromptPlayback("repeat_sentence")).toBe("recording");
    expect(getPhaseAfterPromptPlayback("answer_short_question")).toBe("recording");
  });

  it("starts preparation only after prompt audio for tasks that require it", () => {
    expect(getPhaseAfterPromptPlayback("retell_lecture")).toBe("prep");
    expect(getPhaseAfterPromptPlayback("summarize_group_discussion")).toBe("prep");
    expect(getPhaseAfterPromptPlayback("respond_to_situation")).toBe("prep");
  });
});
