export interface AttemptRecord {
  id: number;
  questionId: number;
  audioUrl?: string | null;
  transcription?: string | null;
  normalizedScore?: number | null;
  pronunciationScore?: number | null;
  fluencyScore?: number | null;
  contentScore?: number | null;
  createdAt: Date;
}

export function groupAttemptsByTask(attempts: AttemptRecord[]) {
  const byScore: { high: number; medium: number; low: number } = { high: 0, medium: 0, low: 0 };
  let totalScore = 0;
  let scoredAttempts = 0;
  let audioCount = 0;

  for (const a of attempts) {
    if (a.audioUrl) audioCount++;
    if (a.normalizedScore === null || a.normalizedScore === undefined) continue;

    const score = a.normalizedScore;
    totalScore += score;
    scoredAttempts++;
    if (score >= 70) byScore.high++;
    else if (score >= 50) byScore.medium++;
    else byScore.low++;
  }

  const avgAttemptScore = scoredAttempts > 0 ? Math.round(totalScore / scoredAttempts) : 0;

  return {
    totalAttempts: attempts.length,
    scoredAttempts,
    audioCount,
    avgAttemptScore,
    distribution: byScore,
  };
}
