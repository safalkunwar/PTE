import { describe, expect, it } from "vitest";
import { scoreObjectiveTask } from "./scoring";

describe("objective task scoring", () => {
  it("awards per-blank partial credit for Reading and Writing fill-in-the-blanks", () => {
    const result = scoreObjectiveTask({
      taskType: "fill_blanks_rw",
      correctAnswer: ["coherent", "evidence", "analysis"],
      userAnswer: ["coherent", "wrong", "analysis"],
    });

    expect(result.score).toBeCloseTo(200 / 3, 5);
    expect(result.normalizedScore).toBeGreaterThan(30);
    expect(result.normalizedScore).toBeLessThan(90);
    expect(result.feedback).toContain("2/3");
  });

  it("applies the same ordered partial credit to legacy Fill in the Blanks identifiers", () => {
    const result = scoreObjectiveTask({
      taskType: "fill_in_blanks_reading_writing",
      correctAnswer: JSON.stringify({ gap1: "curb", gap2: "capacity" }),
      userAnswer: ["curb", "wrong"],
    });

    expect(result.score).toBe(50);
    expect(result.feedback).toContain("1/2");
  });

  it("parses comma-separated listening blank responses in order", () => {
    const result = scoreObjectiveTask({
      taskType: "fill_blanks_listening",
      correctAnswer: ["climate", "policy", "research"],
      userAnswer: "climate, policy, incorrect",
    });

    expect(result.score).toBeCloseTo(200 / 3, 5);
    expect(result.feedback).toContain("2/3");
  });

  it("parses persisted JSON Reorder Paragraphs keys before awarding adjacent-pair partial credit", () => {
    const result = scoreObjectiveTask({
      taskType: "reorder_paragraphs",
      correctAnswer: JSON.stringify(["B", "D", "A", "C"]),
      userAnswer: ["B", "D", "C", "A"],
    });

    expect(result.score).toBeCloseTo(100 / 3, 5);
    expect(result.feedback).toContain("Needs improvement");
  });

  it("keeps single-answer multiple choice binary", () => {
    const result = scoreObjectiveTask({
      taskType: "multiple_choice_single",
      correctAnswer: "option-a",
      userAnswer: "option-b",
    });

    expect(result.score).toBe(0);
    expect(result.normalizedScore).toBe(10);
  });

  it("parses persisted JSON multiple-answer keys before applying selection partial credit", () => {
    const result = scoreObjectiveTask({
      taskType: "multiple_choice_multiple",
      correctAnswer: JSON.stringify(["A", "B", "C"]),
      userAnswer: ["A", "B", "D"],
    });

    expect(result.score).toBeCloseTo(100 / 3, 5);
    expect(result.normalizedScore).toBeGreaterThan(10);
  });
});
