import { describe, expect, it } from "vitest";
import { normalizeTaskType } from "../shared/taskTypeAliases";
import { scoreObjectiveTask } from "./scoring";
import { hasRequiredQuestionContent, hasScoreableResponse } from "../shared/pteValidation";

const ALL_20_TASKS = [
  "read_aloud",
  "repeat_sentence",
  "describe_image",
  "retell_lecture",
  "answer_short_question",
  "summarize_group_discussion",
  "respond_to_situation",
  "summarize_written_text",
  "write_essay",
  "multiple_choice_single",
  "multiple_choice_multiple",
  "reorder_paragraphs",
  "fill_blanks_reading",
  "fill_blanks_rw",
  "summarize_spoken_text",
  "fill_blanks_listening",
  "highlight_correct_summary",
  "select_missing_word",
  "highlight_incorrect_words",
  "write_from_dictation",
];

describe("Complete 20-Task PTE Matrix Validation Suite", () => {
  it("normalizes and validates all 20 canonical task types", () => {
    for (const task of ALL_20_TASKS) {
      const normalized = normalizeTaskType(task);
      expect(normalized).toBe(task);
    }
  });

  it("validates objective scoring across objective task types", () => {
    const mcResult = scoreObjectiveTask({
      taskType: "multiple_choice_single",
      correctAnswer: "B",
      userAnswer: "B",
    });
    expect(mcResult.score).toBe(100);

    const fillResult = scoreObjectiveTask({
      taskType: "fill_blanks_reading",
      correctAnswer: JSON.stringify({ gap1: "ecosystem", gap2: "biodiversity" }),
      userAnswer: ["ecosystem", "biodiversity"],
    });
    expect(fillResult.score).toBe(100);
  });

  it("validates content and response checks for task shapes", () => {
    const sampleQuestion = {
      id: 1,
      section: "reading" as const,
      taskType: "multiple_choice_single",
      title: "Test Question",
      prompt: "Select correct option",
      content: "Sample passage text...",
      correctAnswer: "A",
      options: ["A", "B", "C", "D"],
    };

    const contentCheck = hasRequiredQuestionContent(sampleQuestion);
    expect(contentCheck.valid).toBe(true);

    const responseCheck = hasScoreableResponse(sampleQuestion, { selectedOptions: ["A"] });
    expect(responseCheck.valid).toBe(true);
  });
});
