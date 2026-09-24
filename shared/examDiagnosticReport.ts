export interface DiagnosticReport {
  generatedAt: number;
  overallReadinessIndex: number;
  predictedScore: number;
  moduleBreakdown: {
    speaking: { accuracy: number; status: string; advice: string };
    writing: { accuracy: number; status: string; advice: string };
    reading: { accuracy: number; status: string; advice: string };
    listening: { accuracy: number; status: string; advice: string };
  };
  priorityActionItems: string[];
}

export function generateDiagnosticReport(userStats: {
  speakingAccuracy?: number;
  writingAccuracy?: number;
  readingAccuracy?: number;
  listeningAccuracy?: number;
  totalSessions?: number;
}): DiagnosticReport {
  const sp = userStats.speakingAccuracy ?? 72;
  const wr = userStats.writingAccuracy ?? 68;
  const re = userStats.readingAccuracy ?? 65;
  const li = userStats.listeningAccuracy ?? 74;

  const avg = Math.round((sp + wr + re + li) / 4);
  const predictedScore = Math.min(90, Math.max(30, Math.round(avg * 1.05)));
  const readinessIndex = Math.min(95, Math.max(20, Math.round(avg * 0.98)));

  const getStatus = (acc: number) => acc >= 75 ? "Exam Ready" : acc >= 60 ? "Moderate" : "Needs Practice";

  return {
    generatedAt: Date.now(),
    overallReadinessIndex: readinessIndex,
    predictedScore,
    moduleBreakdown: {
      speaking: { accuracy: sp, status: getStatus(sp), advice: "Maintain consistent pacing and clear word stress in Read Aloud." },
      writing: { accuracy: wr, status: getStatus(wr), advice: "Check sentence boundaries and essay word counts (200-300 words)." },
      reading: { accuracy: re, status: getStatus(re), advice: "Practice high-frequency academic collocations in Fill in the Blanks." },
      listening: { accuracy: li, status: getStatus(li), advice: "Focus on spelling accuracy in Write from Dictation items." },
    },
    priorityActionItems: [
      `Complete 10 high-priority questions in your weakest module (${re < wr && re < sp && re < li ? 'Reading' : 'Writing'}).`,
      "Review past audio recording transcripts and AI feedback scores.",
      "Simulate a full-length mock test under strict exam timing.",
    ],
  };
}
