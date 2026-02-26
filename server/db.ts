import { eq, desc, and, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  questions,
  practiceSessions,
  userResponses,
  practiceTargets,
  milestones,
  type Question,
  type PracticeSession,
  type UserResponse,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: {
  targetScore?: number;
  currentLevel?: "beginner" | "intermediate" | "advanced";
  dailyGoalMinutes?: number;
  notificationsEnabled?: boolean;
}) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// Questions
export async function getQuestions(filters: {
  section?: string;
  taskType?: string;
  difficulty?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(questions).$dynamic();
  const conditions = [];
  if (filters.section) conditions.push(eq(questions.section, filters.section as any));
  if (filters.taskType) conditions.push(eq(questions.taskType, filters.taskType));
  if (filters.difficulty) conditions.push(eq(questions.difficulty, filters.difficulty as any));
  if (conditions.length > 0) query = query.where(and(...conditions));
  if (filters.limit) query = query.limit(filters.limit);
  return query;
}

export async function getQuestionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
  return result[0];
}

export async function insertQuestion(q: typeof questions.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(questions).values(q);
}

// Practice Sessions
export async function createSession(data: typeof practiceSessions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(practiceSessions).values(data);
  return (result[0] as any).insertId as number;
}

export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(practiceSessions).where(eq(practiceSessions.id, id)).limit(1);
  return result[0];
}

export async function updateSession(id: number, data: Partial<PracticeSession>) {
  const db = await getDb();
  if (!db) return;
  await db.update(practiceSessions).set(data as any).where(eq(practiceSessions.id, id));
}

export async function getUserSessions(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(practiceSessions)
    .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed")))
    .orderBy(desc(practiceSessions.completedAt))
    .limit(limit);
}

export async function getSessionResponses(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  const responses = await db.select().from(userResponses).where(eq(userResponses.sessionId, sessionId));
  // Attach question data
  const withQuestions = await Promise.all(responses.map(async (r) => {
    const q = await getQuestionById(r.questionId);
    return { ...r, question: q || null };
  }));
  return withQuestions;
}

// User Responses
export async function createResponse(data: typeof userResponses.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(userResponses).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateResponse(id: number, data: Partial<UserResponse>) {
  const db = await getDb();
  if (!db) return;
  await db.update(userResponses).set(data as any).where(eq(userResponses.id, id));
}

// Analytics
export async function getUserAnalytics(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const sessions = await db
    .select()
    .from(practiceSessions)
    .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed")))
    .orderBy(desc(practiceSessions.completedAt))
    .limit(50);

  const totalSessions = sessions.length;
  const latestSession = sessions[0];
  const avgScore = totalSessions > 0
    ? sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / totalSessions
    : 0;

  return { sessions, totalSessions, latestSession, avgScore };
}

// Practice Targets
export async function getTodayTarget(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const result = await db
    .select()
    .from(practiceTargets)
    .where(and(
      eq(practiceTargets.userId, userId),
      gte(practiceTargets.targetDate, today)
    ))
    .limit(1);
  return result[0];
}

export async function upsertPracticeTarget(data: typeof practiceTargets.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(practiceTargets).values(data);
}

// Milestones
export async function getUserMilestones(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(milestones).where(eq(milestones.userId, userId)).orderBy(desc(milestones.achievedAt)).limit(20);
}

export async function createMilestone(data: typeof milestones.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(milestones).values(data);
}

export async function getQuestionsCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(questions);
  return result[0]?.count ?? 0;
}
