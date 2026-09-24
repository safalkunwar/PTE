type ParsedOption = { id: string; text: string };

function decodeOptions(options: unknown): ParsedOption[] {
  let decoded = options;
  try {
    if (typeof decoded === "string") decoded = JSON.parse(decoded);
    if (typeof decoded === "string") decoded = JSON.parse(decoded);
  } catch {
    return [];
  }
  if (!Array.isArray(decoded)) return [];

  return decoded.map((option, index) => {
    if (typeof option === "string") {
      const prefixed = option.match(/^\s*([A-Za-z0-9]+)\)\s*/);
      return {
        id: prefixed?.[1] ?? String.fromCharCode(65 + index),
        text: option,
      };
    }
    if (option && typeof option === "object") {
      const record = option as Record<string, unknown>;
      return {
        id: String(record.id ?? String.fromCharCode(65 + index)),
        text: String(record.text ?? record.label ?? record.value ?? record.id ?? ""),
      };
    }
    return { id: String.fromCharCode(65 + index), text: String(option) };
  }).filter(option => option.text.trim().length > 0);
}

function decodeAnswers(answer: string | string[] | null | undefined): string[] {
  if (Array.isArray(answer)) return answer.map(String).map(value => value.trim()).filter(Boolean);
  const raw = answer?.trim() ?? "";
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).map(value => value.trim()).filter(Boolean);
  } catch {
    // Plain-text answer keys are valid.
  }
  return [raw];
}

/** Decode persisted answer keys while preserving their stored order. */
export function parseOrderedAnswerKey(answer: unknown): string[] {
  if (Array.isArray(answer)) return answer.map(String).map(value => value.trim()).filter(Boolean);
  if (answer && typeof answer === "object") {
    return Object.values(answer as Record<string, unknown>)
      .map(String)
      .map(value => value.trim())
      .filter(Boolean);
  }
  if (typeof answer !== "string") return [];
  const raw = answer.trim();
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parseOrderedAnswerKey(parsed);
    if (parsed && typeof parsed === "object") return parseOrderedAnswerKey(parsed);
  } catch {
    // Plain-text answer keys are valid.
  }
  return [raw];
}

/** Decode Listening FIB keys/responses, whose legacy imports use commas/newlines. */
export function parseDelimitedAnswers(answer: unknown): string[] {
  const ordered = parseOrderedAnswerKey(answer);
  if (ordered.length !== 1 || typeof answer !== "string") return ordered;
  return ordered[0].split(/[,\n]+/).map(value => value.trim()).filter(Boolean);
}

/**
 * Converts UI option IDs and answer keys from mixed import formats into the
 * common displayed-text representation used by deterministic selection scorers.
 */
export function normalizeOptionValues(
  options: unknown,
  correctAnswer: string | string[] | null | undefined,
  selectedOptions: string[] | null | undefined,
): { correctAnswers: string[]; selectedOptions: string[] } {
  const optionMap = new Map(decodeOptions(options).map(option => [option.id.toLowerCase(), option.text]));
  const normalize = (value: string) => optionMap.get(value.trim().toLowerCase()) ?? value.trim();

  return {
    correctAnswers: decodeAnswers(correctAnswer).map(normalize),
    selectedOptions: (selectedOptions ?? []).map(normalize),
  };
}
