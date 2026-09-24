import { describe, expect, it } from "vitest";
import { prepareSyncPayload } from "./githubSync";

describe("GitHub Daily Sync & Backup Helper", () => {
  it("prepares valid sync payload with timestamp and question count", async () => {
    const payload = await prepareSyncPayload(150);
    expect(payload.totalQuestions).toBe(150);
    expect(payload.status).toBe("ready_for_sync");
    expect(payload.timestamp).toBeDefined();
  });
});
