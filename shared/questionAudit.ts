import type { PteQuestionInput } from "./pteValidation";

export type Difficulty = "easy" | "medium" | "hard";

export interface AuditableQuestion extends PteQuestionInput {
  difficulty?: string | null;
  correctAnswer?: string | null;
}

export interface QuestionAuditResult {
  valid: boolean;
  issues: string[];
  difficultyValid: boolean;
}

const AUDIO_TASKS = new Set([
  "repeat_sentence",
  "retell_lecture",
  "answer_short_question",
  "summarize_group_discussion",
  "summarize_spoken_text",
  "fill_blanks_listening",
  "highlight_correct_summary",
  "select_missing_word",
  "highlight_incorrect_words",
  "write_from_dictation",
  "respond_to_situation",
]);

const OPTION_TASKS = new Set([
  "multiple_choice_single",
  "multiple_choice_multiple",
  "fill_blanks_reading",
  "fill_blanks_rw",
  "highlight_correct_summary",
  "select_missing_word",
]);

const OBJECTIVE_SCORE_TASKS = new Set([
  "multiple_choice_single",
  "multiple_choice_multiple",
  "reorder_paragraphs",
  "fill_blanks_reading",
  "fill_blanks_rw",
  "fill_blanks_listening",
  "highlight_correct_summary",
  "select_missing_word",
  "highlight_incorrect_words",
  "write_from_dictation",
]);

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function wordCount(value: string): number {
  return value.split(/\s+/).filter(Boolean).length;
}

function hasOptions(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.length > 0;
    return Boolean(parsed && typeof parsed === "object" && Object.keys(parsed).length > 0);
  } catch {
    return false;
  }
}

function usableUrl(value: unknown): boolean {
  const candidate = stringValue(value);
  return /^(https?:\/\/|\/)/i.test(candidate) && !/example\.com|placeholder|storage\.example/i.test(candidate);
}

export function auditQuestion(question: AuditableQuestion): QuestionAuditResult {
  const issues: string[] = [];
  const prompt = stringValue(question.prompt);
  const content = stringValue(question.content);
  const sourceText = prompt || content;
  const difficultyValid = question.difficulty == null || ["easy", "medium", "hard"].includes(question.difficulty);

  if (!sourceText && !usableUrl(question.audioUrl) && !usableUrl(question.imageUrl)) {
    issues.push("missing prompt content or usable media");
  }
  if (!difficultyValid) issues.push("difficulty must be easy, medium, or hard");
  if (question.taskType === "describe_image" && !usableUrl(question.imageUrl)) {
    issues.push("Describe Image requires a usable image asset");
  }
  if (AUDIO_TASKS.has(question.taskType) && !usableUrl(question.audioUrl) && !sourceText) {
    issues.push("audio-first task requires audio or a practice fallback transcript/prompt");
  }
  if (OPTION_TASKS.has(question.taskType) && !hasOptions(question.options)) {
    issues.push("objective option task requires at least one option");
  }
  if (OBJECTIVE_SCORE_TASKS.has(question.taskType) && !stringValue(question.correctAnswer)) {
    issues.push("objective scoring task requires a reference answer");
  }
  if (question.taskType === "read_aloud" && wordCount(sourceText) > 60) {
    issues.push("Read Aloud prompt exceeds the 60-word Pearson limit");
  }
  if (question.taskType === "respond_to_situation" && wordCount(sourceText) > 60) {
    issues.push("Respond to a Situation prompt exceeds the 60-word Pearson limit");
  }
  if (question.taskType === "summarize_written_text" && wordCount(content) > 300) {
    issues.push("Summarize Written Text source exceeds the 300-word Pearson limit");
  }

  return { valid: issues.length === 0, issues, difficultyValid };
}
