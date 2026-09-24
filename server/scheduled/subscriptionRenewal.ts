import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { scheduledJobs } from "../../drizzle/schema";
import { sdk } from "../_core/sdk";
import { processDueSubscriptionRenewals } from "../payment/renewalService";

export async function handleSubscriptionRenewal(req: Request, res: Response) {
  const timestamp = new Date().toISOString();
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "database-unavailable", timestamp });

    const [job] = await db
      .select()
      .from(scheduledJobs)
      .where(eq(scheduledJobs.taskUid, user.taskUid))
      .limit(1);
    if (!job || !job.enabled) {
      return res.json({ ok: true, skipped: "unknown-or-disabled-job", timestamp });
    }

    const result = await processDueSubscriptionRenewals(new Date());
    await db.update(scheduledJobs).set({ lastRunAt: new Date(), updatedAt: new Date() }).where(eq(scheduledJobs.id, job.id));
    return res.json({ ok: true, result, timestamp });
  } catch (error) {
    console.error("[Scheduled] Subscription renewal failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
      timestamp,
      context: { url: req.originalUrl },
    });
  }
}
