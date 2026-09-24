import { describe, expect, it } from "vitest";
import { capPromptText, compactJsonForPrompt } from "./aiPromptUtils";

describe("AI prompt budget helpers", () => {
  it("preserves normal PTE-sized content without changes", () => {
    expect(capPromptText("Describe the main trend.", 100)).toBe("Describe the main trend.");
  });

  it("caps oversized content with a visible marker", () => {
    const result = capPromptText("a".repeat(120), 60);
    expect(result.length).toBeLessThanOrEqual(60);
    expect(result).toContain("content truncated for scoring context");
  });

  it("serializes JSON safely within the same budget", () => {
    const result = compactJsonForPrompt({ values: ["a", "b", "c"] }, 20);
    expect(result.length).toBeLessThanOrEqual(20);
  });
});
