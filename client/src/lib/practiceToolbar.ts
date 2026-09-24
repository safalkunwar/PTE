export interface SubmitAvailability {
  isSubmitting: boolean;
  isSpeakingTask: boolean;
  hasAudio: boolean;
  isWritingTask: boolean;
  hasText: boolean;
  isResponseValid?: boolean;
  isQuestionValid?: boolean;
}

export function isSubmitDisabled({
  isSubmitting,
  isSpeakingTask,
  hasAudio,
  isWritingTask,
  hasText,
  isResponseValid = true,
  isQuestionValid = true,
}: SubmitAvailability): boolean {
  return (
    isSubmitting ||
    !isQuestionValid ||
    !isResponseValid ||
    (isSpeakingTask && !hasAudio) ||
    (isWritingTask && !hasText)
  );
}
