import { and, desc, eq, like, or } from "drizzle-orm";
import { getDb } from "../db";
import { practiceSessions, subscriptions, users } from "../../drizzle/schema";

export type AdminUserListInput = {
  limit: number;
  offset: number;
  search?: string;
  role?: "user" | "admin";
  isBanned?: boolean;
};

export async function listAdminUsers(input: AdminUserListInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  const filters = [];
  if (input.search?.trim()) {
    const term = `%${input.search.trim()}%`;
    filters.push(or(like(users.name, term), like(users.email, term), like(users.openId, term)));
  }
  if (input.role) filters.push(eq(users.role, input.role));
  if (input.isBanned !== undefined) filters.push(eq(users.isBanned, input.isBanned));

  const where = filters.length > 0 ? and(...filters) : undefined;
  const rows = await db
    .select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      email: users.email,
      role: users.role,
      isBanned: users.isBanned,
      banReason: users.banReason,
      bannedAt: users.bannedAt,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(input.limit)
    .offset(input.offset);

  return rows;
}

export async function getAdminUserDetails(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;

  const userSubscriptions = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt));
  const recentSessions = await db
    .select({
      id: practiceSessions.id,
      section: practiceSessions.section,
      status: practiceSessions.status,
      startedAt: practiceSessions.startedAt,
      completedAt: practiceSessions.completedAt,
      overallScore: practiceSessions.overallScore,
    })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, userId))
    .orderBy(desc(practiceSessions.startedAt))
    .limit(20);

  return { user, subscriptions: userSubscriptions, recentSessions };
}

export async function setUserBanStatus(userId: number, isBanned: boolean, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  await db
    .update(users)
    .set({
      isBanned,
      banReason: isBanned ? (reason?.trim() || "Suspended by an administrator") : null,
      bannedAt: isBanned ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  const [updated] = await db.select({ id: users.id, isBanned: users.isBanned, banReason: users.banReason, bannedAt: users.bannedAt }).from(users).where(eq(users.id, userId)).limit(1);
  return updated ?? null;
}

export async function setUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
  const [updated] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  return updated ?? null;
}
