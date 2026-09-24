import { normalizeTaskType } from "@shared/taskTypeAliases";

/**
 * Some Listening tasks use a written response and need the section-specific
 * scorer after persistence. They must not receive a temporary generic
 * objective score if asynchronous scoring fails or is still in progress.
 */
export function shouldApplyImmediateObjectiveScore(section: string, taskType: string): boolean {
  if (!['reading', 'listening'].includes(section)) return false;

  return !(section === 'listening' && normalizeTaskType(taskType) === 'summarize_spoken_text');
}
