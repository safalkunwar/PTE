import { normalizeTaskType } from "@shared/taskTypeAliases";

export const audioFirstTaskTypes = new Set([
  "answer_short_question",
  "retell_lecture",
  "respond_to_situation",
  "summarize_group_discussion",
  "summarize_spoken_text",
  "fill_blanks_listening",
  "highlight_correct_summary",
  "select_missing_word",
  "highlight_incorrect_words",
  "write_from_dictation",
]);

const listeningMultipleChoiceTaskTypes = new Set([
  "multiple_choice_single",
  "multiple_choice_multiple",
]);

export const imageTaskTypes = new Set(["describe_image"]);

const placeholderAudioPatterns = [
  /soundhelix\.com/i,
  /example\.com/i,
  /placeholder/i,
];

export function requiresQuestionAudio(taskType: string, section?: string): boolean {
  const canonicalTaskType = normalizeTaskType(taskType);
  return audioFirstTaskTypes.has(canonicalTaskType)
    || (section === "listening" && listeningMultipleChoiceTaskTypes.has(canonicalTaskType));
}

export function requiresQuestionImage(taskType: string): boolean {
  return imageTaskTypes.has(normalizeTaskType(taskType));
}

export function isUsablePromptAudioUrl(audioUrl?: string | null): boolean {
  const candidate = audioUrl?.trim();
  return Boolean(candidate) && !placeholderAudioPatterns.some(pattern => pattern.test(candidate!));
}

export function getAudioFallbackText(taskType: string, content?: string, prompt?: string): string {
  const canonicalTaskType = normalizeTaskType(taskType);
  const normalizedContent = content?.trim();
  if (normalizedContent && normalizedContent.length > 8) return normalizedContent;
  if (prompt?.trim()) return prompt.trim();
  const labels: Record<string, string> = {
    answer_short_question: "Listen to the question and give a short, direct answer.",
    retell_lecture: "Listen carefully to the lecture, then retell the main points in your own words.",
    respond_to_situation: "Listen to the situation and respond appropriately using complete sentences.",
    summarize_group_discussion: "Listen to the group discussion and summarize the main ideas and contrasting views.",
    summarize_spoken_text: "Listen to the spoken text and summarize the key points in 50 to 70 words.",
    fill_blanks_listening: "Listen to the recording and complete the missing words.",
    highlight_correct_summary: "Listen to the recording, then choose the summary that best matches it.",
    select_missing_word: "Listen to the recording and select the word that completes the meaning.",
    highlight_incorrect_words: "Listen to the recording and identify the words that differ from the transcript.",
    write_from_dictation: "Listen carefully and write the sentence exactly as you hear it.",
  };
  return labels[canonicalTaskType] ?? "Listen carefully to the prompt before answering.";
}
