export interface ReadinessInput {
  totalSessions: number;
  avgScore: number;
  targetScore: number;
  speakingAvg: number;
  writingAvg: number;
  readingAvg: number;
  listeningAvg: number;
}

export interface ReadinessResult {
  readinessPercentage: number;
  predictedScore: number;
  readinessLabel: string;
  isReadyForExam: boolean;
  weakestSection: string;
  recommendations: string[];
}

export function evaluateExamReadiness(input: ReadinessInput): ReadinessResult {
  const { totalSessions, avgScore, targetScore, speakingAvg, writingAvg, readingAvg, listeningAvg } = input;

  const baseScore = avgScore > 0 ? avgScore : 55;
  const sessionBonus = Math.min(10, totalSessions * 0.8);
  const predictedScore = Math.min(90, Math.round(baseScore + sessionBonus));

  const sections = [
    { name: "Speaking", score: speakingAvg || baseScore },
    { name: "Writing", score: writingAvg || baseScore },
    { name: "Reading", score: readingAvg || baseScore },
    { name: "Listening", score: listeningAvg || baseScore },
  ];

  sections.sort((a, b) => a.score - b.score);
  const weakestSection = sections[0].name;

  const scoreDiff = targetScore - predictedScore;
  let readinessPercentage = Math.min(100, Math.max(10, Math.round((predictedScore / targetScore) * 100)));
  if (totalSessions < 3) {
    readinessPercentage = Math.min(readinessPercentage, 45);
  }

  let readinessLabel = "Developing Foundation";
  if (readinessPercentage >= 90) readinessLabel = "Exam Ready (Expert Band)";
  else if (readinessPercentage >= 75) readinessLabel = "Near Target (High Confidence)";
  else if (readinessPercentage >= 55) readinessLabel = "Progressing Steadily";

  const recommendations: string[] = [
    `Focus intensive daily practice on the ${weakestSection} module to close your largest band gap.`,
    totalSessions < 5 ? "Complete at least 5 full practice sessions or sectional tests to stabilize accuracy." : "Maintain daily timed mock simulations under strict exam conditions.",
    scoreDiff > 0 ? `You are currently projected ${scoreDiff} points below your target of ${targetScore}. Increase weekly study hours.` : "Your projected score meets or exceeds your target. Keep practicing to maintain fluency.",
  ];

  return {
    readinessPercentage,
    predictedScore,
    readinessLabel,
    isReadyForExam: readinessPercentage >= 80 && scoreDiff <= 2,
    weakestSection,
    recommendations,
  };
}
