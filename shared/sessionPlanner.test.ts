import { describe, expect, it } from "vitest";
import { buildSessionTaskPlan, getFullMockTaskPlan } from "./sessionPlanner";

describe("buildSessionTaskPlan", () => {
  it("builds a full mock plan with the canonical cross-section order", () => {
    const plan = buildSessionTaskPlan({
      sessionType: "mock_test",
      section: "full",
      mode: "exam",
      totalQuestions: 20,
    });

    expect(plan.length).toBeGreaterThanOrEqual(20);
    expect(plan[0]).toEqual({ section: "speaking", taskType: "read_aloud" });
    expect(plan.at(-1)).toEqual({ section: "listening", taskType: "summarize_spoken_text" });
  });

  it("builds the complete Reading sectional-test sequence", () => {
    const plan = buildSessionTaskPlan({
      sessionType: "section_practice",
      section: "reading",
      mode: "exam",
      totalQuestions: 5,
    });

    expect(plan.map(task => task.taskType)).toEqual([
      "multiple_choice_single",
      "multiple_choice_multiple",
      "reorder_paragraphs",
      "fill_blanks_reading",
      "fill_blanks_rw",
    ]);
  });

  it("limits section practice to the requested number of tasks", () => {
    const plan = buildSessionTaskPlan({
      sessionType: "section_practice",
      section: "reading",
      mode: "exam",
      totalQuestions: 3,
    });

    expect(plan).toEqual([
      { section: "reading", taskType: "multiple_choice_single" },
      { section: "reading", taskType: "multiple_choice_multiple" },
      { section: "reading", taskType: "reorder_paragraphs" },
    ]);
  });

  it("uses a broad diagnostic sample and leaves revision to its dedicated flow", () => {
    expect(buildSessionTaskPlan({ sessionType: "diagnostic", section: "full", mode: "diagnostic", totalQuestions: 8 })).toHaveLength(8);
    expect(buildSessionTaskPlan({ sessionType: "revision", section: "speaking", mode: "revision", totalQuestions: 5 })).toEqual([]);
  });

  it("exposes Personal Introduction in Speaking practice without adding it to the scored full mock", () => {
    const speakingPlan = buildSessionTaskPlan({ sessionType: "section_practice", section: "speaking", mode: "exam", totalQuestions: 1 });
    expect(speakingPlan[0]).toEqual({ section: "speaking", taskType: "personal_introduction" });
    expect(getFullMockTaskPlan().some(task => task.taskType === "personal_introduction")).toBe(false);
  });

  it("includes both Listening multiple-choice variants in section practice", () => {
    const listeningPlan = buildSessionTaskPlan({ sessionType: "section_practice", section: "listening", mode: "exam" });
    expect(listeningPlan.map(task => task.taskType)).toEqual([
      "summarize_spoken_text",
      "multiple_choice_multiple",
      "fill_blanks_listening",
      "highlight_correct_summary",
      "multiple_choice_single",
      "select_missing_word",
      "highlight_incorrect_words",
      "write_from_dictation",
    ]);
  });

  it("starts section practice with the selected task instead of the section default", () => {
    expect(buildSessionTaskPlan({
      sessionType: "section_practice",
      section: "speaking",
      mode: "exam",
      totalQuestions: 1,
      targetTaskType: "describe_image",
    })).toEqual([{ section: "speaking", taskType: "describe_image" }]);

    expect(buildSessionTaskPlan({
      sessionType: "section_practice",
      section: "listening",
      mode: "exam",
      totalQuestions: 1,
      targetTaskType: "multiple_choice_single_listening",
    })).toEqual([{ section: "listening", taskType: "multiple_choice_single" }]);
  });

  it("rotates a multi-question section plan from the selected task", () => {
    const plan = buildSessionTaskPlan({
      sessionType: "section_practice",
      section: "writing",
      mode: "exam",
      totalQuestions: 2,
      targetTaskType: "write_essay",
    });

    expect(plan).toEqual([
      { section: "writing", taskType: "write_essay" },
      { section: "writing", taskType: "summarize_written_text" },
    ]);
  });
});
