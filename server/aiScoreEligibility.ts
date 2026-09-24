export function hasUsableSpeakingTranscription(transcription: string | null | undefined): boolean {
  return typeof transcription === "string" && transcription.trim().length > 0;
}
