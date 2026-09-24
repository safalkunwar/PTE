export type SessionSection = "speaking" | "writing" | "reading" | "listening" | "full";
export type SessionType = "mock_test" | "section_practice" | "diagnostic" | "revision" | "beginner";
export type SessionMode = "beginner" | "exam" | "diagnostic" | "revision";

import { normalizeTaskType } from "./taskTypeAliases";
import { SECTIONAL_TEST_CONFIG } from "./sectionalTests";

export type PlannedSessionTask = {
  section: Exclude<SessionSection, "full">;
  taskType: string;
};

const FULL_MOCK_TASKS: PlannedSessionTask[] = [
  { section: "speaking", taskType: "read_aloud" },
  { section: "speaking", taskType: "read_aloud" },
  { section: "speaking", taskType: "repeat_sentence" },
  { section: "speaking", taskType: "repeat_sentence" },
  { section: "speaking", taskType: "describe_image" },
  { section: "speaking", taskType: "describe_image" },
  { section: "speaking", taskType: "retell_lecture" },
  { section: "speaking", taskType: "answer_short_question" },
  { section: "speaking", taskType: "respond_to_situation" },
  { section: "speaking", taskType: "summarize_group_discussion" },
  { section: "writing", taskType: "summarize_written_text" },
  { section: "writing", taskType: "write_essay" },
  { section: "reading", taskType: "multiple_choice_single" },
  { section: "reading", taskType: "multiple_choice_multiple" },
  { section: "reading", taskType: "reorder_paragraphs" },
  { section: "reading", taskType: "fill_blanks_reading" },
  { section: "reading", taskType: "fill_blanks_reading" },
  { section: "reading", taskType: "fill_blanks_rw" },
  { section: "reading", taskType: "fill_blanks_rw" },
  { section: "listening", taskType: "summarize_spoken_text" },
  { section: "listening", taskType: "fill_blanks_listening" },
  { section: "listening", taskType: "highlight_correct_summary" },
  { section: "listening", taskType: "select_missing_word" },
  { section: "listening", taskType: "highlight_incorrect_words" },
  { section: "listening", taskType: "write_from_dictation" },
  { section: "listening", taskType: "write_from_dictation" },
];

const DIAGNOSTIC_TASKS: PlannedSessionTask[] = [
  { section: "speaking", taskType: "read_aloud" },
  { section: "speaking", taskType: "describe_image" },
  { section: "writing", taskType: "write_essay" },
  { section: "reading", taskType: "multiple_choice_single" },
  { section: "reading", taskType: "reorder_paragraphs" },
  { section: "listening", taskType: "summarize_spoken_text" },
  { section: "listening", taskType: "write_from_dictation" },
  { section: "listening", taskType: "highlight_incorrect_words" },
];

const SECTION_TASKS: Record<Exclude<SessionSection, "full">, string[]> = Object.fromEntries(
  Object.entries(SECTIONAL_TEST_CONFIG).map(([section, config]) => [section, config.taskTypes]),
) as Record<Exclude<SessionSection, "full">, string[]>;

export function buildSessionTaskPlan(input: {
  sessionType: SessionType;
  section?: SessionSection;
  mode?: SessionMode;
  totalQuestions?: number;
  targetTaskType?: string;
}): PlannedSessionTask[] {
  if (input.sessionType === "revision") return [];

  const requested = input.totalQuestions && input.totalQuestions > 0 ? input.totalQuestions : undefined;
  if (input.sessionType === "mock_test" || input.section === "full") {
    return FULL_MOCK_TASKS.slice(0, requested ?? FULL_MOCK_TASKS.length);
  }
  if (input.sessionType === "diagnostic" || input.mode === "diagnostic") {
    return DIAGNOSTIC_TASKS.slice(0, requested ?? DIAGNOSTIC_TASKS.length);
  }

  const section = input.section ?? "speaking";
  const sectionTasks = SECTION_TASKS[section];
  const canonicalTarget = input.targetTaskType ? normalizeTaskType(input.targetTaskType) : undefined;
  const targetIndex = canonicalTarget ? sectionTasks.indexOf(canonicalTarget) : -1;
  const orderedTasks = targetIndex > 0
    ? [...sectionTasks.slice(targetIndex), ...sectionTasks.slice(0, targetIndex)]
    : sectionTasks;

  return orderedTasks
    .slice(0, requested ?? orderedTasks.length)
    .map(taskType => ({ section, taskType }));
}

export function getFullMockTaskPlan(): PlannedSessionTask[] {
  return FULL_MOCK_TASKS.map(task => ({ ...task }));
}
