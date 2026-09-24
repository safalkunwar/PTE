export function hasAttemptScore(score?: number, maxScore?: number): boolean {
  return Number.isFinite(score) && Number.isFinite(maxScore) && Number(maxScore) > 0;
}

export function getAttemptScoreLabel(score?: number, maxScore?: number): string {
  return hasAttemptScore(score, maxScore) ? `${score}/${maxScore}` : "Unscored";
}

export function getAttemptScorePercent(score?: number, maxScore?: number): number {
  if (!hasAttemptScore(score, maxScore)) return 0;
  return Math.min(100, Math.max(0, (Number(score) / Number(maxScore)) * 100));
}
