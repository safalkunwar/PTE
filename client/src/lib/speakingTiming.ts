export type SpeakingTiming = { prep: number; record: number; label: string };

export const SPEAKING_TIMINGS: Record<string, SpeakingTiming> = {
  personal_introduction:       { prep: 25, record: 30, label: "Personal Introduction (unscored)" },
  read_aloud:                  { prep: 40, record: 40, label: "Read Aloud" },
  repeat_sentence:             { prep: 0,  record: 15, label: "Repeat Sentence" },
  describe_image:              { prep: 25, record: 40, label: "Describe Image" },
  retell_lecture:              { prep: 10, record: 40, label: "Retell Lecture" },
  answer_short_question:       { prep: 0,  record: 10, label: "Answer Short Question" },
  summarize_group_discussion:  { prep: 10, record: 120, label: "Summarize Group Discussion" },
  respond_to_situation:        { prep: 10, record: 40, label: "Respond to a Situation" },
};

export const DEFAULT_SPEAKING_TIMING: SpeakingTiming = { prep: 0, record: 40, label: "Speaking" };

export function getSpeakingTiming(taskType: string): SpeakingTiming {
  return SPEAKING_TIMINGS[taskType] ?? DEFAULT_SPEAKING_TIMING;
}

export function advanceCountdown(remaining: number): { remaining: number; finished: boolean } {
  if (remaining <= 1) return { remaining: 0, finished: true };
  return { remaining: remaining - 1, finished: false };
}
