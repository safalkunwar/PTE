import { describe, expect, it } from "vitest";
import { getSavedThemePreference } from "./themePreference";

describe("theme preference", () => {
  it("restores a saved theme preference", () => {
    expect(getSavedThemePreference({ getItem: () => "dark" }, false)).toBe("dark");
    expect(getSavedThemePreference({ getItem: () => "light" }, true)).toBe("light");
  });

  it("falls back to the document theme when storage is empty or unavailable", () => {
    expect(getSavedThemePreference({ getItem: () => null }, true)).toBe("dark");
    expect(getSavedThemePreference(undefined, false)).toBe("light");
  });
});
