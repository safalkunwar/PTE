export type ThemePreference = "light" | "dark";

export function getSavedThemePreference(storage: Pick<Storage, "getItem"> | undefined, currentIsDark: boolean): ThemePreference {
  try {
    const saved = storage?.getItem("pte-theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // Browser storage may be unavailable; keep the existing document theme.
  }
  return currentIsDark ? "dark" : "light";
}
