export interface DailyStudyTask {
  day: number;
  title: string;
  section: "speaking" | "writing" | "reading" | "listening";
  taskType: string;
  recommendedCount: number;
  focusRationale: string;
}

export interface AiStudyPlan {
  targetScore: number;
  weakestModule: string;
  generatedAt: number;
  dailySchedule: DailyStudyTask[];
}

export function generateAiStudyPlan(userHistory: {
  speakingAccuracy?: number;
  writingAccuracy?: number;
  readingAccuracy?: number;
  listeningAccuracy?: number;
  targetScore?: number;
}): AiStudyPlan {
  const targetScore = userHistory.targetScore ?? 65;
  const accuracies = {
    speaking: userHistory.speakingAccuracy ?? 68,
    writing: userHistory.writingAccuracy ?? 65,
    reading: userHistory.readingAccuracy ?? 62,
    listening: userHistory.listeningAccuracy ?? 70,
  };

  const weakest = Object.entries(accuracies).reduce((min, [mod, acc]) => 
    acc < min.acc ? { mod, acc } : min, { mod: "reading", acc: 100 }
  );

  const dailySchedule: DailyStudyTask[] = [
    {
      day: 1,
      title: "Targeted Weak-Spot Drill: Read Aloud & Repeat Sentence",
      section: "speaking",
      taskType: "read_aloud",
      recommendedCount: 10,
      focusRationale: `Focus on oral fluency and pronunciation to lift baseline communicative scores toward your ${targetScore} target.`,
    },
    {
      day: 2,
      title: "Writing Mastery: Summarize Written Text & Essay Structure",
      section: "writing",
      taskType: "summarize_written_text",
      recommendedCount: 3,
      focusRationale: "Refine concise summarization and essay templates to secure grammar and form scores.",
    },
    {
      day: 3,
      title: "Reading Intensive: Fill in the Blanks (R&W and Reading)",
      section: "reading",
      taskType: "fill_blanks_rw",
      recommendedCount: 8,
      focusRationale: `Address your weakest module (${weakest.mod}) with high-frequency academic collocations and grammar clues.`,
    },
    {
      day: 4,
      title: "Listening Dictation & Summarize Spoken Text",
      section: "listening",
      taskType: "write_from_dictation",
      recommendedCount: 12,
      focusRationale: "Write from Dictation carries heavy listening and writing points; practice daily for spelling accuracy.",
    },
    {
      day: 5,
      title: "Speaking Fluency Simulation: Describe Image & Retell Lecture",
      section: "speaking",
      taskType: "describe_image",
      recommendedCount: 6,
      focusRationale: "Maintain a steady speaking pace without hesitations or fillers.",
    },
    {
      day: 6,
      title: "Reading & Listening Mixed Mini-Mock",
      section: "reading",
      taskType: "reorder_paragraphs",
      recommendedCount: 5,
      focusRationale: "Simulate test-day stamina across multiple complex paragraph reordering and summary tasks.",
    },
    {
      day: 7,
      title: "Full-Length Exam Simulation & Weakness Review",
      section: "listening",
      taskType: "highlight_incorrect_words",
      recommendedCount: 4,
      focusRationale: "Review past practice session analytics and audio recordings to eliminate recurring mistakes.",
    },
  ];

  return {
    targetScore,
    weakestModule: weakest.mod,
    generatedAt: Date.now(),
    dailySchedule,
  };
}
