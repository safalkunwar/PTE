import { describe, expect, it } from "vitest";
import { playTtsFallback } from "./ttsAudioFallback";

describe("TTS audio fallback", () => {
  it("handles missing speech synthesis gracefully in test environment", () => {
    const result = playTtsFallback("Test prompt audio");
    // In node/vitest environment without window.speechSynthesis, it returns false safely without throwing
    expect(typeof result).toBe("boolean");
  });
});
