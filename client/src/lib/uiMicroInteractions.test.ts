import { describe, expect, it } from "vitest";
import { buttonVariants } from "@/components/ui/button";
import { cardBaseClasses } from "@/components/ui/card";

describe("shared UI micro-interactions", () => {
  it("keeps buttons liftable, pressable, and transition-safe", () => {
    const classes = buttonVariants();
    expect(classes).toContain("transition-all");
    expect(classes).toContain("hover:-translate-y-0.5");
    expect(classes).toContain("active:scale-[0.98]");
  });

  it("keeps shared cards subtly liftable without losing their shadow", () => {
    expect(cardBaseClasses).toContain("transition-all");
    expect(cardBaseClasses).toContain("hover:-translate-y-0.5");
    expect(cardBaseClasses).toContain("hover:shadow-md");
  });
});
