import { normalizeTaskType } from "@shared/taskTypeAliases";

export function isReadingAnswerBankTask(taskType: string): boolean {
  return normalizeTaskType(taskType) === "fill_blanks_reading";
}

export function getReadingBlankCount(content: string | null | undefined): number {
  return (content?.match(/_____/g) ?? []).length;
}

export function hasCompleteReadingAnswerBankSelection(content: string | null | undefined, selections: string[]): boolean {
  const blankCount = getReadingBlankCount(content);
  return blankCount > 0
    && selections.length === blankCount
    && selections.every((selection) => selection.trim().length > 0);
}
