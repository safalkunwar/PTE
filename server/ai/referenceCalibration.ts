import { normalizeRawPercentageToPte } from "../../shared/scoreCalibrationTable";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

export function calibrateSpeakingReferenceScore(params: {
  contentPercentage: number;
  pronunciation: number;
  fluency: number;
  contentWeight?: number;
  pronunciationWeight?: number;
  fluencyWeight?: number;
}): number {
  const contentWeight = params.contentWeight ?? 0.25;
  const pronunciationWeight = params.pronunciationWeight ?? 0.4;
  const fluencyWeight = params.fluencyWeight ?? 0.35;
  const content = clamp(params.contentPercentage, 0, 1);
  const pronunciation = clamp(params.pronunciation, 0, 5) / 5;
  const fluency = clamp(params.fluency, 0, 5) / 5;
  const raw = content * contentWeight + pronunciation * pronunciationWeight + fluency * fluencyWeight;
  const bonus = pronunciation >= 0.9 && fluency >= 0.9 && content >= 0.85 ? 5 : 0;
  return Math.max(10, Math.min(90, normalizeRawPercentageToPte(raw * 100) + bonus));
}

export function calibrateWritingReferenceScore(params: {
  rawScore: number;
  maxRawScore: number;
  formValid?: boolean;
  contentScore?: number;
}): number {
  if (!params.formValid || (params.contentScore ?? 1) <= 0 || params.maxRawScore <= 0) return 10;
  return normalizeRawPercentageToPte((clamp(params.rawScore, 0, params.maxRawScore) / params.maxRawScore) * 100);
}

export function referenceCefrLevel(pteScore: number): string {
  if (pteScore >= 85) return "C2";
  if (pteScore >= 76) return "C1";
  if (pteScore >= 59) return "B2";
  if (pteScore >= 43) return "B1";
  if (pteScore >= 29) return "A2";
  return "A1";
}

export function calibrateObjectiveReferenceScore(rawScore: number, maxRawScore: number): number {
  if (maxRawScore <= 0) return 10;
  return normalizeRawPercentageToPte((clamp(rawScore, 0, maxRawScore) / maxRawScore) * 100);
}
