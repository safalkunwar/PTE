import { describe, expect, it } from "vitest";
import { auditQuestion } from "./questionAudit";
import { PTE_TASK_PROCEDURES } from "./pteTaskConfig";

describe("Pearson question audit", () => {
  it("accepts a normal Read Aloud prompt within the word limit", () => {
    expect(auditQuestion({ taskType: "read_aloud", content: "This is a short passage for oral reading.", difficulty: "medium" }).valid).toBe(true);
  });

  it("rejects an oversized Read Aloud prompt", () => {
    expect(auditQuestion({ taskType: "read_aloud", content: Array.from({ length: 61 }, () => "word").join(" "), difficulty: "medium" }).issues).toContain("Read Aloud prompt exceeds the 60-word Pearson limit");
  });

  it("requires a distinct visual asset for Describe Image", () => {
    expect(auditQuestion({ taskType: "describe_image", content: "Describe this chart", difficulty: "hard" }).valid).toBe(false);
    expect(auditQuestion({ taskType: "describe_image", imageUrl: "/assets/chart.png", difficulty: "hard" }).valid).toBe(true);
  });

  it("requires options for objective selection tasks", () => {
    expect(auditQuestion({ taskType: "multiple_choice_single", content: "Choose one", difficulty: "easy" }).valid).toBe(false);
    expect(auditQuestion({ taskType: "multiple_choice_single", content: "Choose one", options: ["A", "B"], correctAnswer: "A", difficulty: "easy" }).valid).toBe(true);
  });

  it("requires a reference answer for deterministic objective scoring", () => {
    expect(auditQuestion({ taskType: "write_from_dictation", content: "Write this sentence.", difficulty: "medium" }).issues)
      .toContain("objective scoring task requires a reference answer");
    expect(auditQuestion({ taskType: "write_from_dictation", content: "Write this sentence.", correctAnswer: "Write this sentence.", difficulty: "medium" }).valid)
      .toBe(true);
  });

  it("rejects unsupported difficulty metadata", () => {
    expect(auditQuestion({ taskType: "write_essay", content: "Discuss the topic.", difficulty: "expert" }).valid).toBe(false);
  });

  it("allows practice-mode transcript fallbacks for audio-first tasks", () => {
    expect(auditQuestion({ taskType: "retell_lecture", content: "A lecture transcript is available for practice fallback.", difficulty: "hard" }).valid).toBe(true);
  });

  it("accepts a representative, structurally valid fixture for every canonical task procedure", () => {
    for (const [taskType, procedure] of Object.entries(PTE_TASK_PROCEDURES)) {
      const fixture = {
        taskType,
        content: "A representative practice prompt is available for this task.",
        difficulty: "medium",
        ...(procedure.requiresOptions ? { options: ["Option A", "Option B"] } : {}),
        correctAnswer: "Option A",
        ...(taskType === "describe_image" ? { imageUrl: "/assets/task-audit-image.png" } : {}),
      };
      expect(auditQuestion(fixture), taskType).toMatchObject({ valid: true, issues: [] });
    }
  });
});
