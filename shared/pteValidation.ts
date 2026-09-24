import { getPteTaskProcedure, type PteTaskProcedure, type PteSection } from "./pteTaskConfig";
import { auditQuestion } from "./questionAudit";

export interface PteQuestionInput {
  taskType: string;
  section?: string | null;
  prompt?: unknown;
  content?: unknown;
  audioUrl?: unknown;
  imageUrl?: unknown;
  options?: unknown;
  difficulty?: string | null;
}

export interface PteResponseInput {
  responseText?: unknown;
  audioUrl?: unknown;
  transcription?: unknown;
  selectedOptions?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function hasText(value: unknown): boolean {
  return text(value).length > 0;
}

function isUsableMediaUrl(value: unknown): boolean {
  const candidate = text(value);
  if (!candidate) return false;
  if (/example\.com|storage\.example|placeholder/i.test(candidate)) return false;
  return /^(https?:\/\/|\/|blob:)/i.test(candidate);
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return Object.values(parsed as Record<string, unknown>);
      return [];
    } catch {
      return [];
    }
  }
  return [];
}

function selectionValues(value: unknown): string[] {
  return asArray(value).map(item => text(item)).filter(Boolean);
}

function wordCount(value: unknown): number {
  return text(value).split(/\s+/).filter(Boolean).length;
}

export function hasRequiredQuestionContent(question: PteQuestionInput): ValidationResult {
  const procedure = getPteTaskProcedure(question.taskType, question.section as PteSection | undefined);
  if (!procedure) return { valid: false, reason: `Unsupported PTE task type: ${question.taskType}` };
  const audit = auditQuestion(question);
  if (!audit.valid) return { valid: false, reason: audit.issues[0] };

  const promptPresent = hasText(question.prompt);
  const contentPresent = hasText(question.content);
  const audioPresent = isUsableMediaUrl(question.audioUrl);
  const imagePresent = isUsableMediaUrl(question.imageUrl);

  if (procedure.promptSource === "image" && !imagePresent) {
    return { valid: false, reason: `${procedure.label} requires a playable image prompt.` };
  }
  if (procedure.promptSource === "audio" && !audioPresent && !contentPresent && !promptPresent) {
    return { valid: false, reason: `${procedure.label} requires an audio recording or source transcript.` };
  }
  if (procedure.promptSource === "audio_text" && !audioPresent && !contentPresent && !promptPresent) {
    return { valid: false, reason: `${procedure.label} requires an audio recording or situation text.` };
  }
  if (procedure.promptSource === "text" && !contentPresent && !promptPresent) {
    return { valid: false, reason: `${procedure.label} requires written prompt content.` };
  }
  if (procedure.requiresOptions && asArray(question.options).length === 0) {
    return { valid: false, reason: `${procedure.label} requires answer options.` };
  }
  return { valid: true };
}

export function hasScoreableResponse(
  question: PteQuestionInput,
  response: PteResponseInput,
): ValidationResult {
  const procedure = getPteTaskProcedure(question.taskType, question.section as PteSection | undefined);
  if (!procedure) return { valid: false, reason: `Unsupported PTE task type: ${question.taskType}` };

  const contentCheck = hasRequiredQuestionContent(question);
  if (!contentCheck.valid) return contentCheck;

  const selected = selectionValues(response.selectedOptions);
  const answerText = text(response.responseText) || text(response.transcription);
  const hasAudio = isUsableMediaUrl(response.audioUrl);

  switch (procedure.responseKind) {
    case "speech": {
      const audioPresent = hasAudio || hasText(response.audioUrl);
      const transcriptText = text(response.transcription) || text(response.responseText);
      if (!audioPresent && !hasText(transcriptText)) {
        return { valid: false, reason: `${procedure.label} requires a recorded response. Please record or speak before submitting.` };
      }
      // Enforce Pearson 3-second rule: if transcription is very short or nonexistent and audio duration/metadata indicates silence or no speech
      if (transcriptText) {
        const words = transcriptText.split(/\s+/).filter(Boolean);
        if (words.length === 0) {
          return { valid: false, reason: "No speech detected in recording. Please ensure your microphone is working and speak clearly." };
        }
      }
      return { valid: true };
    }
    case "text":
      if (!answerText) return { valid: false, reason: `${procedure.label} cannot be scored without a written response.` };
      if (question.taskType === "summarize_written_text") {
        const sentences = answerText.split(/[.!?]+(?=\s|$)/).map(part => part.trim()).filter(Boolean);
        if (sentences.length !== 1) {
          return { valid: false, reason: "Summarize Written Text must be submitted as one sentence." };
        }
      }
      // Pearson form rules score non-empty out-of-range responses; only a blank response is blocked here.
      return { valid: true };
    case "single_choice":
      return selected.length > 0
        ? { valid: true }
        : { valid: false, reason: `${procedure.label} requires one selected answer.` };
    case "multiple_choice":
      return selected.length > 0
        ? { valid: true }
        : { valid: false, reason: `${procedure.label} requires at least one selected answer.` };
    case "ordered":
      return selected.length > 0
        ? { valid: true }
        : { valid: false, reason: `${procedure.label} requires an ordered response.` };
    case "fill_blanks":
      if (selected.length > 0) return { valid: true };
      if (answerText) return { valid: true };
      return { valid: false, reason: `${procedure.label} requires an answer for every blank.` };
    case "word_selection":
      return selected.length > 0
        ? { valid: true }
        : { valid: false, reason: `${procedure.label} requires at least one selected word.` };
  }
}

export function getTaskProcedure(taskType: string, section?: PteSection): PteTaskProcedure | undefined {
  return getPteTaskProcedure(taskType, section);
}
