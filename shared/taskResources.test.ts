import { describe, expect, it } from "vitest";
import { getTaskStudyResource, TASK_STUDY_RESOURCES } from "./taskResources";

describe("task study resource catalog", () => {
  it("provides study guides for major PTE task types", () => {
    expect(getTaskStudyResource("read_aloud").title).toContain("Read Aloud");
    expect(getTaskStudyResource("write_essay").title).toContain("Write Essay");
    expect(getTaskStudyResource("write_from_dictation").title).toContain("Write from Dictation");
  });

  it("resolves section-specific aliases and the unscored Personal Introduction guide", () => {
    expect(getTaskStudyResource("reading_writing_fill_blanks").title).toContain("Fill in the Blanks");
    expect(getTaskStudyResource("listening_multiple_choice_single").title).toContain("Multiple Choice");
    expect(getTaskStudyResource("listening_multiple_choice_multiple").title).toContain("Multiple Choice");
    expect(getTaskStudyResource("personal_introduction").sampleBreakdown.description).toContain("not scored");
  });

  it("returns a fallback guide for unknown task types", () => {
    expect(getTaskStudyResource("unknown_task").title).toBe("PTE Task Study Guide");
  });

  it("contains rich content including templates and mistakes for core tasks", () => {
    const resource = getTaskStudyResource("describe_image");
    expect(resource.templates.length).toBeGreaterThan(0);
    expect(resource.commonMistakes.length).toBeGreaterThan(0);
    expect(resource.sampleBreakdown).toBeDefined();
  });

  it("provides expanded format, checklist, and drills for every canonical task", () => {
    for (const taskType of Object.keys(TASK_STUDY_RESOURCES)) {
      const resource = getTaskStudyResource(taskType);
      expect(resource.timingAndFormat).toBeTruthy();
      expect(resource.stepByStep?.length).toBeGreaterThanOrEqual(3);
      expect(resource.quickChecklist?.length).toBeGreaterThanOrEqual(3);
      expect(resource.practiceDrills?.length).toBeGreaterThanOrEqual(2);
    }
  });
});
