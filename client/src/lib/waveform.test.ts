import { describe, expect, it } from "vitest";
import { normalizeWaveformBar, waveformBarOpacity, WAVEFORM_BAR_COUNT } from "./waveform";

describe("speaking waveform helpers", () => {
  it("keeps waveform values inside the visual bounds", () => {
    expect(normalizeWaveformBar(-4)).toBe(2);
    expect(normalizeWaveformBar(24.4)).toBe(24);
    expect(normalizeWaveformBar(100)).toBe(48);
    expect(normalizeWaveformBar(Number.NaN)).toBe(2);
  });

  it("keeps inactive bars opaque and active bars within the intended range", () => {
    expect(waveformBarOpacity(false, 24)).toBe(1);
    expect(waveformBarOpacity(true, 2)).toBeCloseTo(0.7125);
    expect(waveformBarOpacity(true, 48)).toBe(1);
  });

  it("uses the stable PTE waveform bar count", () => {
    expect(WAVEFORM_BAR_COUNT).toBe(32);
  });
});
