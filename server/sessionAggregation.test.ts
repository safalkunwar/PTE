import { describe, expect, it } from "vitest";
import { filterScoredSessionResponses, selectLatestPlannedResponses } from "./sessionAggregation";

describe("selectLatestPlannedResponses", () => {
  it("keeps the planned order and only one response per question", () => {
    const responses = [
      { questionId: 1, score: 40 },
      { questionId: 2, score: 60 },
      { questionId: 1, score: 75 },
    ];

    expect(selectLatestPlannedResponses(responses, [{ questionId: 1 }, { questionId: 2 }])).toEqual([
      { questionId: 1, score: 75 },
      { questionId: 2, score: 60 },
    ]);
  });

  it("preserves response order for non-planned sessions", () => {
    const responses = [{ questionId: 3 }, { questionId: 1 }];
    expect(selectLatestPlannedResponses(responses, [])).toEqual(responses);
  });

  it("excludes Personal Introduction from score aggregation while retaining scored questions", () => {
    const responses = [
      { questionId: 1, question: { taskType: "personal_introduction", section: "speaking" } },
      { questionId: 2, question: { taskType: "read_aloud", section: "speaking" } },
    ];

    expect(filterScoredSessionResponses(responses)).toEqual([responses[1]]);
  });
});
