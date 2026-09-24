export function capPromptText(value: string | undefined | null, maxCharacters: number): string {
  const normalized = (value ?? "").trim();
  if (maxCharacters <= 0) return "";
  if (normalized.length <= maxCharacters) return normalized;
  const marker = "[content truncated for scoring context]";
  if (maxCharacters <= marker.length) return marker.slice(0, maxCharacters);
  return `${normalized.slice(0, maxCharacters - marker.length).trimEnd()}${marker}`;
}

export function compactJsonForPrompt(value: unknown, maxCharacters: number): string {
  let serialized = "";
  try {
    serialized = JSON.stringify(value ?? null);
  } catch {
    serialized = "null";
  }
  return capPromptText(serialized, maxCharacters);
}
