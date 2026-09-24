import { describe, expect, it } from "vitest";
import { menuItems } from "./PremiumHeader";
import { getPracticeTaskUrl } from "@/lib/practiceRoutes";

describe("persistent PTE module task menus", () => {
  it("lists routable task entries for every learner module", () => {
    for (const section of ["speaking", "writing", "reading", "listening"] as const) {
      const items = menuItems[section];
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(item.taskType).toBeTruthy();
        expect(item.section).toBe(section);
        expect(getPracticeTaskUrl(item)).toContain(`/practice/${section}?taskType=`);
      }
    }
  });

  it("keeps the two added Speaking task types available from the persistent menu", () => {
    expect(menuItems.speaking.map(item => item.taskType)).toEqual(expect.arrayContaining([
      "respond_to_situation",
      "summarize_group_discussion",
    ]));
  });
});
