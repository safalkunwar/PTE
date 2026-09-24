import { describe, expect, it } from "vitest";
import { getDedicatedPracticeModeRoute } from "./practiceModeRouting";

describe("practice mode routing", () => {
  it("keeps Revision Mode on the dedicated spaced-repetition route", () => {
    expect(getDedicatedPracticeModeRoute("revision")).toBe("/revision");
  });

  it("creates normal practice sessions for the other modes", () => {
    expect(getDedicatedPracticeModeRoute("beginner")).toBeNull();
    expect(getDedicatedPracticeModeRoute("exam")).toBeNull();
    expect(getDedicatedPracticeModeRoute("diagnostic")).toBeNull();
  });
});
