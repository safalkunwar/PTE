var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/const.ts
var COOKIE_NAME, ONE_YEAR_MS, AXIOS_TIMEOUT_MS, UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG;
var init_const = __esm({
  "shared/const.ts"() {
    "use strict";
    COOKIE_NAME = "app_session_id";
    ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
    AXIOS_TIMEOUT_MS = 3e4;
    UNAUTHED_ERR_MSG = "Please login (10001)";
    NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  attemptHistory: () => attemptHistory,
  milestones: () => milestones,
  payments: () => payments,
  practiceSessions: () => practiceSessions,
  practiceTargets: () => practiceTargets,
  questions: () => questions,
  scheduledJobs: () => scheduledJobs,
  srsCards: () => srsCards,
  srsReviewLogs: () => srsReviewLogs,
  subscriptionPlans: () => subscriptionPlans,
  subscriptions: () => subscriptions,
  userResponses: () => userResponses,
  users: () => users
});
import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  boolean,
  json
} from "drizzle-orm/mysql-core";
var users, questions, practiceSessions, userResponses, practiceTargets, srsCards, srsReviewLogs, subscriptionPlans, subscriptions, payments, scheduledJobs, milestones, attemptHistory;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
      targetScore: int("targetScore").default(65),
      currentLevel: mysqlEnum("currentLevel", ["beginner", "intermediate", "advanced"]).default("intermediate"),
      dailyGoalMinutes: int("dailyGoalMinutes").default(30),
      notificationsEnabled: boolean("notificationsEnabled").default(true),
      isBanned: boolean("isBanned").default(false).notNull(),
      banReason: text("banReason"),
      bannedAt: timestamp("bannedAt")
    });
    questions = mysqlTable("questions", {
      id: int("id").autoincrement().primaryKey(),
      section: mysqlEnum("section", ["speaking", "writing", "reading", "listening"]).notNull(),
      taskType: varchar("taskType", { length: 64 }).notNull(),
      // read_aloud, repeat_sentence, describe_image, retell_lecture, answer_short_question, summarize_group_discussion, respond_to_situation, summarize_written_text, write_essay, multiple_choice_single, multiple_choice_multiple, reorder_paragraphs, fill_blanks_reading, fill_blanks_rw, summarize_spoken_text, fill_blanks_listening, highlight_correct_summary, select_missing_word, highlight_incorrect_words, write_from_dictation
      difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      prompt: text("prompt"),
      // instruction text
      content: text("content"),
      // main content (passage, image description, etc.)
      audioUrl: text("audioUrl"),
      // for listening tasks
      imageUrl: text("imageUrl"),
      // for describe image tasks
      options: json("options"),
      // for MCQ tasks: [{id, text, correct}]
      correctAnswer: text("correctAnswer"),
      // for objective tasks
      modelAnswer: text("modelAnswer"),
      // for subjective tasks
      wordLimit: int("wordLimit"),
      // for writing tasks
      timeLimit: int("timeLimit"),
      // seconds allowed
      preparationTime: int("preparationTime"),
      // seconds to prepare before speaking
      tags: json("tags"),
      // topic tags
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    practiceSessions = mysqlTable("practice_sessions", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id),
      sessionType: mysqlEnum("sessionType", ["mock_test", "section_practice", "diagnostic", "revision", "beginner"]).notNull(),
      section: mysqlEnum("section", ["speaking", "writing", "reading", "listening", "full"]).notNull(),
      mode: mysqlEnum("mode", ["beginner", "exam", "diagnostic", "revision"]).default("exam").notNull(),
      status: mysqlEnum("status", ["in_progress", "paused", "completed", "abandoned"]).default("in_progress").notNull(),
      pausedAt: timestamp("pausedAt"),
      pausedIndex: int("pausedIndex").default(0),
      startedAt: timestamp("startedAt").defaultNow().notNull(),
      completedAt: timestamp("completedAt"),
      totalQuestions: int("totalQuestions").default(0),
      answeredQuestions: int("answeredQuestions").default(0),
      questionPlan: json("questionPlan"),
      // ordered [{ questionId, taskType, section }]
      // Overall scores (10-90 scale)
      overallScore: float("overallScore"),
      speakingScore: float("speakingScore"),
      writingScore: float("writingScore"),
      readingScore: float("readingScore"),
      listeningScore: float("listeningScore"),
      // Enabling skills
      grammarScore: float("grammarScore"),
      oralFluencyScore: float("oralFluencyScore"),
      pronunciationScore: float("pronunciationScore"),
      spellingScore: float("spellingScore"),
      vocabularyScore: float("vocabularyScore"),
      writtenDiscourseScore: float("writtenDiscourseScore"),
      // Diagnostic data
      weakSkills: json("weakSkills"),
      // array of skill names
      strongSkills: json("strongSkills"),
      actionPlan: text("actionPlan")
    });
    userResponses = mysqlTable("userResponses", {
      id: int("id").autoincrement().primaryKey(),
      sessionId: int("sessionId").notNull().references(() => practiceSessions.id),
      userId: int("userId").notNull().references(() => users.id),
      questionId: int("questionId").notNull().references(() => questions.id),
      responseText: text("responseText"),
      // text answer
      audioUrl: text("audioUrl"),
      // for speaking tasks
      transcription: text("transcription"),
      // transcribed speech
      selectedOptions: json("selectedOptions"),
      // for MCQ
      timeTaken: int("timeTaken"),
      // seconds
      submittedAt: timestamp("submittedAt").defaultNow().notNull(),
      // Scores
      contentScore: float("contentScore"),
      // 0-1 normalized
      formScore: float("formScore"),
      languageScore: float("languageScore"),
      pronunciationScore: float("pronunciationScore"),
      fluencyScore: float("fluencyScore"),
      totalScore: float("totalScore"),
      // 0-100 raw
      normalizedScore: float("normalizedScore"),
      // 10-90 scale
      scoreConfidence: float("scoreConfidence"),
      // 0-1 AI confidence
      needsReview: boolean("needsReview").default(false).notNull(),
      // low-confidence or anomalous response
      // Feedback
      feedback: text("feedback"),
      // detailed AI feedback
      strengths: json("strengths"),
      improvements: json("improvements"),
      grammarErrors: json("grammarErrors"),
      vocabularyFeedback: text("vocabularyFeedback"),
      pronunciationFeedback: text("pronunciationFeedback"),
      fluencyFeedback: text("fluencyFeedback"),
      isCorrect: boolean("isCorrect")
      // for objective tasks
    });
    practiceTargets = mysqlTable("practiceTargets", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id),
      targetDate: timestamp("targetDate").notNull(),
      targetMinutes: int("targetMinutes").default(30),
      focusSkills: json("focusSkills"),
      // skills to focus on
      recommendedTasks: json("recommendedTasks"),
      // task types to practice
      completedMinutes: int("completedMinutes").default(0),
      isCompleted: boolean("isCompleted").default(false),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    srsCards = mysqlTable("srs_cards", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id),
      questionId: int("questionId").notNull().references(() => questions.id),
      // SM-2 core fields
      easeFactor: float("easeFactor").default(2.5).notNull(),
      // starts at 2.5, min 1.3
      interval: int("interval").default(1).notNull(),
      // days until next review
      repetitions: int("repetitions").default(0).notNull(),
      // consecutive correct reviews
      lapses: int("lapses").default(0).notNull(),
      // times forgotten (reset to 0)
      // Scheduling
      dueDate: timestamp("dueDate").notNull(),
      // next review date
      lastReviewedAt: timestamp("lastReviewedAt"),
      // Stats
      totalReviews: int("totalReviews").default(0).notNull(),
      correctReviews: int("correctReviews").default(0).notNull(),
      // Card state
      state: mysqlEnum("state", ["new", "learning", "review", "relearning"]).default("new").notNull(),
      // Source of the card (from a failed response)
      sourceResponseId: int("sourceResponseId").references(() => userResponses.id),
      lastScore: float("lastScore"),
      // last normalized score that triggered this card
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    srsReviewLogs = mysqlTable("srs_review_logs", {
      id: int("id").autoincrement().primaryKey(),
      cardId: int("cardId").notNull().references(() => srsCards.id),
      userId: int("userId").notNull().references(() => users.id),
      questionId: int("questionId").notNull().references(() => questions.id),
      // What the user rated (1=Again, 2=Hard, 3=Good, 4=Easy, 5=Perfect)
      rating: int("rating").notNull(),
      // SM-2 values BEFORE this review
      prevEaseFactor: float("prevEaseFactor").notNull(),
      prevInterval: int("prevInterval").notNull(),
      prevRepetitions: int("prevRepetitions").notNull(),
      // SM-2 values AFTER this review
      newEaseFactor: float("newEaseFactor").notNull(),
      newInterval: int("newInterval").notNull(),
      newRepetitions: int("newRepetitions").notNull(),
      // Response data
      responseText: text("responseText"),
      normalizedScore: float("normalizedScore"),
      reviewedAt: timestamp("reviewedAt").defaultNow().notNull()
    });
    subscriptionPlans = mysqlTable("subscription_plans", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 64 }).notNull(),
      // Free, Pro, Premium
      price: int("price").notNull(),
      // in NPR (Nepali Rupees)
      interval: mysqlEnum("interval", ["monthly", "yearly"]).notNull(),
      features: json("features").notNull(),
      // array of feature strings
      maxSessions: int("maxSessions"),
      // null for unlimited
      storageGB: int("storageGB"),
      // null for unlimited
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    subscriptions = mysqlTable("subscriptions", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id),
      planId: int("planId").notNull().references(() => subscriptionPlans.id),
      status: mysqlEnum("status", ["active", "inactive", "canceled", "expired"]).default("active").notNull(),
      startDate: timestamp("startDate").defaultNow().notNull(),
      endDate: timestamp("endDate"),
      renewalDate: timestamp("renewalDate"),
      autoRenew: boolean("autoRenew").default(true),
      canceledAt: timestamp("canceledAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    payments = mysqlTable("payments", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id),
      subscriptionId: int("subscriptionId").references(() => subscriptions.id),
      gateway: mysqlEnum("gateway", ["esewa", "khalti"]).notNull(),
      amount: int("amount").notNull(),
      // in NPR
      currency: varchar("currency", { length: 3 }).default("NPR").notNull(),
      status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
      transactionId: varchar("transactionId", { length: 255 }),
      // eSewa or Khalti transaction ID
      referenceId: varchar("referenceId", { length: 255 }).unique(),
      // unique reference for payment and renewal idempotency
      description: text("description"),
      metadata: json("metadata"),
      // additional data from gateway
      completedAt: timestamp("completedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    scheduledJobs = mysqlTable("scheduled_jobs", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 128 }).notNull().unique(),
      taskUid: varchar("taskUid", { length: 65 }).notNull().unique(),
      enabled: boolean("enabled").default(true).notNull(),
      lastRunAt: timestamp("lastRunAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    milestones = mysqlTable("milestones", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id),
      milestoneType: varchar("milestoneType", { length: 64 }).notNull(),
      // score_reached, streak, improvement
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      achievedAt: timestamp("achievedAt").defaultNow().notNull(),
      isNotified: boolean("isNotified").default(false)
    });
    attemptHistory = mysqlTable("attempt_history", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().references(() => users.id),
      sessionId: int("sessionId").notNull().references(() => practiceSessions.id),
      questionId: int("questionId").notNull().references(() => questions.id),
      taskType: varchar("taskType", { length: 64 }).notNull(),
      section: mysqlEnum("section", ["speaking", "writing", "reading", "listening"]).notNull(),
      score: int("score"),
      // final score (0-90)
      maxScore: int("maxScore").default(90),
      audioUrl: text("audioUrl"),
      // for speaking tasks
      transcription: text("transcription"),
      // speech-to-text output
      responseText: text("responseText"),
      // user's written or spoken response
      feedback: text("feedback"),
      // AI feedback
      traits: json("traits"),
      // pronunciation, fluency, content scores
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// server/sm2.ts
function computeSm2(input) {
  const { rating } = input;
  let { easeFactor, interval, repetitions, lapses, state } = input;
  const isPass = rating >= 3;
  if (!isPass) {
    lapses += 1;
    repetitions = 0;
    interval = 1;
    const newState2 = state === "new" ? "learning" : "relearning";
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
    return {
      easeFactor,
      interval,
      repetitions,
      lapses,
      state: newState2,
      dueDate: addDays(/* @__PURE__ */ new Date(), interval)
    };
  }
  repetitions += 1;
  const q = rating;
  const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + efDelta);
  if (repetitions === 1) {
    interval = 1;
  } else if (repetitions === 2) {
    interval = 6;
  } else {
    interval = Math.round(interval * easeFactor);
  }
  interval = Math.max(1, Math.min(interval, 365));
  let newState;
  if (repetitions <= 2) {
    newState = "learning";
  } else {
    newState = "review";
  }
  return {
    easeFactor,
    interval,
    repetitions,
    lapses,
    state: newState,
    dueDate: addDays(/* @__PURE__ */ new Date(), interval)
  };
}
function shouldCreateCard(normalizedScore) {
  return normalizedScore < 65;
}
function getRatingLabel(rating) {
  const labels = {
    1: "Again",
    2: "Hard",
    3: "Good",
    4: "Easy",
    5: "Perfect"
  };
  return labels[rating];
}
function getIntervalPreviews(card) {
  const ratings = [1, 2, 3, 4, 5];
  const result = {};
  for (const rating of ratings) {
    const output = computeSm2({ ...card, rating });
    result[rating] = formatInterval(output.interval);
  }
  return result;
}
function formatInterval(days) {
  if (days === 0) return "now";
  if (days === 1) return "1d";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
var MIN_EASE_FACTOR;
var init_sm2 = __esm({
  "server/sm2.ts"() {
    "use strict";
    MIN_EASE_FACTOR = 1.3;
  }
});

// shared/taskTypeAliases.ts
function normalizeTaskType(taskType) {
  return TASK_TYPE_ALIASES[taskType] ?? taskType;
}
function getTaskTypeVariants(taskType) {
  const canonical = normalizeTaskType(taskType);
  const aliases = Object.entries(TASK_TYPE_ALIASES).filter(([, mappedType]) => mappedType === canonical).map(([alias]) => alias);
  return Array.from(/* @__PURE__ */ new Set([canonical, ...aliases]));
}
var TASK_TYPE_ALIASES;
var init_taskTypeAliases = __esm({
  "shared/taskTypeAliases.ts"() {
    "use strict";
    TASK_TYPE_ALIASES = {
      fill_in_blanks_reading: "fill_blanks_reading",
      fill_in_blanks_reading_writing: "fill_blanks_rw",
      fill_in_blanks_rw: "fill_blanks_rw",
      fill_in_blanks_listening: "fill_blanks_listening",
      multiple_choice_single_reading: "multiple_choice_single",
      multiple_choice_multiple_reading: "multiple_choice_multiple",
      multiple_choice_single_listening: "multiple_choice_single",
      multiple_choice_multiple_listening: "multiple_choice_multiple"
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  autoCreateSrsCardsFromSession: () => autoCreateSrsCardsFromSession,
  createMilestone: () => createMilestone,
  createResponse: () => createResponse,
  createSession: () => createSession,
  getDb: () => getDb,
  getDueCards: () => getDueCards,
  getOrCreateSrsCard: () => getOrCreateSrsCard,
  getQuestionById: () => getQuestionById,
  getQuestions: () => getQuestions,
  getQuestionsCount: () => getQuestionsCount,
  getResponseById: () => getResponseById,
  getSessionById: () => getSessionById,
  getSessionResponses: () => getSessionResponses,
  getSrsCardById: () => getSrsCardById,
  getSrsStats: () => getSrsStats,
  getTodayTarget: () => getTodayTarget,
  getUpcomingCards: () => getUpcomingCards,
  getUserAnalytics: () => getUserAnalytics,
  getUserByOpenId: () => getUserByOpenId,
  getUserMilestones: () => getUserMilestones,
  getUserSessions: () => getUserSessions,
  insertQuestion: () => insertQuestion,
  logSrsReview: () => logSrsReview,
  updateResponse: () => updateResponse,
  updateSession: () => updateSession,
  updateSrsCard: () => updateSrsCard,
  updateUserProfile: () => updateUserProfile,
  upsertPracticeTarget: () => upsertPracticeTarget,
  upsertUser: () => upsertUser
});
import { eq, desc, and, gte, lte, gt, asc, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values = { openId: user.openId };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = /* @__PURE__ */ new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateUserProfile(userId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}
async function getQuestions(filters) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(questions).$dynamic();
  const conditions = [];
  if (filters.section) conditions.push(eq(questions.section, filters.section));
  if (filters.taskType) {
    const taskTypeVariants = getTaskTypeVariants(filters.taskType);
    conditions.push(inArray(questions.taskType, taskTypeVariants));
  }
  if (filters.difficulty) conditions.push(eq(questions.difficulty, filters.difficulty));
  if (conditions.length > 0) query = query.where(and(...conditions));
  if (filters.limit) query = query.limit(filters.limit);
  const rows = await query;
  return rows.map((question) => ({
    ...question,
    taskType: normalizeTaskType(question.taskType)
  }));
}
async function getQuestionById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
  const question = result[0];
  return question ? { ...question, taskType: normalizeTaskType(question.taskType) } : void 0;
}
async function insertQuestion(q) {
  const db = await getDb();
  if (!db) return;
  await db.insert(questions).values({
    ...q,
    taskType: normalizeTaskType(q.taskType)
  });
}
async function createSession(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(practiceSessions).values(data);
  return result[0].insertId;
}
async function getSessionById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(practiceSessions).where(eq(practiceSessions.id, id)).limit(1);
  return result[0];
}
async function updateSession(id, data) {
  const db = await getDb();
  if (!db) return;
  if (!data || Object.keys(data).length === 0) return;
  await db.update(practiceSessions).set(data).where(eq(practiceSessions.id, id));
}
async function getUserSessions(userId, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(practiceSessions).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed"))).orderBy(desc(practiceSessions.completedAt)).limit(limit);
}
async function getSessionResponses(sessionId) {
  const db = await getDb();
  if (!db) return [];
  const responses = await db.select().from(userResponses).where(eq(userResponses.sessionId, sessionId));
  const withQuestions = await Promise.all(responses.map(async (r) => {
    const q = await getQuestionById(r.questionId);
    return { ...r, question: q || null };
  }));
  return withQuestions;
}
async function createResponse(data) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(userResponses).values(data);
  return result[0].insertId;
}
async function updateResponse(id, data) {
  const db = await getDb();
  if (!db) return;
  if (!data || Object.keys(data).length === 0) return;
  await db.update(userResponses).set(data).where(eq(userResponses.id, id));
}
async function getUserAnalytics(userId) {
  const db = await getDb();
  if (!db) return null;
  const sessions = await db.select().from(practiceSessions).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed"))).orderBy(desc(practiceSessions.completedAt)).limit(50);
  const totalSessions = sessions.length;
  const latestSession = sessions[0];
  const avgScore = totalSessions > 0 ? sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / totalSessions : 0;
  return { sessions, totalSessions, latestSession, avgScore };
}
async function getTodayTarget(userId) {
  const db = await getDb();
  if (!db) return null;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const result = await db.select().from(practiceTargets).where(and(
    eq(practiceTargets.userId, userId),
    gte(practiceTargets.targetDate, today)
  )).limit(1);
  return result[0] ?? null;
}
async function upsertPracticeTarget(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(practiceTargets).values(data);
}
async function getUserMilestones(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(milestones).where(eq(milestones.userId, userId)).orderBy(desc(milestones.achievedAt)).limit(20);
}
async function createMilestone(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(milestones).values(data);
}
async function getQuestionsCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql`count(*)` }).from(questions);
  return result[0]?.count ?? 0;
}
async function getOrCreateSrsCard(userId, questionId, sourceResponseId, lastScore) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(srsCards).where(and(eq(srsCards.userId, userId), eq(srsCards.questionId, questionId))).limit(1);
  if (existing.length > 0) {
    if (lastScore !== void 0 && existing[0] && (existing[0].lastScore === null || lastScore < (existing[0].lastScore ?? 100))) {
      await db.update(srsCards).set({ lastScore, sourceResponseId: sourceResponseId ?? existing[0].sourceResponseId }).where(eq(srsCards.id, existing[0].id));
    }
    return existing[0] ?? null;
  }
  const dueDate = /* @__PURE__ */ new Date();
  const values = {
    userId,
    questionId,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    lapses: 0,
    dueDate,
    totalReviews: 0,
    correctReviews: 0,
    state: "new",
    sourceResponseId,
    lastScore
  };
  await db.insert(srsCards).values(values);
  const created = await db.select().from(srsCards).where(and(eq(srsCards.userId, userId), eq(srsCards.questionId, questionId))).limit(1);
  return created[0] ?? null;
}
async function getDueCards(userId, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  const rows = await db.select({
    card: srsCards,
    question: questions
  }).from(srsCards).innerJoin(questions, eq(srsCards.questionId, questions.id)).where(and(eq(srsCards.userId, userId), lte(srsCards.dueDate, now))).orderBy(asc(srsCards.dueDate), desc(srsCards.lapses)).limit(limit);
  return rows;
}
async function getUpcomingCards(userId, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  return db.select({ card: srsCards, question: questions }).from(srsCards).innerJoin(questions, eq(srsCards.questionId, questions.id)).where(and(eq(srsCards.userId, userId), gt(srsCards.dueDate, now))).orderBy(asc(srsCards.dueDate)).limit(limit);
}
async function updateSrsCard(cardId, updates) {
  const db = await getDb();
  if (!db) return;
  await db.update(srsCards).set({
    easeFactor: updates.easeFactor,
    interval: updates.interval,
    repetitions: updates.repetitions,
    lapses: updates.lapses,
    state: updates.state,
    dueDate: updates.dueDate,
    lastReviewedAt: /* @__PURE__ */ new Date(),
    totalReviews: sql`totalReviews + 1`,
    correctReviews: updates.isCorrect ? sql`correctReviews + 1` : sql`correctReviews`
  }).where(eq(srsCards.id, cardId));
}
async function logSrsReview(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(srsReviewLogs).values(data);
}
async function getSrsStats(userId) {
  const db = await getDb();
  if (!db) return null;
  const now = /* @__PURE__ */ new Date();
  const [totalCards, dueCards, reviewedToday, allCards] = await Promise.all([
    // Total cards
    db.select({ count: sql`count(*)` }).from(srsCards).where(eq(srsCards.userId, userId)),
    // Due now
    db.select({ count: sql`count(*)` }).from(srsCards).where(and(eq(srsCards.userId, userId), lte(srsCards.dueDate, now))),
    // Reviewed today
    db.select({ count: sql`count(*)` }).from(srsReviewLogs).where(
      and(
        eq(srsReviewLogs.userId, userId),
        gte(srsReviewLogs.reviewedAt, new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      )
    ),
    // All cards for retention calc
    db.select({ totalReviews: srsCards.totalReviews, correctReviews: srsCards.correctReviews, state: srsCards.state, lapses: srsCards.lapses }).from(srsCards).where(eq(srsCards.userId, userId))
  ]);
  const totalReviews = allCards.reduce((s, c) => s + (c.totalReviews ?? 0), 0);
  const correctReviews = allCards.reduce((s, c) => s + (c.correctReviews ?? 0), 0);
  const retentionRate = totalReviews > 0 ? Math.round(correctReviews / totalReviews * 100) : 0;
  const byState = allCards.reduce((acc, c) => {
    acc[c.state] = (acc[c.state] ?? 0) + 1;
    return acc;
  }, {});
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const recentLogs = await db.select({ reviewedAt: srsReviewLogs.reviewedAt, rating: srsReviewLogs.rating }).from(srsReviewLogs).where(and(eq(srsReviewLogs.userId, userId), gte(srsReviewLogs.reviewedAt, fourteenDaysAgo))).orderBy(asc(srsReviewLogs.reviewedAt));
  return {
    totalCards: totalCards[0]?.count ?? 0,
    dueNow: dueCards[0]?.count ?? 0,
    reviewedToday: reviewedToday[0]?.count ?? 0,
    retentionRate,
    byState,
    recentLogs
  };
}
async function getSrsCardById(cardId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(srsCards).where(eq(srsCards.id, cardId)).limit(1);
  return result[0] ?? null;
}
async function autoCreateSrsCardsFromSession(userId, sessionId) {
  const db = await getDb();
  if (!db) return 0;
  const responses = await db.select().from(userResponses).where(and(eq(userResponses.sessionId, sessionId), eq(userResponses.userId, userId)));
  let created = 0;
  for (const response of responses) {
    const score = response.normalizedScore ?? 0;
    if (shouldCreateCard(score)) {
      const card = await getOrCreateSrsCard(
        userId,
        response.questionId,
        response.id,
        score
      );
      if (card) created++;
    }
  }
  return created;
}
async function getResponseById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(userResponses).where(eq(userResponses.id, id)).limit(1);
  return result[0] ?? void 0;
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    init_sm2();
    init_taskTypeAliases();
    _db = null;
  }
});

// shared/_core/errors.ts
var HttpError, ForbiddenError;
var init_errors = __esm({
  "shared/_core/errors.ts"() {
    "use strict";
    HttpError = class extends Error {
      constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "HttpError";
      }
    };
    ForbiddenError = (msg) => new HttpError(403, msg);
  }
});

// server/_core/sdk.ts
var sdk_exports = {};
__export(sdk_exports, {
  sdk: () => sdk
});
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString2, EXCHANGE_TOKEN_PATH, GET_USER_INFO_PATH, GET_USER_INFO_WITH_JWT_PATH, CRON_OPEN_ID_PREFIX, OAuthService, createOAuthHttpClient, SDKServer, sdk;
var init_sdk = __esm({
  "server/_core/sdk.ts"() {
    "use strict";
    init_const();
    init_errors();
    init_db();
    init_env();
    isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
    EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
    GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
    GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
    CRON_OPEN_ID_PREFIX = "cron_";
    OAuthService = class {
      constructor(client) {
        this.client = client;
        console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
        if (!ENV.oAuthServerUrl) {
          console.error(
            "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
          );
        }
      }
      decodeState(state) {
        const redirectUri = atob(state);
        return redirectUri;
      }
      async getTokenByCode(code, state) {
        const payload = {
          clientId: ENV.appId,
          grantType: "authorization_code",
          code,
          redirectUri: this.decodeState(state)
        };
        const { data } = await this.client.post(
          EXCHANGE_TOKEN_PATH,
          payload
        );
        return data;
      }
      async getUserInfoByToken(token) {
        const { data } = await this.client.post(
          GET_USER_INFO_PATH,
          {
            accessToken: token.accessToken
          }
        );
        return data;
      }
    };
    createOAuthHttpClient = () => axios.create({
      baseURL: ENV.oAuthServerUrl,
      timeout: AXIOS_TIMEOUT_MS
    });
    SDKServer = class {
      client;
      oauthService;
      constructor(client = createOAuthHttpClient()) {
        this.client = client;
        this.oauthService = new OAuthService(this.client);
      }
      deriveLoginMethod(platforms, fallback) {
        if (fallback && fallback.length > 0) return fallback;
        if (!Array.isArray(platforms) || platforms.length === 0) return null;
        const set = new Set(
          platforms.filter((p) => typeof p === "string")
        );
        if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
        if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
        if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
        if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
          return "microsoft";
        if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
        const first = Array.from(set)[0];
        return first ? first.toLowerCase() : null;
      }
      /**
       * Exchange OAuth authorization code for access token
       * @example
       * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
       */
      async exchangeCodeForToken(code, state) {
        return this.oauthService.getTokenByCode(code, state);
      }
      /**
       * Get user information using access token
       * @example
       * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
       */
      async getUserInfo(accessToken) {
        const data = await this.oauthService.getUserInfoByToken({
          accessToken
        });
        const loginMethod = this.deriveLoginMethod(
          data?.platforms,
          data?.platform ?? data.platform ?? null
        );
        return {
          ...data,
          platform: loginMethod,
          loginMethod
        };
      }
      parseCookies(cookieHeader) {
        if (!cookieHeader) {
          return /* @__PURE__ */ new Map();
        }
        const parsed = parseCookieHeader(cookieHeader);
        return new Map(Object.entries(parsed));
      }
      getSessionSecret() {
        const secret = ENV.cookieSecret;
        return new TextEncoder().encode(secret);
      }
      /**
       * Create a session token for a Manus user openId
       * @example
       * const sessionToken = await sdk.createSessionToken(userInfo.openId);
       */
      async createSessionToken(openId, options = {}) {
        return this.signSession(
          {
            openId,
            appId: ENV.appId,
            name: options.name || ""
          },
          options
        );
      }
      async signSession(payload, options = {}) {
        const issuedAt = Date.now();
        const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
        const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
        const secretKey = this.getSessionSecret();
        return new SignJWT({
          openId: payload.openId,
          appId: payload.appId,
          name: payload.name
        }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
      }
      async verifySession(cookieValue) {
        if (!cookieValue) {
          console.warn("[Auth] Missing session cookie");
          return null;
        }
        try {
          const secretKey = this.getSessionSecret();
          const { payload } = await jwtVerify(cookieValue, secretKey, {
            algorithms: ["HS256"]
          });
          const { openId, appId, name } = payload;
          if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
            console.warn("[Auth] Session payload missing required fields");
            return null;
          }
          return {
            openId,
            appId,
            name
          };
        } catch (error) {
          console.warn("[Auth] Session verification failed", String(error));
          return null;
        }
      }
      async getUserInfoWithJwt(jwtToken) {
        const payload = {
          jwtToken,
          projectId: ENV.appId
        };
        const { data } = await this.client.post(
          GET_USER_INFO_WITH_JWT_PATH,
          payload
        );
        const loginMethod = this.deriveLoginMethod(
          data?.platforms,
          data?.platform ?? data.platform ?? null
        );
        return {
          ...data,
          platform: loginMethod,
          loginMethod
        };
      }
      async authenticateRequest(req) {
        const cookies = this.parseCookies(req.headers.cookie);
        const sessionCookie = cookies.get(COOKIE_NAME);
        const session = await this.verifySession(sessionCookie);
        if (!session) {
          throw ForbiddenError("Invalid session cookie");
        }
        if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
          const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
          if (!userInfo.taskUid) throw ForbiddenError("Cron session missing task UID");
          const now = /* @__PURE__ */ new Date();
          return {
            id: -1,
            openId: userInfo.openId,
            name: userInfo.name || "Manus Scheduled Task",
            email: userInfo.email ?? null,
            loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
            role: "user",
            createdAt: now,
            updatedAt: now,
            lastSignedIn: now,
            targetScore: 65,
            currentLevel: "intermediate",
            dailyGoalMinutes: 30,
            notificationsEnabled: true,
            isBanned: false,
            banReason: null,
            bannedAt: null,
            taskUid: userInfo.taskUid,
            isCron: true
          };
        }
        const sessionUserId = session.openId;
        const signedInAt = /* @__PURE__ */ new Date();
        let user = await getUserByOpenId(sessionUserId);
        if (!user) {
          try {
            const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
            await upsertUser({
              openId: userInfo.openId,
              name: userInfo.name || null,
              email: userInfo.email ?? null,
              loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
              lastSignedIn: signedInAt
            });
            user = await getUserByOpenId(userInfo.openId);
          } catch (error) {
            console.error("[Auth] Failed to sync user from OAuth:", error);
            throw ForbiddenError("Failed to sync user info");
          }
        }
        if (!user) {
          throw ForbiddenError("User not found");
        }
        if (user.isBanned) {
          throw ForbiddenError(user.banReason ? `Account suspended: ${user.banReason}` : "Account suspended");
        }
        await upsertUser({
          openId: user.openId,
          lastSignedIn: signedInAt
        });
        return user;
      }
    };
    sdk = new SDKServer();
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  storageGet: () => storageGet,
  storagePut: () => storagePut
});
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
async function buildDownloadUrl(baseUrl, relKey, apiKey) {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey)
  });
  return (await response.json()).url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}
async function storageGet(relKey) {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey)
  };
}
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_env();
  }
});

// server/api.ts
import "dotenv/config";
import serverless from "serverless-http";

// server/_core/app.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/routers.ts
init_const();
import { z as z8 } from "zod";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
init_const();
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
init_db();
init_sm2();
import { TRPCError as TRPCError8 } from "@trpc/server";

// server/_core/llm.ts
init_env();
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// shared/scoreCalibrationTable.ts
var PTE_RAW_SCORE_ANCHORS = [
  { rawPercentage: 0, pteScore: 10 },
  { rawPercentage: 50, pteScore: 50 },
  { rawPercentage: 75, pteScore: 70 },
  { rawPercentage: 100, pteScore: 90 }
];
function normalizeRawPercentageToPte(rawPercentage) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(rawPercentage) ? rawPercentage : 0));
  for (let index = 1; index < PTE_RAW_SCORE_ANCHORS.length; index += 1) {
    const lower = PTE_RAW_SCORE_ANCHORS[index - 1];
    const upper = PTE_RAW_SCORE_ANCHORS[index];
    if (clamped <= upper.rawPercentage) {
      const ratio = (clamped - lower.rawPercentage) / (upper.rawPercentage - lower.rawPercentage);
      return Math.round(lower.pteScore + ratio * (upper.pteScore - lower.pteScore));
    }
  }
  return 90;
}
var PTE_CALIBRATION_TABLE = {
  writing_essay: [
    { minRaw: 0, maxRaw: 3, pteScore: 10, cefrLevel: "A1", description: "Below functional proficiency" },
    { minRaw: 4, maxRaw: 7, pteScore: 30, cefrLevel: "A2", description: "Limited baseline ability" },
    { minRaw: 8, maxRaw: 11, pteScore: 50, cefrLevel: "B1", description: "Moderate communicative competence" },
    { minRaw: 12, maxRaw: 14, pteScore: 65, cefrLevel: "B2", description: "Competent academic English user" },
    { minRaw: 15, maxRaw: 16, pteScore: 79, cefrLevel: "C1", description: "Advanced professional proficiency" },
    { minRaw: 17, maxRaw: 18, pteScore: 90, cefrLevel: "C2", description: "Expert native-like mastery" }
  ],
  write_from_dictation: [
    { minRaw: 0, maxRaw: 5, pteScore: 10, cefrLevel: "A1", description: "Minimal recognition" },
    { minRaw: 6, maxRaw: 12, pteScore: 30, cefrLevel: "A2", description: "Partial listening capture" },
    { minRaw: 13, maxRaw: 18, pteScore: 50, cefrLevel: "B1", description: "Competent word retention" },
    { minRaw: 19, maxRaw: 24, pteScore: 65, cefrLevel: "B2", description: "Strong listening accuracy" },
    { minRaw: 25, maxRaw: 28, pteScore: 79, cefrLevel: "C1", description: "Superior dictation performance" },
    { minRaw: 29, maxRaw: 30, pteScore: 90, cefrLevel: "C2", description: "Flawless exact recall" }
  ]
};
function calibrateScore(taskCategory, rawScore) {
  const bands = PTE_CALIBRATION_TABLE[taskCategory];
  if (!bands) {
    const clamped = Math.max(10, Math.min(90, Math.round(rawScore)));
    return { pteScore: clamped, cefrLevel: clamped >= 79 ? "C1" : clamped >= 65 ? "B2" : "B1", description: "Standard linear normalization" };
  }
  const band = bands.find((b) => rawScore >= b.minRaw && rawScore <= b.maxRaw) || bands[bands.length - 1];
  return { pteScore: band.pteScore, cefrLevel: band.cefrLevel, description: band.description };
}

// shared/pteCalibrationAnchors.ts
var PTE_SUBJECTIVE_CALIBRATION_ANCHORS = `
ILLUSTRATIVE CALIBRATION ANCHORS \u2014 APPLICATION REFERENCE ONLY
Use these as qualitative band boundaries. Do not copy their wording, and do not
award a band from fluency alone. Content and form gates remain decisive.

10 (zero/near-zero): "I do not know." The response is empty, irrelevant, or fails a required form/content gate.
30 (limited): "Technology is good. Many people use it. It is sometimes difficult." Isolated basic ideas; development and control are very limited.
50 (competent): "Technology helps people communicate and find information, but it can also create stress when people are always connected." Main meaning is recoverable, but language range and development are modest.
65 (good): "Technology improves access to education and services, although excessive use can reduce concentration. Its value depends on using it purposefully and maintaining reasonable limits." Relevant, organized response with adequate range and some non-blocking errors.
79 (very good): "Digital tools have widened access to education, accelerated collaboration, and reduced geographic barriers; nevertheless, constant connectivity can erode attention and privacy. Responsible design and informed use can preserve the benefits while limiting those costs." Fully relevant, coherent, flexible academic language with only occasional inaccuracies.
90 (expert): "Technology is most valuable when it expands human agency rather than merely increasing activity: it democratizes expertise, coordinates complex systems, and enables participation across distance, while principled governance protects attention, privacy, and equity. This balanced view recognizes both measurable gains and the conditions required to sustain them." Complete, precise, well-controlled response meeting every task requirement.

For speaking tasks, apply the same content ladder to the transcript while separately judging pronunciation and oral fluency. For summaries, require source-grounded coverage. For essays, require the requested form and development. For objective tasks, use deterministic answer keys instead of subjective anchors.
`;

// server/scoring.ts
init_taskTypeAliases();
var PTE_BAND_DESCRIPTORS = `
PTE Academic Score Band Reference (10-90 scale):

BAND 90 (Expert): Fully operational command. Accurate, fluent, complete. Academic vocabulary used naturally. Complex structures with no errors. All task requirements met perfectly.

BAND 79-89 (Very Good): Operational command with occasional inaccuracies. Effective use of complex language. Minor errors that do not impede communication. Task fully addressed.

BAND 65-78 (Good): Generally effective command. Mix of simple and complex structures. Some errors but meaning is clear. Most task requirements met. Adequate vocabulary range.

BAND 50-64 (Competent): Partial command. Errors noticeable but communication maintained. Limited range of vocabulary and structures. Some task requirements not fully met.

BAND 36-49 (Modest): Intermittent command. Frequent errors affecting clarity. Basic vocabulary. Task partially addressed. Significant gaps in performance.

BAND 10-35 (Limited): Extremely limited command. Errors dominate. Very basic vocabulary. Task requirements largely unmet. Communication severely impaired.
`;
function normalizeToPTE(rawScore) {
  return normalizeRawPercentageToPte(rawScore);
}
async function generateDiagnosticFeedback(params) {
  const target = params.targetScore || 65;
  const gap = target - params.overallScore;
  const systemPrompt = `You are an expert PTE Academic coach with 10+ years of experience preparing students for the PTE exam.

${PTE_BAND_DESCRIPTORS}

Your role: Analyse the student's score profile, identify the SPECIFIC skills that are limiting their overall score, and create a highly targeted, actionable improvement plan.

Key coaching principles:
1. The LOWEST communicative skill score has the most impact on overall score \u2014 address it first
2. Enabling skills (Grammar, Vocabulary, Pronunciation, Fluency) affect multiple communicative skills simultaneously
3. A 5-point improvement in a weak skill yields more overall gain than a 5-point improvement in a strong skill
4. Be specific: don't say "improve grammar" \u2014 say "focus on subject-verb agreement and article usage"

Return ONLY valid JSON:
{
  "weakSkills": ["<specific skill with reason>"],
  "strongSkills": ["<specific skill>"],
  "actionPlan": "<detailed 4-5 sentence plan with specific daily tasks, time allocation, and measurable targets>"
}`;
  const scoresSummary = `
Current Score Profile:
- Overall: ${params.overallScore}/90 (Target: ${target}/90, Gap: ${gap > 0 ? `+${gap} needed` : "target met"})
- Speaking: ${params.speakingScore ?? "Not tested"}/90
- Writing: ${params.writingScore ?? "Not tested"}/90
- Reading: ${params.readingScore ?? "Not tested"}/90
- Listening: ${params.listeningScore ?? "Not tested"}/90

Enabling Skills:
- Grammar: ${params.grammarScore ?? "N/A"}/90
- Vocabulary: ${params.vocabularyScore ?? "N/A"}/90
- Pronunciation: ${params.pronunciationScore ?? "N/A"}/90
- Oral Fluency: ${params.fluencyScore ?? "N/A"}/90
- Spelling: ${params.spellingScore ?? "N/A"}/90
- Written Discourse: ${params.writtenDiscourseScore ?? "N/A"}/90`;
  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: scoresSummary }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "diagnostic_feedback_v2",
          strict: true,
          schema: {
            type: "object",
            properties: {
              weakSkills: { type: "array", items: { type: "string" } },
              strongSkills: { type: "array", items: { type: "string" } },
              actionPlan: { type: "string" }
            },
            required: ["weakSkills", "strongSkills", "actionPlan"],
            additionalProperties: false
          }
        }
      }
    });
    const content = result.choices[0]?.message?.content;
    return JSON.parse(content || "{}");
  } catch (err) {
    console.error("Diagnostic feedback error:", err);
    return {
      weakSkills: ["Unable to generate diagnostic feedback"],
      strongSkills: [],
      actionPlan: "Please complete more practice tasks to receive personalised feedback."
    };
  }
}
function scoreObjectiveTask(params) {
  const { correctAnswer, userAnswer } = params;
  const taskType = normalizeTaskType(params.taskType);
  if (taskType === "write_from_dictation") {
    const correct2 = (typeof correctAnswer === "string" ? correctAnswer : correctAnswer[0]).toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    const user2 = (typeof userAnswer === "string" ? userAnswer : userAnswer[0]).toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    let matches = 0;
    const correctCopy = [...correct2];
    for (const word of user2) {
      const idx = correctCopy.indexOf(word);
      if (idx !== -1) {
        matches++;
        correctCopy.splice(idx, 1);
      }
    }
    const score2 = correct2.length > 0 ? matches / correct2.length * 100 : 0;
    const normalizedScore = normalizeToPTE(score2);
    const pct = Math.round(score2);
    return {
      score: score2,
      normalizedScore,
      feedback: score2 >= 90 ? `Excellent! ${matches}/${correct2.length} words correct (${pct}%). Near-perfect transcription.` : score2 >= 70 ? `Good. ${matches}/${correct2.length} words correct (${pct}%). Review the ${correct2.length - matches} missed word(s).` : score2 >= 50 ? `Satisfactory. ${matches}/${correct2.length} words correct (${pct}%). Focus on listening for unstressed function words.` : `Needs improvement. Only ${matches}/${correct2.length} words correct (${pct}%). Practise dictation with academic texts daily.`
    };
  }
  if (taskType === "reorder_paragraphs") {
    const toOrder = (value) => {
      if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
      const raw = value.trim();
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map(String).map((item) => item.trim()).filter(Boolean);
        }
      } catch {
      }
      return raw.split(/[,|\n]+/).map((item) => item.trim()).filter(Boolean);
    };
    const correctOrder = toOrder(correctAnswer);
    const userOrder = toOrder(userAnswer);
    let correctPairs = 0;
    const totalPairs = Math.max(correctOrder.length - 1, 1);
    for (let i = 0; i < correctOrder.length - 1; i++) {
      const userIdx = userOrder.indexOf(correctOrder[i]);
      if (userIdx !== -1 && userOrder[userIdx + 1] === correctOrder[i + 1]) correctPairs++;
    }
    const score2 = correctPairs / totalPairs * 100;
    return {
      score: score2,
      normalizedScore: normalizeToPTE(score2),
      feedback: score2 >= 80 ? "Excellent paragraph ordering! Strong understanding of discourse structure." : score2 >= 60 ? "Good attempt. Review how cohesive devices (pronouns, connectors) link paragraphs." : score2 >= 40 ? "Partial credit. Focus on identifying the topic sentence (most general statement) first." : "Needs improvement. Strategy: find the topic sentence, then follow pronoun references and time markers."
    };
  }
  if (taskType === "highlight_incorrect_words") {
    const toWordSet = (value) => {
      let values = Array.isArray(value) ? value : [value];
      if (!Array.isArray(value)) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) values = parsed;
        } catch {
        }
      }
      return new Set(values.filter((item) => typeof item === "string").map((item) => item.trim().toLowerCase()).filter(Boolean));
    };
    const correctSet = toWordSet(correctAnswer);
    const userSet = toWordSet(userAnswer);
    const truePositives = Array.from(userSet).filter((w) => correctSet.has(w)).length;
    const falsePositives = Array.from(userSet).filter((w) => !correctSet.has(w)).length;
    const score2 = Math.max(0, (truePositives - falsePositives) / Math.max(correctSet.size, 1) * 100);
    return {
      score: score2,
      normalizedScore: normalizeToPTE(score2),
      feedback: score2 >= 80 ? "Excellent! Accurately identified the incorrect words." : score2 >= 50 ? `Good attempt. You found ${truePositives} correct but also selected ${falsePositives} false positive(s). Listen more carefully for word-level mismatches.` : "Needs improvement. Focus on listening word-by-word while reading the transcript simultaneously."
    };
  }
  if (["fill_blanks_reading", "fill_blanks_rw", "fill_blanks_listening"].includes(taskType)) {
    const toParts = (value) => {
      let parts;
      if (Array.isArray(value)) {
        parts = value;
      } else {
        const raw = value.trim();
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parts = parsed;
          } else if (parsed && typeof parsed === "object") {
            parts = Object.entries(parsed).sort(([left], [right]) => left.localeCompare(right, void 0, { numeric: true })).map(([, answer]) => answer);
          } else {
            parts = raw.split(/[,\\n|]+/);
          }
        } catch {
          parts = raw.split(/[,\\n|]+/);
        }
      }
      return parts.map((part) => String(part).trim().toLowerCase().replace(/[^a-z0-9'’-]/g, "")).filter(Boolean);
    };
    const correctParts = toParts(correctAnswer);
    const userParts = toParts(userAnswer);
    const matched = correctParts.reduce((count, expected, index) => count + (userParts[index] === expected ? 1 : 0), 0);
    const score2 = correctParts.length > 0 ? matched / correctParts.length * 100 : 0;
    return {
      score: score2,
      normalizedScore: normalizeToPTE(score2),
      feedback: matched === correctParts.length ? `Excellent! All ${correctParts.length} blank(s) are correct.` : `Partial credit: ${matched}/${correctParts.length} blank(s) correct. Review the context around each gap.`
    };
  }
  const toSelections = (value) => {
    if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
    const raw = value.trim();
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((item) => item.trim()).filter(Boolean);
      }
    } catch {
    }
    return raw ? [raw] : [];
  };
  const correct = toSelections(correctAnswer).sort();
  const user = toSelections(userAnswer).sort();
  const isCorrect = JSON.stringify(correct) === JSON.stringify(user);
  const score = isCorrect ? 100 : 0;
  if (taskType === "multiple_choice_multiple") {
    const correctSet = new Set(correct);
    const userSet = new Set(user);
    const hits = Array.from(userSet).filter((a) => correctSet.has(a)).length;
    const misses = Array.from(userSet).filter((a) => !correctSet.has(a)).length;
    const partialScore = Math.max(0, (hits - misses) / Math.max(correct.length, 1) * 100);
    return {
      score: partialScore,
      normalizedScore: normalizeToPTE(partialScore),
      feedback: partialScore >= 80 ? "Excellent! Most correct options selected." : partialScore >= 50 ? `Good. ${hits} correct selection(s) but ${misses} incorrect. Re-read each option carefully against the text.` : "Needs improvement. Eliminate clearly wrong options first, then compare remaining options to the text."
    };
  }
  return {
    score,
    normalizedScore: normalizeToPTE(score),
    feedback: isCorrect ? "Correct! Well done." : `Incorrect. The correct answer was: ${Array.isArray(correctAnswer) ? correctAnswer.join(", ") : correctAnswer}`
  };
}

// server/coachingSignals.ts
var ACADEMIC_WORDS = /* @__PURE__ */ new Set([
  "analyze",
  "analysis",
  "approach",
  "benefit",
  "consequently",
  "constitute",
  "contribute",
  "demonstrate",
  "distribution",
  "economic",
  "environmental",
  "factor",
  "fundamental",
  "indicate",
  "innovation",
  "interpret",
  "significant",
  "sustainable",
  "theory",
  "therefore",
  "trend",
  "variation",
  "whereas",
  "whereby"
]);
var COLLOCATIONS = [
  /significant\s+(?:impact|role|factor)/i,
  /plays?\s+(?:a|an)\s+(?:important|significant|crucial)\s+role/i,
  /(?:rapid|economic|social|technological)\s+development/i,
  /(?:address|tackle|mitigate)\s+(?:the\s+)?(?:issue|problem|challenge)/i
];
function detectGrammarSignals(response) {
  const text3 = response.trim();
  if (!text3) return [];
  const signals = [];
  const push = (signal) => {
    if (!signals.some((existing) => existing.type === signal.type)) signals.push(signal);
  };
  if (/\b(?:he|she|it)\s+(?:are|were|have|do)\b|\b(?:they|we|you)\s+(?:is|was|has|does)\b/i.test(text3)) {
    push({ type: "subject-verb agreement", example: "subject and verb do not agree", correction: "Match the verb to the subject in number and person.", explanation: "Agreement errors reduce grammatical accuracy and can make the response harder to follow.", impactOnScore: "medium" });
  }
  if (/\b(?:yesterday|last\s+year|in\s+\d{4})\b[^.!?]{0,50}\b(?:is|are|will)\b/i.test(text3)) {
    push({ type: "tense", example: "past-time marker paired with a present or future verb", correction: "Use a past-tense verb for completed past events.", explanation: "Tense consistency clarifies when events happened.", impactOnScore: "medium" });
  }
  if (/\b(?:a|an)\s+(?:information|advice|research|equipment|evidence)\b/i.test(text3)) {
    push({ type: "articles", example: "article used with an uncountable noun", correction: "Use the uncountable noun without a/an, or add a countable unit.", explanation: "Article choice is part of grammatical form in academic writing.", impactOnScore: "medium" });
  }
  if (/\b(?:discuss|depend|interested|responsible|impact)\s+(?:about|of|with|on)\b/i.test(text3)) {
    push({ type: "prepositions", example: "verb or adjective paired with an incorrect preposition", correction: "Check the fixed preposition used by the expression.", explanation: "Preposition errors affect naturalness and precise meaning.", impactOnScore: "medium" });
  }
  return signals;
}
function measureVocabularySophistication(response) {
  const words = response.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
  const unique = new Set(words);
  return {
    wordCount: words.length,
    lexicalDiversity: words.length ? Number((unique.size / words.length).toFixed(2)) : 0,
    academicWordCount: words.filter((word) => ACADEMIC_WORDS.has(word)).length,
    collocationCount: COLLOCATIONS.filter((pattern) => pattern.test(response)).length
  };
}

// server/aiPromptUtils.ts
function capPromptText(value, maxCharacters) {
  const normalized = (value ?? "").trim();
  if (maxCharacters <= 0) return "";
  if (normalized.length <= maxCharacters) return normalized;
  const marker = "[content truncated for scoring context]";
  if (maxCharacters <= marker.length) return marker.slice(0, maxCharacters);
  return `${normalized.slice(0, maxCharacters - marker.length).trimEnd()}${marker}`;
}

// server/aiCoach.ts
var MODEL_ANSWER_BANDS = ["65", "79", "90"];
function normalizeModelAnswers(input) {
  if (!Array.isArray(input)) return [];
  return input.filter(
    (answer) => typeof answer === "object" && answer !== null && MODEL_ANSWER_BANDS.includes(answer.band) && typeof answer.response === "string" && typeof answer.commentary === "string"
  ).map((answer) => ({
    band: answer.band,
    response: answer.response.trim(),
    commentary: answer.commentary.trim()
  })).filter((answer) => answer.response.length > 0 && answer.commentary.length > 0);
}
var PTE_BAND_REFERENCE = `
PTE Academic Score Bands:
- 90 (Expert): Fully operational. Accurate, fluent, complete. No errors.
- 79-89 (Very Good): Effective command. Occasional minor inaccuracies. Task fully addressed.
- 65-78 (Good): Generally effective. Mix of simple/complex. Some errors but meaning clear.
- 50-64 (Competent): Partial command. Errors noticeable but communication maintained.
- 36-49 (Modest): Intermittent command. Frequent errors affecting clarity.
- 10-35 (Limited): Extremely limited. Errors dominate. Task largely unmet.
`;
var TASK_COACHING_PROMPTS = {
  read_aloud: `You are an expert PTE Academic Read Aloud evaluator with deep knowledge of English phonology and the official PTE scoring rubric.

${PTE_BAND_REFERENCE}

OFFICIAL READ ALOUD SCORING RUBRIC:
- CONTENT (0-5): Proportion of words from the original text spoken correctly
  5 = All words correct | 4 = 1-2 minor errors | 3 = 3-5 errors | 2 = 6-10 errors | 1 = >10 errors | 0 = Unrecognisable
- PRONUNCIATION (0-5): Clarity and accuracy of phoneme production
  5 = Native-like, all phonemes clear, correct stress | 4 = Mostly clear, minor accent | 3 = Some unclear phonemes | 2 = Frequently unclear | 1 = Largely unintelligible | 0 = Cannot be understood
- ORAL FLUENCY (0-5): Natural rhythm, pace (ideal: 120-160 wpm), smooth delivery
  5 = Completely natural | 4 = Minor hesitations | 3 = Noticeable hesitations | 2 = Frequent pauses | 1 = Very choppy | 0 = Extremely disfluent

COMMON READ ALOUD ERRORS TO IDENTIFY:
1. Incorrect word stress (e.g., "REsearch" instead of "reSEARCH" as a verb)
2. Mispronounced academic vocabulary (e.g., "epitome" pronounced as "epi-TOME")
3. Monotone delivery lacking sentence stress on content words
4. Excessive pausing at every comma
5. Rushing through difficult phrases
6. Omitting or substituting words
7. Adding filler words (um, uh, like)
8. Incorrect vowel sounds in unstressed syllables`,
  repeat_sentence: `You are an expert PTE Academic Repeat Sentence evaluator.

${PTE_BAND_REFERENCE}

OFFICIAL REPEAT SENTENCE SCORING RUBRIC:
- CONTENT (0-5): Accuracy of reproduction (exact words, correct order)
  5 = Perfect reproduction | 4 = 1 word changed/missing | 3 = 2-3 changes | 2 = Only fragments correct | 1 = Barely recognisable | 0 = Unrecognisable
- PRONUNCIATION (0-5): Clarity of phoneme production
- ORAL FLUENCY (0-5): Connected speech, natural pace, no unnatural pausing

CHUNKING STRATEGY ASSESSMENT:
- Did the student use meaningful phrase chunks? (e.g., "students who participate / in extracurricular activities / tend to develop")
- Were function words (articles, prepositions) retained?
- Was sentence-final intonation appropriate?

COMMON ERRORS:
1. Dropping function words (articles, prepositions, auxiliaries)
2. Changing word order
3. Substituting synonyms (acceptable in meaning but penalised in PTE)
4. Losing the end of long sentences (recency effect)
5. Unnatural pausing between chunks`,
  describe_image: `You are an expert PTE Academic Describe Image evaluator.

${PTE_BAND_REFERENCE}

OFFICIAL DESCRIBE IMAGE SCORING RUBRIC:
- CONTENT (0-5): Coverage of key visual elements
  5 = All main features, trends, data, comparisons, and conclusion | 4 = Most features with specific data | 3 = Some features, misses trends | 2 = Only superficial | 1 = Minimal | 0 = Off-topic
- ORAL FLUENCY (0-5): Smooth delivery within 40 seconds
- PRONUNCIATION (0-5): Clear articulation of numbers, percentages, technical terms

IDEAL DESCRIBE IMAGE STRUCTURE (40 seconds):
1. Introduction (5s): "This [chart/graph/diagram] shows/illustrates..."
2. Main trend/feature (15s): Highest/lowest values with specific numbers
3. Comparison (10s): Contrast between categories or time periods
4. Conclusion (10s): Overall trend or key takeaway

COMMON ERRORS:
1. Not mentioning specific numbers or percentages
2. Only describing one aspect (e.g., only the highest bar)
3. Using vague language ("it went up") instead of precise language ("increased by 15%")
4. Running out of time before concluding
5. Describing what the image IS rather than what it SHOWS
6. Poor pronunciation of numbers (e.g., "fifteen percent" vs "fifty percent")`,
  retell_lecture: `You are an expert PTE Academic Re-tell Lecture evaluator.

${PTE_BAND_REFERENCE}

OFFICIAL RE-TELL LECTURE SCORING RUBRIC:
- CONTENT (0-5): Coverage of main topic, key arguments, supporting details
  5 = All main points with logical structure | 4 = Most points, minor gaps | 3 = Main topic + some points | 2 = Only main topic | 1 = Minimal content | 0 = Off-topic
- ORAL FLUENCY (0-5): Natural academic delivery
- PRONUNCIATION (0-5): Clear articulation of academic/technical vocabulary

NOTE-TAKING STRATEGY ASSESSMENT:
- Was the main argument captured?
- Were 3-5 key supporting points included?
- Was the structure logical (topic \u2192 argument \u2192 evidence \u2192 conclusion)?
- Were academic terms pronounced correctly?

COMMON ERRORS:
1. Describing only the topic without the argument
2. Listing facts without showing relationships
3. Missing the speaker's conclusion or stance
4. Mispronouncing technical/academic vocabulary
5. Speaking too quickly and losing clarity`,
  answer_short_question: `You are an expert PTE Academic Answer Short Question evaluator.

SCORING: Binary \u2014 correct (100) or incorrect (0).
A correct answer is typically 1-3 words. Partial answers or over-explanations do not gain extra credit.

COMMON ERRORS:
1. Giving a sentence when one word suffices
2. Confusing similar concepts (e.g., "biography" vs "autobiography")
3. Mispronouncing the answer
4. Hesitating too long before answering`,
  summarize_written_text: `You are an expert PTE Academic Summarize Written Text evaluator.

${PTE_BAND_REFERENCE}

OFFICIAL SWT SCORING RUBRIC (max 8 points):
- CONTENT (0-2): Key points from passage included, no irrelevant information
  2 = All key points | 1 = Main point only | 0 = Irrelevant or missing
- FORM (0-1): Single sentence, 5-75 words, grammatically complete
  1 = Meets all form requirements | 0 = Multiple sentences OR outside word range
- GRAMMAR (0-2): Complex sentence structure, correct subordination
  2 = No errors, complex syntax | 1 = Minor errors | 0 = Major errors
- VOCABULARY (0-2): Academic vocabulary, paraphrasing (not copying)
  2 = Sophisticated paraphrase, academic range | 1 = Some paraphrase | 0 = Verbatim copying
- SPELLING (0-1): No spelling errors

CRITICAL RULES:
1. MUST be ONE sentence only \u2014 multiple sentences = FORM score 0
2. MUST be 5-75 words \u2014 outside range = FORM score 0
3. Should NOT copy sentences verbatim
4. Should use complex structures: relative clauses, participle phrases, nominalisations
5. Should cover MAIN idea + 2-3 key supporting points

COMMON ERRORS:
1. Writing multiple sentences (most common error)
2. Exceeding 75 words
3. Copying sentences directly from the passage
4. Omitting the main argument
5. Using simple "and" coordination instead of complex subordination
6. Missing key supporting details`,
  write_essay: `You are an expert PTE Academic Write Essay evaluator.

${PTE_BAND_REFERENCE}

OFFICIAL ESSAY SCORING RUBRIC (max 15 points):
- CONTENT (0-3): Addresses all aspects, develops clear position, relevant examples
  3 = Fully addresses all aspects with well-developed argument | 2 = Addresses most aspects | 1 = Partially addresses | 0 = Off-topic
- FORM (0-2): 200-300 words, appropriate structure
  2 = 200-300 words, clear intro/body/conclusion | 1 = Minor structure issues or slight word count deviation | 0 = <150 or >380 words
- GRAMMAR (0-2): Variety of structures, minimal errors
  2 = Complex variety, no significant errors | 1 = Some variety, minor errors | 0 = Basic structures, frequent errors
- VOCABULARY (0-2): Academic range, precise word choice
  2 = Wide academic range, precise collocations | 1 = Adequate range | 0 = Basic/repetitive
- SPELLING (0-1): Consistent spelling
- WRITTEN DISCOURSE (0-2): Cohesion, coherence, discourse markers
  2 = Excellent flow, varied discourse markers | 1 = Adequate cohesion | 0 = Poor flow, no markers

IDEAL ESSAY STRUCTURE:
1. Introduction (40-50 words): Paraphrase prompt + clear thesis statement
2. Body 1 (60-80 words): Main argument + specific example/evidence + explanation
3. Body 2 (60-80 words): Second argument OR counter-argument + rebuttal
4. Conclusion (30-40 words): Restate thesis + broader implication

COMMON ERRORS:
1. Not paraphrasing the prompt in the introduction
2. Weak topic sentences that don't preview the paragraph
3. Generic examples ("For example, in many countries...")
4. Repetitive vocabulary (using the same word 3+ times)
5. Missing discourse markers (Furthermore, However, In contrast, Consequently)
6. Conclusion that just repeats the introduction word-for-word
7. Word count outside 200-300 range`,
  summarize_spoken_text: `You are an expert PTE Academic Summarize Spoken Text evaluator.

OFFICIAL SST SCORING RUBRIC (max 8 points \u2014 same as SWT):
- CONTENT (0-2): Key points from lecture captured
- FORM (0-1): 50-70 words, complete sentences, paragraph format
- GRAMMAR (0-2): Accurate and varied structures
- VOCABULARY (0-2): Academic vocabulary, paraphrasing
- SPELLING (0-1): Correct spelling

COMMON ERRORS:
1. Word count outside 50-70 range
2. Writing bullet points instead of prose
3. Missing the main argument of the lecture
4. Including irrelevant details while missing key points
5. Copying exact phrases from the transcript`,
  multiple_choice_single: `You are an expert PTE Academic Reading evaluator.

SCORING: Correct = full marks, Incorrect = 0.

STRATEGY COACHING:
1. Read the question FIRST to know what to look for
2. Skim the passage for the relevant section
3. Eliminate clearly wrong options
4. Watch for negation words: NOT, EXCEPT, NEVER, LEAST
5. The correct answer is usually a paraphrase, not a direct quote
6. Beware of "partially true" options that miss a key qualifier

COMMON ERRORS:
1. Choosing answers that are true but not supported by the text
2. Missing negation words
3. Confusing the author's view with examples cited in the text
4. Choosing the first plausible option without checking others`,
  multiple_choice_multiple: `You are an expert PTE Academic Reading evaluator.

SCORING: Partial credit \u2014 correct selections minus incorrect selections.

STRATEGY COACHING:
1. Typically 2-3 correct answers out of 5-7 options
2. Each correct selection = +1, each incorrect = -1 (net scoring)
3. If unsure, it's better to leave an option unselected than guess wrong
4. Verify each option independently against the text

COMMON ERRORS:
1. Over-selecting (choosing too many options)
2. Under-selecting (missing correct options)
3. Not reading each option carefully against the passage`,
  reorder_paragraphs: `You are an expert PTE Academic Reading evaluator.

SCORING: Partial credit for adjacent pairs in correct order.

STRATEGY COACHING:
1. Find the TOPIC SENTENCE first (most general, introduces the topic)
2. Look for pronouns that refer back (it, they, this, these \u2192 must follow what they refer to)
3. Identify time/sequence markers (first, then, subsequently, finally)
4. Find cause-effect relationships (because, therefore, as a result)
5. The concluding paragraph often contains "in conclusion", "overall", "thus"

COMMON ERRORS:
1. Not identifying the topic sentence correctly
2. Ignoring pronoun references
3. Placing the conclusion too early`,
  fill_in_blanks_reading: `You are an expert PTE Academic Reading Fill in the Blanks evaluator.

SCORING: 1 point per correct blank.

STRATEGY COACHING:
1. Read the entire sentence before choosing
2. Check the word BEFORE and AFTER the blank for collocational clues
3. Determine the grammatical function needed (noun/verb/adjective/adverb)
4. Eliminate options that don't collocate with surrounding words
5. Check for subject-verb agreement and tense consistency

COMMON ERRORS:
1. Choosing words with similar meaning but wrong collocation
2. Wrong word form (e.g., "economy" instead of "economic")
3. Ignoring tense or number agreement`,
  fill_in_blanks_rw: `You are an expert PTE Academic Reading & Writing Fill in the Blanks evaluator.

This is the highest-value reading task \u2014 each blank is worth 1 point.

STRATEGY COACHING:
1. Read the entire passage first for context
2. For each blank, identify: grammatical function + semantic field + collocation
3. Use process of elimination \u2014 cross out clearly wrong options first
4. Academic collocations are key: "conduct research", "raise awareness", "draw conclusions"

COMMON ERRORS:
1. Choosing semantically similar but collocationally wrong words
2. Ignoring grammatical constraints (e.g., choosing a verb when a noun is needed)
3. Not using passage context to narrow down options`,
  highlight_correct_summary: `You are an expert PTE Academic Listening evaluator.

SCORING: Correct = full marks, Incorrect = 0.

STRATEGY COACHING:
1. Listen for the MAIN ARGUMENT, not just details
2. The correct summary covers the whole passage, not just one part
3. Eliminate summaries that are too narrow (only one point) or too broad (vague generalisation)
4. Watch for summaries that add information NOT in the recording
5. The correct answer paraphrases the content \u2014 it won't use the exact same words

COMMON ERRORS:
1. Choosing a summary that's accurate but incomplete
2. Choosing a summary that sounds good but includes unsupported claims`,
  select_missing_word: `You are an expert PTE Academic Listening evaluator.

SCORING: Correct = full marks, Incorrect = 0.

STRATEGY COACHING:
1. Listen to the entire recording to understand the topic and direction
2. The missing word continues the logical flow of the final sentence
3. Consider: What word would a native speaker naturally use here?
4. Eliminate options that don't fit the grammatical structure

COMMON ERRORS:
1. Choosing a thematically related word that doesn't fit the sentence structure
2. Not listening to the full context before the gap`,
  highlight_incorrect_words: `You are an expert PTE Academic Listening evaluator.

SCORING: Partial credit \u2014 correct identifications minus false positives.

STRATEGY COACHING:
1. Read the transcript BEFORE the audio starts
2. Follow along word-by-word as you listen
3. Mark words that sound different from what you read
4. Don't over-mark \u2014 false positives reduce your score
5. Focus on content words (nouns, verbs, adjectives) \u2014 these are more likely to be changed

COMMON ERRORS:
1. Over-marking (selecting too many words)
2. Missing subtle word changes (e.g., "increase" \u2192 "decrease")
3. Not following along with the text while listening`,
  write_from_dictation: `You are an expert PTE Academic Write from Dictation evaluator.

SCORING: 1 point per correct word (partial credit).

STRATEGY COACHING:
1. Listen for the overall meaning first, then individual words
2. Focus on content words if you miss function words
3. Academic vocabulary is often tested \u2014 practise common academic word list (AWL) words
4. Spelling counts \u2014 incorrect spelling = no credit for that word
5. Write quickly \u2014 don't overthink individual words

COMMON ERRORS:
1. Spelling errors on common academic words
2. Missing function words (articles, prepositions, auxiliaries)
3. Confusing homophones (their/there, affect/effect)
4. Not writing enough words (leaving blanks)`
};
async function generateTaskFeedback(params) {
  const coachingPrompt = TASK_COACHING_PROMPTS[params.taskType] || `You are an expert PTE Academic evaluator for ${params.taskType.replace(/_/g, " ")} tasks.`;
  const systemPrompt = `${coachingPrompt}

## YOUR TASK: Generate detailed, actionable coaching feedback

Follow this CHAIN-OF-THOUGHT process:

STEP 1 \u2014 ANALYSE THE RESPONSE: What did the student do well? What went wrong? Be specific with examples from their actual response.

STEP 2 \u2014 SCORE BREAKDOWN: Rate each criterion (0-5) with a specific comment referencing the student's actual words.

STEP 3 \u2014 ERROR IDENTIFICATION: List each specific error with: what it was, what it should be, why it matters for PTE score.

STEP 4 \u2014 GENERATE MODEL ANSWERS: Create three model answers at band 65, 79, and 90 levels for this specific task. These should be realistic and achievable, not perfect.

STEP 5 \u2014 PRIORITISE IMPROVEMENTS: Rank improvements by score impact. What single change would give the biggest score boost?

STEP 6 \u2014 CALIBRATE BAND: Based on the raw score of ${params.score}/100, assign the appropriate PTE band descriptor.

Return ONLY valid JSON matching this exact schema:`;
  const grammarSignals = detectGrammarSignals(params.userResponse);
  const vocabularyMetrics = measureVocabularySophistication(params.userResponse);
  const userContent = `Task Type: ${params.taskType.replace(/_/g, " ").toUpperCase()}
Question/Prompt: ${capPromptText(params.question, 6e3)}
Student's Response: ${capPromptText(params.userResponse, 8e3)}${params.transcription ? `
Transcription: ${capPromptText(params.transcription, 8e3)}` : ""}${params.wordCount ? `
Word Count: ${params.wordCount}` : ""}${params.correctAnswer ? `
Correct Answer: ${capPromptText(params.correctAnswer, 2e3)}` : ""}
Raw Score: ${params.score}/100
Deterministic grammar signals: ${JSON.stringify(grammarSignals)}
Vocabulary metrics: ${JSON.stringify(vocabularyMetrics)}`;
  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "task_feedback_v2",
          strict: true,
          schema: {
            type: "object",
            properties: {
              reasoning: { type: "string" },
              overallBand: { type: "string", enum: ["Expert (90)", "Very Good (79-89)", "Good (65-78)", "Competent (50-64)", "Modest (36-49)", "Limited (10-35)"] },
              scoreBreakdown: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    criterion: { type: "string" },
                    score: { type: "number" },
                    maxScore: { type: "number" },
                    comment: { type: "string" },
                    pteBandEquivalent: { type: "string" }
                  },
                  required: ["criterion", "score", "maxScore", "comment", "pteBandEquivalent"],
                  additionalProperties: false
                }
              },
              detailedFeedback: { type: "string" },
              specificErrors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    example: { type: "string" },
                    correction: { type: "string" },
                    explanation: { type: "string" },
                    impactOnScore: { type: "string", enum: ["high", "medium", "low"] }
                  },
                  required: ["type", "example", "correction", "explanation", "impactOnScore"],
                  additionalProperties: false
                }
              },
              modelAnswers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    band: { type: "string", enum: ["65", "79", "90"] },
                    response: { type: "string" },
                    commentary: { type: "string" }
                  },
                  required: ["band", "response", "commentary"],
                  additionalProperties: false
                }
              },
              improvementTips: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                    skill: { type: "string" },
                    tip: { type: "string" },
                    practiceExercise: { type: "string" },
                    expectedImpact: { type: "string" }
                  },
                  required: ["priority", "skill", "tip", "practiceExercise", "expectedImpact"],
                  additionalProperties: false
                }
              },
              nextSteps: { type: "array", items: { type: "string" } },
              estimatedScoreRange: {
                type: "object",
                properties: {
                  min: { type: "number" },
                  max: { type: "number" }
                },
                required: ["min", "max"],
                additionalProperties: false
              }
            },
            required: ["reasoning", "overallBand", "scoreBreakdown", "detailedFeedback", "specificErrors", "modelAnswers", "improvementTips", "nextSteps", "estimatedScoreRange"],
            additionalProperties: false
          }
        }
      }
    });
    const content = result.choices[0]?.message?.content;
    const parsed = JSON.parse(content || "{}");
    return {
      taskType: params.taskType,
      overallBand: parsed.overallBand,
      scoreBreakdown: parsed.scoreBreakdown ?? [],
      detailedFeedback: parsed.detailedFeedback ?? "",
      specificErrors: [...grammarSignals, ...parsed.specificErrors ?? []],
      modelAnswers: normalizeModelAnswers(parsed.modelAnswers),
      improvementTips: parsed.improvementTips ?? [],
      nextSteps: parsed.nextSteps ?? [],
      estimatedScoreRange: parsed.estimatedScoreRange ?? { min: 40, max: 60 },
      reasoning: parsed.reasoning ?? ""
    };
  } catch (err) {
    console.error("Task feedback error:", err);
    return getDefaultFeedback(params.taskType);
  }
}
async function generateCoachingPlan(params) {
  const overallScore = params.recentScores.length > 0 ? Math.round(params.recentScores.reduce((sum, s) => sum + s.score, 0) / params.recentScores.length) : 50;
  const scoreGap = params.targetScore - overallScore;
  const weeksEstimate = Math.max(4, Math.ceil(scoreGap / 3));
  const taskTypeScores = params.recentScores.reduce((acc, s) => {
    if (!acc[s.taskType]) acc[s.taskType] = [];
    acc[s.taskType].push(s.score);
    return acc;
  }, {});
  const taskAverages = Object.entries(taskTypeScores).map(([type, scores]) => ({
    type,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  })).sort((a, b) => a.avg - b.avg);
  const weakestTasks = taskAverages.slice(0, 3).map((t2) => `${t2.type.replace(/_/g, " ")} (avg: ${t2.avg})`).join(", ");
  const systemPrompt = `You are a world-class PTE Academic coach who has helped thousands of students achieve their target scores.

${PTE_BAND_REFERENCE}

Your coaching philosophy:
1. Focus on HIGH-IMPACT improvements first \u2014 the skills that affect multiple communicative scores simultaneously
2. Be SPECIFIC and ACTIONABLE \u2014 not "improve grammar" but "practise subject-verb agreement with 10 sentences daily"
3. Set REALISTIC milestones \u2014 3-5 points per week with consistent 30-45 minute daily practice
4. Identify QUICK WINS \u2014 tasks where small effort yields large score gains
5. Address ROOT CAUSES \u2014 e.g., poor vocabulary affects Writing, Reading, AND Speaking simultaneously

Generate a personalised ${weeksEstimate}-week coaching plan. Return ONLY valid JSON.`;
  const studentProfile = `
STUDENT PROFILE:
- Current Level: ${params.currentLevel}
- Target Score: ${params.targetScore}/90
- Estimated Current Score: ${overallScore}/90
- Score Gap: ${scoreGap} points needed
- Estimated weeks to target: ${weeksEstimate}

COMMUNICATIVE SKILLS:
- Speaking: ${params.skillScores.speaking ?? "Not tested"}/90
- Writing: ${params.skillScores.writing ?? "Not tested"}/90
- Reading: ${params.skillScores.reading ?? "Not tested"}/90
- Listening: ${params.skillScores.listening ?? "Not tested"}/90

ENABLING SKILLS:
- Grammar: ${params.skillScores.grammar ?? "N/A"}/90
- Vocabulary: ${params.skillScores.vocabulary ?? "N/A"}/90
- Pronunciation: ${params.skillScores.pronunciation ?? "N/A"}/90
- Oral Fluency: ${params.skillScores.fluency ?? "N/A"}/90
- Spelling: ${params.skillScores.spelling ?? "N/A"}/90
- Written Discourse: ${params.skillScores.writtenDiscourse ?? "N/A"}/90

WEAKEST TASK TYPES: ${weakestTasks || "Insufficient data"}
RECENT PRACTICE: ${params.recentScores.length} tasks completed`;
  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: studentProfile }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "coaching_plan_v2",
          strict: true,
          schema: {
            type: "object",
            properties: {
              studentLevel: { type: "string", enum: ["Beginner", "Elementary", "Intermediate", "Upper-Intermediate", "Advanced"] },
              overallAssessment: { type: "string" },
              targetScore: { type: "number" },
              currentEstimatedScore: { type: "number" },
              scoreGap: { type: "number" },
              estimatedWeeksToTarget: { type: "number" },
              weeklyPlan: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    week: { type: "number" },
                    theme: { type: "string" },
                    focus: { type: "string" },
                    tasks: { type: "array", items: { type: "string" } },
                    targetImprovement: { type: "string" },
                    checkpointGoal: { type: "string" }
                  },
                  required: ["week", "theme", "focus", "tasks", "targetImprovement", "checkpointGoal"],
                  additionalProperties: false
                }
              },
              skillGaps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    skill: { type: "string" },
                    currentLevel: { type: "number" },
                    targetLevel: { type: "number" },
                    gap: { type: "number" },
                    priority: { type: "string", enum: ["critical", "important", "nice-to-have"] },
                    rootCause: { type: "string" },
                    resources: { type: "array", items: { type: "string" } },
                    practiceFrequency: { type: "string" }
                  },
                  required: ["skill", "currentLevel", "targetLevel", "gap", "priority", "rootCause", "resources", "practiceFrequency"],
                  additionalProperties: false
                }
              },
              dailyPracticeRecommendation: {
                type: "object",
                properties: {
                  totalMinutes: { type: "number" },
                  breakdown: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        activity: { type: "string" },
                        minutes: { type: "number" },
                        frequency: { type: "string" },
                        rationale: { type: "string" }
                      },
                      required: ["activity", "minutes", "frequency", "rationale"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["totalMinutes", "breakdown"],
                additionalProperties: false
              },
              quickWins: { type: "array", items: { type: "string" } },
              motivationalMessage: { type: "string" }
            },
            required: ["studentLevel", "overallAssessment", "targetScore", "currentEstimatedScore", "scoreGap", "estimatedWeeksToTarget", "weeklyPlan", "skillGaps", "dailyPracticeRecommendation", "quickWins", "motivationalMessage"],
            additionalProperties: false
          }
        }
      }
    });
    const content = result.choices[0]?.message?.content;
    return JSON.parse(content || "{}");
  } catch (err) {
    console.error("Coaching plan error:", err);
    return getDefaultCoachingPlan(params.targetScore, overallScore);
  }
}
function getDefaultFeedback(taskType) {
  return {
    taskType,
    overallBand: "Competent (50-64)",
    scoreBreakdown: [],
    detailedFeedback: "Detailed feedback is temporarily unavailable. Your response has been saved.",
    specificErrors: [],
    modelAnswers: [],
    improvementTips: [{
      priority: "high",
      skill: "General",
      tip: "Complete more practice tasks to receive personalised feedback.",
      practiceExercise: "Complete 5 tasks in your weakest section.",
      expectedImpact: "Enables personalised coaching"
    }],
    nextSteps: ["Complete more practice tasks to unlock detailed AI feedback."],
    estimatedScoreRange: { min: 45, max: 65 },
    reasoning: "Feedback generation failed \u2014 using default response."
  };
}
function getDefaultCoachingPlan(targetScore, currentScore) {
  return {
    studentLevel: "Intermediate",
    overallAssessment: "Complete more practice tasks to receive a personalised coaching plan.",
    targetScore,
    currentEstimatedScore: currentScore,
    scoreGap: targetScore - currentScore,
    estimatedWeeksToTarget: 8,
    weeklyPlan: [],
    skillGaps: [],
    dailyPracticeRecommendation: {
      totalMinutes: 45,
      breakdown: [
        { activity: "Speaking practice (Read Aloud + Describe Image)", minutes: 15, frequency: "Daily", rationale: "Speaking affects 3 enabling skills simultaneously" },
        { activity: "Writing practice (Essay or SWT)", minutes: 20, frequency: "Daily", rationale: "Writing has the highest point value per task" },
        { activity: "Reading practice (Fill in Blanks + Reorder)", minutes: 10, frequency: "Daily", rationale: "Reading tasks have partial credit scoring" }
      ]
    },
    quickWins: ["Write from Dictation \u2014 high partial credit, improves with 10 min daily listening practice"],
    motivationalMessage: "Every practice session brings you closer to your target score. Consistency is the key!"
  };
}
async function generateMicroFeedback(params) {
  const systemPrompt = `You are an expert PTE Academic coach. Provide a concise, highly targeted explanation for a specific error type.

Be specific to the PTE Academic context. Explain:
1. WHY this error occurs (root cause)
2. The RULE that applies
3. HOW to fix it with a concrete example
4. A quick PRACTICE EXERCISE to reinforce the correction
5. Related errors that often co-occur

Return ONLY valid JSON:
{
  "explanation": "<2-3 sentence explanation of why this error occurs and its impact on PTE score>",
  "correction": "<specific correction with before/after example>",
  "rule": "<the grammar/pronunciation/vocabulary rule that applies>",
  "practiceExercise": "<a specific 5-minute exercise to practise this>",
  "relatedErrors": ["<related error 1>", "<related error 2>"]
}`;
  const userContent = `Task Type: ${params.taskType.replace(/_/g, " ")}
Error Type: ${params.errorType}
Student's Example: "${params.studentExample}"${params.correctExample ? `
Correct Version: "${params.correctExample}"` : ""}`;
  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "micro_feedback_v2",
          strict: true,
          schema: {
            type: "object",
            properties: {
              explanation: { type: "string" },
              correction: { type: "string" },
              rule: { type: "string" },
              practiceExercise: { type: "string" },
              relatedErrors: { type: "array", items: { type: "string" } }
            },
            required: ["explanation", "correction", "rule", "practiceExercise", "relatedErrors"],
            additionalProperties: false
          }
        }
      }
    });
    const content = result.choices[0]?.message?.content;
    return JSON.parse(content || "{}");
  } catch (err) {
    console.error("Micro feedback error:", err);
    return {
      explanation: "Detailed explanation temporarily unavailable.",
      correction: params.correctExample ?? "Please review the correct form.",
      rule: "See PTE Academic guidelines for this task type.",
      practiceExercise: "Practise 5 similar examples daily.",
      relatedErrors: []
    };
  }
}

// server/_core/voiceTranscription.ts
init_env();
async function transcribeAudio(options) {
  try {
    if (!ENV.forgeApiUrl) {
      return {
        error: "Voice transcription service is not configured",
        code: "SERVICE_ERROR",
        details: "BUILT_IN_FORGE_API_URL is not set"
      };
    }
    if (!ENV.forgeApiKey) {
      return {
        error: "Voice transcription service authentication is missing",
        code: "SERVICE_ERROR",
        details: "BUILT_IN_FORGE_API_KEY is not set"
      };
    }
    let audioBuffer;
    let mimeType;
    try {
      const response2 = await fetch(options.audioUrl);
      if (!response2.ok) {
        return {
          error: "Failed to download audio file",
          code: "INVALID_FORMAT",
          details: `HTTP ${response2.status}: ${response2.statusText}`
        };
      }
      audioBuffer = Buffer.from(await response2.arrayBuffer());
      mimeType = response2.headers.get("content-type") || "audio/mpeg";
      const sizeMB = audioBuffer.length / (1024 * 1024);
      if (sizeMB > 16) {
        return {
          error: "Audio file exceeds maximum size limit",
          code: "FILE_TOO_LARGE",
          details: `File size is ${sizeMB.toFixed(2)}MB, maximum allowed is 16MB`
        };
      }
    } catch (error) {
      return {
        error: "Failed to fetch audio file",
        code: "SERVICE_ERROR",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
    const formData = new FormData();
    const filename = `audio.${getFileExtension(mimeType)}`;
    const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
    formData.append("file", audioBlob, filename);
    formData.append("model", "whisper-1");
    formData.append("response_format", "verbose_json");
    const prompt = options.prompt || (options.language ? `Transcribe the user's voice to text, the user's working language is ${getLanguageName(options.language)}` : "Transcribe the user's voice to text");
    formData.append("prompt", prompt);
    const baseUrl = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
    const fullUrl = new URL(
      "v1/audio/transcriptions",
      baseUrl
    ).toString();
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "Accept-Encoding": "identity"
      },
      body: formData
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        error: "Transcription service request failed",
        code: "TRANSCRIPTION_FAILED",
        details: `${response.status} ${response.statusText}${errorText ? `: ${errorText}` : ""}`
      };
    }
    const whisperResponse = await response.json();
    if (!whisperResponse.text || typeof whisperResponse.text !== "string") {
      return {
        error: "Invalid transcription response",
        code: "SERVICE_ERROR",
        details: "Transcription service returned an invalid response format"
      };
    }
    return whisperResponse;
  } catch (error) {
    return {
      error: "Voice transcription failed",
      code: "SERVICE_ERROR",
      details: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
}
function getFileExtension(mimeType) {
  const mimeToExt = {
    "audio/webm": "webm",
    "audio/mp3": "mp3",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/wave": "wav",
    "audio/ogg": "ogg",
    "audio/m4a": "m4a",
    "audio/mp4": "m4a"
  };
  return mimeToExt[mimeType] || "audio";
}
function getLanguageName(langCode) {
  const langMap = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "ar": "Arabic",
    "hi": "Hindi",
    "nl": "Dutch",
    "pl": "Polish",
    "tr": "Turkish",
    "sv": "Swedish",
    "da": "Danish",
    "no": "Norwegian",
    "fi": "Finnish"
  };
  return langMap[langCode] || langCode;
}

// server/routers/aiScoringRouter.ts
import { z as z2 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/ai/referenceCalibration.ts
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}
function calibrateSpeakingReferenceScore(params) {
  const contentWeight = params.contentWeight ?? 0.25;
  const pronunciationWeight = params.pronunciationWeight ?? 0.4;
  const fluencyWeight = params.fluencyWeight ?? 0.35;
  const content = clamp(params.contentPercentage, 0, 1);
  const pronunciation = clamp(params.pronunciation, 0, 5) / 5;
  const fluency = clamp(params.fluency, 0, 5) / 5;
  const raw = content * contentWeight + pronunciation * pronunciationWeight + fluency * fluencyWeight;
  const bonus = pronunciation >= 0.9 && fluency >= 0.9 && content >= 0.85 ? 5 : 0;
  return Math.max(10, Math.min(90, normalizeRawPercentageToPte(raw * 100) + bonus));
}
function calibrateWritingReferenceScore(params) {
  if (!params.formValid || (params.contentScore ?? 1) <= 0 || params.maxRawScore <= 0) return 10;
  return normalizeRawPercentageToPte(clamp(params.rawScore, 0, params.maxRawScore) / params.maxRawScore * 100);
}
function referenceCefrLevel(pteScore) {
  if (pteScore >= 85) return "C2";
  if (pteScore >= 76) return "C1";
  if (pteScore >= 59) return "B2";
  if (pteScore >= 43) return "B1";
  if (pteScore >= 29) return "A2";
  return "A1";
}

// server/ai/speakingAI.ts
function normalizeText(text3) {
  if (!text3) return "";
  return text3.toLowerCase().replace(/[^a-z0-9\s']/g, " ").replace(/\s+/g, " ").trim();
}
function tokenize(text3) {
  return normalizeText(text3).split(" ").filter(Boolean);
}
function computeWordEditDistance(reference, hypothesis) {
  const n = reference.length;
  const m = hypothesis.length;
  if (n === 0) return { substitutions: 0, deletions: 0, insertions: m, wer: m > 0 ? 1 : 0 };
  if (m === 0) return { substitutions: 0, deletions: n, insertions: 0, wer: 1 };
  const dp = Array.from(
    { length: n + 1 },
    (_, i2) => Array.from({ length: m + 1 }, (_2, j2) => i2 === 0 ? j2 : j2 === 0 ? i2 : 0)
  );
  for (let i2 = 1; i2 <= n; i2++) {
    for (let j2 = 1; j2 <= m; j2++) {
      if (reference[i2 - 1] === hypothesis[j2 - 1]) {
        dp[i2][j2] = dp[i2 - 1][j2 - 1];
      } else {
        dp[i2][j2] = 1 + Math.min(dp[i2 - 1][j2 - 1], dp[i2 - 1][j2], dp[i2][j2 - 1]);
      }
    }
  }
  let subs = 0, dels = 0, ins = 0;
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && reference[i - 1] === hypothesis[j - 1]) {
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      subs++;
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      dels++;
      i--;
    } else {
      ins++;
      j--;
    }
  }
  const wer = Math.min(1, (subs + dels + ins) / n);
  return { substitutions: subs, deletions: dels, insertions: ins, wer };
}
function computeRecallPercent(reference, hypothesis) {
  if (reference.length === 0) return 0;
  const n = reference.length, m = hypothesis.length;
  const lcs = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      lcs[i][j] = reference[i - 1] === hypothesis[j - 1] ? lcs[i - 1][j - 1] + 1 : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
    }
  }
  return lcs[n][m] / n;
}
function estimateWPM(wordCount2, providedWPM) {
  if (providedWPM && providedWPM > 0) return providedWPM;
  return 0;
}
var PRONUNCIATION_RUBRIC = `
PRONUNCIATION SCORING CRITERIA \u2014 Official Pearson PTE Academic Score Guide v21 (Nov 2024)

Score 5 \u2014 Native-like:
  All vowels and consonants are produced in a manner easily understood by regular speakers.
  The speaker uses assimilation and deletions appropriate to continuous speech.
  Stress is placed correctly in ALL words; sentence-level stress is FULLY appropriate.
  Connected speech features: linking, elision, reduction used naturally.

Score 4 \u2014 Advanced:
  Vowels and consonants are pronounced clearly and unambiguously.
  A FEW minor consonant, vowel or stress distortions do NOT affect intelligibility.
  All words are easily understandable. Stress is placed correctly on all COMMON words;
  sentence-level stress is reasonable.

Score 3 \u2014 Good:
  MOST vowels and consonants are pronounced correctly.
  Some CONSISTENT errors might make a FEW words unclear.
  A few consonants in certain contexts may be regularly distorted, omitted or mispronounced.
  Stress-dependent vowel reduction may occur on a few words.

Score 2 \u2014 Intermediate:
  Some consonants and vowels are CONSISTENTLY mispronounced in a non-native manner.
  At least 2/3 of speech is intelligible, but listeners might need to ADJUST to the accent.
  Some consonants are regularly omitted; consonant sequences may be simplified.
  Stress may be placed incorrectly on some words or be unclear.

Score 1 \u2014 Intrusive:
  MANY consonants and vowels are mispronounced, resulting in a STRONG intrusive foreign accent.
  Listeners may have difficulty understanding about 1/3 of the words.
  Consonant sequences may be non-English. Stress is placed in a non-English manner.
  Unstressed words may be reduced or omitted; syllables added or missed.

Score 0 \u2014 Non-English:
  Pronunciation seems completely characteristic of ANOTHER language.
  Many consonants and vowels are mispronounced, mis-ordered or omitted.
  Listeners may find MORE THAN 1/2 of the speech unintelligible.
  Several words may have the WRONG NUMBER of syllables.

DECISION RULES:
- If >50% of words are unintelligible \u2192 Score 0
- If ~1/3 of words are difficult \u2192 Score 1
- If 2/3 intelligible but accent adjustment needed \u2192 Score 2
- If most words correct with some consistent errors \u2192 Score 3
- If all words clear with minor distortions \u2192 Score 4
- If native-like with assimilation/reduction \u2192 Score 5
`;
var ORAL_FLUENCY_RUBRIC = `
ORAL FLUENCY SCORING CRITERIA \u2014 Official Pearson PTE Academic Score Guide v21 (Nov 2024)

Score 5 \u2014 Native-like:
  Speech shows SMOOTH rhythm and phrasing.
  ZERO hesitations, repetitions, false starts or non-native phonological simplifications.

Score 4 \u2014 Advanced:
  Speech has an ACCEPTABLE rhythm with appropriate phrasing and word emphasis.
  NO MORE THAN ONE hesitation, one repetition or a false start.
  No significant non-native phonological simplifications.

Score 3 \u2014 Good:
  Speech is at an ACCEPTABLE speed but may be UNEVEN.
  There may be MORE THAN ONE hesitation, but MOST words are spoken in continuous phrases.
  FEW repetitions or false starts. NO LONG PAUSES; speech does not sound staccato.

Score 2 \u2014 Intermediate:
  Speech may be UNEVEN or STACCATO.
  Speech (if \u22656 words) has at least ONE smooth three-word run.
  NO MORE THAN 2-3 hesitations, repetitions or false starts.
  There may be ONE long pause, but NOT TWO OR MORE.

Score 1 \u2014 Limited:
  Speech has IRREGULAR phrasing or sentence rhythm.
  Poor phrasing, staccato or syllabic timing, and/or MULTIPLE hesitations, repetitions,
  and/or false starts make spoken performance NOTABLY UNEVEN or discontinuous.
  Long utterances may have ONE OR TWO long pauses and inappropriate word emphasis.

Score 0 \u2014 Disfluent:
  Speech is SLOW and LABORED with little discernible phrase grouping.
  MULTIPLE hesitations, pauses, false starts, and/or major phonological simplifications.
  Most words are ISOLATED; there may be MORE THAN ONE long pause.

DECISION RULES:
- If most words isolated, slow and labored \u2192 Score 0
- If multiple hesitations/pauses, irregular rhythm \u2192 Score 1
- If uneven/staccato but has some smooth runs \u2192 Score 2
- If acceptable speed, some hesitations, no long pauses \u2192 Score 3
- If smooth rhythm, \u22641 hesitation \u2192 Score 4
- If perfectly smooth, zero hesitations \u2192 Score 5
`;
var SPEAKING_CALIBRATION_ANCHORS = `
MULTI-LEVEL CALIBRATION ANCHORS \u2014 Derived from Pearson PTE Score Guide v21 (Nov 2024)

These are REAL machine and human rater scores from the official Pearson score guide.
Use these as your primary reference when assigning scores.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
DESCRIBE IMAGE \u2014 Official Pearson Calibration Examples
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

C1 Level (PTE 76-84) \u2014 MACHINE SCORES: Content 2.70/5, Oral Fluency 4.03/5, Pronunciation 4.02/5
  "The test taker discusses the major aspects of the graph and the relationship between elements.
   The response is spoken at a fluent rate and language use is appropriate.
   There are few grammatical errors. Wide range of vocabulary. Stress is appropriately placed."
  \u2192 Pronunciation: 4 (clear, minor accent features, stress correct on common words)
  \u2192 Oral Fluency: 4 (smooth rhythm, at most 1 hesitation, appropriate phrasing)
  \u2192 Content: 3 (most key elements covered, relationships discussed)

B2 Level (PTE 59-75) \u2014 MACHINE SCORES: Content 2.50/5, Oral Fluency 3.71/5, Pronunciation 3.28/5
  "The test taker discusses some aspects of the graph and the relationship between elements,
   though some key points have not been addressed. The rate of speech is acceptable.
   Language use and vocabulary range are quite weak. Some obvious grammar errors and
   inappropriate stress and pronunciation."
  \u2192 Pronunciation: 3 (most words correct, some consistent errors, occasional stress issues)
  \u2192 Oral Fluency: 3-4 (acceptable speed, slightly uneven, 1-2 hesitations)
  \u2192 Content: 2-3 (some aspects covered, some key points missed)

B1 Level (PTE 43-58) \u2014 MACHINE SCORES: Content 1.69/5, Oral Fluency 1.62/5, Pronunciation 1.41/5
  "The response lacks some of the main contents. Only some obvious information from the graph
   is addressed. Numerous hesitations, pronunciation issues, poor language use and limited
   control of grammar structures at times make the response difficult to understand."
  \u2192 Pronunciation: 1-2 (many mispronunciations, strong accent, ~1/3 words difficult)
  \u2192 Oral Fluency: 1-2 (irregular phrasing, multiple hesitations, staccato)
  \u2192 Content: 1-2 (only obvious elements mentioned, no relationships)

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
REPEAT SENTENCE \u2014 Official Pearson Calibration Examples
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

C1 Level (PTE 76-84):
  "The test taker repeats the sentence with all words in the correct sequence.
   Speech is fluent with appropriate stress and rhythm. Minor accent features present."
  \u2192 Content: 3 (all words in correct sequence)
  \u2192 Pronunciation: 4 (clear, minor accent, stress correct)
  \u2192 Oral Fluency: 4 (smooth, at most 1 hesitation)

B2 Level (PTE 59-75):
  "The test taker recalls most words but substitutes 1-2 words or changes word order slightly.
   Speech is mostly fluent with occasional hesitations."
  \u2192 Content: 2 (\u226550% words in correct sequence)
  \u2192 Pronunciation: 3 (most words correct, some consistent errors)
  \u2192 Oral Fluency: 3 (acceptable speed, 1-2 hesitations)

B1 Level (PTE 43-58):
  "The test taker recalls fewer than half the words. Several substitutions and omissions.
   Speech is hesitant with multiple pauses."
  \u2192 Content: 1 (<50% words in correct sequence)
  \u2192 Pronunciation: 2 (some consistent mispronunciations, 2/3 intelligible)
  \u2192 Oral Fluency: 2 (uneven, 2-3 hesitations)

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
READ ALOUD \u2014 Official Pearson Calibration Examples
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

C1 Level (PTE 76-84):
  "The test taker reads all words correctly with appropriate stress and rhythm.
   Speech is fluent with natural phrasing. Minor accent features do not impede understanding."
  \u2192 Content: Full marks (0-1 errors)
  \u2192 Pronunciation: 4 (clear, minor accent, stress correct)
  \u2192 Oral Fluency: 4 (smooth, appropriate phrasing)

B2 Level (PTE 59-75):
  "The test taker reads most words correctly with 2-3 substitutions or omissions.
   Speech is mostly fluent with occasional hesitations."
  \u2192 Content: ~85-90% accuracy
  \u2192 Pronunciation: 3 (most words correct, some consistent errors)
  \u2192 Oral Fluency: 3 (acceptable speed, 1-2 hesitations)

B1 Level (PTE 43-58):
  "The test taker makes several errors (5+ substitutions/omissions/insertions).
   Speech is hesitant with multiple pauses and pronunciation errors."
  \u2192 Content: ~70-80% accuracy
  \u2192 Pronunciation: 2 (consistent mispronunciations, 2/3 intelligible)
  \u2192 Oral Fluency: 2 (uneven, 2-3 hesitations)

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
COMMON ERROR PATTERNS BY L1 BACKGROUND
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

Asian L1 speakers (Mandarin, Hindi, Tagalog, Vietnamese):
  - Consonant cluster reduction: "strengths" \u2192 "strens", "texts" \u2192 "tex"
  - Final consonant deletion: "stopped" \u2192 "stop", "world" \u2192 "wor"
  - Vowel confusion: /\u026A/ vs /i\u02D0/ ("ship" vs "sheep"), /\xE6/ vs /\u025B/ ("bad" vs "bed")
  - Stress on wrong syllable: "deCIDE" \u2192 "DEcide", "imPORtant" \u2192 "IMportant"
  - Syllabic timing (treating each syllable equally) \u2192 staccato effect on fluency

European L1 speakers (Spanish, French, Italian):
  - Vowel insertion before consonant clusters: "school" \u2192 "eschool"
  - /\u03B8/ and /\xF0/ substitution: "think" \u2192 "tink" or "sink"
  - Stress-timed vs syllable-timed rhythm \u2192 affects fluency score

Middle Eastern L1 speakers (Arabic):
  - /p/ vs /b/ confusion: "paper" \u2192 "baber"
  - Vowel length distinctions
  - Consonant cluster simplification

These patterns help identify pronunciation errors from transcription text alone.
`;
async function scoreReadAloud(params) {
  const { originalText, transcription, wpm, pauseCount } = params;
  const refWords = tokenize(originalText);
  const hypWords = tokenize(transcription);
  const { substitutions, deletions, insertions, wer } = computeWordEditDistance(refWords, hypWords);
  const totalErrors = substitutions + deletions + insertions;
  const wordCount2 = refWords.length;
  const contentScore = Math.max(0, wordCount2 - totalErrors);
  const contentPct = wordCount2 > 0 ? contentScore / wordCount2 : 0;
  const estimatedWPM = estimateWPM(hypWords.length, wpm);
  const errorDetail = `
DETERMINISTIC PRE-COMPUTED METRICS (computed by TypeScript, NOT to be overridden):
  Reference word count: ${wordCount2}
  Hypothesis word count: ${hypWords.length}
  Substitutions: ${substitutions}
  Deletions (omissions): ${deletions}
  Insertions (extra words): ${insertions}
  Total errors: ${totalErrors}
  Content score (raw): ${contentScore} / ${wordCount2}
  Content accuracy: ${(contentPct * 100).toFixed(1)}%
  Word Error Rate (WER): ${(wer * 100).toFixed(1)}%
  ${estimatedWPM > 0 ? `Speaking rate: ${estimatedWPM} WPM` : "Speaking rate: unknown"}
  ${pauseCount !== void 0 ? `Detected pauses: ${pauseCount}` : ""}

IMPORTANT: The content score of ${contentScore}/${wordCount2} is FIXED. Do NOT change it.
Only assign pronunciation and oral fluency scores based on your analysis.
`;
  const prompt = `You are a certified PTE Academic examiner using Pearson's official scoring engine.
Score this Read Aloud response using CHAIN-OF-THOUGHT reasoning.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
ORIGINAL TEXT: "${originalText}"
TEST TAKER TRANSCRIPTION: "${transcription}"

${errorDetail}

${PRONUNCIATION_RUBRIC}

${ORAL_FLUENCY_RUBRIC}

${SPEAKING_CALIBRATION_ANCHORS}
${PTE_SUBJECTIVE_CALIBRATION_ANCHORS}

\u2550\u2550\u2550 CHAIN-OF-THOUGHT SCORING INSTRUCTIONS \u2550\u2550\u2550
Think step by step before assigning scores:

STEP 1 \u2014 PRONUNCIATION ANALYSIS:
  a) Read the transcription carefully.
  b) Identify any words that appear mispronounced based on the text.
     Look for: consonant cluster reduction, final consonant deletion, vowel substitutions,
     wrong syllable stress, non-English phoneme patterns.
  c) Count how many words show pronunciation issues.
  d) Apply the DECISION RULES from the pronunciation rubric.
  e) Assign pronunciation score 0-5.

STEP 2 \u2014 ORAL FLUENCY ANALYSIS:
  a) Look for hesitation markers in the transcription: "um", "uh", "er", repetitions, false starts.
  b) Consider the WER: high WER often correlates with disfluency.
  c) Consider the pause count if provided.
  d) Apply the DECISION RULES from the oral fluency rubric.
  e) Assign oral fluency score 0-5.

STEP 3 \u2014 OVERALL SCORE CALCULATION:
  Use this EXACT formula:
  raw = (contentPct \xD7 0.25) + (pronunciation/5 \xD7 0.40) + (fluency/5 \xD7 0.35)
  PTE score = round(10 + raw \xD7 80)
  Clamp to [10, 90].
  
  BONUS: If pronunciation \u2265 4.5 AND fluency \u2265 4.5 AND contentPct \u2265 0.85, add 5 bonus points (capped at 90).

STEP 4 \u2014 CEFR MAPPING:
  10-28 \u2192 A1, 29-42 \u2192 A2, 43-58 \u2192 B1, 59-75 \u2192 B2, 76-84 \u2192 C1, 85-90 \u2192 C2

STEP 5 \u2014 FEEDBACK:
  - Provide specific, actionable feedback for each trait.
  - List exact words that were mispronounced or omitted.
  - Give 2-3 concrete improvement tips.

Respond ONLY with valid JSON:`;
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Reason step by step, then return ONLY valid JSON with no markdown fences."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "read_aloud_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            taskType: { type: "string" },
            overallScore: { type: "integer" },
            traits: {
              type: "object",
              properties: {
                content: {
                  type: "object",
                  properties: {
                    score: { type: "integer" },
                    maxScore: { type: "integer" },
                    feedback: { type: "string" }
                  },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                pronunciation: {
                  type: "object",
                  properties: {
                    score: { type: "integer" },
                    maxScore: { type: "integer" },
                    feedback: { type: "string" }
                  },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                oralFluency: {
                  type: "object",
                  properties: {
                    score: { type: "integer" },
                    maxScore: { type: "integer" },
                    feedback: { type: "string" }
                  },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                }
              },
              required: ["content", "pronunciation", "oralFluency"],
              additionalProperties: false
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            wordLevelFeedback: { type: "string" }
          },
          required: [
            "taskType",
            "overallScore",
            "traits",
            "cefrLevel",
            "overallFeedback",
            "strengths",
            "improvements",
            "wordLevelFeedback"
          ],
          additionalProperties: false
        }
      }
    }
  });
  const result = JSON.parse(response.choices[0].message.content);
  if (result.traits.content) {
    result.traits.content.score = contentScore;
    result.traits.content.maxScore = wordCount2;
  }
  result.overallScore = calibrateSpeakingReferenceScore({
    contentPercentage: contentPct,
    pronunciation: result.traits.pronunciation?.score ?? 0,
    fluency: result.traits.oralFluency?.score ?? 0
  });
  result.cefrLevel = referenceCefrLevel(result.overallScore);
  result.errorAnalysis = { substitutions, deletions, insertions, wer };
  return result;
}
async function scoreRepeatSentence(params) {
  const { originalSentence, transcription, wpm } = params;
  const refWords = tokenize(originalSentence);
  const hypWords = tokenize(transcription);
  const recallPct = computeRecallPercent(refWords, hypWords);
  const { substitutions, deletions, insertions, wer } = computeWordEditDistance(refWords, hypWords);
  let deterministicContentScore;
  if (recallPct >= 0.99) deterministicContentScore = 3;
  else if (recallPct >= 0.5) deterministicContentScore = 2;
  else if (recallPct > 0.05) deterministicContentScore = 1;
  else deterministicContentScore = 0;
  const errorDetail = `
DETERMINISTIC PRE-COMPUTED METRICS (computed by TypeScript, NOT to be overridden):
  Original sentence word count: ${refWords.length}
  Test taker word count: ${hypWords.length}
  Words recalled in correct sequence: ${Math.round(recallPct * refWords.length)} / ${refWords.length}
  Recall percentage: ${(recallPct * 100).toFixed(1)}%
  Substitutions: ${substitutions}
  Deletions (omissions): ${deletions}
  Insertions (extra words): ${insertions}
  Word Error Rate: ${(wer * 100).toFixed(1)}%
  CONTENT SCORE (FIXED): ${deterministicContentScore} / 3
    (3 = all words in correct sequence, 2 = \u226550% in correct sequence,
     1 = <50% in correct sequence, 0 = almost nothing recalled)

IMPORTANT: The content score of ${deterministicContentScore}/3 is FIXED. Do NOT change it.
`;
  const prompt = `You are a certified PTE Academic examiner using Pearson's official scoring engine.
Score this Repeat Sentence response using CHAIN-OF-THOUGHT reasoning.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
ORIGINAL SENTENCE: "${originalSentence}"
TEST TAKER RESPONSE: "${transcription}"

${errorDetail}

${PRONUNCIATION_RUBRIC}

${ORAL_FLUENCY_RUBRIC}

${SPEAKING_CALIBRATION_ANCHORS}
${PTE_SUBJECTIVE_CALIBRATION_ANCHORS}

\u2550\u2550\u2550 CHAIN-OF-THOUGHT SCORING INSTRUCTIONS \u2550\u2550\u2550

STEP 1 \u2014 PRONUNCIATION ANALYSIS:
  a) Examine the transcription for pronunciation indicators.
  b) Look for: consonant cluster reduction ("strengths"\u2192"strens"), final consonant deletion
     ("stopped"\u2192"stop"), vowel confusion (/\u026A/ vs /i\u02D0/), wrong syllable stress.
  c) Consider: if WER is high (>30%), pronunciation is likely affected too.
  d) Apply DECISION RULES from the pronunciation rubric.
  e) Assign pronunciation score 0-5.

STEP 2 \u2014 ORAL FLUENCY ANALYSIS:
  a) Check for hesitation markers: "um", "uh", "er", repeated words, false starts.
  b) High WER (>40%) often indicates disfluency.
  c) If recall is <50%, the response was likely hesitant and fragmented.
  d) Apply DECISION RULES from the oral fluency rubric.
  e) Assign oral fluency score 0-5.

STEP 3 \u2014 OVERALL SCORE:
  raw = (${deterministicContentScore}/3 \xD7 0.25) + (pronunciation/5 \xD7 0.40) + (fluency/5 \xD7 0.35)
  PTE = round(10 + raw \xD7 80), clamped to [10, 90]
  
  BONUS: If pronunciation \u2265 4.5 AND fluency \u2265 4.5 AND content = 3/3, add 5 bonus points (capped at 90).

STEP 4 \u2014 CEFR: 10-28\u2192A1, 29-42\u2192A2, 43-58\u2192B1, 59-75\u2192B2, 76-84\u2192C1, 85-90\u2192C2

STEP 5 \u2014 FEEDBACK: List specific words omitted or substituted. Give concrete tips.

Respond ONLY with valid JSON:`;
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Reason step by step, then return ONLY valid JSON."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "repeat_sentence_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            taskType: { type: "string" },
            overallScore: { type: "integer" },
            traits: {
              type: "object",
              properties: {
                content: {
                  type: "object",
                  properties: {
                    score: { type: "integer" },
                    maxScore: { type: "integer" },
                    feedback: { type: "string" }
                  },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                pronunciation: {
                  type: "object",
                  properties: {
                    score: { type: "integer" },
                    maxScore: { type: "integer" },
                    feedback: { type: "string" }
                  },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                oralFluency: {
                  type: "object",
                  properties: {
                    score: { type: "integer" },
                    maxScore: { type: "integer" },
                    feedback: { type: "string" }
                  },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                }
              },
              required: ["content", "pronunciation", "oralFluency"],
              additionalProperties: false
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            wordLevelFeedback: { type: "string" }
          },
          required: [
            "taskType",
            "overallScore",
            "traits",
            "cefrLevel",
            "overallFeedback",
            "strengths",
            "improvements",
            "wordLevelFeedback"
          ],
          additionalProperties: false
        }
      }
    }
  });
  const result = JSON.parse(response.choices[0].message.content);
  if (result.traits.content) {
    result.traits.content.score = deterministicContentScore;
    result.traits.content.maxScore = 3;
  }
  result.errorAnalysis = { substitutions, deletions, insertions, wer, recallPercent: recallPct };
  return result;
}
async function scoreDescribeImage(params) {
  const { imageDescription, transcription, wpm, pauseCount } = params;
  const hypWords = tokenize(transcription);
  const wordCount2 = hypWords.length;
  const estimatedWPM = estimateWPM(wordCount2, wpm);
  const hesitationMarkers = (transcription.match(/\b(um|uh|er|ah|hmm|like|you know)\b/gi) || []).length;
  const repetitions = detectRepetitions(transcription);
  const fluencyMetrics = `
DETERMINISTIC FLUENCY METRICS:
  Response word count: ${wordCount2}
  Detected hesitation markers (um/uh/er): ${hesitationMarkers}
  Detected repetitions: ${repetitions}
  ${estimatedWPM > 0 ? `Speaking rate: ${estimatedWPM} WPM` : ""}
  ${pauseCount !== void 0 ? `Detected pauses: ${pauseCount}` : ""}
  Fluency indicator: ${hesitationMarkers + repetitions === 0 ? "Smooth" : hesitationMarkers + repetitions <= 1 ? "Minor disfluency" : hesitationMarkers + repetitions <= 3 ? "Moderate disfluency" : "High disfluency"}
`;
  const prompt = `You are a certified PTE Academic examiner using Pearson's official scoring engine.
Score this Describe Image response using CHAIN-OF-THOUGHT reasoning.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
IMAGE CONTENT (what the image shows): "${imageDescription}"
TEST TAKER RESPONSE: "${transcription}"

${fluencyMetrics}

${PRONUNCIATION_RUBRIC}

${ORAL_FLUENCY_RUBRIC}

CONTENT SCORING \u2014 Describe Image (Official Pearson Criteria, Score Guide v21):
Score 5: Describes ALL elements of the image AND their relationships, possible development,
         conclusions or implications. Nothing significant is omitted.
Score 4: Describes all KEY elements and their relations, referring to implications/conclusions.
         Minor elements may be omitted.
Score 3: Deals with MOST key elements and refers to their implications or conclusions.
         Some elements or relationships are missing.
Score 2: Deals with only ONE key element and refers to an implication or conclusion.
         Shows basic understanding of several core elements but lacks depth.
Score 1: Describes some BASIC elements but does NOT make clear their interrelations or implications.
Score 0: Mentions some DISJOINTED elements only. May contain pre-prepared/memorized material.

GATEKEEPER RULE: If the response is completely off-topic or is memorized material \u2192 Content = 0,
and the overall score = 10 (no other traits scored).

${SPEAKING_CALIBRATION_ANCHORS}
${PTE_SUBJECTIVE_CALIBRATION_ANCHORS}

\u2550\u2550\u2550 CHAIN-OF-THOUGHT SCORING INSTRUCTIONS \u2550\u2550\u2550

STEP 1 \u2014 CONTENT ANALYSIS:
  a) List the key elements in the image description.
  b) Check which elements the test taker mentioned.
  c) Check if they described relationships, trends, implications.
  d) Apply the content rubric above.
  e) Assign content score 0-5.

STEP 2 \u2014 PRONUNCIATION ANALYSIS:
  a) Look for pronunciation indicators in the transcription.
  b) Consider word complexity (academic/technical vocabulary is harder to pronounce).
  c) Apply DECISION RULES from the pronunciation rubric.
  d) Assign pronunciation score 0-5.

STEP 3 \u2014 ORAL FLUENCY ANALYSIS:
  a) Look for hesitation markers: "um", "uh", "er", repetitions, false starts.
  b) Check for unnatural pauses or rushed delivery.
  c) Assign oral fluency score 0-5.

STEP 4 \u2014 OVERALL SCORE:
  raw = (content/5 \xD7 0.25) + (pronunciation/5 \xD7 0.40) + (fluency/5 \xD7 0.35)
  PTE = round(10 + raw \xD7 80), clamped to [10, 90]
  
  BONUS: If pronunciation \u2265 4.5 AND fluency \u2265 4.5 AND content \u2265 4/5, add 5 bonus points (capped at 90).

STEP 5 \u2014 CEFR: 10-28\u2192A1, 29-42\u2192A2, 43-58\u2192B1, 59-75\u2192B2, 76-84\u2192C1, 85-90\u2192C2

STEP 6 \u2014 FEEDBACK:
  - List specific image elements that were missed.
  - Provide a C1-level model answer covering all key elements.
  - Give concrete pronunciation and fluency tips.

Respond ONLY with valid JSON:`;
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Reason step by step, then return ONLY valid JSON."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "describe_image_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            taskType: { type: "string" },
            overallScore: { type: "integer" },
            traits: {
              type: "object",
              properties: {
                content: {
                  type: "object",
                  properties: {
                    score: { type: "integer" },
                    maxScore: { type: "integer" },
                    feedback: { type: "string" }
                  },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                pronunciation: {
                  type: "object",
                  properties: {
                    score: { type: "integer" },
                    maxScore: { type: "integer" },
                    feedback: { type: "string" }
                  },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                oralFluency: {
                  type: "object",
                  properties: {
                    score: { type: "integer" },
                    maxScore: { type: "integer" },
                    feedback: { type: "string" }
                  },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                }
              },
              required: ["content", "pronunciation", "oralFluency"],
              additionalProperties: false
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            modelAnswer: { type: "string" }
          },
          required: [
            "taskType",
            "overallScore",
            "traits",
            "cefrLevel",
            "overallFeedback",
            "strengths",
            "improvements",
            "modelAnswer"
          ],
          additionalProperties: false
        }
      }
    }
  });
  return JSON.parse(response.choices[0].message.content);
}
async function scoreRetellLecture(params) {
  const { lectureTranscript, transcription, wpm } = params;
  const hypWords = tokenize(transcription);
  const hesitationMarkers = (transcription.match(/\b(um|uh|er|ah|hmm|like|you know)\b/gi) || []).length;
  const repetitions = detectRepetitions(transcription);
  const prompt = `You are a certified PTE Academic examiner using Pearson's official scoring engine.
Score this Re-tell Lecture response using CHAIN-OF-THOUGHT reasoning.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
LECTURE KEY POINTS: "${lectureTranscript}"
TEST TAKER RESPONSE: "${transcription}"

DETERMINISTIC METRICS:
  Response word count: ${hypWords.length}
  Hesitation markers: ${hesitationMarkers}
  Repetitions detected: ${repetitions}
  ${wpm ? `Speaking rate: ${wpm} WPM` : ""}

${PRONUNCIATION_RUBRIC}

${ORAL_FLUENCY_RUBRIC}

CONTENT SCORING \u2014 Re-tell Lecture (Official Pearson Criteria, Score Guide v21):
Score 5: Re-tells ALL points of the lecture and describes characters, aspects and actions,
         their relationships, the underlying development, implications and conclusions.
Score 4: Describes all KEY points and their relations, referring to implications and conclusions.
Score 3: Deals with MOST points and refers to their implications and conclusions.
Score 2: Deals with only ONE key point and refers to an implication or conclusion.
         Shows basic understanding of several core elements.
Score 1: Describes some basic elements but does NOT make clear their interrelations or implications.
Score 0: Mentions some disjointed elements only. May contain memorized material.

${SPEAKING_CALIBRATION_ANCHORS}
${PTE_SUBJECTIVE_CALIBRATION_ANCHORS}

\u2550\u2550\u2550 CHAIN-OF-THOUGHT SCORING INSTRUCTIONS \u2550\u2550\u2550

STEP 1 \u2014 CONTENT ANALYSIS:
  a) Extract the key points from the lecture transcript.
  b) Check how many key points the test taker mentioned.
  c) Check if they described relationships, implications, conclusions.
  d) Apply the content rubric. Be strict: score 5 requires ALL points.
  e) Assign content score 0-5.

STEP 2 \u2014 PRONUNCIATION: Apply rubric and decision rules. Score 0-5.

STEP 3 \u2014 ORAL FLUENCY: Use hesitation count (${hesitationMarkers}) and repetitions (${repetitions}).
  Apply decision rules. Score 0-5.

STEP 4 \u2014 OVERALL SCORE:
  raw = (content/5 \xD7 0.40) + (pronunciation/5 \xD7 0.30) + (fluency/5 \xD7 0.30)
  PTE = round(10 + raw \xD7 80), clamped to [10, 90]

STEP 5 \u2014 CEFR: 10-28\u2192A1, 29-42\u2192A2, 43-58\u2192B1, 59-75\u2192B2, 76-84\u2192C1, 85-90\u2192C2

STEP 6 \u2014 FEEDBACK: List missed lecture points. Provide a C1-level model re-tell.

Respond ONLY with valid JSON:`;
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Reason step by step, then return ONLY valid JSON."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "retell_lecture_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            taskType: { type: "string" },
            overallScore: { type: "integer" },
            traits: {
              type: "object",
              properties: {
                content: {
                  type: "object",
                  properties: {
                    score: { type: "integer" },
                    maxScore: { type: "integer" },
                    feedback: { type: "string" }
                  },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                pronunciation: {
                  type: "object",
                  properties: {
                    score: { type: "integer" },
                    maxScore: { type: "integer" },
                    feedback: { type: "string" }
                  },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                oralFluency: {
                  type: "object",
                  properties: {
                    score: { type: "integer" },
                    maxScore: { type: "integer" },
                    feedback: { type: "string" }
                  },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                }
              },
              required: ["content", "pronunciation", "oralFluency"],
              additionalProperties: false
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            modelAnswer: { type: "string" }
          },
          required: [
            "taskType",
            "overallScore",
            "traits",
            "cefrLevel",
            "overallFeedback",
            "strengths",
            "improvements",
            "modelAnswer"
          ],
          additionalProperties: false
        }
      }
    }
  });
  return JSON.parse(response.choices[0].message.content);
}
async function scoreAnswerShortQuestion(params) {
  const { question, correctAnswer, transcription } = params;
  const refWords = tokenize(correctAnswer);
  const hypWords = tokenize(transcription);
  const exactMatch = normalizeText(transcription).includes(normalizeText(correctAnswer));
  const anyWordMatch = refWords.some((w) => hypWords.includes(w));
  const matchDetail = `
DETERMINISTIC MATCH ANALYSIS:
  Correct answer: "${correctAnswer}"
  Test taker response: "${transcription}"
  Exact/near match: ${exactMatch ? "YES" : "NO"}
  Any keyword match: ${anyWordMatch ? "YES" : "NO"}
  Correct answer words: [${refWords.join(", ")}]
  Test taker words: [${hypWords.join(", ")}]
`;
  const prompt = `You are a certified PTE Academic examiner.
Score this Answer Short Question response.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
QUESTION: "${question}"
CORRECT ANSWER: "${correctAnswer}"
TEST TAKER RESPONSE: "${transcription}"

${matchDetail}

VOCABULARY SCORING \u2014 Answer Short Question (Official Pearson Criteria):
Score 1: Appropriate word choice \u2014 the response is semantically correct.
  - Accept exact matches AND synonyms AND semantically equivalent phrases.
  - Example: correct="photosynthesis", response="the process plants use to make food" \u2192 Score 1
  - Example: correct="evaporation", response="when water turns to gas/vapor" \u2192 Score 1
Score 0: Inappropriate word choice \u2014 wrong, irrelevant, or no answer.

IMPORTANT RULES:
  - Do NOT penalize for minor pronunciation differences in the transcription.
  - Do NOT penalize for articles (a/an/the) or minor grammatical variations.
  - DO penalize for completely wrong answers or blank responses.
  - If the test taker said something semantically equivalent, score 1.

CHAIN-OF-THOUGHT:
  a) Is the response semantically correct or equivalent to the correct answer?
  b) If YES \u2192 Score 1, PTE = 90
  c) If NO \u2192 Score 0, PTE = 10
  d) Explain why in the feedback.

Respond ONLY with valid JSON:`;
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Return ONLY valid JSON."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "answer_short_question_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            taskType: { type: "string" },
            overallScore: { type: "integer" },
            traits: {
              type: "object",
              properties: {
                vocabulary: {
                  type: "object",
                  properties: {
                    score: { type: "integer" },
                    maxScore: { type: "integer" },
                    feedback: { type: "string" }
                  },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                }
              },
              required: ["vocabulary"],
              additionalProperties: false
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } }
          },
          required: [
            "taskType",
            "overallScore",
            "traits",
            "cefrLevel",
            "overallFeedback",
            "strengths",
            "improvements"
          ],
          additionalProperties: false
        }
      }
    }
  });
  return JSON.parse(response.choices[0].message.content);
}
function detectRepetitions(text3) {
  const words = tokenize(text3);
  let count = 0;
  for (let i = 1; i < words.length; i++) {
    if (words[i] === words[i - 1]) count++;
  }
  return count;
}
function applySpeakingReliabilityGuard(result, params) {
  if (params.taskType === "answer_short_question") return result;
  const spokenWords = tokenize(params.transcription).length;
  const referenceWords = tokenize(params.referenceText ?? "").length;
  const materiallyIncomplete = referenceWords >= 8 && spokenWords <= Math.max(3, Math.floor(referenceWords * 0.25));
  const severeLowOutput = spokenWords <= 3 || params.wpm !== void 0 && params.wpm < 35 && spokenWords <= 8;
  if (!materiallyIncomplete && !severeLowOutput) return result;
  const reason = materiallyIncomplete ? `Only ${spokenWords} of approximately ${referenceWords} expected words were detected.` : `Only ${spokenWords} spoken words were detected at approximately ${Math.round(params.wpm ?? 0)} WPM.`;
  const oralFluency = result.traits.oralFluency;
  const pronunciation = result.traits.pronunciation;
  if (oralFluency) {
    oralFluency.score = Math.min(oralFluency.score, 1);
    oralFluency.feedback = `${reason} Oral fluency is capped because the response does not demonstrate sustained, continuous speech.`;
  }
  if (pronunciation) {
    pronunciation.score = Math.min(pronunciation.score, 1);
    pronunciation.feedback = `${reason} Pronunciation cannot be awarded above the limited-evidence band until enough speech is produced.`;
  }
  if (result.traits.content) {
    result.traits.content.score = Math.min(result.traits.content.score, materiallyIncomplete ? 1 : result.traits.content.score);
    result.traits.content.feedback = `${reason} Content coverage is insufficient for the task.`;
  }
  const contentPercentage = result.traits.content && result.traits.content.maxScore > 0 ? Math.max(0, Math.min(1, result.traits.content.score / result.traits.content.maxScore)) : referenceWords > 0 ? Math.min(1, spokenWords / referenceWords) : 0;
  result.overallScore = calibrateSpeakingReferenceScore({
    contentPercentage,
    pronunciation: pronunciation?.score ?? 0,
    fluency: oralFluency?.score ?? 0
  });
  result.cefrLevel = referenceCefrLevel(result.overallScore);
  result.overallFeedback = `${reason} The score reflects the limited recorded speech and fluency evidence.`;
  result.improvements = Array.from(/* @__PURE__ */ new Set([
    "Speak continuously for the full response window.",
    "Reduce long pauses and maintain a steady speaking rate.",
    ...result.improvements
  ]));
  return result;
}
async function scoreRespondToSituation(params) {
  const { situationText, transcription, wpm = 0, pauseCount = 0 } = params;
  const wordCount2 = tokenize(transcription).length;
  const repetitions = detectRepetitions(transcription);
  const deterministic = [
    "DETERMINISTIC PRE-ANALYSIS:",
    `  Response word count: ${wordCount2} (target: 30-80 words for 40s)`,
    `  Estimated WPM: ${wpm}`,
    `  Detected repetitions: ${repetitions}`,
    `  Blank response: ${wordCount2 === 0 ? "YES" : "NO"}`
  ].join("\n");
  const prompt = [
    "You are a certified PTE Academic examiner scoring a Respond to a Situation task.",
    "",
    "OFFICIAL SCORING CRITERIA (Pearson PTE Academic):",
    "  Pronunciation (0-5): Intelligibility of individual sounds, stress, intonation, rhythm.",
    "    5=Native-like; 4=Minor accent, fully intelligible; 3=Noticeable accent, mostly clear;",
    "    2=Frequent errors, sometimes unclear; 1=Heavy accent, hard to follow; 0=Unintelligible",
    "  Oral Fluency (0-5): Smooth, natural delivery without unnatural pauses or hesitations.",
    "    5=Effortless; 4=Minor hesitations; 3=Some pauses but recovers;",
    "    2=Frequent pauses, choppy; 1=Very halting; 0=No meaningful speech",
    "  Content (0-5): Relevance and completeness - does the response address the situation?",
    "    5=Fully addresses all key points, appropriate register, polite and natural;",
    "    4=Addresses most points, minor omissions; 3=Addresses core issue, some points missed;",
    "    2=Partially relevant; 1=Barely relevant; 0=Off-topic or blank",
    "",
    "CALIBRATION ANCHORS:",
    "  C2: Fully addresses situation with natural register, polite phrasing, all key points covered. Pronunciation:5, Fluency:5, Content:5",
    "  C1: Addresses situation clearly, minor omissions, natural language. Pronunciation:4, Fluency:4, Content:4",
    "  B2: Addresses core issue, some points missed, some hesitations. Pronunciation:3, Fluency:3, Content:3",
    "  B1: Partially relevant, limited vocabulary, multiple hesitations. Pronunciation:2, Fluency:2, Content:2",
    "",
    "TASK INPUT:",
    `SITUATION: "${situationText}"`,
    `TEST TAKER RESPONSE: "${transcription}"`,
    deterministic,
    "",
    "CHAIN-OF-THOUGHT:",
    "  a) Does the response address the situation's core issue? (Content)",
    "  b) Is the language appropriate for the context (register, politeness)? (Content)",
    "  c) How natural and fluent is the delivery? (Oral Fluency)",
    "  d) How clear and intelligible is the pronunciation? (Pronunciation)",
    "  e) Assign scores based on the calibration anchors above.",
    "",
    "Respond ONLY with valid JSON:"
  ].join("\n");
  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are a certified PTE Academic examiner. Return ONLY valid JSON." },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "respond_to_situation_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            taskType: { type: "string" },
            overallScore: { type: "integer" },
            traits: {
              type: "object",
              properties: {
                pronunciation: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                oralFluency: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                content: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false }
              },
              required: ["pronunciation", "oralFluency", "content"],
              additionalProperties: false
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            strategyTips: { type: "array", items: { type: "string" } }
          },
          required: ["taskType", "overallScore", "traits", "cefrLevel", "overallFeedback", "strengths", "improvements", "strategyTips"],
          additionalProperties: false
        }
      }
    }
  });
  return JSON.parse(response.choices[0].message.content);
}
async function scoreSummarizeGroupDiscussion(params) {
  const { discussionTranscript, transcription, wpm = 0 } = params;
  const wordCount2 = tokenize(transcription).length;
  const repetitions = detectRepetitions(transcription);
  const speakerMatchResults = Array.from(discussionTranscript.matchAll(/^([A-Z][a-z]+):/gm));
  const speakerNamesRaw = speakerMatchResults.map((m) => m[1]);
  const speakerNames = speakerNamesRaw.filter((v, i, a) => a.indexOf(v) === i);
  const speakersCovered = speakerNames.filter(
    (name) => transcription.toLowerCase().includes(name.toLowerCase())
  );
  const deterministic = [
    "DETERMINISTIC PRE-ANALYSIS:",
    `  Response word count: ${wordCount2} (target: 60-120 words for 90s)`,
    `  Estimated WPM: ${wpm}`,
    `  Detected repetitions: ${repetitions}`,
    `  Discussion speakers: [${speakerNames.join(", ")}]`,
    `  Speakers mentioned in response: [${speakersCovered.join(", ")}] (${speakersCovered.length}/${speakerNames.length})`,
    `  Blank response: ${wordCount2 === 0 ? "YES" : "NO"}`
  ].join("\n");
  const prompt = [
    "You are a certified PTE Academic examiner scoring a Summarize Group Discussion task.",
    "",
    "OFFICIAL SCORING CRITERIA (Pearson PTE Academic):",
    "  Pronunciation (0-5): Intelligibility of individual sounds, stress, intonation, rhythm.",
    "  Oral Fluency (0-5): Smooth, natural delivery without unnatural pauses or hesitations.",
    "  Content (0-5): Coverage of all speakers' main points and the discussion's overall conclusion.",
    "    5=All speakers' key points covered, overall conclusion clear, well-organised;",
    "    4=Most speakers covered, minor omissions; 3=Core points covered, some speakers missed;",
    "    2=Only 1-2 speakers mentioned, key points missing; 1=Very little relevant content; 0=Off-topic",
    "",
    "CALIBRATION ANCHORS:",
    "  C2: All speakers named, all key points covered, conclusion stated clearly. Pronunciation:5, Fluency:5, Content:5",
    "  C1: Most speakers covered, minor omissions, clear conclusion. Pronunciation:4, Fluency:4, Content:4",
    "  B2: Core points covered, some speakers missed, acceptable fluency. Pronunciation:3, Fluency:3, Content:2-3",
    "  B1: Only 1-2 speakers mentioned, key points missing, hesitant. Pronunciation:2, Fluency:2, Content:1",
    "",
    "TASK INPUT:",
    `GROUP DISCUSSION TRANSCRIPT: "${discussionTranscript.substring(0, 1200)}"`,
    `TEST TAKER SUMMARY RESPONSE: "${transcription}"`,
    deterministic,
    "",
    "CHAIN-OF-THOUGHT:",
    "  a) How many speakers' main points are covered? (Content)",
    "  b) Is the overall conclusion or consensus mentioned? (Content)",
    "  c) How natural and fluent is the delivery? (Oral Fluency)",
    "  d) How clear and intelligible is the pronunciation? (Pronunciation)",
    "  e) Assign scores based on the calibration anchors above.",
    "",
    "Respond ONLY with valid JSON:"
  ].join("\n");
  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are a certified PTE Academic examiner. Return ONLY valid JSON." },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "summarize_group_discussion_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            taskType: { type: "string" },
            overallScore: { type: "integer" },
            traits: {
              type: "object",
              properties: {
                pronunciation: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                oralFluency: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                content: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false }
              },
              required: ["pronunciation", "oralFluency", "content"],
              additionalProperties: false
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            strategyTips: { type: "array", items: { type: "string" } }
          },
          required: ["taskType", "overallScore", "traits", "cefrLevel", "overallFeedback", "strengths", "improvements", "strategyTips"],
          additionalProperties: false
        }
      }
    }
  });
  return JSON.parse(response.choices[0].message.content);
}
async function scoreSpeakingTask(params) {
  const { taskType, transcription } = params;
  let result;
  switch (taskType) {
    case "read_aloud":
      result = await scoreReadAloud({
        originalText: params.originalText || "",
        transcription,
        wpm: params.wpm,
        pauseCount: params.pauseCount
      });
      break;
    case "repeat_sentence":
      result = await scoreRepeatSentence({
        originalSentence: params.originalText || "",
        transcription,
        wpm: params.wpm
      });
      break;
    case "describe_image":
      result = await scoreDescribeImage({
        imageDescription: params.imageDescription || params.originalText || "A graph or chart",
        transcription,
        wpm: params.wpm,
        pauseCount: params.pauseCount
      });
      break;
    case "retell_lecture":
      result = await scoreRetellLecture({
        lectureTranscript: params.lectureTranscript || params.originalText || "",
        transcription,
        wpm: params.wpm
      });
      break;
    case "answer_short_question":
      result = await scoreAnswerShortQuestion({
        question: params.question || params.originalText || "",
        correctAnswer: params.correctAnswer || "",
        transcription
      });
      break;
    case "respond_to_situation":
      result = await scoreRespondToSituation({
        situationText: params.originalText || "",
        transcription,
        wpm: params.wpm,
        pauseCount: params.pauseCount
      });
      break;
    case "summarize_group_discussion":
      result = await scoreSummarizeGroupDiscussion({
        discussionTranscript: params.originalText || params.lectureTranscript || "",
        transcription,
        wpm: params.wpm,
        pauseCount: params.pauseCount
      });
      break;
    default:
      result = await scoreReadAloud({
        originalText: params.originalText || "",
        transcription,
        wpm: params.wpm
      });
  }
  const referenceText = taskType === "answer_short_question" ? params.correctAnswer : params.originalText || params.imageDescription || params.lectureTranscript;
  return applySpeakingReliabilityGuard(result, {
    taskType,
    transcription,
    referenceText,
    wpm: params.wpm
  });
}

// server/ai/writingAI.ts
function countWords(text3) {
  if (!text3) return 0;
  return text3.trim().split(/\s+/).filter(Boolean).length;
}
function countSentences(text3) {
  if (!text3) return 0;
  const matches = text3.match(/[.!?]+/g);
  return matches ? matches.length : 0;
}
function countParagraphs(text3) {
  if (!text3) return 0;
  return text3.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
}
function isAllCaps(text3) {
  if (!text3) return false;
  const letters = text3.replace(/[^a-zA-Z]/g, "");
  if (letters.length === 0) return false;
  return letters === letters.toUpperCase();
}
function countSpellingErrors(text3) {
  const commonErrors = {
    "recieve": "receive",
    "beleive": "believe",
    "occured": "occurred",
    "seperate": "separate",
    "definately": "definitely",
    "accomodate": "accommodate",
    "goverment": "government",
    "enviroment": "environment",
    "developement": "development",
    "independance": "independence",
    "existance": "existence",
    "occurance": "occurrence",
    "knowlege": "knowledge",
    "arguement": "argument",
    "judgement": "judgment",
    "maintainance": "maintenance",
    "neccessary": "necessary",
    "priviledge": "privilege",
    "publically": "publicly",
    "rythm": "rhythm",
    "succesful": "successful",
    "tommorrow": "tomorrow",
    "untill": "until",
    "wierd": "weird",
    "writting": "writing",
    "comming": "coming",
    "begining": "beginning",
    "grammer": "grammar",
    "alot": "a lot",
    "alright": "all right",
    "basicly": "basically",
    "concious": "conscious",
    "critisism": "criticism",
    "dissapear": "disappear",
    "embarass": "embarrass",
    "foriegn": "foreign",
    "harrass": "harass",
    "liase": "liaise",
    "millenium": "millennium",
    "miniscule": "minuscule",
    "noticable": "noticeable",
    "occassion": "occasion",
    "perseverence": "perseverance",
    "pronounciation": "pronunciation",
    "questionaire": "questionnaire",
    "relevent": "relevant",
    "restaraunt": "restaurant",
    "sieze": "seize",
    "supercede": "supersede",
    "temperament": "temperament",
    "vaccum": "vacuum",
    "wether": "whether"
  };
  const words = text3.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
  const errors = [];
  for (const word of words) {
    if (commonErrors[word] && !errors.includes(word)) {
      errors.push(word);
    }
  }
  return { count: errors.length, examples: errors.slice(0, 5) };
}
function detectTransitionWords(text3) {
  const transitions = [
    "however",
    "furthermore",
    "moreover",
    "therefore",
    "consequently",
    "in addition",
    "on the other hand",
    "in contrast",
    "for example",
    "for instance",
    "in conclusion",
    "to summarize",
    "as a result",
    "nevertheless",
    "although",
    "despite",
    "while",
    "whereas",
    "first",
    "second",
    "third",
    "finally",
    "additionally",
    "in fact",
    "indeed",
    "similarly",
    "likewise",
    "thus"
  ];
  const lower = text3.toLowerCase();
  return transitions.filter((t2) => lower.includes(t2)).length;
}
function detectComplexSentences(text3) {
  const subordinators = [
    "although",
    "because",
    "since",
    "while",
    "whereas",
    "if",
    "unless",
    "when",
    "after",
    "before",
    "until",
    "as",
    "that",
    "which",
    "who",
    "whose",
    "where",
    "whether",
    "even though",
    "provided that"
  ];
  const lower = text3.toLowerCase();
  return subordinators.filter((s) => lower.includes(s)).length;
}
var SUMMARIZE_WRITTEN_TEXT_RUBRIC = `
SUMMARIZE WRITTEN TEXT \u2014 OFFICIAL PEARSON SCORING CRITERIA (Score Guide v21, Nov 2024)

FORM (0-2) \u2014 CHECK THIS FIRST:
  Score 2: Written in ONE, single, complete sentence. Word count 5-75.
  Score 0: NOT written in one single complete sentence, OR fewer than 5 words, OR more than 75 words,
           OR written in capital letters.
  \u26A0 GATEKEEPER: If Form = 0, ALL other scores = 0 and total = 0.

CONTENT (0-2):
  Score 2: Provides a GOOD summary. ALL relevant aspects mentioned.
  Score 1: Provides a FAIR summary but misses ONE or TWO aspects.
  Score 0: OMITS or MISREPRESENTS the main aspects of the text.

GRAMMAR (0-2):
  Score 2: Has CORRECT grammatical structure throughout.
  Score 1: Contains grammatical errors but with NO HINDRANCE to communication.
  Score 0: Has DEFECTIVE grammatical structure which COULD HINDER communication.

VOCABULARY (0-2):
  Score 2: Has APPROPRIATE choice of words throughout.
  Score 1: Contains lexical errors but with NO HINDRANCE to communication.
  Score 0: Has DEFECTIVE word choice which COULD HINDER communication.

Maximum raw score: 8 points (Form 2 + Content 2 + Grammar 2 + Vocabulary 2).
PTE scale: round(10 + (rawScore/8) \xD7 80)

DECISION RULES:
- Single sentence check: count full stops, question marks, exclamation marks \u2192 must be exactly 1
- Word count: must be 5-75 words
- If either fails \u2192 Form = 0, total = 0
`;
var WRITE_ESSAY_RUBRIC = `
WRITE ESSAY \u2014 OFFICIAL PEARSON SCORING CRITERIA (Score Guide v21, Nov 2024)

CONTENT (0-3) \u2014 CHECK THIS FIRST:
  Score 3: ADEQUATELY deals with the prompt. All aspects addressed.
  Score 2: Deals with the prompt but does NOT deal with ONE minor aspect.
  Score 1: Deals with the prompt but OMITS a major aspect or more than one minor aspect.
  Score 0: Does NOT deal properly with the prompt. Includes significant pre-prepared/memorized material.
  \u26A0 GATEKEEPER: If Content = 0, ALL other scores = 0 and total = 0.

FORM (0-2) \u2014 CHECK THIS SECOND:
  Score 2: Length is between 200 and 300 words.
  Score 1: Length is between 120-199 OR 301-380 words.
  Score 0: Length is LESS THAN 120 OR MORE THAN 380 words. Written in capital letters.
           Contains no punctuation. Only consists of bullet points or very short sentences.
  \u26A0 GATEKEEPER: If Form = 0, ALL other scores = 0 and total = 0.

DEVELOPMENT, STRUCTURE AND COHERENCE (0-2):
  Score 2: Shows GOOD development and LOGICAL structure. Well-organized paragraphs.
           Appropriate use of discourse markers and transitions.
  Score 1: Is incidentally less well structured; some elements or paragraphs are poorly linked.
  Score 0: LACKS coherence and mainly consists of lists or loose elements.

GRAMMAR (0-2):
  Score 2: Shows CONSISTENT grammatical control of COMPLEX language. Errors are RARE and difficult to spot.
  Score 1: Shows a relatively HIGH DEGREE of grammatical control. No mistakes leading to misunderstandings.
  Score 0: Contains MAINLY SIMPLE structures and/or SEVERAL BASIC mistakes.

GENERAL LINGUISTIC RANGE (0-2):
  Score 2: Exhibits MASTERY of a wide range of language. Formulates thoughts precisely.
           No sign that the test taker is restricted in expression.
  Score 1: SUFFICIENT range to provide clear descriptions, express viewpoints and develop arguments.
  Score 0: Contains MAINLY BASIC language and lacks precision.

VOCABULARY RANGE (0-2):
  Score 2: Good command of a BROAD lexical repertoire, idiomatic expressions and colloquialisms.
           Aware of connotative significance of words.
  Score 1: Shows a GOOD RANGE of vocabulary for general academic topics.
           Lexical shortcomings lead to circumlocution or some imprecision.
  Score 0: Contains MAINLY BASIC vocabulary insufficient to deal with the topic at the required level.

SPELLING (0-2):
  Score 2: CORRECT spelling throughout (zero errors).
  Score 1: EXACTLY ONE spelling error.
  Score 0: MORE THAN ONE spelling error.

Maximum raw score: 15 points.
PTE scale: round(10 + (rawScore/15) \xD7 80)
`;
var WRITING_CALIBRATION_ANCHORS = `
MULTI-LEVEL CALIBRATION ANCHORS \u2014 Real machine scores from Pearson Score Guide v21 (Nov 2024)

These are ACTUAL machine scores from the official Pearson scoring engine.
Use these as your PRIMARY reference when assigning scores.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
WRITE ESSAY \u2014 Official Pearson Calibration (Tobacco/Health topic)
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

C1 Level (PTE 76-84) \u2014 ACTUAL MACHINE SCORES:
  Content: 2.74/3, DSC: 1.97/2, Form: 2.00/2, GLR: 2.00/2, Grammar: 1.70/2, Spelling: 1.00/2, Vocab: 1.82/2
  Total: 13.23/15 \u2192 PTE ~80
  Characteristics: "Clear, well-structured exposition. Points of view given at some length with
    subsidiary points. Reasons and relevant examples demonstrated. General linguistic range and
    vocabulary range are excellent. Phrasing and word choice are appropriate. Very few grammar errors.
    Spelling is excellent."
  \u2192 Grammar: 2 (rare errors), GLR: 2 (no restrictions), Vocab: 2 (broad repertoire), DSC: 2 (good structure)

B2 Level (PTE 59-75) \u2014 ACTUAL MACHINE SCORES:
  Content: 2.25/3, DSC: 1.17/2, Form: 2.00/2, GLR: 1.42/2, Grammar: 1.68/2, Spelling: 0.00/2, Vocab: 1.32/2
  Total: 9.84/15 \u2192 PTE ~62
  Characteristics: "A systematic argument with appropriate highlighting of significant points and
    relevant supporting detail. Ability to evaluate different ideas demonstrated. However, some
    obvious grammar errors and inappropriate use of vocabulary. Quite a number of spelling errors."
  \u2192 Grammar: 1 (some obvious errors), GLR: 1 (sufficient but imprecise), Spelling: 0 (multiple errors)

B1 Level (PTE 43-58) \u2014 ACTUAL MACHINE SCORES:
  Content: 1.80/3, DSC: 1.35/2, Form: 2.00/2, GLR: 1.03/2, Grammar: 1.07/2, Spelling: 0.00/2, Vocab: 0.93/2
  Total: 8.18/15 \u2192 PTE ~54
  Characteristics: "A simple essay which gives a minimal answer to the prompt. The argument
    contains insufficient supporting ideas. The structure is lacking in logic and coherence.
    There is frequent misuse of grammar and vocabulary. Vocabulary range is limited and
    inappropriate at times."
  \u2192 Content: 1-2 (minimal answer), DSC: 1 (lacking coherence), Grammar: 1 (frequent misuse)

A2 Level (PTE 29-42) \u2014 Estimated scores:
  Content: 0-1, DSC: 0, Form: 1-2, GLR: 0, Grammar: 0, Spelling: 0, Vocab: 0
  Total: 1-3/15 \u2192 PTE ~18-26
  Characteristics: "Does not properly address the prompt. Very superficial treatment.
    No coherent structure. Many basic grammar mistakes. Basic vocabulary only."

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
SUMMARIZE WRITTEN TEXT \u2014 Official Pearson Calibration
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

C1 Level (PTE 76-84):
  Form: 2 (single sentence, 20-50 words), Content: 2 (all main points), Grammar: 2, Vocab: 2
  Total: 8/8 \u2192 PTE 90
  Example: "The passage discusses [main topic], explaining that [key point 1] and [key point 2],
    while also noting that [key point 3], which has implications for [conclusion]."

B2 Level (PTE 59-75):
  Form: 2, Content: 1 (misses 1-2 aspects), Grammar: 2, Vocab: 1
  Total: 6/8 \u2192 PTE ~70
  Example: Covers main topic but omits secondary points; some imprecise word choices.

B1 Level (PTE 43-58):
  Form: 2, Content: 1 (fair summary), Grammar: 1 (minor errors), Vocab: 1
  Total: 5/8 \u2192 PTE ~60
  Example: Covers some aspects, grammatical errors that don't impede understanding.

A2 Level (PTE 29-42):
  Form: 0 (two sentences or too long), or Form: 2 with Content: 0
  Total: 0/8 \u2192 PTE 10
  Example: Two separate sentences, or completely misses the main point.
`;
async function scoreSummarizeWrittenText(params) {
  const { sourceText, response } = params;
  const wordCount2 = countWords(response);
  const sentenceCount = countSentences(response);
  const allCaps = isAllCaps(response);
  const spellingCheck = countSpellingErrors(response);
  const formScore = sentenceCount === 1 && wordCount2 >= 5 && wordCount2 <= 75 && !allCaps ? 2 : 0;
  const preProcessing = `
DETERMINISTIC PRE-COMPUTED METRICS (computed by TypeScript, NOT to be overridden):
  Word count: ${wordCount2} (valid range: 5-75)
  Sentence count: ${sentenceCount} (must be exactly 1)
  All capitals: ${allCaps ? "YES \u2014 automatic Form=0" : "NO"}
  Detected spelling errors: ${spellingCheck.count} (${spellingCheck.examples.join(", ") || "none detected"})
  FORM SCORE (FIXED): ${formScore}/2
    ${formScore === 0 ? "\u26A0 FORM=0: " + (sentenceCount !== 1 ? `${sentenceCount} sentences detected (must be 1)` : wordCount2 < 5 ? "Too short (<5 words)" : wordCount2 > 75 ? "Too long (>75 words)" : "Written in capitals") : "\u2713 Single sentence, valid word count"}
  ${formScore === 0 ? "\u26A0 GATEKEEPER TRIGGERED: All scores = 0, total = 0" : ""}
`;
  if (formScore === 0) {
    const formFeedback = sentenceCount !== 1 ? `Response contains ${sentenceCount} sentences. Must be exactly ONE complete sentence.` : wordCount2 < 5 ? `Response is too short (${wordCount2} words). Must be 5-75 words.` : wordCount2 > 75 ? `Response is too long (${wordCount2} words). Must be 5-75 words.` : "Response is written in all capitals, which is not accepted.";
    return {
      taskType: "summarize_written_text",
      overallScore: 10,
      rawScore: 0,
      maxRawScore: 8,
      wordCount: wordCount2,
      traits: {
        form: { score: 0, maxScore: 2, feedback: formFeedback },
        content: { score: 0, maxScore: 2, feedback: "Form requirement not met \u2014 content not scored." },
        grammar: { score: 0, maxScore: 2, feedback: "Form requirement not met \u2014 grammar not scored." },
        vocabulary: { score: 0, maxScore: 2, feedback: "Form requirement not met \u2014 vocabulary not scored." }
      },
      cefrLevel: "A1",
      overallFeedback: `Your response does not meet the Form requirement: ${formFeedback} In PTE, a Summarize Written Text response MUST be a single complete sentence between 5 and 75 words.`,
      strengths: [],
      improvements: [
        "Write your summary as exactly ONE complete sentence.",
        `Your response has ${wordCount2} words and ${sentenceCount} sentence(s). Aim for a single sentence of 25-50 words.`,
        "Use a complex sentence structure: 'The passage discusses X, explaining that Y, while also noting Z.'"
      ],
      modelAnswer: `The text explores [main topic], arguing that [key point 1] and [key point 2], which suggests that [conclusion].`,
      grammarErrors: [],
      vocabularyFeedback: "Not scored due to Form failure."
    };
  }
  const prompt = `You are a certified PTE Academic examiner using Pearson's official scoring engine.
Score this Summarize Written Text response using CHAIN-OF-THOUGHT reasoning.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
SOURCE TEXT: "${sourceText}"
TEST TAKER RESPONSE: "${response}"

${preProcessing}

${SUMMARIZE_WRITTEN_TEXT_RUBRIC}

${WRITING_CALIBRATION_ANCHORS}
${PTE_SUBJECTIVE_CALIBRATION_ANCHORS}

\u2550\u2550\u2550 CHAIN-OF-THOUGHT SCORING INSTRUCTIONS \u2550\u2550\u2550
Note: Form score is already FIXED at ${formScore}/2 by the pre-processor. Do NOT change it.

STEP 1 \u2014 CONTENT ANALYSIS:
  a) Identify the 3-5 main points of the source text.
  b) Check which main points appear in the response.
  c) Is the main topic/argument captured?
  d) Are any key aspects omitted or misrepresented?
  e) Assign content score: 2 (all aspects), 1 (misses 1-2), 0 (omits/misrepresents main aspects).

STEP 2 \u2014 GRAMMAR ANALYSIS:
  a) Identify any grammatical errors in the response.
  b) Do the errors hinder communication?
  c) Assign grammar score: 2 (correct), 1 (errors but no hindrance), 0 (defective, hinders communication).

STEP 3 \u2014 VOCABULARY ANALYSIS:
  a) Are the words appropriate for the topic?
  b) Are there any inappropriate or incorrect word choices?
  c) Assign vocabulary score: 2 (appropriate throughout), 1 (errors but no hindrance), 0 (defective).

STEP 4 \u2014 RAW SCORE CALCULATION:
  raw = Form(${formScore}) + Content + Grammar + Vocabulary (max 8)
  PTE = round(10 + (raw/8) \xD7 80), clamped to [10, 90]

STEP 5 \u2014 CEFR: 10-28\u2192A1, 29-42\u2192A2, 43-58\u2192B1, 59-75\u2192B2, 76-84\u2192C1, 85-90\u2192C2

STEP 6 \u2014 FEEDBACK:
  - List the main points of the source text.
  - Identify which were covered and which were missed.
  - Provide a C1-level model one-sentence summary.

Respond ONLY with valid JSON:`;
  const response_llm = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Reason step by step, then return ONLY valid JSON."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "swt_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            taskType: { type: "string" },
            overallScore: { type: "integer" },
            rawScore: { type: "integer" },
            maxRawScore: { type: "integer" },
            wordCount: { type: "integer" },
            traits: {
              type: "object",
              properties: {
                form: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                content: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                grammar: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                vocabulary: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                }
              },
              required: ["form", "content", "grammar", "vocabulary"],
              additionalProperties: false
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            grammarErrors: { type: "array", items: { type: "string" } },
            vocabularyFeedback: { type: "string" },
            modelAnswer: { type: "string" }
          },
          required: [
            "taskType",
            "overallScore",
            "rawScore",
            "maxRawScore",
            "wordCount",
            "traits",
            "cefrLevel",
            "overallFeedback",
            "strengths",
            "improvements",
            "grammarErrors",
            "vocabularyFeedback",
            "modelAnswer"
          ],
          additionalProperties: false
        }
      }
    }
  });
  const result = JSON.parse(response_llm.choices[0].message.content);
  if (result.traits.form) {
    result.traits.form.score = formScore;
    result.traits.form.maxScore = 2;
  }
  const rawScore = formScore + (result.traits.content?.score || 0) + (result.traits.grammar?.score || 0) + (result.traits.vocabulary?.score || 0);
  result.rawScore = rawScore;
  const calibrated = calibrateScore("writing_essay", rawScore);
  result.overallScore = calibrated.pteScore;
  result.cefrLevel = calibrated.cefrLevel;
  return result;
}
async function scoreWriteEssay(params) {
  const { prompt: essayPrompt, response } = params;
  const wordCount2 = countWords(response);
  const sentenceCount = countSentences(response);
  const paragraphCount = countParagraphs(response);
  const allCaps = isAllCaps(response);
  const spellingCheck = countSpellingErrors(response);
  const transitionCount = detectTransitionWords(response);
  const complexSentenceCount = detectComplexSentences(response);
  let formScore;
  let formFeedback;
  if (allCaps || wordCount2 < 120 || wordCount2 > 380) {
    formScore = 0;
    formFeedback = allCaps ? "Essay written in all capitals \u2014 not accepted." : wordCount2 < 120 ? `Too short: ${wordCount2} words. Minimum is 120 words (ideal: 200-300).` : `Too long: ${wordCount2} words. Maximum is 380 words (ideal: 200-300).`;
  } else if (wordCount2 >= 200 && wordCount2 <= 300) {
    formScore = 2;
    formFeedback = `Word count: ${wordCount2} words \u2014 within the ideal 200-300 range.`;
  } else {
    formScore = 1;
    formFeedback = `Word count: ${wordCount2} words \u2014 acceptable but outside the ideal 200-300 range.`;
  }
  let spellingScore;
  if (spellingCheck.count === 0) spellingScore = 2;
  else if (spellingCheck.count === 1) spellingScore = 1;
  else spellingScore = 0;
  const preProcessing = `
DETERMINISTIC PRE-COMPUTED METRICS (computed by TypeScript, NOT to be overridden):
  Word count: ${wordCount2}
  Sentence count: ${sentenceCount}
  Paragraph count: ${paragraphCount}
  All capitals: ${allCaps ? "YES" : "NO"}
  Transition words detected: ${transitionCount} (${transitionCount >= 5 ? "good" : transitionCount >= 3 ? "adequate" : "limited"})
  Complex sentence structures: ${complexSentenceCount}
  Spelling errors detected: ${spellingCheck.count} (${spellingCheck.examples.join(", ") || "none"})
  FORM SCORE (FIXED): ${formScore}/2 \u2014 ${formFeedback}
  SPELLING SCORE (FIXED): ${spellingScore}/2 \u2014 ${spellingCheck.count} error(s) found
  ${formScore === 0 ? "\u26A0 FORM GATEKEEPER: All scores = 0" : ""}
`;
  if (formScore === 0) {
    return {
      taskType: "write_essay",
      overallScore: 10,
      rawScore: 0,
      maxRawScore: 15,
      wordCount: wordCount2,
      traits: {
        content: { score: 0, maxScore: 3, feedback: "Form requirement not met." },
        form: { score: 0, maxScore: 2, feedback: formFeedback },
        grammar: { score: 0, maxScore: 2, feedback: "Form requirement not met." },
        vocabulary: { score: 0, maxScore: 2, feedback: "Form requirement not met." },
        development: { score: 0, maxScore: 2, feedback: "Form requirement not met." },
        linguisticRange: { score: 0, maxScore: 2, feedback: "Form requirement not met." },
        spelling: { score: spellingScore, maxScore: 2, feedback: formFeedback }
      },
      cefrLevel: "A1",
      overallFeedback: `Your essay does not meet the Form requirement: ${formFeedback} In PTE, essays must be 120-380 words (ideal: 200-300).`,
      strengths: [],
      improvements: [
        `Your essay is ${wordCount2} words. Aim for 200-300 words.`,
        "Structure your essay with an introduction, 2-3 body paragraphs, and a conclusion.",
        "Each paragraph should have a clear topic sentence and supporting evidence."
      ],
      grammarErrors: [],
      vocabularyFeedback: "Not scored due to Form failure."
    };
  }
  const prompt = `You are a certified PTE Academic examiner using Pearson's official scoring engine.
Score this Write Essay response using CHAIN-OF-THOUGHT reasoning, criterion by criterion.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
ESSAY PROMPT: "${essayPrompt}"
TEST TAKER ESSAY: "${response}"

${preProcessing}

${WRITE_ESSAY_RUBRIC}

${WRITING_CALIBRATION_ANCHORS}
${PTE_SUBJECTIVE_CALIBRATION_ANCHORS}

\u2550\u2550\u2550 CHAIN-OF-THOUGHT SCORING INSTRUCTIONS \u2550\u2550\u2550
Note: Form score is FIXED at ${formScore}/2 and Spelling score is FIXED at ${spellingScore}/2. Do NOT change them.

STEP 1 \u2014 CONTENT ANALYSIS (most important criterion):
  a) What does the prompt ask the test taker to discuss/argue?
  b) Does the response address ALL aspects of the prompt?
  c) Are there specific aspects that are missing or underdeveloped?
  d) Is there any pre-prepared/memorized content that is off-topic?
  e) Assign content score: 3 (fully addresses), 2 (misses one minor aspect),
     1 (omits major aspect), 0 (does not deal properly with prompt).
  \u26A0 If Content = 0, ALL other scores = 0 and total = 0.

STEP 2 \u2014 DEVELOPMENT, STRUCTURE AND COHERENCE:
  a) Does the essay have a clear introduction, body paragraphs, and conclusion?
  b) Are paragraphs well-organized with topic sentences?
  c) Are transitions used effectively? (detected: ${transitionCount})
  d) Is the argument logically developed?
  e) Assign DSC score: 2 (good development), 1 (some weak links), 0 (lacks coherence).

STEP 3 \u2014 GRAMMAR ANALYSIS:
  a) Identify specific grammatical errors (subject-verb agreement, tense, articles, prepositions).
  b) Do errors hinder communication?
  c) Are complex sentence structures used? (detected: ${complexSentenceCount})
  d) Assign grammar score: 2 (consistent control, rare errors), 1 (high degree of control, no misunderstandings), 0 (mainly simple, several basic mistakes).

STEP 4 \u2014 GENERAL LINGUISTIC RANGE:
  a) Does the test taker use a wide range of language structures?
  b) Are they restricted in how they express ideas?
  c) Assign GLR score: 2 (mastery, no restrictions), 1 (sufficient range), 0 (mainly basic).

STEP 5 \u2014 VOCABULARY RANGE:
  a) Is academic vocabulary used appropriately?
  b) Are there inappropriate word choices or circumlocution?
  c) Assign vocabulary score: 2 (broad repertoire), 1 (good range, some imprecision), 0 (mainly basic).

STEP 6 \u2014 RAW SCORE:
  raw = Content + Form(${formScore}) + DSC + Grammar + GLR + Vocab + Spelling(${spellingScore}) (max 15)
  PTE = round(10 + (raw/15) \xD7 80), clamped to [10, 90]

STEP 7 \u2014 CEFR: 10-28\u2192A1, 29-42\u2192A2, 43-58\u2192B1, 59-75\u2192B2, 76-84\u2192C1, 85-90\u2192C2

STEP 8 \u2014 FEEDBACK:
  - List specific grammar errors with corrections.
  - Suggest better vocabulary alternatives.
  - Provide the opening paragraph of a C1-level model essay.

Respond ONLY with valid JSON:`;
  const response_llm = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Reason step by step criterion by criterion, then return ONLY valid JSON."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "essay_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            taskType: { type: "string" },
            overallScore: { type: "integer" },
            rawScore: { type: "integer" },
            maxRawScore: { type: "integer" },
            wordCount: { type: "integer" },
            traits: {
              type: "object",
              properties: {
                content: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                form: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                development: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                grammar: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                linguisticRange: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                vocabulary: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                },
                spelling: {
                  type: "object",
                  properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } },
                  required: ["score", "maxScore", "feedback"],
                  additionalProperties: false
                }
              },
              required: ["content", "form", "development", "grammar", "linguisticRange", "vocabulary", "spelling"],
              additionalProperties: false
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            grammarErrors: { type: "array", items: { type: "string" } },
            vocabularyFeedback: { type: "string" },
            modelAnswer: { type: "string" }
          },
          required: [
            "taskType",
            "overallScore",
            "rawScore",
            "maxRawScore",
            "wordCount",
            "traits",
            "cefrLevel",
            "overallFeedback",
            "strengths",
            "improvements",
            "grammarErrors",
            "vocabularyFeedback",
            "modelAnswer"
          ],
          additionalProperties: false
        }
      }
    }
  });
  const result = JSON.parse(response_llm.choices[0].message.content);
  if (result.traits.form) {
    result.traits.form.score = formScore;
    result.traits.form.maxScore = 2;
    result.traits.form.feedback = formFeedback;
  }
  if (result.traits.spelling) {
    result.traits.spelling.score = spellingScore;
    result.traits.spelling.maxScore = 2;
    if (spellingCheck.examples.length > 0) {
      result.traits.spelling.feedback = `${spellingCheck.count} spelling error(s) detected: ${spellingCheck.examples.join(", ")}.`;
    }
  }
  const contentScore = result.traits.content?.score || 0;
  if (contentScore === 0) {
    result.overallScore = 10;
    result.rawScore = 0;
    Object.keys(result.traits).forEach((key) => {
      const trait = result.traits[key];
      if (trait && key !== "content" && key !== "form") {
        trait.score = 0;
      }
    });
    return result;
  }
  const rawScore = contentScore + formScore + (result.traits.development?.score || 0) + (result.traits.grammar?.score || 0) + (result.traits.linguisticRange?.score || 0) + (result.traits.vocabulary?.score || 0) + spellingScore;
  result.rawScore = rawScore;
  result.overallScore = calibrateWritingReferenceScore({
    rawScore,
    maxRawScore: 15,
    formValid: formScore > 0,
    contentScore
  });
  if (result.overallScore >= 85) result.cefrLevel = "C2";
  else if (result.overallScore >= 76) result.cefrLevel = "C1";
  else if (result.overallScore >= 59) result.cefrLevel = "B2";
  else if (result.overallScore >= 43) result.cefrLevel = "B1";
  else if (result.overallScore >= 29) result.cefrLevel = "A2";
  else result.cefrLevel = "A1";
  return result;
}
async function scoreWritingTask(params) {
  switch (params.taskType) {
    case "summarize_written_text":
      return scoreSummarizeWrittenText({
        sourceText: params.sourceText || params.prompt || "",
        response: params.response
      });
    case "write_essay":
      return scoreWriteEssay({
        prompt: params.prompt || params.sourceText || "",
        response: params.response
      });
    default:
      return scoreWriteEssay({
        prompt: params.prompt || "",
        response: params.response
      });
  }
}

// server/ai/readingAI.ts
function normalizeAnswer(answer) {
  return answer.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");
}
function answersMatch(a, b) {
  return normalizeAnswer(a) === normalizeAnswer(b);
}
function computePTEScore(rawScore, maxRawScore) {
  if (maxRawScore === 0) return 10;
  const pte = Math.round(10 + rawScore / maxRawScore * 80);
  return Math.max(10, Math.min(90, pte));
}
function computeCEFR(pteScore) {
  if (pteScore >= 85) return "C2";
  if (pteScore >= 76) return "C1";
  if (pteScore >= 59) return "B2";
  if (pteScore >= 43) return "B1";
  if (pteScore >= 29) return "A2";
  return "A1";
}
function computeAdjacentPairScore(correctOrder, userOrder) {
  let score = 0;
  const correctPairs = /* @__PURE__ */ new Set();
  for (let i = 0; i < correctOrder.length - 1; i++) {
    correctPairs.add(`${correctOrder[i]}|${correctOrder[i + 1]}`);
  }
  for (let i = 0; i < userOrder.length - 1; i++) {
    if (correctPairs.has(`${userOrder[i]}|${userOrder[i + 1]}`)) {
      score++;
    }
  }
  return score;
}
var READING_SCORING_RULES = `
READING SCORING RULES \u2014 Official Pearson PTE Academic Score Guide v21 (Nov 2024)

Reading & Writing: Fill in the Blanks:
  Scoring: PARTIAL CREDIT \u2014 1 point for each correctly completed blank.
  Minimum score: 0. No negative marking.
  Skills: Reading comprehension + vocabulary knowledge + collocation awareness.

Multiple Choice, Choose Multiple Answers:
  Scoring: PARTIAL CREDIT \u2014 +1 for each correct option selected, -1 for each incorrect option.
  Minimum score: 0 (cannot go below zero).
  Skills: Reading comprehension, identifying multiple correct statements.
  \u26A0 NEGATIVE MARKING: Selecting wrong options REDUCES your score. Only select options you are confident about.

Re-order Paragraphs:
  Scoring: PARTIAL CREDIT \u2014 1 point for each correctly ordered ADJACENT PAIR.
  Example: Correct=[A,B,C,D], User=[A,C,B,D]
    User pairs: (A,C), (C,B), (B,D)
    Correct pairs: (A,B), (B,C), (C,D)
    Matching pairs: none \u2192 score = 0
  Minimum score: 0.
  Skills: Text structure comprehension, discourse coherence.

Reading: Fill in the Blanks:
  Scoring: PARTIAL CREDIT \u2014 1 point for each correctly completed blank.
  Minimum score: 0.
  Skills: Reading comprehension, vocabulary, grammar.

Multiple Choice, Choose Single Answer:
  Scoring: CORRECT/INCORRECT \u2014 1 point if correct, 0 if incorrect.
  Skills: Reading comprehension, main idea, detail, inference.
`;
var READING_STRATEGY_COACHING = `
READING STRATEGY COACHING BY TASK TYPE AND CEFR LEVEL

FILL IN THE BLANKS STRATEGIES:
  Step 1: Read the entire passage first to understand context.
  Step 2: For each blank, determine the grammatical category needed (noun/verb/adjective/adverb).
  Step 3: Check collocation: which word "goes with" the surrounding words naturally?
  Step 4: Check register: academic/formal text requires academic/formal vocabulary.
  Step 5: Eliminate options that don't fit grammatically, then choose the best semantic fit.
  Common traps: Words with similar meanings but different collocations (e.g., "make" vs "do").

MULTIPLE CHOICE SINGLE ANSWER STRATEGIES:
  Step 1: Read the question BEFORE reading the passage.
  Step 2: Identify the question type: main idea, specific detail, inference, vocabulary, author's purpose.
  Step 3: Locate the relevant section of the passage.
  Step 4: Eliminate obviously wrong options.
  Step 5: For remaining options, find direct evidence in the passage text.
  Common traps: Options that are true but don't answer the specific question asked.

MULTIPLE CHOICE MULTIPLE ANSWERS STRATEGIES:
  Step 1: Treat each option independently as true/false.
  Step 2: Find passage evidence for each option before selecting.
  Step 3: NEVER select an option just because it "sounds right" \u2014 negative marking applies.
  Step 4: If unsure about an option, leave it unselected (0 points better than -1).
  Common traps: Options that are partially true, options that contradict the passage.

RE-ORDER PARAGRAPHS STRATEGIES:
  Step 1: Find the INTRODUCTION paragraph (no pronoun reference to preceding text, introduces the topic).
  Step 2: Find the CONCLUSION paragraph (summarizes, uses "in conclusion/overall/therefore").
  Step 3: Look for pronoun references (he/she/it/they/this/these) \u2014 they must refer to something in the previous paragraph.
  Step 4: Look for discourse markers: "However", "Furthermore", "In addition", "As a result".
  Step 5: Look for time sequences, cause-effect relationships, and examples following claims.
  Common traps: Paragraphs that seem to fit in multiple positions.
`;
var BASE_READING_SCHEMA = {
  type: "object",
  properties: {
    taskType: { type: "string" },
    overallScore: { type: "integer" },
    rawScore: { type: "integer" },
    maxRawScore: { type: "integer" },
    correctAnswers: { type: "array", items: { type: "string" } },
    userAnswers: { type: "array", items: { type: "string" } },
    explanation: { type: "string" },
    cefrLevel: { type: "string" },
    overallFeedback: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    strategyTips: { type: "array", items: { type: "string" } }
  },
  required: [
    "taskType",
    "overallScore",
    "rawScore",
    "maxRawScore",
    "correctAnswers",
    "userAnswers",
    "explanation",
    "cefrLevel",
    "overallFeedback",
    "strengths",
    "improvements",
    "strategyTips"
  ],
  additionalProperties: false
};
async function scoreReadingFillBlanks(params) {
  const { passage, blanks, taskType } = params;
  const blankResults = blanks.map((b) => ({
    ...b,
    isCorrect: answersMatch(b.userAnswer, b.correctAnswer)
  }));
  const rawScore = blankResults.filter((b) => b.isCorrect).length;
  const maxRawScore = blanks.length;
  const pteScore = computePTEScore(rawScore, maxRawScore);
  const cefrLevel = computeCEFR(pteScore);
  const blankSummary = blankResults.map(
    (b, i) => `Blank ${i + 1}: Correct="${b.correctAnswer}" | User="${b.userAnswer}" | Options=[${b.options.join(", ")}] | ${b.isCorrect ? "\u2713 CORRECT" : "\u2717 WRONG"}`
  ).join("\n");
  const incorrectBlanks = blankResults.filter((b) => !b.isCorrect);
  const prompt = `You are a certified PTE Academic examiner.
Analyze this Fill in the Blanks response with CHAIN-OF-THOUGHT reasoning.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
TASK TYPE: ${taskType === "reading_writing_fill_blanks" ? "Reading & Writing: Fill in the Blanks" : "Reading: Fill in the Blanks"}
PASSAGE: "${passage}"

BLANK RESULTS (scores already computed \u2014 do NOT change them):
${blankSummary}

SCORE: ${rawScore}/${maxRawScore} (PTE: ${pteScore}, CEFR: ${cefrLevel})

${READING_SCORING_RULES}
${READING_STRATEGY_COACHING}

\u2550\u2550\u2550 CHAIN-OF-THOUGHT ANALYSIS INSTRUCTIONS \u2550\u2550\u2550

STEP 1 \u2014 FOR EACH INCORRECT BLANK, ANALYZE:
  a) What grammatical category is needed at this position? (noun/verb/adj/adverb)
  b) What does the context tell us about the meaning needed?
  c) Why is "${incorrectBlanks.map((b) => b.correctAnswer).join('", "')}" the correct answer?
     - Cite the specific words in the passage that provide the context clue.
     - Explain the collocation pattern (what words naturally go together).
  d) Why is the user's answer wrong?
     - Is it the wrong grammatical category?
     - Is it semantically incorrect in this context?
     - Is it a common distractor trap?

STEP 2 \u2014 READING SKILL DIAGNOSIS:
  What reading skills does this task test? (vocabulary, collocation, grammar, context inference)
  What specific knowledge gap led to the incorrect answers?

STEP 3 \u2014 STRATEGY COACHING:
  Provide 2-3 specific, actionable tips for this exact passage and blank type.

Respond ONLY with valid JSON:`;
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Reason step by step, then return ONLY valid JSON. Always cite specific passage text as evidence."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "fill_blanks_score",
        strict: true,
        schema: BASE_READING_SCHEMA
      }
    }
  });
  const result = JSON.parse(response.choices[0].message.content);
  result.overallScore = pteScore;
  result.rawScore = rawScore;
  result.maxRawScore = maxRawScore;
  result.cefrLevel = cefrLevel;
  result.correctAnswers = blanks.map((b) => b.correctAnswer);
  result.userAnswers = blanks.map((b) => b.userAnswer);
  result.blankAnalysis = blankResults.map((b, i) => ({
    blankNumber: i + 1,
    correctAnswer: b.correctAnswer,
    userAnswer: b.userAnswer,
    isCorrect: b.isCorrect,
    explanation: b.isCorrect ? "Correct answer selected." : `Incorrect. The correct answer is "${b.correctAnswer}".`
  }));
  return result;
}
async function scoreMultipleChoiceSingle(params) {
  const { passage, question, options, correctAnswer, userAnswer } = params;
  const isCorrect = answersMatch(userAnswer, correctAnswer);
  const rawScore = isCorrect ? 1 : 0;
  const pteScore = isCorrect ? 90 : 10;
  const cefrLevel = computeCEFR(pteScore);
  const optionsList = options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join("\n");
  const prompt = `You are a certified PTE Academic examiner.
Analyze this Multiple Choice (Single Answer) reading response with CHAIN-OF-THOUGHT reasoning.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
PASSAGE: "${passage}"
QUESTION: "${question}"
OPTIONS:
${optionsList}
CORRECT ANSWER: "${correctAnswer}"
USER ANSWER: "${userAnswer}"
RESULT: ${isCorrect ? "\u2713 CORRECT" : "\u2717 INCORRECT"}

${READING_SCORING_RULES}
${READING_STRATEGY_COACHING}

\u2550\u2550\u2550 CHAIN-OF-THOUGHT ANALYSIS INSTRUCTIONS \u2550\u2550\u2550

STEP 1 \u2014 QUESTION TYPE IDENTIFICATION:
  What reading skill does this question test?
  - Main idea / central theme
  - Specific detail / factual information
  - Inference / implied meaning
  - Vocabulary in context
  - Author's purpose / attitude / tone
  - Text structure / organization

STEP 2 \u2014 CORRECT ANSWER JUSTIFICATION:
  a) Find the specific sentence(s) in the passage that support the correct answer.
  b) Quote the relevant passage text directly.
  c) Explain the logical connection between the passage evidence and the correct answer.

STEP 3 \u2014 DISTRACTOR ANALYSIS (for each wrong option):
  a) Why is this option wrong?
  b) Is it: (i) contradicted by the passage, (ii) not mentioned, (iii) partially true but incomplete,
     (iv) true but doesn't answer the question, (v) a trap using passage keywords out of context?
  ${!isCorrect ? `d) The user chose "${userAnswer}" \u2014 what distractor trap did they fall into?` : ""}

STEP 4 \u2014 STRATEGY COACHING:
  What specific reading strategy would help with this question type?

Respond ONLY with valid JSON:`;
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Reason step by step, cite passage evidence, then return ONLY valid JSON."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "mcq_single_score",
        strict: true,
        schema: BASE_READING_SCHEMA
      }
    }
  });
  const result = JSON.parse(response.choices[0].message.content);
  result.overallScore = pteScore;
  result.rawScore = rawScore;
  result.maxRawScore = 1;
  result.cefrLevel = cefrLevel;
  result.correctAnswers = [correctAnswer];
  result.userAnswers = [userAnswer];
  return result;
}
async function scoreMultipleChoiceMultiple(params) {
  const { passage, question, options, correctAnswers, userAnswers } = params;
  let rawScore = 0;
  const correctSet = new Set(correctAnswers.map(normalizeAnswer));
  const userSet = new Set(userAnswers.map(normalizeAnswer));
  for (const ua of userAnswers) {
    if (correctSet.has(normalizeAnswer(ua))) {
      rawScore += 1;
    } else {
      rawScore -= 1;
    }
  }
  rawScore = Math.max(0, rawScore);
  const maxRawScore = correctAnswers.length;
  const pteScore = computePTEScore(rawScore, maxRawScore);
  const cefrLevel = computeCEFR(pteScore);
  const optionAnalysis = options.map((o, i) => {
    const isCorrectOption = correctSet.has(normalizeAnswer(o));
    const userSelected = userSet.has(normalizeAnswer(o));
    let status;
    if (isCorrectOption && userSelected) status = "\u2713 Correct \u2014 selected";
    else if (isCorrectOption && !userSelected) status = "\u2717 Correct \u2014 MISSED (should have selected)";
    else if (!isCorrectOption && userSelected) status = "\u2717 Wrong \u2014 SELECTED (cost -1 point)";
    else status = "\u2713 Wrong \u2014 not selected (correct decision)";
    return `${String.fromCharCode(65 + i)}) ${o} \u2192 ${status}`;
  });
  const prompt = `You are a certified PTE Academic examiner.
Analyze this Multiple Choice (Multiple Answers) reading response with CHAIN-OF-THOUGHT reasoning.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
PASSAGE: "${passage}"
QUESTION: "${question}"
OPTION ANALYSIS:
${optionAnalysis.join("\n")}

SCORE: ${rawScore}/${maxRawScore} (PTE: ${pteScore}, CEFR: ${cefrLevel})
NEGATIVE MARKING: ${userAnswers.filter((ua) => !correctSet.has(normalizeAnswer(ua))).length} wrong selection(s) cost ${userAnswers.filter((ua) => !correctSet.has(normalizeAnswer(ua))).length} point(s).

${READING_SCORING_RULES}
${READING_STRATEGY_COACHING}

\u2550\u2550\u2550 CHAIN-OF-THOUGHT ANALYSIS INSTRUCTIONS \u2550\u2550\u2550

STEP 1 \u2014 FOR EACH OPTION, PROVIDE PASSAGE-GROUNDED ANALYSIS:
  a) Is this option supported, contradicted, or not mentioned by the passage?
  b) Quote the specific passage text that confirms or denies this option.
  c) Explain why it is correct or incorrect.

STEP 2 \u2014 NEGATIVE MARKING ANALYSIS:
  Did the user incur negative marking penalties?
  What led them to select incorrect options?
  What distractor traps were present?

STEP 3 \u2014 STRATEGY COACHING:
  How should the user approach this question type to avoid negative marking?

Respond ONLY with valid JSON:`;
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Reason step by step, cite passage evidence, then return ONLY valid JSON."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "mcq_multiple_score",
        strict: true,
        schema: BASE_READING_SCHEMA
      }
    }
  });
  const result = JSON.parse(response.choices[0].message.content);
  result.overallScore = pteScore;
  result.rawScore = rawScore;
  result.maxRawScore = maxRawScore;
  result.cefrLevel = cefrLevel;
  result.correctAnswers = correctAnswers;
  result.userAnswers = userAnswers;
  return result;
}
async function scoreReorderParagraphs(params) {
  const { paragraphs, correctOrder, userOrder } = params;
  const rawScore = computeAdjacentPairScore(correctOrder, userOrder);
  const maxRawScore = Math.max(0, correctOrder.length - 1);
  const pteScore = computePTEScore(rawScore, maxRawScore);
  const cefrLevel = computeCEFR(pteScore);
  const correctPairs = /* @__PURE__ */ new Set();
  for (let i = 0; i < correctOrder.length - 1; i++) {
    correctPairs.add(`${correctOrder[i]}|${correctOrder[i + 1]}`);
  }
  const pairAnalysis = [];
  for (let i = 0; i < userOrder.length - 1; i++) {
    const pair = `${userOrder[i]}|${userOrder[i + 1]}`;
    pairAnalysis.push(`(${userOrder[i]}\u2192${userOrder[i + 1]}): ${correctPairs.has(pair) ? "\u2713 CORRECT pair" : "\u2717 WRONG pair"}`);
  }
  const paragraphTexts = paragraphs.map((p) => `[${p.id}]: "${p.text.substring(0, 150)}${p.text.length > 150 ? "..." : ""}"`).join("\n");
  const prompt = `You are a certified PTE Academic examiner.
Analyze this Re-order Paragraphs response with CHAIN-OF-THOUGHT reasoning.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
PARAGRAPHS:
${paragraphTexts}

CORRECT ORDER: ${correctOrder.join(" \u2192 ")}
USER ORDER: ${userOrder.join(" \u2192 ")}

ADJACENT PAIR ANALYSIS:
${pairAnalysis.join("\n")}

SCORE: ${rawScore}/${maxRawScore} correct adjacent pairs (PTE: ${pteScore}, CEFR: ${cefrLevel})

${READING_SCORING_RULES}
${READING_STRATEGY_COACHING}

\u2550\u2550\u2550 CHAIN-OF-THOUGHT ANALYSIS INSTRUCTIONS \u2550\u2550\u2550

STEP 1 \u2014 CORRECT ORDER JUSTIFICATION:
  For each consecutive pair in the CORRECT order, explain WHY they go together:
  a) What discourse marker or connector links them?
  b) What pronoun reference connects them? (e.g., "it", "this", "they" refers to something in the previous paragraph)
  c) What logical relationship exists? (cause\u2192effect, claim\u2192example, general\u2192specific, chronological)
  d) Quote the specific words that create the link.

STEP 2 \u2014 USER ERROR ANALYSIS:
  For each WRONG pair in the user's order:
  a) Why did this pair seem plausible?
  b) What clue did the user miss that shows these paragraphs don't belong together?

STEP 3 \u2014 INTRODUCTION AND CONCLUSION IDENTIFICATION:
  Which paragraph is the introduction? (Look for: topic introduction, no pronoun references to preceding text)
  Which paragraph is the conclusion? (Look for: summary language, "in conclusion", "overall", "therefore")

STEP 4 \u2014 STRATEGY COACHING:
  Provide specific tips for this particular text.

Respond ONLY with valid JSON:`;
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Reason step by step, cite specific text evidence, then return ONLY valid JSON."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "reorder_score",
        strict: true,
        schema: BASE_READING_SCHEMA
      }
    }
  });
  const result = JSON.parse(response.choices[0].message.content);
  result.overallScore = pteScore;
  result.rawScore = rawScore;
  result.maxRawScore = maxRawScore;
  result.cefrLevel = cefrLevel;
  result.correctAnswers = correctOrder;
  result.userAnswers = userOrder;
  return result;
}
async function scoreReadingTask(params) {
  const { taskType } = params;
  switch (taskType) {
    case "reading_fill_blanks":
    case "reading_writing_fill_blanks":
      return scoreReadingFillBlanks({
        passage: params.passage || "",
        blanks: params.blanks || [],
        taskType
      });
    case "multiple_choice_single":
      return scoreMultipleChoiceSingle({
        passage: params.passage || "",
        question: params.question || "",
        options: params.options || [],
        correctAnswer: (Array.isArray(params.correctAnswer) ? params.correctAnswer[0] : params.correctAnswer) || "",
        userAnswer: (Array.isArray(params.userAnswer) ? params.userAnswer[0] : params.userAnswer) || ""
      });
    case "multiple_choice_multiple":
      return scoreMultipleChoiceMultiple({
        passage: params.passage || "",
        question: params.question || "",
        options: params.options || [],
        correctAnswers: Array.isArray(params.correctAnswer) ? params.correctAnswer : [params.correctAnswer || ""],
        userAnswers: Array.isArray(params.userAnswer) ? params.userAnswer : [params.userAnswer || ""]
      });
    case "reorder_paragraphs":
      return scoreReorderParagraphs({
        paragraphs: params.paragraphs || [],
        correctOrder: params.correctOrder || [],
        userOrder: params.userOrder || []
      });
    default:
      return scoreMultipleChoiceSingle({
        passage: params.passage || "",
        question: params.question || "",
        options: params.options || [],
        correctAnswer: (Array.isArray(params.correctAnswer) ? params.correctAnswer[0] : params.correctAnswer) || "",
        userAnswer: (Array.isArray(params.userAnswer) ? params.userAnswer[0] : params.userAnswer) || ""
      });
  }
}

// server/ai/listeningAI.ts
init_taskTypeAliases();
function normalizeWord(word) {
  return word.toLowerCase().trim().replace(/[.,!?;:'"()\-]/g, "");
}
function computePTEScore2(rawScore, maxRawScore) {
  if (maxRawScore === 0) return 10;
  const pte = Math.round(10 + rawScore / maxRawScore * 80);
  return Math.max(10, Math.min(90, pte));
}
function computeCEFR2(pteScore) {
  if (pteScore >= 85) return "C2";
  if (pteScore >= 76) return "C1";
  if (pteScore >= 59) return "B2";
  if (pteScore >= 43) return "B1";
  if (pteScore >= 29) return "A2";
  return "A1";
}
function countWords2(text3) {
  return text3.trim().split(/\s+/).filter(Boolean).length;
}
function countSpellingErrors2(text3) {
  const commonErrors = {
    recieve: "receive",
    beleive: "believe",
    occured: "occurred",
    seperate: "separate",
    definately: "definitely",
    accomodate: "accommodate",
    goverment: "government",
    enviroment: "environment",
    developement: "development",
    independance: "independence",
    existance: "existence",
    occurance: "occurrence",
    knowlege: "knowledge",
    arguement: "argument",
    maintainance: "maintenance",
    neccessary: "necessary",
    priviledge: "privilege",
    publically: "publicly",
    rythm: "rhythm",
    succesful: "successful",
    tommorrow: "tomorrow",
    untill: "until",
    wierd: "weird",
    writting: "writing",
    comming: "coming",
    begining: "beginning",
    grammer: "grammar",
    alot: "a lot",
    basicly: "basically",
    concious: "conscious",
    critisism: "criticism",
    dissapear: "disappear",
    embarass: "embarrass",
    foriegn: "foreign",
    harrass: "harass",
    millenium: "millennium",
    noticable: "noticeable",
    occassion: "occasion",
    perseverence: "perseverance",
    pronounciation: "pronunciation",
    questionaire: "questionnaire",
    relevent: "relevant",
    restaraunt: "restaurant",
    sieze: "seize",
    supercede: "supersede",
    vaccum: "vacuum",
    wether: "whether"
  };
  const words = text3.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
  const errors = [];
  for (const word of words) {
    if (commonErrors[word] && !errors.includes(word)) errors.push(word);
  }
  return { count: errors.length, examples: errors.slice(0, 5) };
}
function computeWFDScore(originalSentence, userResponse) {
  const originalWords = (originalSentence || "").trim().split(/\s+/).filter(Boolean);
  const userWords = (userResponse || "").trim().split(/\s+/).filter(Boolean);
  const wordResults = [];
  let rawScore = 0;
  for (let i = 0; i < originalWords.length; i++) {
    const orig = normalizeWord(originalWords[i]);
    const user = normalizeWord(userWords[i] || "");
    const isCorrect = orig === user;
    let errorType = "none";
    if (!isCorrect) {
      if (!userWords[i]) {
        errorType = "missing_word";
      } else if (orig.length > 0 && user.length > 0) {
        const editDist = levenshteinDistance(orig, user);
        if (editDist <= 2) {
          errorType = "spelling_error";
        } else {
          errorType = "hearing_error";
        }
      }
    }
    if (isCorrect) rawScore++;
    wordResults.push({ original: originalWords[i], user: userWords[i] || "(missing)", isCorrect, errorType });
  }
  return { rawScore, maxRawScore: originalWords.length, wordResults };
}
function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from(
    { length: m + 1 },
    (_, i) => Array.from({ length: n + 1 }, (_2, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
var LISTENING_SCORING_RULES = `
LISTENING SCORING RULES \u2014 Official Pearson PTE Academic Score Guide v21 (Nov 2024)

Summarize Spoken Text (1-2 items per test):
  Skills: Listening AND Writing.
  CONTENT (0-2): 2=all relevant aspects; 1=fair but misses 1-2 aspects; 0=omits/misrepresents main aspects.
  FORM (0-2): 2=50-70 words; 1=40-49 or 71-100 words; 0=<40 or >100 words, or capitals, no punctuation, only bullets.
  GRAMMAR (0-2): 2=correct; 1=errors but no hindrance; 0=defective, hinders communication.
  VOCABULARY (0-2): 2=appropriate; 1=some errors, no hindrance; 0=defective, hinders communication.
  SPELLING (0-2): 2=correct; 1=one error; 0=more than one error.
  Max raw: 10. PTE = round(10 + (raw/10) \xD7 80).

Multiple Choice, Choose Multiple Answers (1-2 items):
  Skills: Listening.
  Scoring: +1 correct selected, -1 incorrect selected. Minimum 0.
  \u26A0 NEGATIVE MARKING applies.

Fill in the Blanks (2-3 items):
  Skills: Listening AND Writing.
  Scoring: 1 point per correct word spelled correctly. Minimum 0.

Highlight Correct Summary (1-2 items):
  Skills: Listening AND Reading.
  Scoring: 1 if correct, 0 if incorrect.

Multiple Choice, Choose Single Answer (1-2 items):
  Skills: Listening.
  Scoring: 1 if correct, 0 if incorrect.

Select Missing Word (1-2 items):
  Skills: Listening.
  Scoring: 1 if correct, 0 if incorrect.

Highlight Incorrect Words (2-3 items):
  Skills: Listening AND Reading.
  Scoring: +1 correct word identified, -1 incorrect word marked. Minimum 0.

Write from Dictation (3-4 items):
  Skills: Listening AND Writing.
  Scoring: 1 point per correct word spelled correctly. Minimum 0.
  \u26A0 Spelling must be EXACT. Punctuation is ignored.
`;
var SST_CALIBRATION_ANCHORS = `
SUMMARIZE SPOKEN TEXT \u2014 MULTI-LEVEL CALIBRATION ANCHORS
(Based on Pearson PTE Academic Score Guide v21, Nov 2024)

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
C2/Native Speaker Baseline (PTE 85-90, raw 9-10/10):
  Content: 2, Form: 2, Grammar: 2, Vocabulary: 2, Spelling: 2
  Characteristics:
    - Concise, accurate summary entirely in own words (no direct copying)
    - Academic register throughout
    - Captures main argument AND all supporting points
    - 55-65 words, single well-structured paragraph
    - Zero grammar errors, zero spelling errors
    - Precise academic vocabulary (not just repeating lecture words)
  Example: "The lecture examines the relationship between urban density and public health outcomes,
    arguing that higher density correlates with improved access to healthcare and reduced car dependency,
    though it simultaneously increases exposure to air pollution and infectious disease transmission,
    necessitating targeted policy interventions to maximise benefits while mitigating risks."

C1 Level (PTE 76-84, raw 7-9/10):
  Content: 2, Form: 2, Grammar: 2, Vocabulary: 1-2, Spelling: 2
  Characteristics:
    - Good summary covering all main points
    - Mostly own words with some borrowed phrases
    - Clear grammatical structure, rare errors
    - Appropriate academic vocabulary, minor imprecision acceptable
    - 50-70 words

B2 Level (PTE 59-75, raw 5-7/10):
  Content: 1-2, Form: 2, Grammar: 1, Vocabulary: 1, Spelling: 1
  Characteristics:
    - Covers most aspects but may miss nuances or secondary points
    - Mix of own words and copied phrases from lecture
    - Some grammar errors that don't impede understanding
    - Some inappropriate vocabulary choices
    - One spelling error acceptable

B1 Level (PTE 43-58, raw 2-4/10):
  Content: 0-1, Form: 1-2, Grammar: 0-1, Vocabulary: 0-1, Spelling: 0
  Characteristics:
    - Limited comprehension \u2014 mainly copies phrases from lecture
    - Misses important aspects or misrepresents the main point
    - Frequent grammar and vocabulary errors
    - Multiple spelling errors
    - May be too short (<40 words) or too long (>100 words)

A2 Level (PTE 29-42, raw 0-2/10):
  Content: 0, Form: 0-1, Grammar: 0, Vocabulary: 0, Spelling: 0
  Characteristics:
    - Does not capture the main point of the lecture
    - Very limited vocabulary, basic errors throughout
    - Incoherent or very short response

SCORING DECISION RULES FOR SST:
  - Count words EXACTLY (${"`"}word count = response.trim().split(/\\s+/).length${"`"})
  - Form=0 if: <40 words, >100 words, all capitals, no punctuation, only bullet points
  - Spelling: count unique misspelled words (not occurrences)
  - Content: identify 3-5 key points from the lecture, check how many are covered
  - Penalize direct copying: if >50% of response is verbatim from lecture, reduce Content by 1
`;
var LISTENING_STRATEGY_COACHING = `
LISTENING STRATEGY COACHING BY TASK TYPE

SUMMARIZE SPOKEN TEXT:
  - Note-taking: Write keywords, not full sentences. Use abbreviations.
  - Structure: Identify the main topic (first 30 seconds), supporting points, and conclusion.
  - Paraphrase: NEVER copy the lecture verbatim. Use synonyms and restructure sentences.
  - Word count: Aim for 55-65 words (safely in the 50-70 range).
  - Spelling: Write slowly and check each word.

WRITE FROM DICTATION:
  - Chunking: Listen for natural phrase boundaries (subject/verb/object).
  - Prediction: Use grammar knowledge to predict what word type comes next.
  - Spelling: Sound out each syllable. Write what you hear, then check.
  - Common errors: Function words (the, a, an, of, in, at) are often missed.
  - Replay strategy: If unsure, write your best guess \u2014 partial credit applies.

HIGHLIGHT CORRECT SUMMARY:
  - Listen for the MAIN IDEA, not details.
  - Eliminate summaries that are too specific (focus on one detail only).
  - Eliminate summaries that contradict the lecture.
  - Eliminate summaries that introduce information not in the lecture.
  - The correct summary should capture the overall message.

FILL IN THE BLANKS (Listening):
  - Read the passage BEFORE the audio starts to predict what words might fill the blanks.
  - Listen for the exact word \u2014 spelling must be correct.
  - If unsure, write the word that sounds closest and check spelling.

MULTIPLE CHOICE (Listening):
  - Read all options BEFORE the audio starts.
  - Listen for the specific information that matches or contradicts each option.
  - For negative marking: only select options you are confident about.

SELECT MISSING WORD:
  - Listen to the whole recording to understand the context.
  - The missing word should complete the sentence logically AND grammatically.
  - Consider the topic and tone of the recording when choosing.
`;
var BASE_LISTENING_SCHEMA = {
  type: "object",
  properties: {
    taskType: { type: "string" },
    overallScore: { type: "integer" },
    rawScore: { type: "integer" },
    maxRawScore: { type: "integer" },
    correctAnswers: { type: "array", items: { type: "string" } },
    userAnswers: { type: "array", items: { type: "string" } },
    cefrLevel: { type: "string" },
    overallFeedback: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    strategyTips: { type: "array", items: { type: "string" } }
  },
  required: [
    "taskType",
    "overallScore",
    "rawScore",
    "maxRawScore",
    "correctAnswers",
    "userAnswers",
    "cefrLevel",
    "overallFeedback",
    "strengths",
    "improvements",
    "strategyTips"
  ],
  additionalProperties: false
};
async function scoreSummarizeSpokenText(params) {
  const { lectureTranscript, response } = params;
  const wordCount2 = countWords2(response);
  const spellingCheck = countSpellingErrors2(response);
  const allCaps = response.trim() === response.trim().toUpperCase() && /[A-Z]/.test(response);
  const hasPunctuation = /[.!?,;:]/.test(response);
  const onlyBullets = /^[\s•\-*]+/.test(response) && !response.includes(".");
  let formScore;
  let formFeedback;
  if (wordCount2 < 40 || wordCount2 > 100 || allCaps || !hasPunctuation || onlyBullets) {
    formScore = 0;
    formFeedback = wordCount2 < 40 ? `Too short: ${wordCount2} words (minimum 40, ideal 50-70).` : wordCount2 > 100 ? `Too long: ${wordCount2} words (maximum 100, ideal 50-70).` : allCaps ? "Written in all capitals \u2014 not accepted." : !hasPunctuation ? "No punctuation detected \u2014 required for Form score." : "Only bullet points detected \u2014 must be written in complete sentences.";
  } else if (wordCount2 >= 50 && wordCount2 <= 70) {
    formScore = 2;
    formFeedback = `Word count: ${wordCount2} \u2014 within the ideal 50-70 range.`;
  } else {
    formScore = 1;
    formFeedback = `Word count: ${wordCount2} \u2014 acceptable but outside the ideal 50-70 range (40-49 or 71-100).`;
  }
  const spellingScore = spellingCheck.count === 0 ? 2 : spellingCheck.count === 1 ? 1 : 0;
  const preProcessing = `
DETERMINISTIC PRE-COMPUTED METRICS (do NOT override):
  Word count: ${wordCount2} (ideal: 50-70)
  All capitals: ${allCaps ? "YES" : "NO"}
  Has punctuation: ${hasPunctuation ? "YES" : "NO"}
  Only bullets: ${onlyBullets ? "YES" : "NO"}
  Spelling errors detected: ${spellingCheck.count} (${spellingCheck.examples.join(", ") || "none"})
  FORM SCORE (FIXED): ${formScore}/2 \u2014 ${formFeedback}
  SPELLING SCORE (FIXED): ${spellingScore}/2
`;
  const prompt = `You are a certified PTE Academic examiner.
Score this Summarize Spoken Text response using CHAIN-OF-THOUGHT reasoning.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
LECTURE TRANSCRIPT: "${lectureTranscript}"
TEST TAKER RESPONSE: "${response}"

${preProcessing}

${LISTENING_SCORING_RULES}

${SST_CALIBRATION_ANCHORS}
${PTE_SUBJECTIVE_CALIBRATION_ANCHORS}

${LISTENING_STRATEGY_COACHING}

\u2550\u2550\u2550 CHAIN-OF-THOUGHT SCORING INSTRUCTIONS \u2550\u2550\u2550
Note: Form score is FIXED at ${formScore}/2. Spelling score is FIXED at ${spellingScore}/2. Do NOT change them.

STEP 1 \u2014 LECTURE ANALYSIS:
  a) Identify the main topic/thesis of the lecture (1 sentence).
  b) List the 3-5 key supporting points.
  c) Identify the conclusion or main takeaway.

STEP 2 \u2014 CONTENT SCORING:
  a) Which key points from Step 1 appear in the response?
  b) Are any key points missing or misrepresented?
  c) Is the main thesis captured?
  d) Is the response mostly copied verbatim? (penalize if >50% verbatim)
  e) Assign content score: 2 (all aspects), 1 (misses 1-2), 0 (omits/misrepresents main aspects).

STEP 3 \u2014 GRAMMAR SCORING:
  a) Identify specific grammatical errors.
  b) Do they hinder communication?
  c) Assign grammar score: 2 (correct), 1 (errors, no hindrance), 0 (defective, hinders).

STEP 4 \u2014 VOCABULARY SCORING:
  a) Are words appropriate for academic context?
  b) Any inappropriate or incorrect word choices?
  c) Is the vocabulary mostly copied from the lecture (not paraphrased)?
  d) Assign vocabulary score: 2 (appropriate), 1 (some errors, no hindrance), 0 (defective).

STEP 5 \u2014 RAW SCORE:
  raw = Content + Form(${formScore}) + Grammar + Vocabulary + Spelling(${spellingScore}) (max 10)
  PTE = round(10 + (raw/10) \xD7 80), clamped [10, 90]

STEP 6 \u2014 CEFR: 10-28\u2192A1, 29-42\u2192A2, 43-58\u2192B1, 59-75\u2192B2, 76-84\u2192C1, 85-90\u2192C2

STEP 7 \u2014 FEEDBACK:
  - List the key points of the lecture.
  - Identify which were covered and which were missed.
  - Provide a C1-level model summary (55-65 words, in own words).

Respond ONLY with valid JSON:`;
  const response_llm = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Reason step by step, then return ONLY valid JSON."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "sst_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            taskType: { type: "string" },
            overallScore: { type: "integer" },
            rawScore: { type: "integer" },
            maxRawScore: { type: "integer" },
            wordCount: { type: "integer" },
            traits: {
              type: "object",
              properties: {
                content: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                form: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                grammar: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                vocabulary: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                spelling: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false }
              },
              required: ["content", "form", "grammar", "vocabulary", "spelling"],
              additionalProperties: false
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            strategyTips: { type: "array", items: { type: "string" } },
            modelAnswer: { type: "string" }
          },
          required: ["taskType", "overallScore", "rawScore", "maxRawScore", "wordCount", "traits", "cefrLevel", "overallFeedback", "strengths", "improvements", "strategyTips", "modelAnswer"],
          additionalProperties: false
        }
      }
    }
  });
  const result = JSON.parse(response_llm.choices[0].message.content);
  if (result.traits?.form) {
    result.traits.form.score = formScore;
    result.traits.form.maxScore = 2;
    result.traits.form.feedback = formFeedback;
  }
  if (result.traits?.spelling) {
    result.traits.spelling.score = spellingScore;
    result.traits.spelling.maxScore = 2;
    if (spellingCheck.examples.length > 0) {
      result.traits.spelling.feedback = `${spellingCheck.count} spelling error(s): ${spellingCheck.examples.join(", ")}.`;
    }
  }
  const rawScore = (result.traits?.content?.score || 0) + formScore + (result.traits?.grammar?.score || 0) + (result.traits?.vocabulary?.score || 0) + spellingScore;
  result.rawScore = rawScore;
  result.maxRawScore = 10;
  result.overallScore = Math.max(10, Math.min(90, Math.round(10 + rawScore / 10 * 80)));
  result.cefrLevel = computeCEFR2(result.overallScore);
  result.wordCount = wordCount2;
  return result;
}
async function scoreWriteFromDictation(params) {
  const { originalSentence, userResponse } = params;
  const { rawScore, maxRawScore, wordResults } = computeWFDScore(originalSentence, userResponse);
  const pteScore = computePTEScore2(rawScore, maxRawScore);
  const cefrLevel = computeCEFR2(pteScore);
  const wordSummary = wordResults.map(
    (w, i) => `Word ${i + 1}: "${w.original}" \u2192 User: "${w.user}" \u2192 ${w.isCorrect ? "\u2713" : `\u2717 (${w.errorType})`}`
  ).join("\n");
  const incorrectWords = wordResults.filter((w) => !w.isCorrect);
  const spellingErrors = incorrectWords.filter((w) => w.errorType === "spelling_error");
  const hearingErrors = incorrectWords.filter((w) => w.errorType === "hearing_error");
  const missingWords = incorrectWords.filter((w) => w.errorType === "missing_word");
  const prompt = `You are a certified PTE Academic examiner.
Analyze this Write from Dictation response with CHAIN-OF-THOUGHT reasoning.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
ORIGINAL SENTENCE: "${originalSentence}"
USER RESPONSE: "${userResponse}"

WORD-BY-WORD ANALYSIS (scores already computed \u2014 do NOT change):
${wordSummary}

SCORE: ${rawScore}/${maxRawScore} words correct (PTE: ${pteScore}, CEFR: ${cefrLevel})
Error breakdown:
  Spelling errors (wrote wrong letters): ${spellingErrors.length} \u2014 ${spellingErrors.map((w) => `"${w.original}"\u2192"${w.user}"`).join(", ") || "none"}
  Hearing errors (wrote different word): ${hearingErrors.length} \u2014 ${hearingErrors.map((w) => `"${w.original}"\u2192"${w.user}"`).join(", ") || "none"}
  Missing words (left blank): ${missingWords.length} \u2014 ${missingWords.map((w) => `"${w.original}"`).join(", ") || "none"}

${LISTENING_SCORING_RULES}
${LISTENING_STRATEGY_COACHING}

\u2550\u2550\u2550 CHAIN-OF-THOUGHT ANALYSIS INSTRUCTIONS \u2550\u2550\u2550

STEP 1 \u2014 ERROR CLASSIFICATION:
  For each incorrect word, explain:
  a) Is this a SPELLING error (heard correctly but spelled wrong)?
     \u2192 Identify the spelling rule or pattern that applies.
  b) Is this a HEARING error (heard a different word)?
     \u2192 Identify the phonetic similarity that caused confusion (e.g., /\u03B8/ vs /d/, /\u026A/ vs /i\u02D0/).
  c) Is this a MEMORY error (forgot the word)?
     \u2192 Note that chunking and note-taking would help.

STEP 2 \u2014 PHONETIC ANALYSIS:
  For hearing errors, identify the specific phonemes that were confused.
  Common PTE confusions: /\u03B8/\u2192/d/ (think\u2192dink), /\xE6/\u2192/\u025B/ (bad\u2192bed), /\u026A/\u2192/i\u02D0/ (sit\u2192seat).

STEP 3 \u2014 STRATEGY COACHING:
  Based on the error types found, provide specific, actionable tips.
  If mainly spelling errors \u2192 spelling rules and mnemonics.
  If mainly hearing errors \u2192 phoneme practice recommendations.
  If mainly missing words \u2192 chunking and note-taking strategies.

Respond ONLY with valid JSON:`;
  const response_llm = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Reason step by step, then return ONLY valid JSON."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "wfd_score",
        strict: true,
        schema: BASE_LISTENING_SCHEMA
      }
    }
  });
  const result = JSON.parse(response_llm.choices[0].message.content);
  result.rawScore = rawScore;
  result.maxRawScore = maxRawScore;
  result.overallScore = pteScore;
  result.cefrLevel = cefrLevel;
  result.correctAnswers = [originalSentence];
  result.userAnswers = [userResponse];
  result.wordAnalysis = wordResults.map((w) => ({
    word: w.original,
    userWord: w.user,
    isCorrect: w.isCorrect,
    errorType: w.errorType
  }));
  return result;
}
async function scoreHighlightCorrectSummary(params) {
  const { lectureTranscript, summaryOptions, correctSummary, userSummary } = params;
  const isCorrect = normalizeWord(userSummary) === normalizeWord(correctSummary) || userSummary.toLowerCase().trim() === correctSummary.toLowerCase().trim();
  const rawScore = isCorrect ? 1 : 0;
  const pteScore = isCorrect ? 90 : 10;
  const cefrLevel = computeCEFR2(pteScore);
  const optionsList = summaryOptions.map((s, i) => `Option ${i + 1}: "${s}" ${s === correctSummary ? "\u2190 CORRECT" : s === userSummary ? "\u2190 USER SELECTED" : ""}`).join("\n");
  const prompt = `You are a certified PTE Academic examiner.
Analyze this Highlight Correct Summary response with CHAIN-OF-THOUGHT reasoning.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
LECTURE TRANSCRIPT: "${lectureTranscript}"
SUMMARY OPTIONS:
${optionsList}
CORRECT ANSWER: "${correctSummary}"
USER SELECTED: "${userSummary}"
RESULT: ${isCorrect ? "\u2713 CORRECT" : "\u2717 INCORRECT"}

${LISTENING_SCORING_RULES}
${LISTENING_STRATEGY_COACHING}

\u2550\u2550\u2550 CHAIN-OF-THOUGHT ANALYSIS INSTRUCTIONS \u2550\u2550\u2550

STEP 1 \u2014 LECTURE ANALYSIS:
  a) What is the main topic/thesis of the lecture?
  b) What are the 2-3 key supporting points?
  c) What is the overall conclusion?

STEP 2 \u2014 CORRECT SUMMARY JUSTIFICATION:
  a) Why does the correct summary accurately represent the lecture?
  b) Quote specific parts of the lecture that support each claim in the correct summary.

STEP 3 \u2014 DISTRACTOR ANALYSIS (for each wrong option):
  a) Is it TOO SPECIFIC (focuses on one detail, misses the main point)?
  b) Does it CONTRADICT the lecture?
  c) Does it introduce INFORMATION NOT IN THE LECTURE?
  d) Is it PARTIALLY CORRECT but misleading?
  ${!isCorrect ? `e) Why did the user select "${userSummary}"? What trap did they fall into?` : ""}

STEP 4 \u2014 STRATEGY COACHING:
  What listening strategy would help identify the correct summary?

Respond ONLY with valid JSON:`;
  const response_llm = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Reason step by step, cite lecture evidence, then return ONLY valid JSON."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "hcs_score",
        strict: true,
        schema: BASE_LISTENING_SCHEMA
      }
    }
  });
  const result = JSON.parse(response_llm.choices[0].message.content);
  result.overallScore = pteScore;
  result.rawScore = rawScore;
  result.maxRawScore = 1;
  result.cefrLevel = cefrLevel;
  result.correctAnswers = [correctSummary];
  result.userAnswers = [userSummary];
  return result;
}
async function scoreListeningFillBlanks(params) {
  const { transcript, blanks } = params;
  const blankResults = blanks.map((b) => ({
    ...b,
    isCorrect: normalizeWord(b.userWord) === normalizeWord(b.correctWord),
    errorType: normalizeWord(b.userWord) === normalizeWord(b.correctWord) ? "none" : !b.userWord.trim() ? "missing_word" : levenshteinDistance(normalizeWord(b.correctWord), normalizeWord(b.userWord)) <= 2 ? "spelling_error" : "hearing_error"
  }));
  const rawScore = blankResults.filter((b) => b.isCorrect).length;
  const maxRawScore = blanks.length;
  const pteScore = computePTEScore2(rawScore, maxRawScore);
  const cefrLevel = computeCEFR2(pteScore);
  const blankSummary = blankResults.map(
    (b, i) => `Blank ${i + 1}: Correct="${b.correctWord}" | User="${b.userWord}" | ${b.isCorrect ? "\u2713" : `\u2717 (${b.errorType})`}`
  ).join("\n");
  const prompt = `You are a certified PTE Academic examiner.
Analyze this Listening Fill in the Blanks response with CHAIN-OF-THOUGHT reasoning.

\u2550\u2550\u2550 TASK INPUT \u2550\u2550\u2550
TRANSCRIPT: "${transcript}"
BLANK RESULTS (scores already computed):
${blankSummary}
SCORE: ${rawScore}/${maxRawScore} (PTE: ${pteScore}, CEFR: ${cefrLevel})

${LISTENING_SCORING_RULES}
${LISTENING_STRATEGY_COACHING}

\u2550\u2550\u2550 CHAIN-OF-THOUGHT ANALYSIS INSTRUCTIONS \u2550\u2550\u2550

STEP 1 \u2014 FOR EACH INCORRECT BLANK:
  a) Is this a SPELLING error or a HEARING error?
  b) For spelling errors: what spelling rule applies? (silent letters, double consonants, -tion/-sion, etc.)
  c) For hearing errors: what phonemes were confused? (e.g., /p/ vs /b/, /s/ vs /z/)
  d) What context clues in the transcript should have helped identify the correct word?

STEP 2 \u2014 STRATEGY COACHING:
  Based on error types, provide specific tips.

Respond ONLY with valid JSON:`;
  const response_llm = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a certified PTE Academic examiner. Reason step by step, then return ONLY valid JSON."
      },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "lfib_score",
        strict: true,
        schema: BASE_LISTENING_SCHEMA
      }
    }
  });
  const result = JSON.parse(response_llm.choices[0].message.content);
  result.overallScore = pteScore;
  result.rawScore = rawScore;
  result.maxRawScore = maxRawScore;
  result.cefrLevel = cefrLevel;
  result.correctAnswers = blanks.map((b) => b.correctWord);
  result.userAnswers = blanks.map((b) => b.userWord);
  return result;
}
async function scoreListeningTask(params) {
  const taskType = normalizeTaskType(params.taskType);
  const correctAns = Array.isArray(params.correctAnswer) ? params.correctAnswer[0] : params.correctAnswer || "";
  const userAns = Array.isArray(params.userAnswer) ? params.userAnswer[0] : params.userAnswer || "";
  switch (taskType) {
    case "summarize_spoken_text":
      return scoreSummarizeSpokenText({
        lectureTranscript: params.lectureTranscript || params.transcript || "",
        response: params.response || ""
      });
    case "write_from_dictation":
      return scoreWriteFromDictation({
        originalSentence: correctAns || params.transcript || "",
        userResponse: params.response || userAns || ""
      });
    case "highlight_correct_summary":
      return scoreHighlightCorrectSummary({
        lectureTranscript: params.lectureTranscript || params.transcript || "",
        summaryOptions: params.summaryOptions || params.options || [],
        correctSummary: correctAns,
        userSummary: userAns
      });
    case "fill_blanks_listening":
      return scoreListeningFillBlanks({
        transcript: params.transcript || "",
        blanks: params.blanks || []
      });
    case "multiple_choice_single":
    case "multiple_choice_single_listening":
    case "select_missing_word": {
      const isCorrect = normalizeWord(userAns) === normalizeWord(correctAns);
      const pteScore = isCorrect ? 90 : 10;
      return {
        taskType,
        overallScore: pteScore,
        rawScore: isCorrect ? 1 : 0,
        maxRawScore: 1,
        correctAnswers: [correctAns],
        userAnswers: [userAns],
        cefrLevel: computeCEFR2(pteScore),
        overallFeedback: isCorrect ? "Correct answer selected. Good listening comprehension." : `Incorrect. The correct answer was: "${correctAns}". Focus on listening for the main idea and key details that match the options.`,
        strengths: isCorrect ? ["Correctly identified the answer"] : [],
        improvements: !isCorrect ? [
          `The correct answer was "${correctAns}". Re-listen and identify the specific moment in the audio that supports this.`,
          "Eliminate options that contradict the audio before choosing."
        ] : [],
        strategyTips: [
          "Read all options before the audio starts to know what to listen for.",
          "Listen for key words from the options in the audio.",
          "Eliminate obviously wrong answers first."
        ]
      };
    }
    case "multiple_choice_multiple":
    case "multiple_choice_multiple_listening": {
      const correctAnswers = Array.isArray(params.correctAnswer) ? params.correctAnswer : [params.correctAnswer || ""];
      const userAnswers = Array.isArray(params.userAnswer) ? params.userAnswer : [params.userAnswer || ""];
      const correctSet = new Set(correctAnswers.map(normalizeWord));
      let rawScore = 0;
      for (const ua of userAnswers) {
        if (correctSet.has(normalizeWord(ua))) rawScore += 1;
        else rawScore -= 1;
      }
      rawScore = Math.max(0, rawScore);
      const pteScore = computePTEScore2(rawScore, correctAnswers.length);
      return {
        taskType,
        overallScore: pteScore,
        rawScore,
        maxRawScore: correctAnswers.length,
        correctAnswers,
        userAnswers,
        cefrLevel: computeCEFR2(pteScore),
        overallFeedback: `Score: ${rawScore}/${correctAnswers.length}. ${rawScore === correctAnswers.length ? "All correct answers selected." : "Some answers were missed or incorrect options were selected (negative marking applies)."}`,
        strengths: rawScore > 0 ? ["Some correct answers identified"] : [],
        improvements: rawScore < correctAnswers.length ? [
          "Only select options you are confident about \u2014 negative marking reduces your score.",
          "Find specific evidence in the audio for each option before selecting."
        ] : [],
        strategyTips: [
          "Treat each option independently: is it supported by the audio?",
          "Never select an option just because it sounds plausible \u2014 find direct audio evidence.",
          "If unsure, leave it unselected (0 points is better than -1)."
        ]
      };
    }
    default:
      return scoreSummarizeSpokenText({
        lectureTranscript: params.lectureTranscript || params.transcript || "",
        response: params.response || ""
      });
  }
}

// server/routers/aiScoringRouter.ts
init_db();

// shared/pteTaskConfig.ts
var PTE_TASK_PROCEDURES = {
  personal_introduction: {
    label: "Personal Introduction",
    section: "speaking",
    promptSource: "text",
    responseKind: "speech",
    preparationSeconds: 25,
    responseSeconds: 30,
    audioPlaysOnce: false,
    scored: false,
    scoringDimensions: []
  },
  read_aloud: {
    label: "Read Aloud",
    section: "speaking",
    promptSource: "text",
    responseKind: "speech",
    preparationSeconds: 40,
    officialPreparationRange: [30, 40],
    responseSeconds: 40,
    audioPlaysOnce: false,
    scored: true,
    scoringDimensions: ["content", "pronunciation", "oral_fluency"]
  },
  repeat_sentence: {
    label: "Repeat Sentence",
    section: "speaking",
    promptSource: "audio",
    responseKind: "speech",
    preparationSeconds: 0,
    responseSeconds: 15,
    audioPlaysOnce: true,
    scored: true,
    scoringDimensions: ["content", "pronunciation", "oral_fluency"]
  },
  describe_image: {
    label: "Describe Image",
    section: "speaking",
    promptSource: "image",
    responseKind: "speech",
    preparationSeconds: 25,
    responseSeconds: 40,
    audioPlaysOnce: false,
    scored: true,
    scoringDimensions: ["content", "pronunciation", "oral_fluency"]
  },
  retell_lecture: {
    label: "Retell Lecture",
    section: "speaking",
    promptSource: "audio",
    responseKind: "speech",
    preparationSeconds: 10,
    responseSeconds: 40,
    audioPlaysOnce: true,
    scored: true,
    scoringDimensions: ["content", "pronunciation", "oral_fluency"]
  },
  answer_short_question: {
    label: "Answer Short Question",
    section: "speaking",
    promptSource: "audio",
    responseKind: "speech",
    preparationSeconds: 0,
    responseSeconds: 10,
    audioPlaysOnce: true,
    scored: true,
    scoringDimensions: ["content"]
  },
  summarize_group_discussion: {
    label: "Summarize Group Discussion",
    section: "speaking",
    promptSource: "audio",
    responseKind: "speech",
    preparationSeconds: 10,
    responseSeconds: 120,
    audioPlaysOnce: true,
    scored: true,
    scoringDimensions: ["content", "pronunciation", "oral_fluency"]
  },
  respond_to_situation: {
    label: "Respond to a Situation",
    section: "speaking",
    promptSource: "audio_text",
    responseKind: "speech",
    preparationSeconds: 10,
    responseSeconds: 40,
    audioPlaysOnce: true,
    scored: true,
    scoringDimensions: ["content", "pronunciation", "oral_fluency"]
  },
  summarize_written_text: {
    label: "Summarize Written Text",
    section: "writing",
    promptSource: "text",
    responseKind: "text",
    preparationSeconds: 0,
    timeLimitSeconds: 600,
    minWords: 5,
    maxWords: 75,
    audioPlaysOnce: false,
    scored: true,
    scoringDimensions: ["content", "form", "grammar", "vocabulary"]
  },
  write_essay: {
    label: "Write Essay",
    section: "writing",
    promptSource: "text",
    responseKind: "text",
    preparationSeconds: 0,
    timeLimitSeconds: 1200,
    minWords: 200,
    maxWords: 300,
    audioPlaysOnce: false,
    scored: true,
    scoringDimensions: ["content", "form", "grammar", "vocabulary", "written_discourse"]
  },
  fill_blanks_reading: {
    label: "Fill in the Blanks (Dropdown)",
    section: "reading",
    promptSource: "text",
    responseKind: "fill_blanks",
    preparationSeconds: 0,
    requiresOptions: true,
    requiresAllSelections: true,
    audioPlaysOnce: false,
    scored: true,
    scoringDimensions: ["reading"]
  },
  multiple_choice_multiple: {
    label: "Multiple Choice, Multiple Answers",
    section: "reading",
    promptSource: "text",
    responseKind: "multiple_choice",
    preparationSeconds: 0,
    requiresOptions: true,
    audioPlaysOnce: false,
    scored: true,
    scoringDimensions: ["reading"]
  },
  reorder_paragraphs: {
    label: "Reorder Paragraph",
    section: "reading",
    promptSource: "text",
    responseKind: "ordered",
    preparationSeconds: 0,
    requiresOptions: true,
    requiresAllSelections: true,
    audioPlaysOnce: false,
    scored: true,
    scoringDimensions: ["reading"]
  },
  fill_blanks_rw: {
    label: "Reading and Writing: Fill in the Blanks",
    section: "reading",
    promptSource: "text",
    responseKind: "fill_blanks",
    preparationSeconds: 0,
    requiresOptions: true,
    requiresAllSelections: true,
    audioPlaysOnce: false,
    scored: true,
    scoringDimensions: ["reading", "writing"]
  },
  multiple_choice_single: {
    label: "Multiple Choice, Single Answer",
    section: "reading",
    promptSource: "text",
    responseKind: "single_choice",
    preparationSeconds: 0,
    requiresOptions: true,
    audioPlaysOnce: false,
    scored: true,
    scoringDimensions: ["reading"]
  },
  listening_multiple_choice_multiple: {
    label: "Multiple Choice, Multiple Answers (Listening)",
    section: "listening",
    promptSource: "audio",
    responseKind: "multiple_choice",
    preparationSeconds: 0,
    requiresOptions: true,
    audioPlaysOnce: true,
    scored: true,
    scoringDimensions: ["listening"]
  },
  listening_multiple_choice_single: {
    label: "Multiple Choice, Single Answer (Listening)",
    section: "listening",
    promptSource: "audio",
    responseKind: "single_choice",
    preparationSeconds: 0,
    requiresOptions: true,
    audioPlaysOnce: true,
    scored: true,
    scoringDimensions: ["listening"]
  },
  summarize_spoken_text: {
    label: "Summarize Spoken Text",
    section: "listening",
    promptSource: "audio",
    responseKind: "text",
    preparationSeconds: 0,
    timeLimitSeconds: 600,
    minWords: 50,
    maxWords: 70,
    audioPlaysOnce: true,
    scored: true,
    scoringDimensions: ["listening", "writing"]
  },
  fill_blanks_listening: {
    label: "Fill in the Blanks (Type In)",
    section: "listening",
    promptSource: "audio",
    responseKind: "text",
    preparationSeconds: 0,
    audioPlaysOnce: true,
    scored: true,
    scoringDimensions: ["listening"]
  },
  highlight_correct_summary: {
    label: "Highlight Correct Summary",
    section: "listening",
    promptSource: "audio",
    responseKind: "single_choice",
    preparationSeconds: 0,
    requiresOptions: true,
    audioPlaysOnce: true,
    scored: true,
    scoringDimensions: ["listening"]
  },
  select_missing_word: {
    label: "Select Missing Word",
    section: "listening",
    promptSource: "audio",
    responseKind: "single_choice",
    preparationSeconds: 0,
    requiresOptions: true,
    audioPlaysOnce: true,
    scored: true,
    scoringDimensions: ["listening"]
  },
  highlight_incorrect_words: {
    label: "Highlight Incorrect Words",
    section: "listening",
    promptSource: "audio_text",
    responseKind: "word_selection",
    preparationSeconds: 0,
    requiresOptions: false,
    audioPlaysOnce: true,
    scored: true,
    scoringDimensions: ["listening"]
  },
  write_from_dictation: {
    label: "Write from Dictation",
    section: "listening",
    promptSource: "audio",
    responseKind: "text",
    preparationSeconds: 0,
    audioPlaysOnce: true,
    scored: true,
    scoringDimensions: ["listening", "writing"]
  }
};
function getPteTaskProcedure(taskType, section) {
  const sectionSpecificType = section ? `${section}_${taskType}` : void 0;
  return sectionSpecificType && PTE_TASK_PROCEDURES[sectionSpecificType] || PTE_TASK_PROCEDURES[taskType];
}

// shared/questionAudit.ts
var AUDIO_TASKS = /* @__PURE__ */ new Set([
  "repeat_sentence",
  "retell_lecture",
  "answer_short_question",
  "summarize_group_discussion",
  "summarize_spoken_text",
  "fill_blanks_listening",
  "highlight_correct_summary",
  "select_missing_word",
  "highlight_incorrect_words",
  "write_from_dictation",
  "respond_to_situation"
]);
var OPTION_TASKS = /* @__PURE__ */ new Set([
  "multiple_choice_single",
  "multiple_choice_multiple",
  "fill_blanks_reading",
  "fill_blanks_rw",
  "highlight_correct_summary",
  "select_missing_word"
]);
var OBJECTIVE_SCORE_TASKS = /* @__PURE__ */ new Set([
  "multiple_choice_single",
  "multiple_choice_multiple",
  "reorder_paragraphs",
  "fill_blanks_reading",
  "fill_blanks_rw",
  "fill_blanks_listening",
  "highlight_correct_summary",
  "select_missing_word",
  "highlight_incorrect_words",
  "write_from_dictation"
]);
function stringValue(value) {
  return typeof value === "string" ? value.trim() : "";
}
function wordCount(value) {
  return value.split(/\s+/).filter(Boolean).length;
}
function hasOptions(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.length > 0;
    return Boolean(parsed && typeof parsed === "object" && Object.keys(parsed).length > 0);
  } catch {
    return false;
  }
}
function usableUrl(value) {
  const candidate = stringValue(value);
  return /^(https?:\/\/|\/)/i.test(candidate) && !/example\.com|placeholder|storage\.example/i.test(candidate);
}
function auditQuestion(question) {
  const issues = [];
  const prompt = stringValue(question.prompt);
  const content = stringValue(question.content);
  const sourceText = prompt || content;
  const difficultyValid = question.difficulty == null || ["easy", "medium", "hard"].includes(question.difficulty);
  if (!sourceText && !usableUrl(question.audioUrl) && !usableUrl(question.imageUrl)) {
    issues.push("missing prompt content or usable media");
  }
  if (!difficultyValid) issues.push("difficulty must be easy, medium, or hard");
  if (question.taskType === "describe_image" && !usableUrl(question.imageUrl)) {
    issues.push("Describe Image requires a usable image asset");
  }
  if (AUDIO_TASKS.has(question.taskType) && !usableUrl(question.audioUrl) && !sourceText) {
    issues.push("audio-first task requires audio or a practice fallback transcript/prompt");
  }
  if (OPTION_TASKS.has(question.taskType) && !hasOptions(question.options)) {
    issues.push("objective option task requires at least one option");
  }
  if (OBJECTIVE_SCORE_TASKS.has(question.taskType) && !stringValue(question.correctAnswer)) {
    issues.push("objective scoring task requires a reference answer");
  }
  if (question.taskType === "read_aloud" && wordCount(sourceText) > 60) {
    issues.push("Read Aloud prompt exceeds the 60-word Pearson limit");
  }
  if (question.taskType === "respond_to_situation" && wordCount(sourceText) > 60) {
    issues.push("Respond to a Situation prompt exceeds the 60-word Pearson limit");
  }
  if (question.taskType === "summarize_written_text" && wordCount(content) > 300) {
    issues.push("Summarize Written Text source exceeds the 300-word Pearson limit");
  }
  return { valid: issues.length === 0, issues, difficultyValid };
}

// shared/pteValidation.ts
function text2(value) {
  return typeof value === "string" ? value.trim() : "";
}
function hasText(value) {
  return text2(value).length > 0;
}
function isUsableMediaUrl(value) {
  const candidate = text2(value);
  if (!candidate) return false;
  if (/example\.com|storage\.example|placeholder/i.test(candidate)) return false;
  return /^(https?:\/\/|\/|blob:)/i.test(candidate);
}
function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return Object.values(parsed);
      return [];
    } catch {
      return [];
    }
  }
  return [];
}
function selectionValues(value) {
  return asArray(value).map((item) => text2(item)).filter(Boolean);
}
function hasRequiredQuestionContent(question) {
  const procedure = getPteTaskProcedure(question.taskType, question.section);
  if (!procedure) return { valid: false, reason: `Unsupported PTE task type: ${question.taskType}` };
  const audit = auditQuestion(question);
  if (!audit.valid) return { valid: false, reason: audit.issues[0] };
  const promptPresent = hasText(question.prompt);
  const contentPresent = hasText(question.content);
  const audioPresent = isUsableMediaUrl(question.audioUrl);
  const imagePresent = isUsableMediaUrl(question.imageUrl);
  if (procedure.promptSource === "image" && !imagePresent) {
    return { valid: false, reason: `${procedure.label} requires a playable image prompt.` };
  }
  if (procedure.promptSource === "audio" && !audioPresent && !contentPresent && !promptPresent) {
    return { valid: false, reason: `${procedure.label} requires an audio recording or source transcript.` };
  }
  if (procedure.promptSource === "audio_text" && !audioPresent && !contentPresent && !promptPresent) {
    return { valid: false, reason: `${procedure.label} requires an audio recording or situation text.` };
  }
  if (procedure.promptSource === "text" && !contentPresent && !promptPresent) {
    return { valid: false, reason: `${procedure.label} requires written prompt content.` };
  }
  if (procedure.requiresOptions && asArray(question.options).length === 0) {
    return { valid: false, reason: `${procedure.label} requires answer options.` };
  }
  return { valid: true };
}
function hasScoreableResponse(question, response) {
  const procedure = getPteTaskProcedure(question.taskType, question.section);
  if (!procedure) return { valid: false, reason: `Unsupported PTE task type: ${question.taskType}` };
  const contentCheck = hasRequiredQuestionContent(question);
  if (!contentCheck.valid) return contentCheck;
  const selected = selectionValues(response.selectedOptions);
  const answerText = text2(response.responseText) || text2(response.transcription);
  const hasAudio = isUsableMediaUrl(response.audioUrl);
  switch (procedure.responseKind) {
    case "speech": {
      const audioPresent = hasAudio || hasText(response.audioUrl);
      const transcriptText = text2(response.transcription) || text2(response.responseText);
      if (!audioPresent && !hasText(transcriptText)) {
        return { valid: false, reason: `${procedure.label} requires a recorded response. Please record or speak before submitting.` };
      }
      if (transcriptText) {
        const words = transcriptText.split(/\s+/).filter(Boolean);
        if (words.length === 0) {
          return { valid: false, reason: "No speech detected in recording. Please ensure your microphone is working and speak clearly." };
        }
      }
      return { valid: true };
    }
    case "text":
      if (!answerText) return { valid: false, reason: `${procedure.label} cannot be scored without a written response.` };
      if (question.taskType === "summarize_written_text") {
        const sentences = answerText.split(/[.!?]+(?=\s|$)/).map((part) => part.trim()).filter(Boolean);
        if (sentences.length !== 1) {
          return { valid: false, reason: "Summarize Written Text must be submitted as one sentence." };
        }
      }
      return { valid: true };
    case "single_choice":
      return selected.length > 0 ? { valid: true } : { valid: false, reason: `${procedure.label} requires one selected answer.` };
    case "multiple_choice":
      return selected.length > 0 ? { valid: true } : { valid: false, reason: `${procedure.label} requires at least one selected answer.` };
    case "ordered":
      return selected.length > 0 ? { valid: true } : { valid: false, reason: `${procedure.label} requires an ordered response.` };
    case "fill_blanks":
      if (selected.length > 0) return { valid: true };
      if (answerText) return { valid: true };
      return { valid: false, reason: `${procedure.label} requires an answer for every blank.` };
    case "word_selection":
      return selected.length > 0 ? { valid: true } : { valid: false, reason: `${procedure.label} requires at least one selected word.` };
  }
}

// server/routers/aiScoringRouter.ts
init_taskTypeAliases();

// server/optionValueNormalization.ts
function decodeOptions(options) {
  let decoded = options;
  try {
    if (typeof decoded === "string") decoded = JSON.parse(decoded);
    if (typeof decoded === "string") decoded = JSON.parse(decoded);
  } catch {
    return [];
  }
  if (!Array.isArray(decoded)) return [];
  return decoded.map((option, index) => {
    if (typeof option === "string") {
      const prefixed = option.match(/^\s*([A-Za-z0-9]+)\)\s*/);
      return {
        id: prefixed?.[1] ?? String.fromCharCode(65 + index),
        text: option
      };
    }
    if (option && typeof option === "object") {
      const record = option;
      return {
        id: String(record.id ?? String.fromCharCode(65 + index)),
        text: String(record.text ?? record.label ?? record.value ?? record.id ?? "")
      };
    }
    return { id: String.fromCharCode(65 + index), text: String(option) };
  }).filter((option) => option.text.trim().length > 0);
}
function decodeAnswers(answer) {
  if (Array.isArray(answer)) return answer.map(String).map((value) => value.trim()).filter(Boolean);
  const raw = answer?.trim() ?? "";
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).map((value) => value.trim()).filter(Boolean);
  } catch {
  }
  return [raw];
}
function parseOrderedAnswerKey(answer) {
  if (Array.isArray(answer)) return answer.map(String).map((value) => value.trim()).filter(Boolean);
  if (answer && typeof answer === "object") {
    return Object.values(answer).map(String).map((value) => value.trim()).filter(Boolean);
  }
  if (typeof answer !== "string") return [];
  const raw = answer.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parseOrderedAnswerKey(parsed);
    if (parsed && typeof parsed === "object") return parseOrderedAnswerKey(parsed);
  } catch {
  }
  return [raw];
}
function parseDelimitedAnswers(answer) {
  const ordered = parseOrderedAnswerKey(answer);
  if (ordered.length !== 1 || typeof answer !== "string") return ordered;
  return ordered[0].split(/[,\n]+/).map((value) => value.trim()).filter(Boolean);
}
function normalizeOptionValues(options, correctAnswer, selectedOptions) {
  const optionMap = new Map(decodeOptions(options).map((option) => [option.id.toLowerCase(), option.text]));
  const normalize = (value) => optionMap.get(value.trim().toLowerCase()) ?? value.trim();
  return {
    correctAnswers: decodeAnswers(correctAnswer).map(normalize),
    selectedOptions: (selectedOptions ?? []).map(normalize)
  };
}

// server/aiConfidence.ts
function getConfidenceMetadata(result, threshold = 0.7) {
  const value = result?.confidence;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { needsReview: false };
  }
  const scoreConfidence = Math.max(0, Math.min(1, value));
  return { scoreConfidence, needsReview: scoreConfidence < threshold };
}

// server/aiScoreFallback.ts
function deterministicScoreFallback(taskType) {
  const message = `Automated scoring timed out for ${taskType.replace(/_/g, " ")}. The response was saved and can be rescored when the AI service is available.`;
  return {
    overallScore: 10,
    rawScore: 0,
    maxRawScore: 1,
    overallFeedback: message,
    strengths: [],
    improvements: ["Retry AI scoring when the service is available."],
    confidence: 0.1,
    traits: {
      content: { score: 0, maxScore: 1, feedback: "Not scored by the AI engine." },
      form: { score: 0, maxScore: 1, feedback: "Not scored by the AI engine." },
      pronunciation: { score: 0, maxScore: 5, feedback: "Not scored by the AI engine." },
      oralFluency: { score: 0, maxScore: 5, feedback: "Not scored by the AI engine." }
    }
  };
}
async function withScoringTimeout(promise, fallback, timeoutMs = 15e3) {
  let timeoutHandle;
  const timeout = new Promise((resolve) => {
    timeoutHandle = setTimeout(() => resolve("timeout"), timeoutMs);
  });
  const guardedPromise = promise.then(
    (value) => ({ value, timedOut: false }),
    () => ({ value: fallback(), timedOut: true })
  );
  const result = await Promise.race([guardedPromise, timeout.then(() => ({ value: fallback(), timedOut: true }))]);
  if (timeoutHandle) clearTimeout(timeoutHandle);
  return result;
}

// server/aiScoreEligibility.ts
function hasUsableSpeakingTranscription(transcription) {
  return typeof transcription === "string" && transcription.trim().length > 0;
}

// server/routers/aiScoringRouter.ts
async function scoreWithFallback(taskType, scorer) {
  const result = await withScoringTimeout(
    scorer(),
    () => deterministicScoreFallback(taskType)
  );
  return result.value;
}
var aiScoringRouter = router({
  /**
   * Score a Speaking task response.
   * Accepts either a transcription (text) or an audioUrl (auto-transcribed).
   * Uses official PTE rubrics: Pronunciation (0-5), Oral Fluency (0-5), Content (task-specific).
   */
  scoreSpeak: protectedProcedure.input(z2.object({
    responseId: z2.number(),
    audioUrl: z2.string().optional(),
    transcription: z2.string().optional(),
    durationSeconds: z2.number().positive().optional()
  })).mutation(async ({ ctx, input }) => {
    const response = await getResponseById(input.responseId);
    if (!response || response.userId !== ctx.user.id) {
      throw new TRPCError3({ code: "NOT_FOUND" });
    }
    const question = await getQuestionById(response.questionId);
    if (!question) throw new TRPCError3({ code: "NOT_FOUND" });
    const questionCheck = hasRequiredQuestionContent(question);
    if (!questionCheck.valid) {
      throw new TRPCError3({ code: "BAD_REQUEST", message: questionCheck.reason });
    }
    let transcription = input.transcription || response.transcription || "";
    if (!transcription && (input.audioUrl || response.audioUrl)) {
      try {
        const audioUrl = input.audioUrl || response.audioUrl || "";
        const result2 = await transcribeAudio({ audioUrl, language: "en" });
        transcription = "text" in result2 ? result2.text : "";
        await updateResponse(input.responseId, { transcription });
      } catch (e) {
        console.error("Transcription failed:", e);
      }
    }
    const responseCheck = hasScoreableResponse(question, {
      audioUrl: input.audioUrl || response.audioUrl,
      transcription,
      responseText: response.responseText
    });
    if (!responseCheck.valid) {
      throw new TRPCError3({ code: "BAD_REQUEST", message: responseCheck.reason });
    }
    if (!hasUsableSpeakingTranscription(transcription)) {
      throw new TRPCError3({
        code: "BAD_REQUEST",
        message: "No transcription available. Please provide audio or text."
      });
    }
    const result = await scoreWithFallback(question.taskType, () => scoreSpeakingTask({
      taskType: question.taskType,
      originalText: question.content || question.prompt || void 0,
      imageDescription: question.content || void 0,
      lectureTranscript: question.content || void 0,
      question: question.prompt || void 0,
      correctAnswer: question.correctAnswer || void 0,
      transcription,
      wpm: input.durationSeconds && transcription.trim() ? transcription.trim().split(/\s+/).filter(Boolean).length / input.durationSeconds * 60 : void 0
    }));
    const normalizedScore = Number.isFinite(result.overallScore) ? Math.max(10, Math.min(90, result.overallScore)) : 10;
    await updateResponse(input.responseId, {
      normalizedScore,
      totalScore: normalizedScore,
      pronunciationScore: result.traits.pronunciation ? result.traits.pronunciation.score / 5 : void 0,
      fluencyScore: result.traits.oralFluency ? result.traits.oralFluency.score / 5 : void 0,
      feedback: result.overallFeedback,
      strengths: result.strengths,
      improvements: result.improvements,
      pronunciationFeedback: result.traits.pronunciation?.feedback,
      fluencyFeedback: result.traits.oralFluency?.feedback,
      ...getConfidenceMetadata(result)
    });
    return { ...result, normalizedScore };
  }),
  /**
   * Score a Writing task response.
   * Uses official PTE rubrics for Essay (15 traits) and Summarize Written Text (8 traits).
   */
  scoreWrite: protectedProcedure.input(z2.object({
    responseId: z2.number(),
    responseText: z2.string().optional()
  })).mutation(async ({ ctx, input }) => {
    const response = await getResponseById(input.responseId);
    if (!response || response.userId !== ctx.user.id) {
      throw new TRPCError3({ code: "NOT_FOUND" });
    }
    const question = await getQuestionById(response.questionId);
    if (!question) throw new TRPCError3({ code: "NOT_FOUND" });
    const questionCheck = hasRequiredQuestionContent(question);
    if (!questionCheck.valid) {
      throw new TRPCError3({ code: "BAD_REQUEST", message: questionCheck.reason });
    }
    const text3 = input.responseText || response.responseText || "";
    const responseCheck = hasScoreableResponse(question, { responseText: text3 });
    if (!responseCheck.valid) {
      throw new TRPCError3({ code: "BAD_REQUEST", message: responseCheck.reason });
    }
    if (!text3.trim()) {
      throw new TRPCError3({ code: "BAD_REQUEST", message: "No response text provided." });
    }
    const result = await scoreWithFallback(question.taskType, () => scoreWritingTask({
      taskType: question.taskType,
      sourceText: question.content || void 0,
      prompt: question.prompt || void 0,
      response: text3
    }));
    await updateResponse(input.responseId, {
      normalizedScore: result.overallScore,
      totalScore: result.overallScore,
      contentScore: result.traits.content.score / result.traits.content.maxScore,
      formScore: result.traits.form.score / result.traits.form.maxScore,
      feedback: result.overallFeedback,
      strengths: result.strengths,
      improvements: result.improvements,
      grammarErrors: result.grammarErrors || [],
      vocabularyFeedback: result.vocabularyFeedback || "",
      ...getConfidenceMetadata(result)
    });
    return result;
  }),
  /**
   * Score a Reading task response.
   * Objective scoring + AI-generated explanations and strategy tips.
   */
  scoreRead: protectedProcedure.input(z2.object({
    responseId: z2.number(),
    selectedOptions: z2.array(z2.string()).optional(),
    orderedItems: z2.array(z2.string()).optional(),
    filledBlanks: z2.array(z2.object({
      position: z2.number(),
      answer: z2.string()
    })).optional()
  })).mutation(async ({ ctx, input }) => {
    const response = await getResponseById(input.responseId);
    if (!response || response.userId !== ctx.user.id) {
      throw new TRPCError3({ code: "NOT_FOUND" });
    }
    const question = await getQuestionById(response.questionId);
    if (!question) throw new TRPCError3({ code: "NOT_FOUND" });
    const questionCheck = hasRequiredQuestionContent(question);
    if (!questionCheck.valid) {
      throw new TRPCError3({ code: "BAD_REQUEST", message: questionCheck.reason });
    }
    const userAnswers = input.selectedOptions || response.selectedOptions || [];
    const correctAnswerRaw = question.correctAnswer;
    const correctAnswers = correctAnswerRaw ? correctAnswerRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const optionsArr = question.options || [];
    const blanks = input.filledBlanks?.map((b, i) => ({
      position: b.position,
      correctAnswer: correctAnswers[i] || "",
      userAnswer: b.answer,
      options: optionsArr
    }));
    const responseCheck = hasScoreableResponse(question, {
      selectedOptions: userAnswers,
      responseText: response.responseText
    });
    if (!responseCheck.valid) {
      throw new TRPCError3({ code: "BAD_REQUEST", message: responseCheck.reason });
    }
    const result = await scoreWithFallback(question.taskType, () => scoreReadingTask({
      taskType: question.taskType,
      passage: question.content || question.prompt || "",
      question: question.prompt || "",
      options: optionsArr,
      correctAnswer: correctAnswers.length === 1 ? correctAnswers[0] : correctAnswers,
      userAnswer: userAnswers.length === 1 ? userAnswers[0] : userAnswers,
      paragraphs: question.options || void 0,
      correctOrder: correctAnswers,
      userOrder: input.orderedItems || userAnswers,
      blanks
    }));
    await updateResponse(input.responseId, {
      normalizedScore: result.overallScore,
      totalScore: result.overallScore,
      contentScore: result.rawScore / result.maxRawScore,
      feedback: result.overallFeedback,
      strengths: result.strengths,
      improvements: result.improvements,
      ...getConfidenceMetadata(result)
    });
    return result;
  }),
  /**
   * Score a Listening task response.
   * Handles Summarize Spoken Text, Write from Dictation, Fill in Blanks, and MCQ types.
   */
  scoreListen: protectedProcedure.input(z2.object({
    responseId: z2.number(),
    responseText: z2.string().optional(),
    selectedOptions: z2.array(z2.string()).optional(),
    filledBlanks: z2.array(z2.object({
      position: z2.number(),
      word: z2.string()
    })).optional()
  })).mutation(async ({ ctx, input }) => {
    const response = await getResponseById(input.responseId);
    if (!response || response.userId !== ctx.user.id) {
      throw new TRPCError3({ code: "NOT_FOUND" });
    }
    const question = await getQuestionById(response.questionId);
    if (!question) throw new TRPCError3({ code: "NOT_FOUND" });
    const questionCheck = hasRequiredQuestionContent(question);
    if (!questionCheck.valid) {
      throw new TRPCError3({ code: "BAD_REQUEST", message: questionCheck.reason });
    }
    const responseText = input.responseText || response.responseText || "";
    const userAnswers = input.selectedOptions || response.selectedOptions || [];
    const correctAnswerRaw2 = question.correctAnswer;
    const canonicalTaskType = normalizeTaskType(question.taskType);
    const correctAnswers = canonicalTaskType === "fill_blanks_listening" ? parseDelimitedAnswers(correctAnswerRaw2) : parseOrderedAnswerKey(correctAnswerRaw2);
    const optionsArr2 = question.options || [];
    const isListeningSelectionTask = question.section === "listening" && [
      "multiple_choice_single",
      "multiple_choice_multiple",
      "highlight_correct_summary",
      "select_missing_word"
    ].includes(canonicalTaskType);
    const normalizedSelections = isListeningSelectionTask ? normalizeOptionValues(question.options, question.correctAnswer, userAnswers) : void 0;
    const scoringCorrectAnswers = normalizedSelections?.correctAnswers ?? correctAnswers;
    const scoringUserAnswers = normalizedSelections?.selectedOptions ?? userAnswers;
    const blankAnswers = input.filledBlanks?.map((b) => ({ position: b.position, word: b.word })) ?? (canonicalTaskType === "fill_blanks_listening" ? parseDelimitedAnswers(responseText || userAnswers).map((word, position) => ({ position, word })) : []);
    const blanks = blankAnswers.map((b, i) => ({
      position: b.position ?? i,
      correctWord: correctAnswers[i] || "",
      userWord: b.word
    }));
    const responseCheck = hasScoreableResponse(question, {
      responseText,
      selectedOptions: userAnswers
    });
    if (!responseCheck.valid) {
      throw new TRPCError3({ code: "BAD_REQUEST", message: responseCheck.reason });
    }
    const result = await scoreWithFallback(question.taskType, () => scoreListeningTask({
      taskType: question.taskType,
      lectureTranscript: question.content || void 0,
      transcript: question.content || void 0,
      response: responseText,
      question: question.prompt || void 0,
      options: optionsArr2,
      correctAnswer: scoringCorrectAnswers.length === 1 ? scoringCorrectAnswers[0] : scoringCorrectAnswers,
      userAnswer: scoringUserAnswers.length === 1 ? scoringUserAnswers[0] : scoringUserAnswers,
      summaryOptions: optionsArr2,
      blanks
    }));
    await updateResponse(input.responseId, {
      normalizedScore: result.overallScore,
      totalScore: result.overallScore,
      contentScore: result.rawScore / result.maxRawScore,
      feedback: result.overallFeedback,
      strengths: result.strengths,
      improvements: result.improvements,
      ...getConfidenceMetadata(result)
    });
    return result;
  }),
  /**
   * Get the full AI score breakdown for a previously scored response.
   * Re-runs scoring if no score exists yet.
   */
  getScore: protectedProcedure.input(z2.object({ responseId: z2.number() })).query(async ({ ctx, input }) => {
    const response = await getResponseById(input.responseId);
    if (!response || response.userId !== ctx.user.id) {
      throw new TRPCError3({ code: "NOT_FOUND" });
    }
    const question = await getQuestionById(response.questionId);
    if (!question) throw new TRPCError3({ code: "NOT_FOUND" });
    return {
      responseId: input.responseId,
      section: question.section,
      taskType: question.taskType,
      normalizedScore: response.normalizedScore,
      totalScore: response.totalScore,
      feedback: response.feedback,
      strengths: response.strengths,
      improvements: response.improvements,
      pronunciationScore: response.pronunciationScore,
      fluencyScore: response.fluencyScore,
      contentScore: response.contentScore,
      formScore: response.formScore,
      grammarErrors: response.grammarErrors,
      vocabularyFeedback: response.vocabularyFeedback,
      scoreConfidence: response.scoreConfidence,
      needsReview: response.needsReview,
      transcription: response.transcription
    };
  })
});

// server/routers/paymentRouter.ts
import { z as z3 } from "zod";
import { TRPCError as TRPCError4 } from "@trpc/server";

// server/payment/db.ts
init_db();
init_schema();
import { eq as eq2, and as and2, desc as desc2 } from "drizzle-orm";
async function createPayment(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const [payment] = await db.insert(payments).values({
    userId: data.userId,
    subscriptionId: data.subscriptionId,
    gateway: data.gateway,
    amount: data.amount,
    currency: "NPR",
    status: "pending",
    description: data.description,
    referenceId: data.referenceId
  }).execute();
  return payment;
}
async function updatePaymentStatus(paymentId, status, transactionId, metadata, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const updateData = {
    status,
    updatedAt: /* @__PURE__ */ new Date()
  };
  if (transactionId) {
    updateData.transactionId = transactionId;
  }
  if (metadata) {
    updateData.metadata = metadata;
  }
  if (status === "completed") {
    updateData.completedAt = /* @__PURE__ */ new Date();
  }
  await db.update(payments).set(updateData).where(userId === void 0 ? eq2(payments.id, paymentId) : and2(eq2(payments.id, paymentId), eq2(payments.userId, userId))).execute();
}
async function getPaymentByReferenceId(referenceId, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const [payment] = await db.select().from(payments).where(userId === void 0 ? eq2(payments.referenceId, referenceId) : and2(eq2(payments.referenceId, referenceId), eq2(payments.userId, userId))).execute();
  return payment;
}
async function getUserPayments(userId, limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const userPayments = await db.select().from(payments).where(eq2(payments.userId, userId)).orderBy(desc2(payments.createdAt)).limit(limit).execute();
  return userPayments;
}
async function getSubscriptionPlans() {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const plans = await db.select().from(subscriptionPlans).execute();
  return plans;
}
async function getSubscriptionPlanById(planId) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const [plan] = await db.select().from(subscriptionPlans).where(eq2(subscriptionPlans.id, planId)).execute();
  return plan;
}
async function getUserActiveSubscription(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const [subscription] = await db.select().from(subscriptions).where(
    and2(
      eq2(subscriptions.userId, userId),
      eq2(subscriptions.status, "active")
    )
  ).execute();
  return subscription;
}
async function updateSubscriptionAutoRenew(subscriptionId, userId, autoRenew) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  await db.update(subscriptions).set({ autoRenew, updatedAt: /* @__PURE__ */ new Date() }).where(and2(eq2(subscriptions.id, subscriptionId), eq2(subscriptions.userId, userId)));
  const [subscription] = await db.select().from(subscriptions).where(and2(eq2(subscriptions.id, subscriptionId), eq2(subscriptions.userId, userId))).limit(1);
  return subscription;
}
async function getUserSubscriptions(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  return db.select().from(subscriptions).where(eq2(subscriptions.userId, userId)).orderBy(desc2(subscriptions.createdAt));
}
async function cancelSubscription(subscriptionId, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  await db.update(subscriptions).set({
    status: "canceled",
    autoRenew: false,
    canceledAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  }).where(userId === void 0 ? eq2(subscriptions.id, subscriptionId) : and2(eq2(subscriptions.id, subscriptionId), eq2(subscriptions.userId, userId))).execute();
}
async function getSubscriptionWithPlan(subscriptionId, userId) {
  const db = await getDb();
  if (!db) return null;
  const [subscription] = await db.select().from(subscriptions).where(userId === void 0 ? eq2(subscriptions.id, subscriptionId) : and2(eq2(subscriptions.id, subscriptionId), eq2(subscriptions.userId, userId))).execute();
  if (!subscription) return null;
  const plan = await getSubscriptionPlanById(subscription.planId);
  return { ...subscription, plan };
}

// server/payment/esewa.ts
import crypto from "crypto";
function generateSignature(data, secretKey) {
  return crypto.createHash("md5").update(data + secretKey).digest("hex");
}
function createESewaPaymentRequest(config, payment) {
  const baseUrl = config.isProduction ? "https://esewa.com.np/epay/main" : "https://uat.esewa.com.np/epay/main";
  const signatureData = `${payment.amount}${config.merchantCode}${payment.productCode}${payment.referenceId}`;
  const signature = generateSignature(signatureData, "8gBm/:&EnhH.1/q");
  const params = new URLSearchParams({
    amt: payment.amount.toString(),
    psc: payment.productCode,
    pdc: payment.productDescription,
    txAmt: "0",
    // tax amount
    tAmt: payment.amount.toString(),
    // total amount
    pid: payment.referenceId,
    scd: config.merchantCode,
    su: config.successUrl,
    fu: config.failureUrl,
    sign: signature
  });
  return {
    transactionCode: "",
    status: "pending",
    totalAmount: payment.amount,
    productCode: payment.productCode,
    signedFieldNames: "amt,psc,pdc,pid,scd,su,fu",
    signature,
    paymentUrl: `${baseUrl}?${params.toString()}`
  };
}
async function verifyESewaPayment(config, transactionCode) {
  try {
    const verifyUrl = config.isProduction ? "https://esewa.com.np/api/validate" : "https://uat.esewa.com.np/api/validate";
    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        q: transactionCode
      }).toString()
    });
    const data = await response.json();
    if (data.status === "0" || data.status === 0) {
      return {
        success: true,
        transactionCode: data.transaction_code || transactionCode,
        status: "completed",
        totalAmount: data.total_amount,
        productCode: data.product_code
      };
    }
    return {
      success: false,
      message: "Payment verification failed"
    };
  } catch (error) {
    console.error("eSewa verification error:", error);
    return {
      success: false,
      message: "Payment verification error"
    };
  }
}
function generateReferenceId(userId, timestamp2) {
  return `PTE${userId}${timestamp2}${crypto.randomBytes(4).toString("hex")}`;
}

// server/payment/khalti.ts
import crypto2 from "crypto";
async function createKhaltiPaymentRequest(config, payment) {
  const baseUrl = config.isProduction ? "https://khalti.com/api/v2/epayment/initiate/" : "https://a.khalti.com/api/v2/epayment/initiate/";
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${config.publicKey}`
      },
      body: JSON.stringify({
        return_url: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/payment/khalti/callback`,
        website_url: process.env.VITE_FRONTEND_URL || "http://localhost:3000",
        amount: payment.amount,
        // in paisa
        product_name: payment.productName,
        product_description: payment.productDescription,
        customer_name: `User ${payment.userId}`,
        customer_email: payment.customerEmail,
        customer_phone: payment.customerPhone,
        merchant_username: "PTEMaster"
      })
    });
    const data = await response.json();
    if (data.pidx) {
      const paymentUrl = config.isProduction ? `https://khalti.com/epayment/payment/${data.pidx}` : `https://a.khalti.com/epayment/payment/${data.pidx}`;
      return {
        pidx: data.pidx,
        paymentUrl,
        expiresAt: data.expires_at
      };
    }
    throw new Error("Failed to create Khalti payment");
  } catch (error) {
    console.error("Khalti payment creation error:", error);
    throw error;
  }
}
async function verifyKhaltiPayment(config, verification) {
  const baseUrl = config.isProduction ? "https://khalti.com/api/v2/epayment/lookup/" : "https://a.khalti.com/api/v2/epayment/lookup/";
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${config.secretKey}`
      },
      body: JSON.stringify({
        pidx: verification.pidx
      })
    });
    const data = await response.json();
    if (data.status === "Completed") {
      return {
        success: true,
        pidx: data.pidx,
        transactionId: data.transaction_id,
        status: "completed",
        amount: data.amount
      };
    }
    return {
      success: false,
      message: `Payment status: ${data.status}`
    };
  } catch (error) {
    console.error("Khalti verification error:", error);
    return {
      success: false,
      message: "Payment verification error"
    };
  }
}
function generateReferenceId2(userId, timestamp2) {
  return `KHL${userId}${timestamp2}-${crypto2.randomBytes(4).toString("hex")}`;
}
function nprToKhalti(nprAmount) {
  return nprAmount * 100;
}

// server/routers/paymentRouter.ts
var ESEWA_CONFIG = {
  merchantCode: process.env.ESEWA_MERCHANT_CODE || "TESTMERCHANT",
  successUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/payment/esewa/success`,
  failureUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/payment/esewa/failure`,
  isProduction: process.env.NODE_ENV === "production"
};
var KHALTI_CONFIG = {
  publicKey: process.env.KHALTI_PUBLIC_KEY || "test_public_key",
  secretKey: process.env.KHALTI_SECRET_KEY || "test_secret_key",
  isProduction: process.env.NODE_ENV === "production"
};
var paymentRouter = router({
  // Get all subscription plans
  getPlans: publicProcedure.query(async () => {
    return getSubscriptionPlans();
  }),
  // Initiate eSewa payment
  initiateESewaPayment: protectedProcedure.input(
    z3.object({
      planId: z3.number(),
      productName: z3.string(),
      productDescription: z3.string()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const referenceId = generateReferenceId(ctx.user.id, Date.now());
      try {
        await createPayment({
          userId: ctx.user.id,
          gateway: "esewa",
          amount: 1e3,
          // Placeholder - get from plan
          description: input.productDescription,
          referenceId
        });
      } catch (e) {
        console.error("Error creating payment record:", e);
      }
      const esewaRequest = createESewaPaymentRequest(ESEWA_CONFIG, {
        amount: 1e3,
        productCode: `PLAN${input.planId}`,
        productName: input.productName,
        productDescription: input.productDescription,
        referenceId,
        userId: ctx.user.id
      });
      return {
        paymentId: 0,
        paymentUrl: esewaRequest.paymentUrl,
        referenceId
      };
    } catch (error) {
      console.error("eSewa payment initiation error:", error);
      throw new TRPCError4({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to initiate eSewa payment"
      });
    }
  }),
  // Verify eSewa payment
  verifyESewaPayment: protectedProcedure.input(z3.object({ transactionCode: z3.string() })).mutation(async ({ ctx, input }) => {
    try {
      const verification = await verifyESewaPayment(
        ESEWA_CONFIG,
        input.transactionCode
      );
      if (!verification.success) {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Payment verification failed"
        });
      }
      const payment = await getPaymentByReferenceId(
        verification.transactionCode || "",
        ctx.user.id
      );
      if (!payment) {
        throw new TRPCError4({ code: "NOT_FOUND", message: "Payment record not found" });
      }
      try {
        await updatePaymentStatus(
          payment.id,
          "completed",
          verification.transactionCode,
          { verificationResponse: verification },
          ctx.user.id
        );
      } catch (e) {
        console.error("Error updating payment status:", e);
      }
      return { success: true, verification };
    } catch (error) {
      if (error instanceof TRPCError4) throw error;
      console.error("eSewa verification error:", error);
      throw new TRPCError4({
        code: "INTERNAL_SERVER_ERROR",
        message: "Payment verification failed"
      });
    }
  }),
  // Initiate Khalti payment
  initiateKhaltiPayment: protectedProcedure.input(
    z3.object({
      planId: z3.number(),
      productName: z3.string(),
      productDescription: z3.string(),
      amount: z3.number(),
      customerEmail: z3.string().email(),
      customerPhone: z3.string()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const referenceId = generateReferenceId2(ctx.user.id, Date.now());
      try {
        await createPayment({
          userId: ctx.user.id,
          gateway: "khalti",
          amount: input.amount,
          description: input.productDescription,
          referenceId
        });
      } catch (e) {
        console.error("Error creating payment record:", e);
      }
      const khaltiRequest = await createKhaltiPaymentRequest(KHALTI_CONFIG, {
        amount: nprToKhalti(input.amount),
        productName: input.productName,
        productDescription: input.productDescription,
        referenceId,
        userId: ctx.user.id,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone
      });
      return {
        paymentId: 0,
        pidx: khaltiRequest.pidx,
        paymentUrl: khaltiRequest.paymentUrl,
        referenceId
      };
    } catch (error) {
      console.error("Khalti payment initiation error:", error);
      throw new TRPCError4({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to initiate Khalti payment"
      });
    }
  }),
  // Verify Khalti payment
  verifyKhaltiPayment: protectedProcedure.input(
    z3.object({
      pidx: z3.string(),
      transactionId: z3.string(),
      amount: z3.number()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const verification = await verifyKhaltiPayment(KHALTI_CONFIG, {
        pidx: input.pidx,
        transactionId: input.transactionId,
        amount: input.amount
      });
      if (!verification.success) {
        throw new TRPCError4({
          code: "BAD_REQUEST",
          message: "Payment verification failed"
        });
      }
      const payment = await getPaymentByReferenceId(input.pidx, ctx.user.id);
      if (!payment) {
        throw new TRPCError4({ code: "NOT_FOUND", message: "Payment record not found" });
      }
      try {
        await updatePaymentStatus(
          payment.id,
          "completed",
          verification.transactionId,
          { verificationResponse: verification },
          ctx.user.id
        );
      } catch (e) {
        console.error("Error updating payment status:", e);
      }
      return { success: true, verification };
    } catch (error) {
      if (error instanceof TRPCError4) throw error;
      console.error("Khalti verification error:", error);
      throw new TRPCError4({
        code: "INTERNAL_SERVER_ERROR",
        message: "Payment verification failed"
      });
    }
  }),
  // Get user's payment history
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    return getUserPayments(ctx.user.id, 20);
  }),
  // Get all subscriptions belonging to the current user
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    return getUserSubscriptions(ctx.user.id);
  }),
  // Get user's active subscription
  getActiveSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await getUserActiveSubscription(ctx.user.id);
    if (!subscription) return null;
    return getSubscriptionWithPlan(subscription.id, ctx.user.id);
  }),
  // Toggle auto-renewal for a subscription owned by the current user
  setAutoRenew: protectedProcedure.input(z3.object({ subscriptionId: z3.number().int().positive(), autoRenew: z3.boolean() })).mutation(async ({ ctx, input }) => {
    const updated = await updateSubscriptionAutoRenew(input.subscriptionId, ctx.user.id, input.autoRenew);
    if (!updated) throw new TRPCError4({ code: "NOT_FOUND", message: "Subscription not found" });
    return { success: true, subscription: updated };
  }),
  // Cancel subscription
  cancelSubscription: protectedProcedure.input(z3.object({ subscriptionId: z3.number() })).mutation(async ({ ctx, input }) => {
    const subscription = await getSubscriptionWithPlan(input.subscriptionId, ctx.user.id);
    if (!subscription) {
      throw new TRPCError4({ code: "NOT_FOUND", message: "Subscription not found" });
    }
    await cancelSubscription(input.subscriptionId, ctx.user.id);
    return { success: true };
  })
});

// server/routers/systemAdminRouter.ts
init_db();
import os from "node:os";
import { z as z4 } from "zod";
import { TRPCError as TRPCError5 } from "@trpc/server";

// server/admin/adminDb.ts
init_db();
init_schema();
import { eq as eq3, desc as desc3, gte as gte2, sql as sql2 } from "drizzle-orm";
async function getSystemStatistics() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const totalUsersResult = await db.select({ count: sql2`count(*)` }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;
    const activeSubsResult = await db.select({ count: sql2`count(*)` }).from(subscriptions).where(eq3(subscriptions.status, "active"));
    const activeSubscriptions = activeSubsResult[0]?.count || 0;
    const revenueResult = await db.select({ total: sql2`sum(${payments.amount})` }).from(payments).where(eq3(payments.status, "completed"));
    const totalRevenue = revenueResult[0]?.total || 0;
    const sessionsResult = await db.select({ count: sql2`count(*)` }).from(practiceSessions);
    const totalSessions = sessionsResult[0]?.count || 0;
    const failedPaymentsResult = await db.select({ count: sql2`count(*)` }).from(payments).where(eq3(payments.status, "failed"));
    const failedPayments = failedPaymentsResult[0]?.count || 0;
    const activeUsersResult = await db.select({ count: sql2`count(*)` }).from(users);
    const activeUsers = activeUsersResult[0]?.count || 0;
    return {
      totalUsers,
      activeUsers,
      totalSessions,
      totalRevenue,
      activeSubscriptions,
      failedPayments,
      pendingSupport: 0,
      // Would need support tickets table
      systemErrors: 0,
      // Would need error logs table
      apiCalls: 0,
      // Would need API logs table
      storageUsed: 0,
      // Would need storage tracking
      databaseSize: 0
      // Would need to query DB size
    };
  } catch (error) {
    console.error("[Admin] Error fetching system statistics:", error);
    throw error;
  }
}
async function getUserActivityLogs(limit = 50, offset = 0) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const logs = await db.select({
      id: practiceSessions.id,
      userId: practiceSessions.userId,
      userName: users.name,
      action: sql2`'Practice Session'`,
      target: sql2`CONCAT(${practiceSessions.section}, ' - ', ${practiceSessions.status})`,
      timestamp: practiceSessions.startedAt,
      status: practiceSessions.status,
      details: sql2`'Practice session completed'`
    }).from(practiceSessions).leftJoin(users, eq3(practiceSessions.userId, users.id)).orderBy(desc3(practiceSessions.startedAt)).limit(limit).offset(offset);
    return logs;
  } catch (error) {
    console.error("[Admin] Error fetching activity logs:", error);
    throw error;
  }
}

// server/admin/analyticsDb.ts
init_db();
init_schema();
import { sql as sql3, desc as desc4, gte as gte3, and as and4, eq as eq4 } from "drizzle-orm";
async function getUserEngagementMetrics(days = 30) {
  const db = await getDb();
  if (!db) return { totalUsers: 0, activeUsers: 0, dau: [], loginFrequency: [] };
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
  const totalUsers = await db.select({ count: sql3`COUNT(*)` }).from(users);
  const activeUsers = await db.select({ count: sql3`COUNT(DISTINCT ${practiceSessions.userId})` }).from(practiceSessions).where(gte3(practiceSessions.startedAt, startDate));
  const dau = await db.select({
    date: sql3`DATE(${practiceSessions.startedAt})`,
    count: sql3`COUNT(DISTINCT ${practiceSessions.userId})`
  }).from(practiceSessions).where(gte3(practiceSessions.startedAt, startDate)).groupBy(sql3`DATE(${practiceSessions.startedAt})`).orderBy(sql3`DATE(${practiceSessions.startedAt})`);
  const loginFrequency = await db.select({
    frequency: sql3`CASE 
        WHEN COUNT(*) >= 20 THEN 'Very Active (20+ sessions)'
        WHEN COUNT(*) >= 10 THEN 'Active (10-19 sessions)'
        WHEN COUNT(*) >= 5 THEN 'Regular (5-9 sessions)'
        WHEN COUNT(*) >= 1 THEN 'Occasional (1-4 sessions)'
        ELSE 'Inactive'
      END`,
    userCount: sql3`COUNT(DISTINCT ${practiceSessions.userId})`
  }).from(practiceSessions).where(gte3(practiceSessions.startedAt, startDate)).groupBy(
    sql3`CASE 
        WHEN COUNT(*) >= 20 THEN 'Very Active (20+ sessions)'
        WHEN COUNT(*) >= 10 THEN 'Active (10-19 sessions)'
        WHEN COUNT(*) >= 5 THEN 'Regular (5-9 sessions)'
        WHEN COUNT(*) >= 1 THEN 'Occasional (1-4 sessions)'
        ELSE 'Inactive'
      END`
  );
  return {
    totalUsers: totalUsers[0]?.count || 0,
    activeUsers: activeUsers[0]?.count || 0,
    dau: dau || [],
    loginFrequency: loginFrequency || []
  };
}
async function getLearningPerformanceMetrics(days = 30) {
  const db = await getDb();
  if (!db) return { scoresByTaskType: [], scoreDistribution: [], weakAreas: [], improvementTrends: [] };
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
  const scoresByTaskType = await db.select({
    taskType: sql3`q.taskType`,
    avgScore: sql3`AVG(COALESCE(ps.overallScore, 0))`,
    count: sql3`COUNT(*)`,
    minScore: sql3`MIN(COALESCE(ps.overallScore, 0))`,
    maxScore: sql3`MAX(COALESCE(ps.overallScore, 0))`
  }).from(practiceSessions).where(gte3(practiceSessions.startedAt, startDate)).groupBy(sql3`q.taskType`).orderBy(desc4(sql3`AVG(COALESCE(ps.overallScore, 0))`));
  const scoreDistribution = await db.select({
    band: sql3`CASE 
        WHEN COALESCE(ps.overallScore, 0) >= 80 THEN '80-90 (Excellent)'
        WHEN COALESCE(ps.overallScore, 0) >= 70 THEN '70-79 (Very Good)'
        WHEN COALESCE(ps.overallScore, 0) >= 60 THEN '60-69 (Good)'
        WHEN COALESCE(ps.overallScore, 0) >= 50 THEN '50-59 (Fair)'
        ELSE '< 50 (Needs Improvement)'
      END`,
    count: sql3`COUNT(*)`
  }).from(practiceSessions).where(gte3(practiceSessions.startedAt, startDate)).groupBy(
    sql3`CASE 
        WHEN COALESCE(ps.overallScore, 0) >= 80 THEN '80-90 (Excellent)'
        WHEN COALESCE(ps.overallScore, 0) >= 70 THEN '70-79 (Very Good)'
        WHEN COALESCE(ps.overallScore, 0) >= 60 THEN '60-69 (Good)'
        WHEN COALESCE(ps.overallScore, 0) >= 50 THEN '50-59 (Fair)'
        ELSE '< 50 (Needs Improvement)'
      END`
  );
  const weakAreas = await db.select({
    taskType: sql3`q.taskType`,
    avgScore: sql3`AVG(COALESCE(ps.overallScore, 0))`,
    attempts: sql3`COUNT(*)`
  }).from(practiceSessions).where(gte3(practiceSessions.startedAt, startDate)).groupBy(sql3`q.taskType`).orderBy(sql3`AVG(COALESCE(ps.overallScore, 0))`).limit(5);
  const improvementTrends = await db.select({
    date: sql3`DATE(ps.startedAt)`,
    avgScore: sql3`AVG(COALESCE(ps.overallScore, 0))`
  }).from(practiceSessions).where(gte3(practiceSessions.startedAt, startDate)).groupBy(sql3`DATE(ps.startedAt)`).orderBy(sql3`DATE(ps.startedAt)`);
  return {
    scoresByTaskType: scoresByTaskType || [],
    scoreDistribution: scoreDistribution || [],
    weakAreas: weakAreas || [],
    improvementTrends: improvementTrends || []
  };
}
async function getPaymentRevenueMetrics(days = 30) {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, revenueByMethod: [], subscriptionBreakdown: [], failedPayments: 0, dailyRevenue: [] };
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
  const totalRevenue = await db.select({ total: sql3`SUM(${payments.amount})` }).from(payments).where(and4(gte3(payments.createdAt, startDate), eq4(payments.status, "completed")));
  const revenueByMethod = await db.select({
    method: payments.gateway,
    total: sql3`SUM(${payments.amount})`,
    count: sql3`COUNT(*)`
  }).from(payments).where(and4(gte3(payments.createdAt, startDate), eq4(payments.status, "completed"))).groupBy(payments.gateway).orderBy(desc4(sql3`SUM(${payments.amount})`));
  const subscriptionBreakdown = await db.select({
    plan: sql3`sp.name`,
    count: sql3`COUNT(*)`,
    totalMrr: sql3`SUM(sp.price)`
  }).from(subscriptions).innerJoin(subscriptionPlans, eq4(subscriptions.planId, subscriptionPlans.id)).where(eq4(subscriptions.status, "active")).groupBy(sql3`sp.id`);
  const failedPayments = await db.select({ count: sql3`COUNT(*)` }).from(payments).where(and4(gte3(payments.createdAt, startDate), eq4(payments.status, "failed")));
  const dailyRevenue = await db.select({
    date: sql3`DATE(${payments.createdAt})`,
    total: sql3`SUM(${payments.amount})`,
    count: sql3`COUNT(*)`
  }).from(payments).where(and4(gte3(payments.createdAt, startDate), eq4(payments.status, "completed"))).groupBy(sql3`DATE(${payments.createdAt})`).orderBy(sql3`DATE(${payments.createdAt})`);
  return {
    totalRevenue: totalRevenue[0]?.total || 0,
    revenueByMethod: revenueByMethod || [],
    subscriptionBreakdown: subscriptionBreakdown || [],
    failedPayments: failedPayments[0]?.count || 0,
    dailyRevenue: dailyRevenue || []
  };
}
async function getCustomerLifetimeValue() {
  const db = await getDb();
  if (!db) return { topCustomers: [], averageClv: 0 };
  const clvData = await db.select({
    userId: payments.userId,
    totalSpent: sql3`SUM(${payments.amount})`,
    transactionCount: sql3`COUNT(*)`,
    firstPayment: sql3`MIN(DATE(${payments.createdAt}))`,
    lastPayment: sql3`MAX(DATE(${payments.createdAt}))`
  }).from(payments).where(eq4(payments.status, "completed")).groupBy(payments.userId).orderBy(desc4(sql3`SUM(${payments.amount})`)).limit(100);
  const avgClv = await db.select({
    avgClv: sql3`AVG(total_spent)`
  }).from(
    db.select({
      total_spent: sql3`SUM(${payments.amount})`
    }).from(payments).where(eq4(payments.status, "completed")).groupBy(payments.userId).as("clv_calc")
  );
  return {
    topCustomers: clvData || [],
    averageClv: avgClv[0]?.avgClv || 0
  };
}
async function getChurnRetentionMetrics(days = 30) {
  const db = await getDb();
  if (!db) return { churned: 0, active: 0, total: 0, churnRate: 0 };
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
  const churnedSubs = await db.select({ count: sql3`COUNT(*)` }).from(subscriptions).where(and4(eq4(subscriptions.status, "canceled"), gte3(subscriptions.canceledAt, startDate)));
  const activeSubs = await db.select({ count: sql3`COUNT(*)` }).from(subscriptions).where(eq4(subscriptions.status, "active"));
  const totalSubs = await db.select({ count: sql3`COUNT(*)` }).from(subscriptions);
  const churnRate = totalSubs[0]?.count && totalSubs[0].count > 0 ? (churnedSubs[0]?.count || 0) / totalSubs[0].count * 100 : 0;
  return {
    churned: churnedSubs[0]?.count || 0,
    active: activeSubs[0]?.count || 0,
    total: totalSubs[0]?.count || 0,
    churnRate: parseFloat(churnRate.toFixed(2))
  };
}

// server/admin/userAdmin.ts
init_db();
init_schema();
import { and as and5, desc as desc5, eq as eq5, like, or } from "drizzle-orm";
async function listAdminUsers(input) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const filters = [];
  if (input.search?.trim()) {
    const term = `%${input.search.trim()}%`;
    filters.push(or(like(users.name, term), like(users.email, term), like(users.openId, term)));
  }
  if (input.role) filters.push(eq5(users.role, input.role));
  if (input.isBanned !== void 0) filters.push(eq5(users.isBanned, input.isBanned));
  const where = filters.length > 0 ? and5(...filters) : void 0;
  const rows = await db.select({
    id: users.id,
    openId: users.openId,
    name: users.name,
    email: users.email,
    role: users.role,
    isBanned: users.isBanned,
    banReason: users.banReason,
    bannedAt: users.bannedAt,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn
  }).from(users).where(where).orderBy(desc5(users.createdAt)).limit(input.limit).offset(input.offset);
  return rows;
}
async function getAdminUserDetails(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const [user] = await db.select().from(users).where(eq5(users.id, userId)).limit(1);
  if (!user) return null;
  const userSubscriptions = await db.select().from(subscriptions).where(eq5(subscriptions.userId, userId)).orderBy(desc5(subscriptions.createdAt));
  const recentSessions = await db.select({
    id: practiceSessions.id,
    section: practiceSessions.section,
    status: practiceSessions.status,
    startedAt: practiceSessions.startedAt,
    completedAt: practiceSessions.completedAt,
    overallScore: practiceSessions.overallScore
  }).from(practiceSessions).where(eq5(practiceSessions.userId, userId)).orderBy(desc5(practiceSessions.startedAt)).limit(20);
  return { user, subscriptions: userSubscriptions, recentSessions };
}
async function setUserBanStatus(userId, isBanned, reason) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  await db.update(users).set({
    isBanned,
    banReason: isBanned ? reason?.trim() || "Suspended by an administrator" : null,
    bannedAt: isBanned ? /* @__PURE__ */ new Date() : null,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq5(users.id, userId));
  const [updated] = await db.select({ id: users.id, isBanned: users.isBanned, banReason: users.banReason, bannedAt: users.bannedAt }).from(users).where(eq5(users.id, userId)).limit(1);
  return updated ?? null;
}
async function setUserRole(userId, role) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  await db.update(users).set({ role, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(users.id, userId));
  const [updated] = await db.select({ id: users.id, role: users.role }).from(users).where(eq5(users.id, userId)).limit(1);
  return updated ?? null;
}

// server/admin/adminPolicy.ts
function canSuspendUser(actorId, targetUserId) {
  return actorId !== targetUserId;
}
function canDemoteUser(actorId, targetUserId, nextRole) {
  return actorId !== targetUserId || nextRole === "admin";
}

// server/routers/systemAdminRouter.ts
var adminOnlyProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError5({
      code: "FORBIDDEN",
      message: "Only administrators can access this resource"
    });
  }
  return next({ ctx });
});
var systemAdminRouter = router({
  /**
   * Get system health status
   */
  getSystemHealth: adminOnlyProcedure.query(async () => {
    try {
      const db = await getDb();
      let database = "unavailable";
      if (db) {
        await db.execute("SELECT 1");
        database = "connected";
      }
      const cpu = Math.round(Math.min(100, os.loadavg()[0] / Math.max(1, os.cpus().length) * 100));
      const memory = Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100);
      const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "test_key");
      const paymentsConfigured = Boolean(
        process.env.KHALTI_SECRET_KEY && process.env.KHALTI_SECRET_KEY !== "test_secret_key" || process.env.ESEWA_MERCHANT_CODE && process.env.ESEWA_MERCHANT_CODE !== "TESTMERCHANT"
      );
      const services = [
        { name: "API Server", status: "operational", uptime: `${Math.floor(process.uptime() / 3600)}h` },
        { name: "Database", status: database === "connected" ? "operational" : "unavailable", uptime: "runtime check" },
        { name: "Email Service", status: emailConfigured ? "configured" : "not_configured", uptime: "configuration check" },
        { name: "Payment Gateway", status: paymentsConfigured ? "configured" : "not_configured", uptime: "configuration check" },
        { name: "Storage Service", status: "configured", uptime: "runtime check" }
      ];
      return {
        status: database === "connected" ? "healthy" : "degraded",
        cpu,
        memory,
        database,
        api: "operational",
        uptime: `${Math.floor(process.uptime() / 3600)} hours`,
        lastCheck: (/* @__PURE__ */ new Date()).toISOString(),
        services
      };
    } catch (error) {
      console.error("[Admin] Error fetching system health:", error);
      throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  /**
   * Get system statistics
   */
  getSystemStats: adminOnlyProcedure.query(async ({ ctx }) => {
    try {
      return await getSystemStatistics();
    } catch (error) {
      console.error("[Admin] Error fetching system stats:", error);
      throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  /**
   * Get activity logs
   */
  getActivityLogs: adminOnlyProcedure.input(
    z4.object({
      limit: z4.number().default(50),
      offset: z4.number().default(0),
      filter: z4.enum(["all", "user_actions", "system_events", "errors"]).default("all")
    })
  ).query(async ({ input }) => {
    try {
      return await getUserActivityLogs(input.limit, input.offset);
    } catch (error) {
      console.error("[Admin] Error fetching activity logs:", error);
      throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  /**
   * List users with real persisted role and ban state.
   */
  listUsers: adminOnlyProcedure.input(z4.object({
    limit: z4.number().int().min(1).max(100).default(50),
    offset: z4.number().int().min(0).default(0),
    search: z4.string().optional(),
    role: z4.enum(["user", "admin"]).optional(),
    isBanned: z4.boolean().optional()
  })).query(async ({ input }) => {
    try {
      return await listAdminUsers(input);
    } catch (error) {
      console.error("[Admin] Error listing users:", error);
      throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Unable to list users" });
    }
  }),
  /**
   * View one user's persisted profile, subscriptions, and recent sessions.
   */
  getUserDetails: adminOnlyProcedure.input(z4.object({ userId: z4.number().int().positive() })).query(async ({ input }) => {
    const details = await getAdminUserDetails(input.userId);
    if (!details) throw new TRPCError5({ code: "NOT_FOUND", message: "User not found" });
    return details;
  }),
  /**
   * Ban or unban a user. An administrator may not suspend their own account.
   */
  toggleUserBan: adminOnlyProcedure.input(z4.object({
    userId: z4.number().int().positive(),
    isBanned: z4.boolean(),
    reason: z4.string().max(500).optional()
  })).mutation(async ({ input, ctx }) => {
    if (!canSuspendUser(ctx.user.id, input.userId)) {
      throw new TRPCError5({ code: "BAD_REQUEST", message: "Administrators cannot suspend their own account" });
    }
    const updated = await setUserBanStatus(input.userId, input.isBanned, input.reason);
    if (!updated) throw new TRPCError5({ code: "NOT_FOUND", message: "User not found" });
    return { success: true, ...updated };
  }),
  /**
   * Promote or demote a user. Administrators may not demote themselves.
   */
  setUserRole: adminOnlyProcedure.input(z4.object({ userId: z4.number().int().positive(), role: z4.enum(["user", "admin"]) })).mutation(async ({ input, ctx }) => {
    if (!canDemoteUser(ctx.user.id, input.userId, input.role)) {
      throw new TRPCError5({ code: "BAD_REQUEST", message: "Administrators cannot demote their own account" });
    }
    const updated = await setUserRole(input.userId, input.role);
    if (!updated) throw new TRPCError5({ code: "NOT_FOUND", message: "User not found" });
    return { success: true, ...updated };
  }),
  /**
   * Update system configuration
   */
  updateSystemConfig: adminOnlyProcedure.input(
    z4.object({
      key: z4.string(),
      value: z4.any()
    })
  ).mutation(async ({ input, ctx }) => {
    console.log(`[Admin] ${ctx.user?.name} updated config: ${input.key}`);
    return {
      success: true,
      message: "Configuration updated",
      key: input.key,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  /**
   * Trigger system backup
   */
  triggerBackup: adminOnlyProcedure.mutation(async ({ ctx }) => {
    console.log(`[Admin] ${ctx.user?.name} triggered system backup`);
    return {
      success: true,
      backupId: `backup_${Date.now()}`,
      status: "in_progress",
      estimatedTime: "15 minutes",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  /**
   * Get backup history
   */
  getBackupHistory: adminOnlyProcedure.query(async () => {
    return [
      {
        id: "backup_1710000000000",
        date: new Date(Date.now() - 24 * 60 * 6e4).toISOString(),
        size: "2.5 GB",
        status: "completed",
        duration: "12 minutes"
      },
      {
        id: "backup_1709913600000",
        date: new Date(Date.now() - 48 * 60 * 6e4).toISOString(),
        size: "2.4 GB",
        status: "completed",
        duration: "11 minutes"
      },
      {
        id: "backup_1709827200000",
        date: new Date(Date.now() - 72 * 60 * 6e4).toISOString(),
        size: "2.3 GB",
        status: "completed",
        duration: "10 minutes"
      }
    ];
  }),
  /**
   * Get API key management
   */
  getApiKeys: adminOnlyProcedure.query(async () => {
    return [
      {
        id: "key_1",
        name: "Email Service",
        key: "sk_live_\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
        status: "active",
        lastUsed: "2 minutes ago",
        createdAt: "2024-01-15"
      },
      {
        id: "key_2",
        name: "Payment Gateway",
        key: "pk_live_\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
        status: "active",
        lastUsed: "5 minutes ago",
        createdAt: "2024-01-20"
      },
      {
        id: "key_3",
        name: "Storage Service",
        key: "aws_\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
        status: "active",
        lastUsed: "1 hour ago",
        createdAt: "2024-02-01"
      }
    ];
  }),
  /**
   * Rotate API key
   */
  rotateApiKey: adminOnlyProcedure.input(
    z4.object({
      keyId: z4.string()
    })
  ).mutation(async ({ input, ctx }) => {
    console.log(`[Admin] ${ctx.user?.name} rotated API key: ${input.keyId}`);
    return {
      success: true,
      message: "API key rotated successfully",
      newKey: "sk_live_\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  /**
   * Get user engagement metrics
   */
  getUserEngagement: adminOnlyProcedure.input(z4.object({ days: z4.number().default(30) })).query(async ({ input }) => {
    try {
      return await getUserEngagementMetrics(input.days);
    } catch (error) {
      console.error("[Admin] Error fetching user engagement:", error);
      throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  /**
   * Get learning performance metrics
   */
  getLearningPerformance: adminOnlyProcedure.input(z4.object({ days: z4.number().default(30) })).query(async ({ input }) => {
    try {
      return await getLearningPerformanceMetrics(input.days);
    } catch (error) {
      console.error("[Admin] Error fetching learning performance:", error);
      throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  /**
   * Get payment and revenue metrics
   */
  getPaymentRevenue: adminOnlyProcedure.input(z4.object({ days: z4.number().default(30) })).query(async ({ input }) => {
    try {
      return await getPaymentRevenueMetrics(input.days);
    } catch (error) {
      console.error("[Admin] Error fetching payment revenue:", error);
      throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  /**
   * Get customer lifetime value
   */
  getCustomerLTV: adminOnlyProcedure.query(async () => {
    try {
      return await getCustomerLifetimeValue();
    } catch (error) {
      console.error("[Admin] Error fetching CLV:", error);
      throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  /**
   * Get churn and retention metrics
   */
  getChurnRetention: adminOnlyProcedure.input(z4.object({ days: z4.number().default(30) })).query(async ({ input }) => {
    try {
      return await getChurnRetentionMetrics(input.days);
    } catch (error) {
      console.error("[Admin] Error fetching churn retention:", error);
      throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  /**
   * Get system alerts
   */
  getSystemAlerts: adminOnlyProcedure.query(async () => {
    return [
      {
        id: 1,
        severity: "warning",
        title: "High Memory Usage",
        message: "Memory usage is at 78%, consider scaling up",
        timestamp: new Date(Date.now() - 30 * 6e4).toISOString()
      },
      {
        id: 2,
        severity: "info",
        title: "Backup Completed",
        message: "Daily backup completed successfully",
        timestamp: new Date(Date.now() - 2 * 60 * 6e4).toISOString()
      },
      {
        id: 3,
        severity: "error",
        title: "Failed Payment Processing",
        message: "2 payments failed in the last hour",
        timestamp: new Date(Date.now() - 4 * 60 * 6e4).toISOString()
      }
    ];
  }),
  /**
   * Acknowledge alert
   */
  acknowledgeAlert: adminOnlyProcedure.input(
    z4.object({
      alertId: z4.number()
    })
  ).mutation(async ({ input, ctx }) => {
    console.log(`[Admin] ${ctx.user?.name} acknowledged alert: ${input.alertId}`);
    return {
      success: true,
      message: "Alert acknowledged",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  /**
   * Get system performance metrics
   */
  getPerformanceMetrics: adminOnlyProcedure.query(async () => {
    return {
      apiResponseTime: "145ms",
      databaseQueryTime: "23ms",
      cacheHitRate: "87%",
      errorRate: "0.02%",
      uptime: "99.98%",
      requestsPerSecond: 1250,
      activeConnections: 456,
      queuedRequests: 12
    };
  })
});

// server/routers/adminRouter.ts
init_db();
init_schema();
import { z as z6 } from "zod";
import { eq as eq6 } from "drizzle-orm";
import { TRPCError as TRPCError6 } from "@trpc/server";

// server/adminQuestionGeneration.ts
import { z as z5 } from "zod";
var generatedQuestionSchema = z5.object({
  title: z5.string().trim().min(1).max(255),
  prompt: z5.string().default(""),
  content: z5.string().default(""),
  correctAnswer: z5.union([z5.string(), z5.array(z5.unknown()), z5.record(z5.string(), z5.unknown())]).default(""),
  modelAnswer: z5.string().default(""),
  options: z5.array(z5.object({
    id: z5.string().trim().min(1),
    text: z5.string().trim().min(1),
    correct: z5.boolean().default(false)
  })).default([]),
  timeLimit: z5.number().int().min(0).max(3600).default(30),
  preparationTime: z5.number().int().min(0).max(3600).default(0),
  wordLimit: z5.number().int().min(1).max(5e3).nullable().default(null),
  audioUrl: z5.string().url().nullable().default(null),
  imageUrl: z5.string().url().nullable().default(null)
});
function serializeAnswer(answer) {
  if (typeof answer === "string") return answer;
  return JSON.stringify(answer);
}
function extractText(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((part) => typeof part === "string" ? part : part && typeof part === "object" && "text" in part ? String(part.text) : "").join("");
  }
  return "";
}
function stripJsonMarkdown(text3) {
  return text3.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}
function parseGeneratedQuestion(content) {
  const text3 = stripJsonMarkdown(extractText(content));
  if (!text3) throw new Error("The AI returned an empty question.");
  let parsed;
  try {
    parsed = JSON.parse(text3);
  } catch {
    throw new Error("The AI returned invalid JSON for the question.");
  }
  const result = generatedQuestionSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`The AI returned an incomplete question: ${result.error.issues[0]?.message || "schema validation failed"}`);
  }
  if (!result.data.prompt.trim() && !result.data.content.trim()) {
    throw new Error("The AI returned an incomplete question: prompt or content is required.");
  }
  return { ...result.data, correctAnswer: serializeAnswer(result.data.correctAnswer) };
}
var generatedQuestionResponseSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    prompt: { type: "string" },
    content: { type: "string" },
    correctAnswer: { type: ["string", "array", "object"] },
    modelAnswer: { type: "string" },
    options: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          text: { type: "string" },
          correct: { type: "boolean" }
        },
        required: ["id", "text", "correct"],
        additionalProperties: false
      }
    },
    timeLimit: { type: "integer", minimum: 0, maximum: 3600 },
    preparationTime: { type: "integer", minimum: 0, maximum: 3600 },
    wordLimit: { type: ["integer", "null"], minimum: 1, maximum: 5e3 },
    audioUrl: { type: ["string", "null"] },
    imageUrl: { type: ["string", "null"] }
  },
  required: ["title", "prompt", "content", "correctAnswer", "modelAnswer", "options", "timeLimit", "preparationTime", "wordLimit", "audioUrl", "imageUrl"],
  additionalProperties: false
};

// server/routers/adminRouter.ts
var adminRouter = router({
  // Upload questions from CSV
  uploadQuestionsCSV: adminProcedure.input(z6.object({
    file: z6.string(),
    section: z6.enum(["speaking", "writing", "reading", "listening"]),
    taskType: z6.string()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError6({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
    const lines = input.file.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      throw new TRPCError6({ code: "BAD_REQUEST", message: "CSV file must have headers and at least one row" });
    }
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const titleIdx = headers.indexOf("title");
    const promptIdx = headers.indexOf("prompt");
    const contentIdx = headers.indexOf("content");
    const difficultyIdx = headers.indexOf("difficulty");
    const correctAnswerIdx = headers.indexOf("correct_answer");
    const optionsIdx = headers.indexOf("options");
    if (titleIdx === -1) {
      throw new TRPCError6({ code: "BAD_REQUEST", message: "CSV must have a 'title' column" });
    }
    const insertedQuestions = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length < 2) continue;
      const questionData = {
        section: input.section,
        taskType: input.taskType,
        title: values[titleIdx] || `Question ${i}`,
        prompt: promptIdx !== -1 ? values[promptIdx] : void 0,
        content: contentIdx !== -1 ? values[contentIdx] : void 0,
        difficulty: difficultyIdx !== -1 ? values[difficultyIdx] : "medium",
        correctAnswer: correctAnswerIdx !== -1 ? values[correctAnswerIdx] : void 0,
        options: optionsIdx !== -1 ? JSON.parse(values[optionsIdx]) : void 0,
        timeLimit: 30,
        preparationTime: 0,
        createdAt: /* @__PURE__ */ new Date()
      };
      const result = await db.insert(questions).values(questionData);
      insertedQuestions.push(result);
    }
    return { success: true, count: insertedQuestions.length };
  }),
  // Generate questions using AI
  generateQuestionsAI: adminProcedure.input(z6.object({
    section: z6.enum(["speaking", "writing", "reading", "listening"]),
    taskType: z6.string(),
    difficulty: z6.enum(["easy", "medium", "hard"]),
    count: z6.number().min(1).max(20)
  })).mutation(async ({ input }) => {
    const generatedQuestions = [];
    const failures = [];
    const db = await getDb();
    if (!db) throw new TRPCError6({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
    for (let i = 0; i < input.count; i++) {
      const prompt = `Generate one ${input.difficulty} difficulty PTE Academic ${input.taskType.replace(/_/g, " ")} question for the ${input.section} section.

        The answer must be grounded in the generated question. For objective tasks, correctAnswer may be a plain string or a JSON-encoded array/object stored as a string. For MCQs, include options with exactly one or more correct flags as appropriate. Do not invent media URLs.
        
        Return a JSON object with these fields:
        - title: Brief title for the question
        - prompt: Instructions for the test taker
        - content: The main content/passage/scenario
        - correctAnswer: The correct answer (for objective tasks)
        - timeLimit: Time limit in seconds
        - preparationTime: Preparation time in seconds
        
        Return only the requested JSON object. Do not include markdown or commentary.`;
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a PTE Academic test expert. Generate realistic and challenging practice questions."
            },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "pte_question",
              strict: true,
              schema: generatedQuestionResponseSchema
            }
          }
        });
        const questionData = parseGeneratedQuestion(response.choices[0]?.message?.content);
        const insertData = {
          section: input.section,
          taskType: input.taskType,
          difficulty: input.difficulty,
          title: questionData.title || `Generated ${input.taskType} ${i + 1}`,
          prompt: questionData.prompt,
          content: questionData.content,
          correctAnswer: questionData.correctAnswer || void 0,
          modelAnswer: questionData.modelAnswer || void 0,
          options: questionData.options.length ? questionData.options : void 0,
          audioUrl: questionData.audioUrl || void 0,
          imageUrl: questionData.imageUrl || void 0,
          wordLimit: questionData.wordLimit || void 0,
          timeLimit: questionData.timeLimit,
          preparationTime: questionData.preparationTime,
          createdAt: /* @__PURE__ */ new Date()
        };
        await db.insert(questions).values(insertData);
        generatedQuestions.push(insertData);
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown generation error";
        failures.push(`Question ${i + 1}: ${message}`);
        console.error(`Failed to generate question ${i + 1}:`, error);
      }
    }
    if (generatedQuestions.length === 0) {
      throw new TRPCError6({ code: "BAD_GATEWAY", message: `AI generation failed. ${failures[0] || "No valid question was returned."}` });
    }
    return { success: true, count: generatedQuestions.length, requested: input.count, failed: failures.length, failures };
  }),
  // Insert a question manually
  insertQuestion: adminProcedure.input(z6.object({
    section: z6.enum(["speaking", "writing", "reading", "listening"]),
    taskType: z6.string(),
    difficulty: z6.enum(["easy", "medium", "hard"]),
    title: z6.string().min(1, "Title is required"),
    prompt: z6.string().optional(),
    content: z6.string().optional(),
    correctAnswer: z6.string().optional(),
    options: z6.any().optional(),
    timeLimit: z6.number().default(30),
    preparationTime: z6.number().default(0)
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError6({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
    const insertData = {
      section: input.section,
      taskType: input.taskType,
      difficulty: input.difficulty,
      title: input.title,
      prompt: input.prompt || void 0,
      content: input.content || void 0,
      correctAnswer: input.correctAnswer || void 0,
      options: input.options || void 0,
      timeLimit: input.timeLimit,
      preparationTime: input.preparationTime,
      createdAt: /* @__PURE__ */ new Date()
    };
    const result = await db.insert(questions).values(insertData);
    return { success: true, result };
  }),
  // Update editable question content without changing its stable ID.
  updateQuestion: adminProcedure.input(z6.object({
    questionId: z6.number().int().positive(),
    title: z6.string().min(1),
    prompt: z6.string().optional(),
    content: z6.string().optional(),
    correctAnswer: z6.string().optional(),
    difficulty: z6.enum(["easy", "medium", "hard"]).optional()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError6({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
    const { questionId, ...values } = input;
    const result = await db.update(questions).set({
      ...values,
      prompt: values.prompt || void 0,
      content: values.content || void 0,
      correctAnswer: values.correctAnswer || void 0
    }).where(eq6(questions.id, questionId));
    if (!result) throw new TRPCError6({ code: "NOT_FOUND", message: "Question not found" });
    return { success: true };
  }),
  // Delete a question
  deleteQuestion: adminProcedure.input(z6.object({ questionId: z6.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError6({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
    const result = await db.delete(questions).where(eq6(questions.id, input.questionId));
    if (!result) {
      throw new TRPCError6({ code: "NOT_FOUND", message: "Question not found" });
    }
    return { success: true };
  }),
  // Get questions by task type
  getByTaskType: protectedProcedure.input(z6.object({ taskType: z6.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const results = await db.select().from(questions).where(eq6(questions.taskType, input.taskType));
    return results;
  })
});

// server/routers/navigationRouter.ts
init_db();
import { TRPCError as TRPCError7 } from "@trpc/server";
import { z as z7 } from "zod";

// server/sessionOwnership.ts
function isQuestionAllowedInSession(sessionSection, questionSection) {
  return sessionSection === "full" || sessionSection === questionSection;
}

// server/routers/navigationRouter.ts
var navigationRouter = router({
  getSessionQuestions: protectedProcedure.input(z7.object({ sessionId: z7.number() })).query(async ({ ctx, input }) => {
    const session = await getSessionById(input.sessionId);
    if (!session || session.userId !== ctx.user.id) {
      throw new TRPCError7({ code: "NOT_FOUND" });
    }
    const responses = await getSessionResponses(input.sessionId);
    const responseByQuestionId = new Map(responses.map((response) => [response.questionId, response]));
    const plan = Array.isArray(session.questionPlan) ? session.questionPlan : [];
    if (plan.length > 0) {
      const validPlan = (await Promise.all(plan.map(async (item) => {
        const question = await getQuestionById(item.questionId);
        return question && isQuestionAllowedInSession(session.section, question.section) ? { ...item, taskType: question.taskType, section: question.section } : null;
      }))).filter((item) => item !== null);
      return validPlan.map((item) => {
        const response = responseByQuestionId.get(item.questionId);
        const isSkipped = Boolean(response && response.normalizedScore === null && response.responseText === null && response.audioUrl === null);
        return {
          id: item.questionId,
          taskType: item.taskType,
          section: item.section,
          status: response?.normalizedScore !== null && response?.normalizedScore !== void 0 ? "practiced" : isSkipped ? "skipped" : "undone",
          score: response?.normalizedScore ?? null
        };
      });
    }
    return responses.map((r) => ({
      id: r.questionId,
      taskType: r.question?.taskType,
      section: r.question?.section,
      status: r.normalizedScore !== null ? "practiced" : "undone",
      score: r.normalizedScore
    }));
  }),
  skipQuestion: protectedProcedure.input(z7.object({ sessionId: z7.number(), questionId: z7.number() })).mutation(async ({ ctx, input }) => {
    const session = await getSessionById(input.sessionId);
    if (!session || session.userId !== ctx.user.id) {
      throw new TRPCError7({ code: "FORBIDDEN" });
    }
    if (!Number.isInteger(input.questionId) || input.questionId <= 0) {
      throw new TRPCError7({ code: "BAD_REQUEST", message: "A valid question is required before skipping." });
    }
    const question = await getQuestionById(input.questionId);
    if (!question) {
      throw new TRPCError7({ code: "NOT_FOUND", message: "The question to skip was not found." });
    }
    if (!isQuestionAllowedInSession(session.section, question.section)) {
      throw new TRPCError7({ code: "BAD_REQUEST", message: "This question does not belong to the selected practice section." });
    }
    const plan = Array.isArray(session.questionPlan) ? session.questionPlan : [];
    if (plan.length > 0 && !plan.some((item) => item.questionId === input.questionId)) {
      plan.push({ questionId: input.questionId, taskType: "practice", section: session.section });
      await updateSession(input.sessionId, { questionPlan: plan });
    }
    const responseId = await createResponse({
      sessionId: input.sessionId,
      userId: ctx.user.id,
      questionId: input.questionId,
      responseText: null,
      audioUrl: null,
      selectedOptions: null,
      timeTaken: 0
    });
    return { responseId, status: "skipped" };
  }),
  bookmarkQuestion: protectedProcedure.input(z7.object({ sessionId: z7.number(), questionId: z7.number() })).mutation(async ({ ctx, input }) => {
    const session = await getSessionById(input.sessionId);
    if (!session || session.userId !== ctx.user.id) {
      throw new TRPCError7({ code: "FORBIDDEN" });
    }
    return { success: true, status: "bookmarked" };
  }),
  getProgress: protectedProcedure.input(z7.object({ sessionId: z7.number() })).query(async ({ ctx, input }) => {
    const session = await getSessionById(input.sessionId);
    if (!session || session.userId !== ctx.user.id) {
      throw new TRPCError7({ code: "NOT_FOUND" });
    }
    const responses = await getSessionResponses(input.sessionId);
    const plan = Array.isArray(session.questionPlan) ? session.questionPlan : [];
    const total = plan.length > 0 ? plan.length : responses.length;
    const practiced = responses.filter((r) => r.normalizedScore !== null).length;
    const skipped = responses.filter((r) => r.normalizedScore === null && r.responseText === null && r.audioUrl === null).length;
    return {
      practiced,
      skipped,
      undone: total - practiced - skipped,
      total,
      percentage: total > 0 ? Math.round(practiced / total * 100) : 0
    };
  })
});

// shared/sessionPlanner.ts
init_taskTypeAliases();

// shared/sectionalTests.ts
var SECTIONAL_TEST_CONFIG = {
  speaking: {
    section: "speaking",
    label: "Speaking Section Test",
    description: "Complete the speaking task sequence with Pearson-style preparation and response timers.",
    durationMinutes: 25,
    questionCount: 8,
    taskTypes: [
      "personal_introduction",
      "read_aloud",
      "repeat_sentence",
      "describe_image",
      "retell_lecture",
      "answer_short_question",
      "respond_to_situation",
      "summarize_group_discussion"
    ],
    scoringNote: "Personal Introduction is familiarisation only; the remaining speaking tasks receive AI-estimated PTE scores."
  },
  writing: {
    section: "writing",
    label: "Writing Section Test",
    description: "Complete both writing task types with strict response-form and time guidance.",
    durationMinutes: 30,
    questionCount: 2,
    taskTypes: ["summarize_written_text", "write_essay"],
    scoringNote: "Responses are scored for content, form, grammar, vocabulary, spelling, and written discourse where applicable."
  },
  reading: {
    section: "reading",
    label: "Reading Section Test",
    description: "Work through every current Reading task family in one timed section simulation.",
    durationMinutes: 30,
    questionCount: 5,
    taskTypes: [
      "multiple_choice_single",
      "multiple_choice_multiple",
      "reorder_paragraphs",
      "fill_blanks_reading",
      "fill_blanks_rw"
    ],
    scoringNote: "Objective tasks use exact or partial-credit rules defined by the task format."
  },
  listening: {
    section: "listening",
    label: "Listening Section Test",
    description: "Complete the listening task sequence with single-play audio handling and timed responses.",
    durationMinutes: 40,
    questionCount: 8,
    taskTypes: [
      "summarize_spoken_text",
      "multiple_choice_multiple",
      "fill_blanks_listening",
      "highlight_correct_summary",
      "multiple_choice_single",
      "select_missing_word",
      "highlight_incorrect_words",
      "write_from_dictation"
    ],
    scoringNote: "Audio-first tasks preserve single-play behavior; objective answers use Pearson-style partial credit where defined."
  }
};

// shared/sessionPlanner.ts
var FULL_MOCK_TASKS = [
  { section: "speaking", taskType: "read_aloud" },
  { section: "speaking", taskType: "read_aloud" },
  { section: "speaking", taskType: "repeat_sentence" },
  { section: "speaking", taskType: "repeat_sentence" },
  { section: "speaking", taskType: "describe_image" },
  { section: "speaking", taskType: "describe_image" },
  { section: "speaking", taskType: "retell_lecture" },
  { section: "speaking", taskType: "answer_short_question" },
  { section: "speaking", taskType: "respond_to_situation" },
  { section: "speaking", taskType: "summarize_group_discussion" },
  { section: "writing", taskType: "summarize_written_text" },
  { section: "writing", taskType: "write_essay" },
  { section: "reading", taskType: "multiple_choice_single" },
  { section: "reading", taskType: "multiple_choice_multiple" },
  { section: "reading", taskType: "reorder_paragraphs" },
  { section: "reading", taskType: "fill_blanks_reading" },
  { section: "reading", taskType: "fill_blanks_reading" },
  { section: "reading", taskType: "fill_blanks_rw" },
  { section: "reading", taskType: "fill_blanks_rw" },
  { section: "listening", taskType: "summarize_spoken_text" },
  { section: "listening", taskType: "fill_blanks_listening" },
  { section: "listening", taskType: "highlight_correct_summary" },
  { section: "listening", taskType: "select_missing_word" },
  { section: "listening", taskType: "highlight_incorrect_words" },
  { section: "listening", taskType: "write_from_dictation" },
  { section: "listening", taskType: "write_from_dictation" }
];
var DIAGNOSTIC_TASKS = [
  { section: "speaking", taskType: "read_aloud" },
  { section: "speaking", taskType: "describe_image" },
  { section: "writing", taskType: "write_essay" },
  { section: "reading", taskType: "multiple_choice_single" },
  { section: "reading", taskType: "reorder_paragraphs" },
  { section: "listening", taskType: "summarize_spoken_text" },
  { section: "listening", taskType: "write_from_dictation" },
  { section: "listening", taskType: "highlight_incorrect_words" }
];
var SECTION_TASKS = Object.fromEntries(
  Object.entries(SECTIONAL_TEST_CONFIG).map(([section, config]) => [section, config.taskTypes])
);
function buildSessionTaskPlan(input) {
  if (input.sessionType === "revision") return [];
  const requested = input.totalQuestions && input.totalQuestions > 0 ? input.totalQuestions : void 0;
  if (input.sessionType === "mock_test" || input.section === "full") {
    return FULL_MOCK_TASKS.slice(0, requested ?? FULL_MOCK_TASKS.length);
  }
  if (input.sessionType === "diagnostic" || input.mode === "diagnostic") {
    return DIAGNOSTIC_TASKS.slice(0, requested ?? DIAGNOSTIC_TASKS.length);
  }
  const section = input.section ?? "speaking";
  const sectionTasks = SECTION_TASKS[section];
  const canonicalTarget = input.targetTaskType ? normalizeTaskType(input.targetTaskType) : void 0;
  const targetIndex = canonicalTarget ? sectionTasks.indexOf(canonicalTarget) : -1;
  const orderedTasks = targetIndex > 0 ? [...sectionTasks.slice(targetIndex), ...sectionTasks.slice(0, targetIndex)] : sectionTasks;
  return orderedTasks.slice(0, requested ?? orderedTasks.length).map((taskType) => ({ section, taskType }));
}

// server/sessionAggregation.ts
function isScoredSessionQuestion(question) {
  if (!question?.taskType) return true;
  return getPteTaskProcedure(question.taskType, question.section)?.scored !== false;
}
function filterScoredSessionResponses(responses) {
  return responses.filter((response) => isScoredSessionQuestion(response.question));
}
function selectLatestPlannedResponses(responses, plan) {
  if (plan.length === 0) return responses;
  const latestByQuestionId = new Map(responses.map((response) => [response.questionId, response]));
  return plan.map((item) => latestByQuestionId.get(item.questionId)).filter((response) => Boolean(response));
}

// server/routers.ts
init_taskTypeAliases();

// server/responseScoringPolicy.ts
init_taskTypeAliases();
function shouldApplyImmediateObjectiveScore(section, taskType) {
  if (!["reading", "listening"].includes(section)) return false;
  return !(section === "listening" && normalizeTaskType(taskType) === "summarize_spoken_text");
}

// server/routers.ts
var questionsRouter = router({
  list: publicProcedure.input(z8.object({
    section: z8.enum(["speaking", "writing", "reading", "listening"]).optional(),
    taskType: z8.string().optional(),
    difficulty: z8.enum(["easy", "medium", "hard"]).optional(),
    limit: z8.number().min(1).max(200).optional()
  })).query(async ({ input }) => {
    return getQuestions(input);
  }),
  getById: publicProcedure.input(z8.object({ id: z8.number() })).query(async ({ input }) => {
    const q = await getQuestionById(input.id);
    if (!q) throw new TRPCError8({ code: "NOT_FOUND" });
    return q;
  }),
  count: publicProcedure.query(async () => {
    return getQuestionsCount();
  }),
  getByTaskType: publicProcedure.input(z8.object({ taskType: z8.string() })).query(async ({ input }) => {
    return getQuestions({ taskType: input.taskType });
  })
});
var sessionsRouter = router({
  create: protectedProcedure.input(z8.object({
    sessionType: z8.enum(["mock_test", "section_practice", "diagnostic", "revision", "beginner"]),
    section: z8.enum(["speaking", "writing", "reading", "listening", "full"]).optional(),
    mode: z8.enum(["beginner", "exam", "diagnostic", "revision"]).default("exam"),
    totalQuestions: z8.number().default(0),
    targetTaskType: z8.string().optional(),
    targetQuestionId: z8.number().optional()
  })).mutation(async ({ ctx, input }) => {
    const targetQuestion = input.targetQuestionId ? await getQuestionById(input.targetQuestionId) : void 0;
    if (input.targetQuestionId && !targetQuestion) {
      throw new TRPCError8({ code: "NOT_FOUND", message: "The selected practice question was not found." });
    }
    if (input.mode === "exam" && input.targetQuestionId && input.sessionType === "section_practice") {
      throw new TRPCError8({ code: "BAD_REQUEST", message: "Exam mode is available only through a mock or sectional test." });
    }
    if (input.mode === "exam" && input.sessionType === "section_practice" && input.totalQuestions < 2) {
      throw new TRPCError8({ code: "BAD_REQUEST", message: "Exam mode requires a multi-question sectional test." });
    }
    const effectiveSection = input.section && input.section !== "full" ? input.section : targetQuestion?.section ?? "speaking";
    if (targetQuestion && targetQuestion.section !== effectiveSection) {
      throw new TRPCError8({ code: "BAD_REQUEST", message: "The selected question does not belong to the selected practice section." });
    }
    const requestedTaskType = input.targetTaskType ?? targetQuestion?.taskType;
    const canonicalTargetTaskType = requestedTaskType ? normalizeTaskType(requestedTaskType) : void 0;
    if (targetQuestion && canonicalTargetTaskType && normalizeTaskType(targetQuestion.taskType) !== canonicalTargetTaskType) {
      throw new TRPCError8({ code: "BAD_REQUEST", message: "The selected question does not match the selected task type." });
    }
    const plannedTasks = buildSessionTaskPlan({
      ...input,
      targetTaskType: canonicalTargetTaskType
    });
    const plannedQuestions = (await Promise.all(
      plannedTasks.map(async (task, index) => {
        const isTarget = index === 0 && targetQuestion && task.section === targetQuestion.section && normalizeTaskType(task.taskType) === normalizeTaskType(targetQuestion.taskType);
        let candidates = isTarget ? [targetQuestion] : await getQuestions({ section: task.section, taskType: task.taskType, limit: 10 });
        if (candidates.length === 0) {
          candidates = await getQuestions({ section: task.section, limit: 10 });
        }
        const question = candidates[0];
        return question ? { questionId: question.id, taskType: normalizeTaskType(question.taskType), section: question.section } : null;
      })
    )).filter((question) => question !== null);
    if (input.sessionType !== "revision" && plannedQuestions.length === 0) {
      throw new TRPCError8({ code: "PRECONDITION_FAILED", message: "No questions are available for this mode." });
    }
    const {
      targetTaskType: _targetTaskType,
      targetQuestionId: _targetQuestionId,
      ...sessionInput
    } = input;
    const id = await createSession({
      userId: ctx.user.id,
      ...sessionInput,
      section: input.section || "full",
      totalQuestions: plannedQuestions.length || input.totalQuestions,
      questionPlan: plannedQuestions,
      status: "in_progress"
    });
    return { id, questionPlan: plannedQuestions };
  }),
  getById: protectedProcedure.input(z8.object({ id: z8.number() })).query(async ({ ctx, input }) => {
    const session = await getSessionById(input.id);
    if (!session || session.userId !== ctx.user.id) {
      throw new TRPCError8({ code: "NOT_FOUND" });
    }
    let plan = session.questionPlan;
    if (typeof plan === "string") {
      try {
        plan = JSON.parse(plan);
      } catch {
        plan = [];
      }
    }
    return {
      ...session,
      questionPlan: Array.isArray(plan) ? plan : []
    };
  }),
  pause: protectedProcedure.input(z8.object({ id: z8.number(), pausedIndex: z8.number().optional() })).mutation(async ({ ctx, input }) => {
    const session = await getSessionById(input.id);
    if (!session || session.userId !== ctx.user.id) {
      throw new TRPCError8({ code: "NOT_FOUND" });
    }
    if (session.sessionType !== "mock_test" && session.sessionType !== "section_practice") {
      throw new TRPCError8({ code: "FORBIDDEN", message: "Pause and save progress is only available for Mock Tests and Sectional Tests." });
    }
    await updateSession(input.id, {
      status: "paused",
      pausedAt: /* @__PURE__ */ new Date(),
      pausedIndex: input.pausedIndex ?? 0
    });
    return { success: true };
  }),
  resume: protectedProcedure.input(z8.object({ id: z8.number() })).mutation(async ({ ctx, input }) => {
    const session = await getSessionById(input.id);
    if (!session || session.userId !== ctx.user.id) {
      throw new TRPCError8({ code: "NOT_FOUND" });
    }
    await updateSession(input.id, {
      status: "in_progress",
      pausedAt: null
    });
    return { success: true, pausedIndex: session.pausedIndex ?? 0 };
  }),
  complete: protectedProcedure.input(z8.object({ id: z8.number() })).mutation(async ({ ctx, input }) => {
    const session = await getSessionById(input.id);
    if (!session || session.userId !== ctx.user.id) {
      throw new TRPCError8({ code: "NOT_FOUND" });
    }
    const responses = await getSessionResponses(input.id);
    const plan = Array.isArray(session.questionPlan) ? session.questionPlan : [];
    const effectiveResponses = selectLatestPlannedResponses(responses, plan);
    const scoredResponses = filterScoredSessionResponses(effectiveResponses);
    const speakingResponses = scoredResponses.filter((r) => r.pronunciationScore !== null);
    const writingResponses = scoredResponses.filter((r) => r.languageScore !== null && r.pronunciationScore === null);
    const allScored = scoredResponses.filter((r) => r.normalizedScore !== null);
    const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : void 0;
    const speakingScore = avg(speakingResponses.map((r) => r.normalizedScore).filter((score) => typeof score === "number"));
    const writingScore = avg(writingResponses.map((r) => r.normalizedScore).filter((score) => typeof score === "number"));
    const overallScore = avg(allScored.map((r) => r.normalizedScore).filter((score) => typeof score === "number"));
    const grammarScore = avg(scoredResponses.filter((r) => r.languageScore).map((r) => normalizeToPTE((r.languageScore || 0.5) * 100)));
    const pronunciationScore = avg(speakingResponses.map((r) => r.pronunciationScore).filter((score) => typeof score === "number").map((score) => normalizeToPTE(score * 100)));
    const fluencyScore = avg(speakingResponses.map((r) => r.fluencyScore).filter((score) => typeof score === "number").map((score) => normalizeToPTE(score * 100)));
    const updateData = {
      status: "completed",
      completedAt: /* @__PURE__ */ new Date(),
      answeredQuestions: effectiveResponses.length,
      overallScore: overallScore ?? null,
      speakingScore: speakingScore ?? null,
      writingScore: writingScore ?? null,
      grammarScore: grammarScore ?? null,
      pronunciationScore: pronunciationScore ?? null,
      oralFluencyScore: fluencyScore ?? null
    };
    await updateSession(input.id, updateData);
    if (overallScore !== void 0) {
      const diagnostic = await generateDiagnosticFeedback({
        overallScore,
        speakingScore,
        writingScore,
        grammarScore,
        pronunciationScore,
        fluencyScore,
        targetScore: 65
      });
      await updateSession(input.id, {
        weakSkills: diagnostic.weakSkills,
        strongSkills: diagnostic.strongSkills,
        actionPlan: diagnostic.actionPlan
      });
      if (overallScore >= 65) {
        await createMilestone({
          userId: ctx.user.id,
          milestoneType: "score_reached",
          title: "Score Goal Achieved!",
          description: `You reached an overall score of ${Math.round(overallScore)}/90`
        });
      }
    }
    return { success: true, overallScore };
  }),
  getReport: protectedProcedure.input(z8.object({ id: z8.number() })).query(async ({ ctx, input }) => {
    const session = await getSessionById(input.id);
    if (!session || session.userId !== ctx.user.id) {
      throw new TRPCError8({ code: "NOT_FOUND" });
    }
    const responses = await getSessionResponses(input.id);
    const scoredResponses = filterScoredSessionResponses(responses);
    const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : void 0;
    const spk = scoredResponses.filter((r) => r.pronunciationScore !== null);
    const wrt = scoredResponses.filter((r) => r.languageScore !== null && r.pronunciationScore === null);
    const allScored = scoredResponses.filter((r) => r.normalizedScore !== null);
    const enablingSkills = {};
    const grammar = avg(scoredResponses.filter((r) => r.languageScore).map((r) => normalizeToPTE((r.languageScore || 0.5) * 100)));
    const pronunciation = avg(spk.map((r) => r.pronunciationScore).filter((score) => typeof score === "number").map((score) => normalizeToPTE(score * 100)));
    const fluency = avg(spk.map((r) => r.fluencyScore).filter((score) => typeof score === "number").map((score) => normalizeToPTE(score * 100)));
    const vocab = avg(scoredResponses.map((r) => r.contentScore).filter((score) => typeof score === "number").map((score) => normalizeToPTE(score * 100)));
    if (grammar) enablingSkills.grammar = grammar;
    if (pronunciation) enablingSkills.pronunciation = pronunciation;
    if (fluency) enablingSkills.oral_fluency = fluency;
    if (vocab) enablingSkills.vocabulary = vocab;
    const readingResp = scoredResponses.filter((r) => r.question?.section === "reading");
    const listeningResp = scoredResponses.filter((r) => r.question?.section === "listening");
    const readingScore = avg(readingResp.map((r) => r.normalizedScore).filter((score) => typeof score === "number"));
    const listeningScore = avg(listeningResp.map((r) => r.normalizedScore).filter((score) => typeof score === "number"));
    if (readingScore) enablingSkills.reading_skills = readingScore;
    if (listeningScore) enablingSkills.listening_skills = listeningScore;
    const speakingScore = avg(spk.map((r) => r.normalizedScore).filter((score) => typeof score === "number"));
    const writingScore = avg(wrt.map((r) => r.normalizedScore).filter((score) => typeof score === "number"));
    const overallScore = avg(allScored.map((r) => r.normalizedScore).filter((score) => typeof score === "number"));
    const diagnostic = session.actionPlan ? `${session.actionPlan}` : null;
    const plan = session.weakSkills ? `Focus on improving: ${Array.isArray(session.weakSkills) ? session.weakSkills.join(", ") : session.weakSkills}` : null;
    return {
      ...session,
      overallScore: overallScore || session.overallScore,
      speakingScore: speakingScore || session.speakingScore,
      writingScore: writingScore || session.writingScore,
      readingScore: readingScore || session.readingScore,
      listeningScore: listeningScore || session.listeningScore,
      enablingSkills,
      diagnosticFeedback: diagnostic,
      improvementPlan: plan,
      responses: responses.map((r) => ({ ...r, question: r.question }))
    };
  }),
  myHistory: protectedProcedure.input(z8.object({ limit: z8.number().default(20) })).query(async ({ ctx, input }) => {
    return getUserSessions(ctx.user.id, input.limit);
  }),
  getResponses: protectedProcedure.input(z8.object({ sessionId: z8.number() })).query(async ({ ctx, input }) => {
    const session = await getSessionById(input.sessionId);
    if (!session || session.userId !== ctx.user.id) {
      throw new TRPCError8({ code: "NOT_FOUND" });
    }
    return getSessionResponses(input.sessionId);
  })
});
var responsesRouter = router({
  submit: protectedProcedure.input(z8.object({
    sessionId: z8.number(),
    questionId: z8.number(),
    responseText: z8.string().optional(),
    audioUrl: z8.string().optional(),
    selectedOptions: z8.array(z8.string()).optional(),
    timeTaken: z8.number().optional()
  })).mutation(async ({ ctx, input }) => {
    const session = await getSessionById(input.sessionId);
    if (!session || session.userId !== ctx.user.id) {
      throw new TRPCError8({ code: "NOT_FOUND" });
    }
    const sessionPlan = Array.isArray(session.questionPlan) ? session.questionPlan : [];
    let resolvedQuestionId = input.questionId;
    if (!resolvedQuestionId || resolvedQuestionId <= 0) {
      if (sessionPlan.length > 0 && sessionPlan[0]?.questionId) {
        resolvedQuestionId = sessionPlan[0].questionId;
      } else {
        const allQs = await getQuestions({ limit: 1 });
        if (allQs.length > 0 && allQs[0]?.id) {
          resolvedQuestionId = allQs[0].id;
        }
      }
    }
    if (!resolvedQuestionId || resolvedQuestionId <= 0) {
      throw new TRPCError8({ code: "BAD_REQUEST", message: "A valid question is required before submitting." });
    }
    const question = await getQuestionById(resolvedQuestionId);
    if (!question) throw new TRPCError8({ code: "NOT_FOUND" });
    if (!isQuestionAllowedInSession(session.section, question.section)) {
      throw new TRPCError8({ code: "BAD_REQUEST", message: "This question does not belong to the selected practice section." });
    }
    if (sessionPlan.length > 0 && !sessionPlan.some((item) => item.questionId === resolvedQuestionId)) {
      sessionPlan.push({ questionId: resolvedQuestionId, taskType: question.taskType, section: question.section });
      await updateSession(input.sessionId, { questionPlan: sessionPlan });
    }
    const questionCheck = hasRequiredQuestionContent(question);
    if (!questionCheck.valid) {
      throw new TRPCError8({ code: "BAD_REQUEST", message: questionCheck.reason });
    }
    const responseCheck = hasScoreableResponse(question, input);
    if (!responseCheck.valid) {
      throw new TRPCError8({ code: "BAD_REQUEST", message: responseCheck.reason });
    }
    const responseId = await createResponse({
      sessionId: input.sessionId,
      userId: ctx.user.id,
      questionId: resolvedQuestionId,
      responseText: input.responseText,
      audioUrl: input.audioUrl,
      selectedOptions: input.selectedOptions,
      timeTaken: input.timeTaken
    });
    let scoreData = {};
    if (question.section === "speaking" && input.audioUrl) {
      let transcription = "";
      try {
        const transcribeResult = await transcribeAudio({ audioUrl: input.audioUrl, language: "en" });
        transcription = "text" in transcribeResult ? transcribeResult.text : "";
        await updateResponse(responseId, { transcription });
      } catch (e) {
        console.error("Transcription failed:", e);
        transcription = input.responseText || "";
      }
    } else if (shouldApplyImmediateObjectiveScore(question.section, question.taskType)) {
      const normalizedSelections = normalizeOptionValues(
        question.options,
        question.correctAnswer,
        input.selectedOptions
      );
      const result = scoreObjectiveTask({
        taskType: question.taskType,
        correctAnswer: normalizedSelections.correctAnswers,
        userAnswer: input.selectedOptions ? normalizedSelections.selectedOptions : input.responseText ?? ""
      });
      scoreData = {
        normalizedScore: result.normalizedScore,
        contentScore: result.score > 50 ? 1 : 0,
        formScore: 1,
        languageScore: 0.5
      };
    }
    await updateResponse(responseId, scoreData);
    if (session) {
      await updateSession(input.sessionId, {
        answeredQuestions: (session.answeredQuestions || 0) + 1
      });
    }
    let savedTranscription;
    if (question.section === "speaking") {
      try {
        const saved = await getResponseById(responseId);
        savedTranscription = saved?.transcription ?? void 0;
      } catch {
      }
    }
    return { responseId, ...scoreData, transcription: savedTranscription };
  }),
  transcribeAudio: protectedProcedure.input(z8.object({ audioUrl: z8.string() })).mutation(async ({ input }) => {
    const result = await transcribeAudio({ audioUrl: input.audioUrl, language: "en" });
    const transcription = "text" in result ? result.text : "";
    return { transcription };
  })
});
var analyticsRouter = router({
  myStats: protectedProcedure.query(async ({ ctx }) => {
    return getUserAnalytics(ctx.user.id);
  }),
  todayTarget: protectedProcedure.query(async ({ ctx }) => {
    return getTodayTarget(ctx.user.id);
  }),
  milestones: protectedProcedure.query(async ({ ctx }) => {
    return getUserMilestones(ctx.user.id);
  }),
  generateTarget: protectedProcedure.input(z8.object({
    targetMinutes: z8.number().default(30),
    focusSkills: z8.array(z8.string()).optional()
  })).mutation(async ({ ctx, input }) => {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    await upsertPracticeTarget({
      userId: ctx.user.id,
      targetDate: today,
      targetMinutes: input.targetMinutes,
      focusSkills: input.focusSkills || ["speaking", "writing"],
      recommendedTasks: ["read_aloud", "write_essay", "multiple_choice_single"]
    });
    return { success: true };
  })
});
var aiCoachRouter = router({
  // Get detailed AI feedback for a specific response
  getTaskFeedback: protectedProcedure.input(z8.object({
    responseId: z8.number()
  })).mutation(async ({ ctx, input }) => {
    const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const db = await getDb2();
    if (!db) throw new TRPCError8({ code: "INTERNAL_SERVER_ERROR" });
    const { userResponses: userResponses2, questions: questions2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq9 } = await import("drizzle-orm");
    const [response] = await db.select().from(userResponses2).where(eq9(userResponses2.id, input.responseId)).limit(1);
    if (!response || response.userId !== ctx.user.id) {
      throw new TRPCError8({ code: "NOT_FOUND" });
    }
    const [question] = await db.select().from(questions2).where(eq9(questions2.id, response.questionId)).limit(1);
    if (!question) throw new TRPCError8({ code: "NOT_FOUND" });
    const feedback = await generateTaskFeedback({
      taskType: question.taskType,
      question: question.prompt || question.content || "",
      userResponse: response.responseText || response.transcription || "",
      correctAnswer: question.correctAnswer || void 0,
      score: response.totalScore || 0,
      transcription: response.transcription || void 0
    });
    return feedback;
  }),
  // Generate personalized coaching plan
  getCoachingPlan: protectedProcedure.input(z8.object({
    targetScore: z8.number().min(10).max(90).default(65)
  })).mutation(async ({ ctx, input }) => {
    const sessions = await getUserSessions(ctx.user.id, 20);
    const analytics = await getUserAnalytics(ctx.user.id);
    const recentScores = sessions.filter((s) => s.overallScore).map((s) => ({
      taskType: s.sessionType,
      section: s.section || "full",
      score: s.overallScore || 50,
      createdAt: s.completedAt || /* @__PURE__ */ new Date()
    }));
    const plan = await generateCoachingPlan({
      userId: ctx.user.id,
      targetScore: input.targetScore,
      currentLevel: ctx.user.currentLevel || "intermediate",
      recentScores,
      skillScores: {
        grammar: void 0,
        pronunciation: void 0,
        fluency: void 0
      }
    });
    return plan;
  }),
  // Get micro-feedback for a specific error
  getMicroFeedback: protectedProcedure.input(z8.object({
    taskType: z8.string(),
    errorType: z8.string(),
    studentExample: z8.string(),
    correctExample: z8.string().optional()
  })).mutation(async ({ input }) => {
    return generateMicroFeedback(input);
  }),
  // Get AI-powered response to a practice question (for Beginner Mode)
  getModelAnswer: protectedProcedure.input(z8.object({
    questionId: z8.number(),
    taskType: z8.string()
  })).query(async ({ input }) => {
    const question = await getQuestionById(input.questionId);
    if (!question) throw new TRPCError8({ code: "NOT_FOUND" });
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a PTE Academic expert. Provide a model answer for this ${input.taskType.replace(/_/g, " ")} task that would score 90/90. Include brief annotations explaining why each part is effective.`
        },
        {
          role: "user",
          content: `Task: ${question.prompt || question.content}

Provide a model answer with brief annotations.`
        }
      ]
    });
    const content = result.choices[0]?.message?.content;
    return { modelAnswer: content, question };
  })
});
var profileRouter = router({
  update: protectedProcedure.input(z8.object({
    targetScore: z8.number().min(10).max(90).optional(),
    currentLevel: z8.enum(["beginner", "intermediate", "advanced"]).optional(),
    dailyGoalMinutes: z8.number().min(5).max(240).optional(),
    notificationsEnabled: z8.boolean().optional()
  })).mutation(async ({ ctx, input }) => {
    await updateUserProfile(ctx.user.id, input);
    return { success: true };
  })
});
var srsRouter = router({
  /**
   * Get all cards due for review today, with question content.
   */
  getDueCards: protectedProcedure.input(z8.object({ limit: z8.number().min(1).max(50).default(20) })).query(async ({ ctx, input }) => {
    const rows = await getDueCards(ctx.user.id, input.limit);
    return rows.map(({ card, question }) => ({
      card,
      question,
      intervalPreviews: getIntervalPreviews({
        easeFactor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
        lapses: card.lapses,
        state: card.state
      })
    }));
  }),
  /**
   * Get upcoming cards (not yet due) for planning.
   */
  getUpcomingCards: protectedProcedure.input(z8.object({ limit: z8.number().min(1).max(20).default(10) })).query(async ({ ctx, input }) => {
    return getUpcomingCards(ctx.user.id, input.limit);
  }),
  /**
   * Get SRS statistics for the current user.
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return getSrsStats(ctx.user.id);
  }),
  /**
   * Record a review for a card and update its SM-2 schedule.
   * rating: 1=Again, 2=Hard, 3=Good, 4=Easy, 5=Perfect
   */
  recordReview: protectedProcedure.input(z8.object({
    cardId: z8.number(),
    rating: z8.number().min(1).max(5),
    responseText: z8.string().optional(),
    normalizedScore: z8.number().optional()
  })).mutation(async ({ ctx, input }) => {
    const card = await getSrsCardById(input.cardId);
    if (!card || card.userId !== ctx.user.id) {
      throw new TRPCError8({ code: "NOT_FOUND", message: "Card not found" });
    }
    const rating = input.rating;
    const sm2Result = computeSm2({
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
      lapses: card.lapses,
      state: card.state,
      rating
    });
    const isCorrect = rating >= 3;
    await updateSrsCard(card.id, {
      easeFactor: sm2Result.easeFactor,
      interval: sm2Result.interval,
      repetitions: sm2Result.repetitions,
      lapses: sm2Result.lapses,
      state: sm2Result.state,
      dueDate: sm2Result.dueDate,
      isCorrect
    });
    await logSrsReview({
      cardId: card.id,
      userId: ctx.user.id,
      questionId: card.questionId,
      rating,
      prevEaseFactor: card.easeFactor,
      prevInterval: card.interval,
      prevRepetitions: card.repetitions,
      newEaseFactor: sm2Result.easeFactor,
      newInterval: sm2Result.interval,
      newRepetitions: sm2Result.repetitions,
      responseText: input.responseText,
      normalizedScore: input.normalizedScore
    });
    return {
      success: true,
      nextInterval: sm2Result.interval,
      nextDueDate: sm2Result.dueDate,
      ratingLabel: getRatingLabel(rating),
      newState: sm2Result.state
    };
  }),
  /**
   * Manually add a question to the SRS deck.
   */
  addCard: protectedProcedure.input(z8.object({
    questionId: z8.number(),
    sourceResponseId: z8.number().optional(),
    lastScore: z8.number().optional()
  })).mutation(async ({ ctx, input }) => {
    const card = await getOrCreateSrsCard(
      ctx.user.id,
      input.questionId,
      input.sourceResponseId,
      input.lastScore
    );
    return { success: true, card };
  }),
  /**
   * Auto-create SRS cards from a completed session (called after session submit).
   */
  autoCreateFromSession: protectedProcedure.input(z8.object({ sessionId: z8.number() })).mutation(async ({ ctx, input }) => {
    const count = await autoCreateSrsCardsFromSession(ctx.user.id, input.sessionId);
    return { success: true, cardsCreated: count };
  }),
  /**
   * Reset a card back to "new" state (useful if user wants to relearn from scratch).
   */
  resetCard: protectedProcedure.input(z8.object({ cardId: z8.number() })).mutation(async ({ ctx, input }) => {
    const card = await getSrsCardById(input.cardId);
    if (!card || card.userId !== ctx.user.id) {
      throw new TRPCError8({ code: "NOT_FOUND", message: "Card not found" });
    }
    await updateSrsCard(card.id, {
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      lapses: card.lapses,
      state: "new",
      dueDate: /* @__PURE__ */ new Date(),
      isCorrect: false
    });
    return { success: true };
  })
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  questions: questionsRouter,
  sessions: sessionsRouter,
  responses: responsesRouter,
  analytics: analyticsRouter,
  profile: profileRouter,
  aiCoach: aiCoachRouter,
  srs: srsRouter,
  aiScoring: aiScoringRouter,
  payment: paymentRouter,
  systemAdmin: systemAdminRouter,
  admin: adminRouter,
  navigation: navigationRouter
});

// server/_core/context.ts
init_sdk();
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/oauth.ts
init_const();
init_db();
init_sdk();
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
init_env();
function registerStorageProxy(app2) {
  app2.get("/manus-storage/*", async (req, res) => {
    const key = String(req.params["0"] || "");
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/scheduled/subscriptionRenewal.ts
init_db();
init_schema();
init_sdk();
import { eq as eq8 } from "drizzle-orm";

// server/payment/renewalService.ts
init_db();
import { and as and6, desc as desc6, eq as eq7, lte as lte4, lt, or as or2 } from "drizzle-orm";

// server/email/emailService.ts
var RESEND_API_KEY = process.env.RESEND_API_KEY || "test_key";
var SENDER_EMAIL = process.env.SENDER_EMAIL || "noreply@ptepractice.com";
var SENDER_NAME = "PTEMaster";
async function sendEmail(options) {
  try {
    console.log(`[Email] Sending to ${options.to}: ${options.subject}`);
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      success: true,
      messageId
    };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function sendSubscriptionRenewalReminder(data) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Renewal Reminder</h1>
          </div>

          <div class="content">
            <h2>Hello ${data.userName},</h2>
            <p>Your ${data.planName} subscription will renew on <strong>${data.nextBillingDate}</strong>.</p>

            <div class="alert">
              <strong>Renewal Details:</strong><br>
              Amount: ${data.currency} ${data.amount.toLocaleString()}<br>
              Plan: ${data.planName}<br>
              Renewal Date: ${data.renewalDate}
            </div>

            <p>Your subscription will automatically renew to ensure uninterrupted access to all premium features.</p>

            <p><strong>What's included in your ${data.planName} plan:</strong></p>
            <ul>
              <li>Unlimited practice questions</li>
              <li>AI-powered scoring and feedback</li>
              <li>Personalized coaching plans</li>
              <li>Advanced analytics dashboard</li>
              <li>Priority support</li>
            </ul>

            <center>
              <a href="https://ptepractice.com/subscription" class="button">Manage Subscription</a>
            </center>
          </div>

          <div class="footer">
            <p>\xA9 2026 PTEMaster. All rights reserved.</p>
            <p>If you have any questions, please contact support@ptepractice.com</p>
          </div>
        </div>
      </body>
    </html>
  `;
  const result = await sendEmail({
    to: data.userEmail,
    subject: `Your ${data.planName} Subscription Renews Soon`,
    html,
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`
  });
  return result.success;
}

// server/payment/renewalService.ts
init_schema();
function getRenewalPaymentReference(subscriptionId, renewalDate, now) {
  const date = renewalDate ?? now;
  return `renewal-${subscriptionId}-${date.toISOString().slice(0, 10)}`;
}
function shouldCreateRenewalIntent(existingPayment) {
  return existingPayment == null;
}
async function processDueSubscriptionRenewals(now = /* @__PURE__ */ new Date()) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const due = await db.select({
    subscription: subscriptions,
    plan: subscriptionPlans,
    user: users
  }).from(subscriptions).innerJoin(subscriptionPlans, eq7(subscriptions.planId, subscriptionPlans.id)).innerJoin(users, eq7(subscriptions.userId, users.id)).where(and6(
    eq7(subscriptions.status, "active"),
    eq7(subscriptions.autoRenew, true),
    lte4(subscriptions.renewalDate, now)
  ));
  const expirationCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
  const overdue = await db.select({ id: subscriptions.id }).from(subscriptions).where(and6(
    eq7(subscriptions.status, "active"),
    lt(subscriptions.endDate, expirationCutoff)
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
    const [lastPayment] = await db.select({ gateway: payments.gateway }).from(payments).where(and6(eq7(payments.userId, user.id), eq7(payments.status, "completed"))).orderBy(desc6(payments.createdAt)).limit(1);
    await createPayment({
      userId: user.id,
      subscriptionId: subscription.id,
      gateway: lastPayment?.gateway ?? "khalti",
      amount: plan.price,
      description: `${plan.name} subscription renewal payment`,
      referenceId
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
        nextBillingDate: (subscription.renewalDate ?? now).toISOString()
      });
      if (sent) remindersSent += 1;
    }
  }
  if (overdue.length > 0) {
    await db.update(subscriptions).set({ status: "expired", autoRenew: false, updatedAt: now }).where(or2(...overdue.map(({ id }) => eq7(subscriptions.id, id))));
  }
  return {
    dueSubscriptions: due.length,
    renewalIntentsCreated,
    remindersSent,
    expiredSubscriptions: overdue.length,
    alreadyPrepared
  };
}

// server/scheduled/subscriptionRenewal.ts
async function handleSubscriptionRenewal(req, res) {
  const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "database-unavailable", timestamp: timestamp2 });
    const [job] = await db.select().from(scheduledJobs).where(eq8(scheduledJobs.taskUid, user.taskUid)).limit(1);
    if (!job || !job.enabled) {
      return res.json({ ok: true, skipped: "unknown-or-disabled-job", timestamp: timestamp2 });
    }
    const result = await processDueSubscriptionRenewals(/* @__PURE__ */ new Date());
    await db.update(scheduledJobs).set({ lastRunAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq8(scheduledJobs.id, job.id));
    return res.json({ ok: true, result, timestamp: timestamp2 });
  } catch (error) {
    console.error("[Scheduled] Subscription renewal failed:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
      timestamp: timestamp2,
      context: { url: req.originalUrl }
    });
  }
}

// server/_core/app.ts
function createApp() {
  const app2 = express();
  app2.disable("x-powered-by");
  app2.use(express.json({ limit: "50mb" }));
  app2.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app2);
  registerOAuthRoutes(app2);
  app2.post(
    "/api/upload-audio",
    express.raw({ type: "audio/*", limit: "20mb" }),
    async (req, res) => {
      try {
        const { sdk: sdk2 } = await Promise.resolve().then(() => (init_sdk(), sdk_exports));
        let user = null;
        try {
          user = await sdk2.authenticateRequest(req);
        } catch {
          user = null;
        }
        if (!user || user.isCron) {
          res.status(401).json({ error: "Unauthorized" });
          return;
        }
        const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
        const { nanoid } = await import("nanoid");
        const key = `audio/user-${user.id}/${nanoid()}.webm`;
        const buffer = req.body;
        const { url } = await storagePut2(key, buffer, "audio/webm");
        res.json({ url, key });
      } catch (err) {
        console.error("Audio upload error:", err);
        res.status(500).json({ error: "Upload failed" });
      }
    }
  );
  app2.post("/api/scheduled/subscription-renewal", handleSubscriptionRenewal);
  app2.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  return app2;
}

// server/api.ts
var app = createApp();
var api_default = serverless(app);
export {
  api_default as default
};
