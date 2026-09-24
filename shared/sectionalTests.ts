export type SectionalTestSection = "speaking" | "writing" | "reading" | "listening";

export interface SectionalTestConfig {
  section: SectionalTestSection;
  label: string;
  description: string;
  durationMinutes: number;
  questionCount: number;
  taskTypes: string[];
  scoringNote: string;
}

/**
 * Section-level exam simulations. The question counts cover every runnable
 * task type in the current bank; Personal Introduction remains unscored and
 * is included only in the Speaking familiarisation flow.
 */
export const SECTIONAL_TEST_CONFIG: Record<SectionalTestSection, SectionalTestConfig> = {
  speaking: {
    section: "speaking",
    label: "Speaking Section Test",
    description: "Complete the speaking task sequence with Pearson-style preparation and response timers.",
    durationMinutes: 25,
    questionCount: 8,
    taskTypes: [
      "personal_introduction",
      "read_aloud",
      "repeat_sentence",
      "describe_image",
      "retell_lecture",
      "answer_short_question",
      "respond_to_situation",
      "summarize_group_discussion",
    ],
    scoringNote: "Personal Introduction is familiarisation only; the remaining speaking tasks receive AI-estimated PTE scores.",
  },
  writing: {
    section: "writing",
    label: "Writing Section Test",
    description: "Complete both writing task types with strict response-form and time guidance.",
    durationMinutes: 30,
    questionCount: 2,
    taskTypes: ["summarize_written_text", "write_essay"],
    scoringNote: "Responses are scored for content, form, grammar, vocabulary, spelling, and written discourse where applicable.",
  },
  reading: {
    section: "reading",
    label: "Reading Section Test",
    description: "Work through every current Reading task family in one timed section simulation.",
    durationMinutes: 30,
    questionCount: 5,
    taskTypes: [
      "multiple_choice_single",
      "multiple_choice_multiple",
      "reorder_paragraphs",
      "fill_blanks_reading",
      "fill_blanks_rw",
    ],
    scoringNote: "Objective tasks use exact or partial-credit rules defined by the task format.",
  },
  listening: {
    section: "listening",
    label: "Listening Section Test",
    description: "Complete the listening task sequence with single-play audio handling and timed responses.",
    durationMinutes: 40,
    questionCount: 8,
    taskTypes: [
      "summarize_spoken_text",
      "multiple_choice_multiple",
      "fill_blanks_listening",
      "highlight_correct_summary",
      "multiple_choice_single",
      "select_missing_word",
      "highlight_incorrect_words",
      "write_from_dictation",
    ],
    scoringNote: "Audio-first tasks preserve single-play behavior; objective answers use Pearson-style partial credit where defined.",
  },
};

export function getSectionalTestConfig(section: string): SectionalTestConfig | undefined {
  return SECTIONAL_TEST_CONFIG[section as SectionalTestSection];
}
