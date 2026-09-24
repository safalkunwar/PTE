export interface ConfidenceMetadata {
  scoreConfidence?: number;
  needsReview: boolean;
}

export function getConfidenceMetadata(result: unknown, threshold = 0.7): ConfidenceMetadata {
  const value = (result as { confidence?: unknown } | null)?.confidence;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { needsReview: false };
  }
  const scoreConfidence = Math.max(0, Math.min(1, value));
  return { scoreConfidence, needsReview: scoreConfidence < threshold };
}
