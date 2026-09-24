export interface ExamTip {
  id: string;
  category: "Speaking" | "Writing" | "Reading" | "Listening" | "General";
  title: string;
  content: string;
  actionableAdvice: string;
}

export const DAILY_EXAM_TIPS: ExamTip[] = [
  {
    id: "t1",
    category: "Speaking",
    title: "Read Aloud Pacing & Chunking",
    content: "Do not rush. Maintain a steady pace of 120-160 words per minute. Group words into meaningful grammatical chunks rather than reading word by word.",
    actionableAdvice: "Practice 5 Read Aloud questions daily focusing on natural pauses at commas and periods.",
  },
  {
    id: "t2",
    category: "Writing",
    title: "Summarize Written Text Single Sentence Rule",
    content: "SWT must be written as ONE single sentence separated by commas and conjunctions — never use a full stop until the very end.",
    actionableAdvice: "Check your summary for capital letters in the middle or extra periods.",
  },
  {
    id: "t3",
    category: "Reading",
    title: "Fill in the Blanks Collocation Mastery",
    content: "Many Reading blanks test standard English collocations (e.g., 'raise awareness', 'rigorous validation').",
    actionableAdvice: "Review the Vocabulary & Collocation Flashcards daily for 10 minutes.",
  },
  {
    id: "t4",
    category: "Listening",
    title: "Write from Dictation Accuracy",
    content: "WFD carries massive weight for both Listening and Writing scores. Even partial words give partial credit.",
    actionableAdvice: "Use initials on your notepad during audio playback, then reconstruct full words.",
  },
];

export function getTipOfTheDay(dayIndex: number): ExamTip {
  return DAILY_EXAM_TIPS[dayIndex % DAILY_EXAM_TIPS.length];
}
