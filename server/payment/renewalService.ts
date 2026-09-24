import { and, desc, eq, lte, lt, or } from "drizzle-orm";
import { getDb } from "../db";
import { sendSubscriptionRenewalReminder } from "../email/emailService";
import { getPaymentByReferenceId, createPayment } from "./db";
import { payments, subscriptionPlans, subscriptions, users } from "../../drizzle/schema";

export function getRenewalPaymentReference(subscriptionId: number, renewalDate: Date | null, now: Date): string {
  const date = renewalDate ?? now;
  return `renewal-${subscriptionId}-${date.toISOString().slice(0, 10)}`;
}

function addBillingInterval(date: Date, interval: "monthly" | "yearly") {
  const next = new Date(date);
  if (interval === "monthly") next.setMonth(next.getMonth() + 1);
  else next.setFullYear(next.getFullYear() + 1);
  return next;
}

export function shouldCreateRenewalIntent(existingPayment: unknown) {
  return existingPayment == null;
}

export type RenewalRunResult = {
  dueSubscriptions: number;
  renewalIntentsCreated: number;
  remindersSent: number;
  expiredSubscriptions: number;
  alreadyPrepared: number;
};

/**
 * Process due subscriptions without charging a gateway inside a cron callback.
 * The job is intentionally idempotent: the renewal reference is unique and a
 * previously-created pending/completed payment is reused on retries.
 */
export async function processDueSubscriptionRenewals(now = new Date()): Promise<RenewalRunResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  const due = await db
    .select({
      subscription: subscriptions,
      plan: subscriptionPlans,
      user: users,
    })
    .from(subscriptions)
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(and(
      eq(subscriptions.status, "active"),
      eq(subscriptions.autoRenew, true),
      lte(subscriptions.renewalDate, now),
    ));

  const expirationCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const overdue = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(and(
      eq(subscriptions.status, "active"),
      lt(subscriptions.endDate, expirationCutoff),
    ));

  let renewalIntentsCreated = 0;
  let remindersSent = 0;
  let alreadyPrepared = 0;

  for (const item of due) {
    const subscription = item.subscription;
    const plan = item.plan;
    const user = item.user;
    const referenceId = getRenewalPaymentReference(subscription.id, subscription.renewalDate, now);
    const existingPayment = await getPaymentByReferenceId(referenceId);

    if (!shouldCreateRenewalIntent(existingPayment)) {
      alreadyPrepared += 1;
      continue;
    }

    const [lastPayment] = await db
      .select({ gateway: payments.gateway })
      .from(payments)
      .where(and(eq(payments.userId, user.id), eq(payments.status, "completed")))
      .orderBy(desc(payments.createdAt))
      .limit(1);

    await createPayment({
      userId: user.id,
      subscriptionId: subscription.id,
      gateway: lastPayment?.gateway ?? "khalti",
      amount: plan.price,
      description: `${plan.name} subscription renewal payment`,
      referenceId,
    });
    renewalIntentsCreated += 1;

    if (user.email) {
      const sent = await sendSubscriptionRenewalReminder({
        userName: user.name || "PTE learner",
        userEmail: user.email,
        planName: plan.name,
        amount: plan.price,
        currency: "NPR",
        renewalDate: (subscription.renewalDate ?? now).toISOString(),
        nextBillingDate: (subscription.renewalDate ?? now).toISOString(),
      });
      if (sent) remindersSent += 1;
    }
  }

  if (overdue.length > 0) {
    await db
      .update(subscriptions)
      .set({ status: "expired", autoRenew: false, updatedAt: now })
      .where(or(...overdue.map(({ id }) => eq(subscriptions.id, id))));
  }

  return {
    dueSubscriptions: due.length,
    renewalIntentsCreated,
    remindersSent,
    expiredSubscriptions: overdue.length,
    alreadyPrepared,
  };
}

export function getNextRenewalDate(currentDate: Date, interval: "monthly" | "yearly") {
  return addBillingInterval(currentDate, interval);
}
