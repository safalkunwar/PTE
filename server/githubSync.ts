import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function checkGitHubAuth(): Promise<boolean> {
  try {
    const { stdout } = await execAsync("gh auth status");
    return stdout.includes("Logged in");
  } catch {
    return false;
  }
}

export async function prepareSyncPayload(questionsCount: number) {
  return {
    timestamp: new Date().toISOString(),
    totalQuestions: questionsCount,
    status: "ready_for_sync",
    platform: "PTE Academic Practice Platform",
  };
}
