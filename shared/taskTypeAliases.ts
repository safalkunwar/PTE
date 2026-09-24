/**
 * Canonical task IDs used by the client, planner, and scoring contracts.
 *
 * Older question-bank imports used a few longer names. Keep the aliases here
 * so existing rows remain usable while future seeds can use canonical IDs.
 */
export const TASK_TYPE_ALIASES = {
  fill_in_blanks_reading: "fill_blanks_reading",
  fill_in_blanks_reading_writing: "fill_blanks_rw",
  fill_in_blanks_rw: "fill_blanks_rw",
  fill_in_blanks_listening: "fill_blanks_listening",
  multiple_choice_single_reading: "multiple_choice_single",
  multiple_choice_multiple_reading: "multiple_choice_multiple",
  multiple_choice_single_listening: "multiple_choice_single",
  multiple_choice_multiple_listening: "multiple_choice_multiple",
} as const;

export function normalizeTaskType(taskType: string): string {
  return TASK_TYPE_ALIASES[taskType as keyof typeof TASK_TYPE_ALIASES] ?? taskType;
}

/**
 * Return every persisted spelling that can satisfy a canonical task filter.
 * The canonical value is always first so newly-seeded rows are preferred.
 */
export function getTaskTypeVariants(taskType: string): string[] {
  const canonical = normalizeTaskType(taskType);
  const aliases = Object.entries(TASK_TYPE_ALIASES)
    .filter(([, mappedType]) => mappedType === canonical)
    .map(([alias]) => alias);
  return Array.from(new Set([canonical, ...aliases]));
}

export function taskTypesMatch(left: string, right: string): boolean {
  return normalizeTaskType(left) === normalizeTaskType(right);
}
