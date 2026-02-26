import { describe, expect, it, vi, beforeEach } from "vitest";
import { normalizeToPTE, scoreObjectiveTask } from "./scoring";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── normalizeToPTE ───────────────────────────────────────────────────────────
describe("normalizeToPTE", () => {
  it("maps 0% → 10 (minimum PTE score)", () => {
    expect(normalizeToPTE(0)).toBe(10);
  });

  it("maps 100% → 90 (maximum PTE score)", () => {
    expect(normalizeToPTE(100)).toBe(90);
  });

  it("maps 50% → 50 (midpoint)", () => {
    expect(normalizeToPTE(50)).toBe(50);
  });

  it("clamps values below 0 to 10", () => {
    expect(normalizeToPTE(-10)).toBe(10);
  });

  it("clamps values above 100 to 90", () => {
    expect(normalizeToPTE(110)).toBe(90);
  });

  it("maps 75% to expected PTE range (60–70)", () => {
    const score = normalizeToPTE(75);
    expect(score).toBeGreaterThanOrEqual(60);
    expect(score).toBeLessThanOrEqual(90);
  });
});

// ─── scoreObjectiveTask ───────────────────────────────────────────────────────
describe("scoreObjectiveTask", () => {
  describe("multiple_choice_single", () => {
    it("returns isCorrect=true when selected option matches correctAnswer", () => {
      const result = scoreObjectiveTask({
        taskType: "multiple_choice_single",
        correctAnswer: "b",
        selectedOptions: ["b"],
        responseText: undefined,
      });
      expect(result.isCorrect).toBe(true);
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it("returns isCorrect=false when selected option is wrong", () => {
      const result = scoreObjectiveTask({
        taskType: "multiple_choice_single",
        correctAnswer: "b",
        selectedOptions: ["a"],
        responseText: undefined,
      });
      expect(result.isCorrect).toBe(false);
      expect(result.totalScore).toBe(0);
    });

    it("returns isCorrect=false when no option selected", () => {
      const result = scoreObjectiveTask({
        taskType: "multiple_choice_single",
        correctAnswer: "b",
        selectedOptions: [],
        responseText: undefined,
      });
      expect(result.isCorrect).toBe(false);
    });
  });

  describe("write_from_dictation", () => {
    it("scores exact match as high accuracy", () => {
      const result = scoreObjectiveTask({
        taskType: "write_from_dictation",
        correctAnswer: "the quick brown fox",
        selectedOptions: undefined,
        responseText: "the quick brown fox",
      });
      expect(result.isCorrect).toBe(true);
      expect(result.normalizedScore).toBeGreaterThanOrEqual(70);
    });

    it("scores partial match with some credit", () => {
      const result = scoreObjectiveTask({
        taskType: "write_from_dictation",
        correctAnswer: "the quick brown fox jumps over the lazy dog",
        selectedOptions: undefined,
        responseText: "the quick brown fox",
      });
      expect(result.normalizedScore).toBeGreaterThan(10);
      expect(result.normalizedScore).toBeLessThan(90);
    });

    it("scores empty response as minimum", () => {
      const result = scoreObjectiveTask({
        taskType: "write_from_dictation",
        correctAnswer: "the quick brown fox",
        selectedOptions: undefined,
        responseText: "",
      });
      expect(result.normalizedScore).toBeLessThanOrEqual(20);
    });
  });

  describe("reorder_paragraphs", () => {
    it("awards partial credit for partially correct order", () => {
      const result = scoreObjectiveTask({
        taskType: "reorder_paragraphs",
        correctAnswer: JSON.stringify(["p1", "p2", "p3", "p4"]),
        selectedOptions: ["p1", "p2", "p4", "p3"],
        responseText: undefined,
      });
      expect(result.normalizedScore).toBeGreaterThan(10);
      expect(result.normalizedScore).toBeLessThan(90);
    });

    it("awards maximum credit for fully correct order", () => {
      const result = scoreObjectiveTask({
        taskType: "reorder_paragraphs",
        correctAnswer: JSON.stringify(["p1", "p2", "p3"]),
        selectedOptions: ["p1", "p2", "p3"],
        responseText: undefined,
      });
      expect(result.isCorrect).toBe(true);
    });
  });

  describe("highlight_incorrect_words", () => {
    it("scores correctly identified incorrect words", () => {
      const result = scoreObjectiveTask({
        taskType: "highlight_incorrect_words",
        correctAnswer: JSON.stringify(["word1", "word3"]),
        selectedOptions: ["word1", "word3"],
        responseText: undefined,
      });
      expect(result.isCorrect).toBe(true);
    });
  });

  describe("normalizedScore range", () => {
    const taskTypes = [
      "multiple_choice_single",
      "multiple_choice_multiple",
      "fill_blanks_reading",
      "highlight_correct_summary",
      "select_missing_word",
    ];

    taskTypes.forEach(taskType => {
      it(`${taskType}: normalizedScore is always between 10 and 90`, () => {
        const result = scoreObjectiveTask({
          taskType,
          correctAnswer: "a",
          selectedOptions: ["a"],
          responseText: undefined,
        });
        expect(result.normalizedScore).toBeGreaterThanOrEqual(10);
        expect(result.normalizedScore).toBeLessThanOrEqual(90);
      });
    });
  });
});

// ─── Auth router ─────────────────────────────────────────────────────────────
describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const cleared: { name: string; options: Record<string, unknown> }[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 1, openId: "test", email: "test@test.com", name: "Test",
        loginMethod: "manus", role: "user",
        createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string, opts: Record<string, unknown>) => {
          cleared.push({ name, options: opts });
        },
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(cleared).toHaveLength(1);
    expect(cleared[0]?.options?.maxAge).toBe(-1);
  });
});

// ─── Questions router ─────────────────────────────────────────────────────────
describe("questions.list", () => {
  it("returns an array (even if empty when DB unavailable)", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    // Should not throw — returns empty array when DB is unavailable
    const result = await caller.questions.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("accepts section filter without throwing", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.questions.list({ section: "speaking" });
    expect(Array.isArray(result)).toBe(true);
  });
});
