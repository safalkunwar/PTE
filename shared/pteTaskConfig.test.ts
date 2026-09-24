import { describe, expect, it } from "vitest";
import { getPteTaskProcedure } from "./pteTaskConfig";

describe("Pearson task procedures", () => {
  it("resolves listening multiple-choice procedures by section", () => {
    expect(getPteTaskProcedure("multiple_choice_multiple", "listening")).toMatchObject({
      promptSource: "audio",
      audioPlaysOnce: true,
      responseKind: "multiple_choice",
      section: "listening",
    });
    expect(getPteTaskProcedure("multiple_choice_multiple", "reading")).toMatchObject({
      promptSource: "text",
      audioPlaysOnce: false,
      section: "reading",
    });
  });

  it("enforces the current Pearson speaking timings", () => {
    expect(getPteTaskProcedure("describe_image", "speaking")).toMatchObject({ preparationSeconds: 25, responseSeconds: 40 });
    expect(getPteTaskProcedure("summarize_group_discussion", "speaking")).toMatchObject({ preparationSeconds: 10, responseSeconds: 120 });
    expect(getPteTaskProcedure("respond_to_situation", "speaking")).toMatchObject({ preparationSeconds: 10, responseSeconds: 40 });
  });
});
