import { describe, expect, it } from "vitest";
import {
  NO_SPEECH_CUTOFF_MS,
  getWaveformRms,
  hasDetectedVoice,
  shouldStopForNoSpeech,
} from "./speakingSilenceRule";

describe("three-second speaking silence rule", () => {
  it("recognizes a silent waveform and avoids mistaking it for speech", () => {
    const silence = new Uint8Array(128).fill(128);
    expect(getWaveformRms(silence)).toBe(0);
    expect(hasDetectedVoice(silence)).toBe(false);
  });

  it("recognizes a meaningful voice waveform", () => {
    const voiced = new Uint8Array(128).fill(160);
    expect(hasDetectedVoice(voiced)).toBe(true);
  });

  it("ends only a recording that remains silent for the full cutoff", () => {
    expect(shouldStopForNoSpeech(NO_SPEECH_CUTOFF_MS - 1, false)).toBe(false);
    expect(shouldStopForNoSpeech(NO_SPEECH_CUTOFF_MS, false)).toBe(true);
    expect(shouldStopForNoSpeech(NO_SPEECH_CUTOFF_MS + 500, true)).toBe(false);
  });
});
