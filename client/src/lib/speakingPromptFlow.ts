import { getSpeakingTiming } from "./speakingTiming";

export type SpeakingPromptPhase = "prompt" | "prep" | "recording";

export const audioLedSpeakingTaskTypes = new Set([
  "repeat_sentence",
  "retell_lecture",
  "answer_short_question",
  "summarize_group_discussion",
  "respond_to_situation",
]);

export function isAudioLedSpeakingTask(taskType: string): boolean {
  return audioLedSpeakingTaskTypes.has(taskType);
}

export function getInitialSpeakingPhase(taskType: string): SpeakingPromptPhase {
  if (isAudioLedSpeakingTask(taskType)) return "prompt";
  return getSpeakingTiming(taskType).prep > 0 ? "prep" : "recording";
}

export function getPhaseAfterPromptPlayback(taskType: string): "prep" | "recording" {
  return getSpeakingTiming(taskType).prep > 0 ? "prep" : "recording";
}
