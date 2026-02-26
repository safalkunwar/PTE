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
  taskType: varchar("taskType", { length: 64 }).notNull(), // read_aloud, repeat_sentence, describe_image, retell_lecture, answer_short_question, summarize_written_text, write_essay, multiple_choice_single, multiple_choice_multiple, reorder_paragraphs, fill_blanks_reading, fill_blanks_rw, summarize_spoken_text, fill_blanks_listening, highlight_correct_summary, select_missing_word, highlight_incorrect_words, write_from_dictation
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
