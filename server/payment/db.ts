/**
 * Payment Database Helpers
 */

import { getDb } from "../db";
import {
  payments,
  subscriptions,
  subscriptionPlans,
  users,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Create a new payment record
 */
export async function createPayment(data: {
  userId: number;
  subscriptionId?: number;
  gateway: "esewa" | "khalti";
  amount: number;
  description: string;
  referenceId: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  const [payment] = await db
    .insert(payments)
    .values({
      userId: data.userId,
      subscriptionId: data.subscriptionId,
      gateway: data.gateway,
      amount: data.amount,
      currency: "NPR",
      status: "pending",
      description: data.description,
      referenceId: data.referenceId,
    })
    .execute();

  return payment;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: number,
  status: "pending" | "completed" | "failed" | "refunded",
  transactionId?: string,
  metadata?: Record<string, any>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (transactionId) {
    updateData.transactionId = transactionId;
  }

  if (metadata) {
    updateData.metadata = metadata;
  }

  if (status === "completed") {
    updateData.completedAt = new Date();
  }

  await db
    .update(payments)
    .set(updateData)
    .where(eq(payments.id, paymentId))
    .execute();
}

/**
 * Get payment by reference ID
 */
export async function getPaymentByReferenceId(referenceId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.referenceId, referenceId))
    .execute();

  return payment;
}

/**
 * Get user's payment history
 */
export async function getUserPayments(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  const userPayments = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt))
    .limit(limit)
    .execute();

  return userPayments;
}

/**
 * Create subscription plan
 */
export async function createSubscriptionPlan(data: {
  name: string;
  price: number;
  interval: "monthly" | "yearly";
  features: string[];
  maxSessions?: number;
  storageGB?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  const [plan] = await db
    .insert(subscriptionPlans)
    .values({
      name: data.name,
      price: data.price,
      interval: data.interval,
      features: data.features,
      maxSessions: data.maxSessions,
      storageGB: data.storageGB,
    })
    .execute();

  return plan;
}

/**
 * Get all subscription plans
 */
export async function getSubscriptionPlans() {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  const plans = await db.select().from(subscriptionPlans).execute();
  return plans;
}

/**
 * Get subscription plan by ID
 */
export async function getSubscriptionPlanById(planId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId))
    .execute();

  return plan;
}

/**
 * Create subscription for user
 */
export async function createSubscription(data: {
  userId: number;
  planId: number;
  autoRenew?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  const plan = await getSubscriptionPlanById(data.planId);
  if (!plan) throw new Error("Plan not found");

  const startDate = new Date();
  const endDate = new Date();

  if (plan.interval === "monthly") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  const [subscription] = await db
    .insert(subscriptions)
    .values({
      userId: data.userId,
      planId: data.planId,
      status: "active",
      startDate,
      endDate,
      renewalDate: endDate,
      autoRenew: data.autoRenew ?? true,
    })
    .execute();

  return subscription;
}

/**
 * Get active subscription for user
 */
export async function getUserActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    )
    .execute();

  return subscription;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscriptionId))
    .execute();
}

/**
 * Get subscription with plan details
 */
export async function getSubscriptionWithPlan(subscriptionId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, subscriptionId))
    .execute();

  if (!subscription) return null;

  const plan = await getSubscriptionPlanById(subscription.planId);
  return { ...subscription, plan };
}

/**
 * Get total revenue (admin)
 */
export async function getTotalRevenue() {
  const db = await getDb();
  if (!db) return 0;
  
  try {
    const result = await db.execute(
      `SELECT SUM(amount) as total FROM payments WHERE status = 'completed'`
    ) as any;
    return result[0]?.total || 0;
  } catch {
    return 0;
  }
}

/**
 * Get revenue by gateway
 */
export async function getRevenueByGateway() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.execute(
    `SELECT gateway, SUM(amount) as total, COUNT(*) as count FROM payments WHERE status = 'completed' GROUP BY gateway`
  );
  return result;
}

/**
 * Get active subscriptions count
 */
export async function getActiveSubscriptionsCount() {
  const db = await getDb();
  if (!db) return 0;
  
  try {
    const result = await db.execute(
      `SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'`
    ) as any;
    return result[0]?.count || 0;
  } catch {
    return 0;
  }
}

/**
 * Get subscription count by plan
 */
export async function getSubscriptionsByPlan() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.execute(
    `SELECT sp.name, COUNT(*) as count FROM subscriptions s 
     JOIN subscription_plans sp ON s.planId = sp.id 
     WHERE s.status = 'active' 
     GROUP BY s.planId`
  );
  return result;
}
