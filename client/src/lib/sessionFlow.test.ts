import { describe, expect, it } from "vitest";
import { buildSessionQuestionUrl, getAdjacentQuestionIndex, resolveSessionQuestionId, shouldCompleteSession } from "./sessionFlow";

describe("session flow helpers", () => {
  it("builds a resumable question URL and preserves mock-test context", () => {
    expect(buildSessionQuestionUrl({ sessionId: 42, questionId: 301, mode: "exam", mockTest: true }))
      .toBe("/session/42?questionId=301&mode=exam&mockTest=true");
  });

  it("returns null at navigation boundaries", () => {
    expect(getAdjacentQuestionIndex(0, 3, "previous")).toBeNull();
    expect(getAdjacentQuestionIndex(2, 3, "next")).toBeNull();
    expect(getAdjacentQuestionIndex(1, 3, "previous")).toBe(0);
    expect(getAdjacentQuestionIndex(1, 3, "next")).toBe(2);
  });

  it("completes only on the final planned question", () => {
    expect(shouldCompleteSession(0, 5)).toBe(false);
    expect(shouldCompleteSession(4, 5)).toBe(true);
    expect(shouldCompleteSession(0, 1)).toBe(true);
  });

  it("never resolves a zero or negative question ID", () => {
    expect(resolveSessionQuestionId(0, -1, undefined, 305)).toBe(305);
    expect(resolveSessionQuestionId(0, null, undefined)).toBeNull();
    expect(resolveSessionQuestionId(0.5, 306)).toBe(306);
  });
});
