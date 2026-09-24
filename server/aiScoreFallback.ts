export interface DeterministicScoreFallback {
  overallScore: number;
  rawScore: number;
  maxRawScore: number;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  confidence: number;
  traits: {
    content: { score: number; maxScore: number; feedback: string };
    form: { score: number; maxScore: number; feedback: string };
    pronunciation: { score: number; maxScore: number; feedback: string };
    oralFluency: { score: number; maxScore: number; feedback: string };
  };
}

export function deterministicScoreFallback(taskType: string): DeterministicScoreFallback {
  const message = `Automated scoring timed out for ${taskType.replace(/_/g, " ")}. The response was saved and can be rescored when the AI service is available.`;
  return {
    overallScore: 10,
    rawScore: 0,
    maxRawScore: 1,
    overallFeedback: message,
    strengths: [],
    improvements: ["Retry AI scoring when the service is available."],
    confidence: 0.1,
    traits: {
      content: { score: 0, maxScore: 1, feedback: "Not scored by the AI engine." },
      form: { score: 0, maxScore: 1, feedback: "Not scored by the AI engine." },
      pronunciation: { score: 0, maxScore: 5, feedback: "Not scored by the AI engine." },
      oralFluency: { score: 0, maxScore: 5, feedback: "Not scored by the AI engine." },
    },
  };
}

export async function withScoringTimeout<T>(
  promise: Promise<T>,
  fallback: () => T,
  timeoutMs = 15_000,
): Promise<{ value: T; timedOut: boolean }> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<"timeout">(resolve => {
    timeoutHandle = setTimeout(() => resolve("timeout"), timeoutMs);
  });
  const guardedPromise = promise.then(
    value => ({ value, timedOut: false as const }),
    () => ({ value: fallback(), timedOut: true as const }),
  );
  const result = await Promise.race([guardedPromise, timeout.then(() => ({ value: fallback(), timedOut: true as const }))]);
  if (timeoutHandle) clearTimeout(timeoutHandle);
  return result;
}
