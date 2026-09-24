export function requiresLoadedVisualPrompt(taskType: string): boolean {
  return taskType === "describe_image";
}

export function validateVisualPromptReadiness(taskType: string, isLoaded: boolean): { valid: boolean; reason?: string } {
  if (!requiresLoadedVisualPrompt(taskType) || isLoaded) return { valid: true };
  return { valid: false, reason: "The Describe Image visual prompt must load before this response can be submitted or scored." };
}
