import { describe, expect, it } from "vitest";
import { parseGeneratedQuestion } from "./adminQuestionGeneration";

describe("admin AI question generation parsing", () => {
  const valid = {
    title: "Climate change",
    prompt: "Read the passage.",
    content: "Climate change affects ecosystems.",
    correctAnswer: "suppress",
    modelAnswer: "Climate change affects ecosystems.",
    options: [],
    timeLimit: 30,
    preparationTime: 0,
    wordLimit: null,
    audioUrl: null,
    imageUrl: null,
  };

  it("parses strict JSON and preserves answer strings", () => {
    expect(parseGeneratedQuestion(JSON.stringify(valid)).correctAnswer).toBe("suppress");
  });

  it("accepts fenced JSON returned by an imperfect model", () => {
    const fenced = "```json\n" + JSON.stringify(valid) + "\n```";
    expect(parseGeneratedQuestion(fenced).title).toBe("Climate change");
  });

  it("serializes array and object answer keys for the text database column", () => {
    expect(parseGeneratedQuestion(JSON.stringify({ ...valid, correctAnswer: ["one", "two"] })).correctAnswer).toBe('["one","two"]');
    expect(parseGeneratedQuestion(JSON.stringify({ ...valid, correctAnswer: { gap1: "one" } })).correctAnswer).toBe('{"gap1":"one"}');
  });

  it("rejects empty or incomplete model responses", () => {
    expect(() => parseGeneratedQuestion("")) .toThrow("empty question");
    expect(() => parseGeneratedQuestion(JSON.stringify({ title: "Only title" }))).toThrow("incomplete question");
  });
});
