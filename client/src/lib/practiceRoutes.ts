export type PracticeSection = "speaking" | "writing" | "reading" | "listening";

import { normalizeTaskType } from "@shared/taskTypeAliases";

export type PracticeTaskLink = {
  taskType?: string;
  section?: PracticeSection;
  href?: string;
};

/**
 * Returns a route that exists in the current application. Task links stay on
 * the section practice page and use a query parameter to focus the task; the
 * existing Practice page then owns question selection and session creation.
 */
export function getPracticeTaskUrl(item: PracticeTaskLink): string {
  if (item.taskType && item.section) {
    return `/practice/${item.section}?taskType=${encodeURIComponent(item.taskType)}`;
  }
  return item.href || "/practice";
}

export const canonicalPracticeTaskTypes: Record<PracticeSection, string[]> = {
  speaking: [
    "personal_introduction",
    "read_aloud",
    "repeat_sentence",
    "describe_image",
    "retell_lecture",
    "answer_short_question",
    "respond_to_situation",
    "summarize_group_discussion",
  ],
  writing: ["summarize_written_text", "write_essay"],
  reading: [
    "multiple_choice_single",
    "multiple_choice_multiple",
    "reorder_paragraphs",
    "fill_blanks_reading",
    "fill_blanks_rw",
  ],
  listening: [
    "summarize_spoken_text",
    "multiple_choice_multiple",
    "fill_blanks_listening",
    "highlight_correct_summary",
    "multiple_choice_single",
    "select_missing_word",
    "highlight_incorrect_words",
    "write_from_dictation",
  ],
};

export function isCanonicalPracticeTask(section: PracticeSection, taskType: string): boolean {
  return canonicalPracticeTaskTypes[section].includes(normalizeTaskType(taskType));
}

export function isQuestionInPracticeSection(
  question: { section?: string | null; taskType: string },
  section: PracticeSection,
): boolean {
  return question.section === section && isCanonicalPracticeTask(section, question.taskType);
}

export function getPracticeSectionForTask(taskType: string): PracticeSection | undefined {
  const canonicalTaskType = normalizeTaskType(taskType);
  return (Object.entries(canonicalPracticeTaskTypes) as Array<[PracticeSection, string[]]>).find(([, tasks]) => tasks.includes(canonicalTaskType))?.[0];
}

export function isPracticeModuleRoute(location: string, section: PracticeSection): boolean {
  const normalized = location.split("?")[0].replace(/\/+$/, "") || "/";
  return normalized === `/practice/${section}` || normalized.startsWith(`/practice/${section}/`);
}
