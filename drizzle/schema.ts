import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
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
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Question bank
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  section: mysqlEnum("section", ["speaking", "writing", "reading", "listening"]).notNull(),
  taskType: varchar("taskType", { length: 64 }).notNull(), // read_aloud, repeat_sentence, describe_image, retell_lecture, answer_short_question, summarize_group_discussion, respond_to_situation, summarize_written_text, write_essay, multiple_choice_single, multiple_choice_multiple, reorder_paragraphs, fill_blanks_reading, fill_blanks_rw, summarize_spoken_text, fill_blanks_listening, highlight_correct_summary, select_missing_word, highlight_incorrect_words, write_from_dictation
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  prompt: text("prompt"), // instruction text
  content: text("content"), // main content (passage, image description, etc.)
  audioUrl: text("audioUrl"), // for listening tasks
  imageUrl: text("imageUrl"), // for describe image tasks
  options: json("options"), // for MCQ tasks: [{id, text, correct}]
  correctAnswer: text("correctAnswer"), // for objective tasks
  modelAnswer: text("modelAnswer"), // for subjective tasks
  wordLimit: int("wordLimit"), // for writing tasks
  timeLimit: int("timeLimit"), // seconds allowed
  preparationTime: int("preparationTime"), // seconds to prepare before speaking
  tags: json("tags"), // topic tags
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;

// Practice sessions
export const practiceSessions = mysqlTable("practice_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  sessionType: mysqlEnum("sessionType", ["mock_test", "section_practice", "diagnostic", "revision", "beginner"]).notNull(),
  section: mysqlEnum("section", ["speaking", "writing", "reading", "listening", "full"]).notNull(),
  mode: mysqlEnum("mode", ["beginner", "exam", "diagnostic", "revision"]).default("exam").notNull(),
  status: mysqlEnum("status", ["in_progress", "completed", "abandoned"]).default("in_progress").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  totalQuestions: int("totalQuestions").default(0),
  answeredQuestions: int("answeredQuestions").default(0),
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
  weakSkills: json("weakSkills"), // array of skill names
  strongSkills: json("strongSkills"),
  actionPlan: text("actionPlan"),
});

export type PracticeSession = typeof practiceSessions.$inferSelect;

// User responses to individual questions
export const userResponses = mysqlTable("userResponses", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => practiceSessions.id),
  userId: int("userId").notNull().references(() => users.id),
  questionId: int("questionId").notNull().references(() => questions.id),
  responseText: text("responseText"), // text answer
  audioUrl: text("audioUrl"), // for speaking tasks
  transcription: text("transcription"), // transcribed speech
  selectedOptions: json("selectedOptions"), // for MCQ
  timeTaken: int("timeTaken"), // seconds
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  // Scores
  contentScore: float("contentScore"), // 0-1 normalized
  formScore: float("formScore"),
  languageScore: float("languageScore"),
  pronunciationScore: float("pronunciationScore"),
  fluencyScore: float("fluencyScore"),
  totalScore: float("totalScore"), // 0-100 raw
  normalizedScore: float("normalizedScore"), // 10-90 scale
  // Feedback
  feedback: text("feedback"), // detailed AI feedback
  strengths: json("strengths"),
  improvements: json("improvements"),
  grammarErrors: json("grammarErrors"),
  vocabularyFeedback: text("vocabularyFeedback"),
  pronunciationFeedback: text("pronunciationFeedback"),
  fluencyFeedback: text("fluencyFeedback"),
  isCorrect: boolean("isCorrect"), // for objective tasks
});

export type UserResponse = typeof userResponses.$inferSelect;

// Daily practice targets
export const practiceTargets = mysqlTable("practiceTargets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  targetDate: timestamp("targetDate").notNull(),
  targetMinutes: int("targetMinutes").default(30),
  focusSkills: json("focusSkills"), // skills to focus on
  recommendedTasks: json("recommendedTasks"), // task types to practice
  completedMinutes: int("completedMinutes").default(0),
  isCompleted: boolean("isCompleted").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Spaced Repetition Cards (SM-2 algorithm)
export const srsCards = mysqlTable("srs_cards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  questionId: int("questionId").notNull().references(() => questions.id),
  // SM-2 core fields
  easeFactor: float("easeFactor").default(2.5).notNull(), // starts at 2.5, min 1.3
  interval: int("interval").default(1).notNull(), // days until next review
  repetitions: int("repetitions").default(0).notNull(), // consecutive correct reviews
  lapses: int("lapses").default(0).notNull(), // times forgotten (reset to 0)
  // Scheduling
  dueDate: timestamp("dueDate").notNull(), // next review date
  lastReviewedAt: timestamp("lastReviewedAt"),
  // Stats
  totalReviews: int("totalReviews").default(0).notNull(),
  correctReviews: int("correctReviews").default(0).notNull(),
  // Card state
  state: mysqlEnum("state", ["new", "learning", "review", "relearning"]).default("new").notNull(),
  // Source of the card (from a failed response)
  sourceResponseId: int("sourceResponseId").references(() => userResponses.id),
  lastScore: float("lastScore"), // last normalized score that triggered this card
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SrsCard = typeof srsCards.$inferSelect;
export type InsertSrsCard = typeof srsCards.$inferInsert;

// SRS Review Logs — full history of every review
export const srsReviewLogs = mysqlTable("srs_review_logs", {
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
  reviewedAt: timestamp("reviewedAt").defaultNow().notNull(),
});

export type SrsReviewLog = typeof srsReviewLogs.$inferSelect;

// Subscription plans
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(), // Free, Pro, Premium
  price: int("price").notNull(), // in NPR (Nepali Rupees)
  interval: mysqlEnum("interval", ["monthly", "yearly"]).notNull(),
  features: json("features").notNull(), // array of feature strings
  maxSessions: int("maxSessions"), // null for unlimited
  storageGB: int("storageGB"), // null for unlimited
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// User subscriptions
export const subscriptions = mysqlTable("subscriptions", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// Payments (eSewa and Khalti)
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  subscriptionId: int("subscriptionId").references(() => subscriptions.id),
  gateway: mysqlEnum("gateway", ["esewa", "khalti"]).notNull(),
  amount: int("amount").notNull(), // in NPR
  currency: varchar("currency", { length: 3 }).default("NPR").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  transactionId: varchar("transactionId", { length: 255 }), // eSewa or Khalti transaction ID
  referenceId: varchar("referenceId", { length: 255 }), // unique reference for payment
  description: text("description"),
  metadata: json("metadata"), // additional data from gateway
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Score milestones and notifications
export const milestones = mysqlTable("milestones", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  milestoneType: varchar("milestoneType", { length: 64 }).notNull(), // score_reached, streak, improvement
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  achievedAt: timestamp("achievedAt").defaultNow().notNull(),
  isNotified: boolean("isNotified").default(false),
});
