import { normalizeTaskType } from "@shared/taskTypeAliases";
import { requiresQuestionAudio } from "./taskMedia";

/**
 * Listening MCQs share generic persisted task IDs with Reading. The section
 * must therefore participate in determining whether the learner receives an
 * audio-first prompt.
 */
export function isListeningAudioPrompt(section: string | null | undefined, taskType: string): boolean {
  return section === "listening" && requiresQuestionAudio(taskType, section);
}

export function isTextResponseTask(taskType: string): boolean {
  return new Set([
    "summarize_spoken_text",
    "fill_blanks_listening",
    "write_from_dictation",
  ]).has(normalizeTaskType(taskType));
}

export function getTextResponseTaskConfig(taskType: string): {
  placeholder: string;
  minHeightClass: string;
  wordTarget?: string;
} {
  switch (normalizeTaskType(taskType)) {
    case "summarize_spoken_text":
      return {
        placeholder: "Write a 50–70 word summary of the recording...",
        minHeightClass: "min-h-[160px]",
        wordTarget: "50–70 words",
      };
    case "write_from_dictation":
      return {
        placeholder: "Type the sentence exactly as you heard it...",
        minHeightClass: "min-h-[80px]",
      };
    default:
      return {
        placeholder: "Type your answers separated by commas...",
        minHeightClass: "min-h-[80px]",
      };
  }
}
