import { describe, expect, it } from "vitest";
import { advanceCountdown, getSpeakingTiming, SPEAKING_TIMINGS } from "./speakingTiming";
import { getPteTaskProcedure } from "@shared/pteTaskConfig";

describe("speaking timing contract", () => {
  it("keeps task-specific preparation and response timings", () => {
    expect(getSpeakingTiming("personal_introduction")).toEqual({ prep: 25, record: 30, label: "Personal Introduction (unscored)" });
    expect(getSpeakingTiming("read_aloud")).toEqual({ prep: 40, record: 40, label: "Read Aloud" });
    expect(getSpeakingTiming("repeat_sentence")).toEqual({ prep: 0, record: 15, label: "Repeat Sentence" });
    expect(getSpeakingTiming("describe_image")).toEqual({ prep: 25, record: 40, label: "Describe Image" });
    expect(getSpeakingTiming("retell_lecture")).toEqual({ prep: 10, record: 40, label: "Retell Lecture" });
    expect(getSpeakingTiming("answer_short_question")).toEqual({ prep: 0, record: 10, label: "Answer Short Question" });
    expect(getSpeakingTiming("summarize_group_discussion")).toEqual({ prep: 10, record: 120, label: "Summarize Group Discussion" });
    expect(getSpeakingTiming("respond_to_situation")).toEqual({ prep: 10, record: 40, label: "Respond to a Situation" });
    expect(Object.keys(SPEAKING_TIMINGS)).toHaveLength(8);
  });

  it("uses a safe default for unknown speaking tasks", () => {
    expect(getSpeakingTiming("unknown_task")).toEqual({ prep: 0, record: 40, label: "Speaking" });
  });

  it("stays aligned with the central PTE task procedure timings", () => {
    for (const [taskType, timing] of Object.entries(SPEAKING_TIMINGS)) {
      const procedure = getPteTaskProcedure(taskType, "speaking");
      expect(procedure?.preparationSeconds).toBe(timing.prep);
      expect(procedure?.responseSeconds).toBe(timing.record);
    }
  });

  it("transitions from the final second to a finished state without going negative", () => {
    expect(advanceCountdown(3)).toEqual({ remaining: 2, finished: false });
    expect(advanceCountdown(1)).toEqual({ remaining: 0, finished: true });
    expect(advanceCountdown(0)).toEqual({ remaining: 0, finished: true });
  });
});
