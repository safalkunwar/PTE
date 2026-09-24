import { describe, expect, it } from "vitest";
import {
  calibrateObjectiveReferenceScore,
  calibrateSpeakingReferenceScore,
  calibrateWritingReferenceScore,
} from "./referenceCalibration";

describe("reference-response calibration helpers", () => {
  it("maps speaking low, middle, and native-like fixtures to separated bands", () => {
    expect(calibrateSpeakingReferenceScore({ contentPercentage: 0, pronunciation: 0, fluency: 0 })).toBe(10);
    expect(calibrateSpeakingReferenceScore({ contentPercentage: 0.6, pronunciation: 3, fluency: 3 })).toBe(58);
    expect(calibrateSpeakingReferenceScore({ contentPercentage: 1, pronunciation: 5, fluency: 5 })).toBe(90);
  });

  it("maps writing raw fixtures and enforces form/content gates", () => {
    expect(calibrateWritingReferenceScore({ rawScore: 0, maxRawScore: 15, formValid: true, contentScore: 0 })).toBe(10);
    expect(calibrateWritingReferenceScore({ rawScore: 8, maxRawScore: 15, formValid: true, contentScore: 2 })).toBe(53);
    expect(calibrateWritingReferenceScore({ rawScore: 15, maxRawScore: 15, formValid: true, contentScore: 3 })).toBe(90);
    expect(calibrateWritingReferenceScore({ rawScore: 15, maxRawScore: 15, formValid: false, contentScore: 3 })).toBe(10);
  });

  it("keeps objective low and high endpoints deterministic", () => {
    expect(calibrateObjectiveReferenceScore(0, 1)).toBe(10);
    expect(calibrateObjectiveReferenceScore(1, 1)).toBe(90);
  });
});
