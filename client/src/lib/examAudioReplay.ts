export function canStartPromptPlayback(hasAlreadyStarted: boolean, allowReplay: boolean): boolean {
  return allowReplay || !hasAlreadyStarted;
}

export function getPromptPlaybackStatus(hasFinished: boolean, allowReplay: boolean): string {
  if (allowReplay) return "Replay available";
  return hasFinished ? "Exam audio completed" : "Exam audio plays once";
}
