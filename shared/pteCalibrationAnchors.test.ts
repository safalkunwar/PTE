import { describe, expect, it } from "vitest";
import {
  PTE_SUBJECTIVE_CALIBRATION_ANCHORS,
  PTE_SUBJECTIVE_CALIBRATION_BANDS,
} from "./pteCalibrationAnchors";

describe("subjective PTE calibration anchors", () => {
  it("contains every requested band in ascending order", () => {
    expect(PTE_SUBJECTIVE_CALIBRATION_BANDS).toEqual([10, 30, 50, 65, 79, 90]);
    for (const band of PTE_SUBJECTIVE_CALIBRATION_BANDS) {
      expect(PTE_SUBJECTIVE_CALIBRATION_ANCHORS).toContain(`${band} (`);
    }
  });

  it("clearly separates illustrative references from official Pearson material", () => {
    expect(PTE_SUBJECTIVE_CALIBRATION_ANCHORS).toContain("APPLICATION REFERENCE ONLY");
    expect(PTE_SUBJECTIVE_CALIBRATION_ANCHORS).toContain("Content and form gates remain decisive");
    expect(PTE_SUBJECTIVE_CALIBRATION_ANCHORS).toContain("For objective tasks, use deterministic answer keys");
  });
});
