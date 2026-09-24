import { describe, expect, it } from "vitest";
import { PRACTICE_CONTENT_CLASS } from "./practiceLayout";

describe("practice layout contract", () => {
  it("keeps the practice workspace centered, full-width on small screens, and compact on large screens", () => {
    expect(PRACTICE_CONTENT_CLASS).toContain("mx-auto");
    expect(PRACTICE_CONTENT_CLASS).toContain("w-full");
    expect(PRACTICE_CONTENT_CLASS).toContain("max-w-4xl");
  });
});
