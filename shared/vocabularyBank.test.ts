import { describe, expect, it } from "vitest";
import { PTE_VOCABULARY_BANK } from "./vocabularyBank";

describe("PTE Vocabulary & Collocation Bank", () => {
  it("contains high-frequency academic collocations with examples", () => {
    expect(PTE_VOCABULARY_BANK.length).toBeGreaterThan(0);
    const item = PTE_VOCABULARY_BANK[0];
    expect(item.collocation).toBeDefined();
    expect(item.meaning).toBeDefined();
    expect(item.example).toBeDefined();
    expect(item.pteTaskType).toBeDefined();
  });
});
