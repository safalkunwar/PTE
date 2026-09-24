import { describe, expect, it } from "vitest";
import { detectGrammarSignals, measureVocabularySophistication } from "./coachingSignals";

describe("PTE coaching signals", () => {
  it("classifies the requested grammar error families", () => {
    const signals = detectGrammarSignals("They is responsible about the analysis yesterday and it are important.");
    expect(signals.map(signal => signal.type)).toEqual(expect.arrayContaining([
      "subject-verb agreement",
      "tense",
      "prepositions",
    ]));
  });

  it("measures academic vocabulary, lexical diversity, and collocations", () => {
    const metrics = measureVocabularySophistication(
      "Economic development has a significant impact on sustainable innovation and economic development.",
    );
    expect(metrics.wordCount).toBeGreaterThan(0);
    expect(metrics.academicWordCount).toBeGreaterThan(0);
    expect(metrics.collocationCount).toBeGreaterThan(0);
    expect(metrics.lexicalDiversity).toBeGreaterThan(0);
    expect(metrics.lexicalDiversity).toBeLessThan(1);
  });
});
