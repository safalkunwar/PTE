import { describe, expect, it } from "vitest";
import { calibrateScore, normalizeRawPercentageToPte, PTE_RAW_SCORE_ANCHORS } from "./scoreCalibrationTable";
import { normalizeToPTE } from "../server/scoring";

describe("score calibration table", () => {
  it("calibrates maximum raw essay score to PTE 90", () => {
    const res = calibrateScore("writing_essay", 18);
    expect(res.pteScore).toBe(90);
    expect(res.cefrLevel).toBe("C2");
  });

  it("calibrates zero raw dictation score to PTE 10", () => {
    const res = calibrateScore("write_from_dictation", 0);
    expect(res.pteScore).toBe(10);
    expect(res.cefrLevel).toBe("A1");
  });

  it("calibrates competent range raw essay score to PTE 65", () => {
    const res = calibrateScore("writing_essay", 13);
    expect(res.pteScore).toBe(65);
    expect(res.cefrLevel).toBe("B2");
  });

  it("maps each shared raw-score anchor through the live normalizeToPTE path", () => {
    expect(PTE_RAW_SCORE_ANCHORS.map((anchor) => normalizeToPTE(anchor.rawPercentage))).toEqual([10, 50, 70, 90]);
    expect(normalizeRawPercentageToPte(25)).toBe(30);
    expect(normalizeRawPercentageToPte(88)).toBe(80);
  });
});
