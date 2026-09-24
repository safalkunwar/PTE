import { describe, expect, it } from "vitest";
import { canStartPromptPlayback, getPromptPlaybackStatus } from "./examAudioReplay";

describe("exam prompt playback policy", () => {
  it("allows only the initial prompt playback in a timed test", () => {
    expect(canStartPromptPlayback(false, false)).toBe(true);
    expect(canStartPromptPlayback(true, false)).toBe(false);
  });

  it("retains replay flexibility in ordinary practice", () => {
    expect(canStartPromptPlayback(true, true)).toBe(true);
    expect(getPromptPlaybackStatus(false, true)).toBe("Replay available");
  });

  it("labels the single-play exam lifecycle accurately", () => {
    expect(getPromptPlaybackStatus(false, false)).toBe("Exam audio plays once");
    expect(getPromptPlaybackStatus(true, false)).toBe("Exam audio completed");
  });
});
