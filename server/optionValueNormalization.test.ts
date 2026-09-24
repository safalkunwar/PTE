import { describe, expect, it } from "vitest";
import { normalizeOptionValues, parseDelimitedAnswers, parseOrderedAnswerKey } from "./optionValueNormalization";

describe("option value normalization", () => {
  it("maps letter IDs from string-array options to their displayed option text", () => {
    const result = normalizeOptionValues(
      JSON.stringify(["First summary", "Correct summary", "Third summary"]),
      "Correct summary",
      ["B"],
    );

    expect(result.correctAnswers).toEqual(["Correct summary"]);
    expect(result.selectedOptions).toEqual(["Correct summary"]);
  });

  it("maps ID-based imported keys and selections from object options", () => {
    const result = normalizeOptionValues(
      JSON.stringify([{ id: "a", text: "Distractor" }, { id: "b", text: "Supported claim" }]),
      "b",
      ["b"],
    );

    expect(result.correctAnswers).toEqual(["Supported claim"]);
    expect(result.selectedOptions).toEqual(["Supported claim"]);
  });

  it("preserves JSON array and object answer-key order", () => {
    expect(parseOrderedAnswerKey('["tectonic","faultline"]')).toEqual(["tectonic", "faultline"]);
    expect(parseOrderedAnswerKey('{"gap1":"tectonic","gap2":"faultline"}')).toEqual(["tectonic", "faultline"]);
  });

  it("splits legacy comma-separated Listening FIB keys and responses", () => {
    expect(parseDelimitedAnswers("86,junctions,formed,consolidating")).toEqual([
      "86", "junctions", "formed", "consolidating",
    ]);
  });
});
