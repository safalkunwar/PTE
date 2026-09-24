import { describe, expect, it } from "vitest";
import { getTaskTypeVariants, normalizeTaskType, taskTypesMatch } from "./taskTypeAliases";

describe("task type aliases", () => {
  it("normalizes known legacy seed names to canonical IDs", () => {
    expect(normalizeTaskType("fill_in_blanks_reading")).toBe("fill_blanks_reading");
    expect(normalizeTaskType("multiple_choice_single_listening")).toBe("multiple_choice_single");
    expect(normalizeTaskType("read_aloud")).toBe("read_aloud");
  });

  it("returns canonical and legacy variants for database filtering", () => {
    expect(getTaskTypeVariants("fill_blanks_listening")).toEqual([
      "fill_blanks_listening",
      "fill_in_blanks_listening",
    ]);
  });

  it("compares task IDs after normalization", () => {
    expect(taskTypesMatch("multiple_choice_single_listening", "multiple_choice_single")).toBe(true);
    expect(taskTypesMatch("write_essay", "summarize_written_text")).toBe(false);
  });
});
