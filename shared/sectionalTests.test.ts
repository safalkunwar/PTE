import { describe, expect, it } from "vitest";
import { getSectionalTestConfig, SECTIONAL_TEST_CONFIG } from "./sectionalTests";

describe("sectional test catalog", () => {
  it("covers all four PTE sections with runnable task plans", () => {
    expect(Object.keys(SECTIONAL_TEST_CONFIG)).toEqual(["speaking", "writing", "reading", "listening"]);
    for (const config of Object.values(SECTIONAL_TEST_CONFIG)) {
      expect(config.questionCount).toBe(config.taskTypes.length);
      expect(config.durationMinutes).toBeGreaterThan(0);
      expect(config.description.length).toBeGreaterThan(20);
    }
  });

  it("returns accurate section-specific counts", () => {
    expect(getSectionalTestConfig("speaking")?.questionCount).toBe(8);
    expect(getSectionalTestConfig("writing")?.questionCount).toBe(2);
    expect(getSectionalTestConfig("reading")?.questionCount).toBe(5);
    expect(getSectionalTestConfig("listening")?.questionCount).toBe(8);
  });

  it("returns undefined for an unsupported section", () => {
    expect(getSectionalTestConfig("grammar")).toBeUndefined();
  });
});
