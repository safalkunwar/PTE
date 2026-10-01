import { describe, expect, it } from "vitest";
import { getDedicatedPracticeModeRoute } from "./practiceModeRouting";

describe("practice mode routing", () => {
  it("keeps Revision Mode on the dedicated spaced-repetition route", () => {
    expect(getDedicatedPracticeModeRoute("revision")).toBe("/revision");
  });

  it("routes Exam Mode to the real Mock Test flow", () => {
    expect(getDedicatedPracticeModeRoute("beginner")).toBeNull();
    expect(getDedicatedPracticeModeRoute("exam")).toBe("/mock-test");
    expect(getDedicatedPracticeModeRoute("diagnostic")).toBeNull();
  });
});
