import { describe, it, expect } from "vitest";
import { PTE_TASK_PROCEDURES, getPteTaskProcedure } from "../shared/pteTaskConfig";
import { normalizeTaskType } from "../shared/taskTypeAliases";

const ALL_20_TASKS = [
  "personal_introduction",
  "read_aloud",
  "repeat_sentence",
  "describe_image",
  "retell_lecture",
  "answer_short_question",
  "summarize_group_discussion",
  "respond_to_situation",
  "summarize_written_text",
  "write_essay",
  "fill_blanks_reading",
  "multiple_choice_multiple",
  "reorder_paragraphs",
  "fill_blanks_rw",
  "multiple_choice_single",
  "summarize_spoken_text",
  "fill_blanks_listening",
  "highlight_correct_summary",
  "select_missing_word",
  "highlight_incorrect_words",
  "write_from_dictation",
];

describe("Comprehensive All-Task PTE Compliance Suite", () => {
  it("defines exactly or more than 20 Pearson-aligned task procedures", () => {
    const keys = Object.keys(PTE_TASK_PROCEDURES);
    expect(keys.length).toBeGreaterThanOrEqual(20);
  });

  it("normalizes and resolves procedure specs for every core task type", () => {
    for (const task of ALL_20_TASKS) {
      const normalized = normalizeTaskType(task);
      const proc = getPteTaskProcedure(normalized);
      expect(proc).toBeDefined();
      expect(proc?.label).toBeTruthy();
      expect(proc?.section).toBeTruthy();
    }
  });

  it("enforces scoring rules and timing properties across tasks", () => {
    const readAloud = getPteTaskProcedure("read_aloud");
    expect(readAloud?.scored).toBe(true);
    expect(readAloud?.preparationSeconds).toBeGreaterThan(0);

    const intro = getPteTaskProcedure("personal_introduction");
    expect(intro?.scored).toBe(false);

    const wfd = getPteTaskProcedure("write_from_dictation");
    expect(wfd?.scored).toBe(true);
    expect(wfd?.promptSource).toBe("audio");
  });
});
