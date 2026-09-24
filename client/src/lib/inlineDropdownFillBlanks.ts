import { normalizeTaskType } from "@shared/taskTypeAliases";

export function isInlineDropdownFillBlanksTask(taskType: string): boolean {
  return normalizeTaskType(taskType) === "fill_blanks_rw";
}

export function getInlineDropdownBlankIds(content: string | null | undefined): string[] {
  const matches = content?.matchAll(/\[\[(gap\d+)\]\]|\{(gap\d+)\}/g) ?? [];
  return Array.from(matches, (match) => match[1] ?? match[2]);
}

export function hasCompleteInlineDropdownSelection(content: string | null | undefined, selections: string[]): boolean {
  const blankCount = getInlineDropdownBlankIds(content).length;
  return blankCount > 0
    && selections.length === blankCount
    && selections.every((selection) => selection.trim().length > 0);
}
