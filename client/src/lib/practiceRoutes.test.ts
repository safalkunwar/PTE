import { describe, expect, it } from "vitest";
import {
  canonicalPracticeTaskTypes,
  getPracticeSectionForTask,
  getPracticeTaskUrl,
  isQuestionInPracticeSection,
  isCanonicalPracticeTask,
  isPracticeModuleRoute,
} from "./practiceRoutes";

describe("practice route mapping", () => {
  it("routes task links through the existing Practice section route", () => {
    expect(getPracticeTaskUrl({ section: "speaking", taskType: "read_aloud" })).toBe(
      "/practice/speaking?taskType=read_aloud",
    );
  });

  it("preserves a valid feature route for non-task menu entries", () => {
    expect(getPracticeTaskUrl({ href: "/analytics" })).toBe("/analytics");
    expect(getPracticeTaskUrl({})).toBe("/practice");
  });

  it("recognizes every canonical task in its section", () => {
    expect(isCanonicalPracticeTask("speaking", "personal_introduction")).toBe(true);
    expect(isCanonicalPracticeTask("speaking", "read_aloud")).toBe(true);
    expect(isCanonicalPracticeTask("writing", "email_writing")).toBe(false);
    expect(isCanonicalPracticeTask("listening", "multiple_choice_single")).toBe(true);
    expect(isCanonicalPracticeTask("listening", "multiple_choice_multiple")).toBe(true);
    expect(isCanonicalPracticeTask("listening", "write_from_dictation")).toBe(true);
  });

  it("maps a task type back to its learner-facing module", () => {
    expect(getPracticeSectionForTask("fill_blanks_rw")).toBe("reading");
    expect(getPracticeSectionForTask("summarize_spoken_text")).toBe("listening");
    expect(getPracticeSectionForTask("unknown_task")).toBeUndefined();
  });

  it("normalizes persisted legacy task aliases for practice routing", () => {
    expect(isCanonicalPracticeTask("reading", "fill_in_blanks_reading")).toBe(true);
    expect(getPracticeSectionForTask("fill_in_blanks_reading_writing")).toBe("reading");
    expect(getPracticeSectionForTask("fill_in_blanks_listening")).toBe("listening");
  });

  it("keeps practice questions inside the selected module", () => {
    expect(isQuestionInPracticeSection({ section: "speaking", taskType: "read_aloud" }, "speaking")).toBe(true);
    expect(isQuestionInPracticeSection({ section: "reading", taskType: "read_aloud" }, "speaking")).toBe(false);
    expect(isQuestionInPracticeSection({ section: "listening", taskType: "multiple_choice_single" }, "listening")).toBe(true);
    expect(isQuestionInPracticeSection({ section: "reading", taskType: "multiple_choice_single" }, "listening")).toBe(false);
  });

  it("keeps the four module task lists non-empty", () => {
    for (const taskTypes of Object.values(canonicalPracticeTaskTypes)) {
      expect(taskTypes.length).toBeGreaterThan(0);
    }
  });

  it("matches active module roots, nested tasks, and query-string routes", () => {
    expect(isPracticeModuleRoute("/practice/speaking", "speaking")).toBe(true);
    expect(isPracticeModuleRoute("/practice/speaking?taskType=read_aloud", "speaking")).toBe(true);
    expect(isPracticeModuleRoute("/practice/speaking/read-aloud", "speaking")).toBe(true);
    expect(isPracticeModuleRoute("/practice/writing", "speaking")).toBe(false);
    expect(isPracticeModuleRoute("/practice/speaking-extra", "speaking")).toBe(false);
    expect(isPracticeModuleRoute("/dashboard", "speaking")).toBe(false);
  });
});
