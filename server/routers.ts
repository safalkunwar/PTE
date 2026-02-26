import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getQuestions, getQuestionById, createSession, getSessionById, updateSession,
  getUserSessions, createResponse, updateResponse, getSessionResponses,
  getUserAnalytics, getTodayTarget, upsertPracticeTarget, getUserMilestones,
  createMilestone, updateUserProfile, getQuestionsCount,
} from "./db";
import {
  scoreWritingTask, scoreSpeakingTask, scoreObjectiveTask,
  generateDiagnosticFeedback, normalizeToPTE,
} from "./scoring";
import { transcribeAudio } from "./_core/voiceTranscription";
import { notifyOwner } from "./_core/notification";

// Questions router
const questionsRouter = router({
  list: publicProcedure
    .input(z.object({
      section: z.enum(["speaking", "writing", "reading", "listening"]).optional(),
      taskType: z.string().optional(),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      limit: z.number().min(1).max(50).optional(),
    }))
    .query(async ({ input }) => {
      return getQuestions(input);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const q = await getQuestionById(input.id);
      if (!q) throw new TRPCError({ code: "NOT_FOUND" });
      return q;
    }),

  count: publicProcedure.query(async () => {
    return getQuestionsCount();
  }),
});

// Sessions router
const sessionsRouter = router({
  create: protectedProcedure
    .input(z.object({
      sessionType: z.enum(["mock_test", "section_practice", "diagnostic", "revision", "beginner"]),
      section: z.enum(["speaking", "writing", "reading", "listening", "full"]).optional(),
      mode: z.enum(["beginner", "exam", "diagnostic", "revision"]).default("exam"),
      totalQuestions: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await createSession({
        userId: ctx.user.id,
        ...input,
        section: input.section || "full",
        status: "in_progress",
      });
      return { id };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getSessionById(input.id);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return session;
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getSessionById(input.id);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const responses = await getSessionResponses(input.id);

      // Calculate aggregate scores
      const speakingResponses = responses.filter(r => r.pronunciationScore !== null);
      const writingResponses = responses.filter(r => r.languageScore !== null && r.pronunciationScore === null);
      const allScored = responses.filter(r => r.normalizedScore !== null);

      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined;

      const speakingScore = avg(speakingResponses.map(r => r.normalizedScore || 50));
      const writingScore = avg(writingResponses.map(r => r.normalizedScore || 50));
      const overallScore = avg(allScored.map(r => r.normalizedScore || 50));

      // Aggregate enabling skills
      const grammarScore = avg(responses.filter(r => r.languageScore).map(r => normalizeToPTE((r.languageScore || 0.5) * 100)));
      const pronunciationScore = avg(speakingResponses.map(r => normalizeToPTE((r.pronunciationScore || 0.5) * 100)));
      const fluencyScore = avg(speakingResponses.map(r => normalizeToPTE((r.fluencyScore || 0.5) * 100)));

      const updateData = {
        status: "completed" as const,
        completedAt: new Date(),
        answeredQuestions: responses.length,
        overallScore: overallScore || 50,
        speakingScore: speakingScore,
        writingScore: writingScore,
        grammarScore: grammarScore,
        pronunciationScore: pronunciationScore,
        oralFluencyScore: fluencyScore,
      };

      await updateSession(input.id, updateData);

      // Generate diagnostic feedback
      if (overallScore) {
        const diagnostic = await generateDiagnosticFeedback({
          overallScore: overallScore,
          speakingScore,
          writingScore,
          grammarScore,
          pronunciationScore,
          fluencyScore,
          targetScore: 65,
        });

        await updateSession(input.id, {
          weakSkills: diagnostic.weakSkills,
          strongSkills: diagnostic.strongSkills,
          actionPlan: diagnostic.actionPlan,
        });

        // Check for milestones
        if (overallScore >= 65) {
          await createMilestone({
            userId: ctx.user.id,
            milestoneType: "score_reached",
            title: "Score Goal Achieved!",
            description: `You reached an overall score of ${Math.round(overallScore)}/90`,
          });
        }
      }

      return { success: true, overallScore };
    }),

  getReport: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getSessionById(input.id);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const responses = await getSessionResponses(input.id);
      // Build enabling skills from response data
      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined;
      const spk = responses.filter(r => r.pronunciationScore !== null);
      const wrt = responses.filter(r => r.languageScore !== null && r.pronunciationScore === null);
      const allScored = responses.filter(r => r.normalizedScore !== null);
      const enablingSkills: Record<string, number> = {};
      const grammar = avg(responses.filter(r => r.languageScore).map(r => normalizeToPTE((r.languageScore || 0.5) * 100)));
      const pronunciation = avg(spk.map(r => normalizeToPTE((r.pronunciationScore || 0.5) * 100)));
      const fluency = avg(spk.map(r => normalizeToPTE((r.fluencyScore || 0.5) * 100)));
      const vocab = avg(responses.filter(r => r.contentScore).map(r => normalizeToPTE((r.contentScore || 0.5) * 100)));
      if (grammar) enablingSkills.grammar = grammar;
      if (pronunciation) enablingSkills.pronunciation = pronunciation;
      if (fluency) enablingSkills.oral_fluency = fluency;
      if (vocab) enablingSkills.vocabulary = vocab;
      const readingResp = responses.filter(r => r.question?.section === "reading");
      const listeningResp = responses.filter(r => r.question?.section === "listening");
      const readingScore = avg(readingResp.filter(r => r.normalizedScore).map(r => r.normalizedScore!));
      const listeningScore = avg(listeningResp.filter(r => r.normalizedScore).map(r => r.normalizedScore!));
      if (readingScore) enablingSkills.reading_skills = readingScore;
      if (listeningScore) enablingSkills.listening_skills = listeningScore;
      const speakingScore = avg(spk.map(r => r.normalizedScore!).filter(Boolean));
      const writingScore = avg(wrt.map(r => r.normalizedScore!).filter(Boolean));
      const overallScore = avg(allScored.map(r => r.normalizedScore!));
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
        responses: responses.map(r => ({ ...r, question: r.question })),
      };
    }),

  myHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      return getUserSessions(ctx.user.id, input.limit);
    }),

  getResponses: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return getSessionResponses(input.sessionId);
    }),
});

// Responses router
const responsesRouter = router({
  submit: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      questionId: z.number(),
      responseText: z.string().optional(),
      audioUrl: z.string().optional(),
      selectedOptions: z.array(z.string()).optional(),
      timeTaken: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const question = await getQuestionById(input.questionId);
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      const responseId = await createResponse({
        sessionId: input.sessionId,
        userId: ctx.user.id,
        questionId: input.questionId,
        responseText: input.responseText,
        audioUrl: input.audioUrl,
        selectedOptions: input.selectedOptions,
        timeTaken: input.timeTaken,
      });

      // Score based on task type
      let scoreData: Partial<typeof import("../drizzle/schema").userResponses.$inferInsert> = {};

      if (question.section === "writing" && input.responseText) {
        const result = await scoreWritingTask({
          taskType: question.taskType as any,
          prompt: question.prompt || "",
          content: question.content || undefined,
          response: input.responseText,
          wordLimit: question.wordLimit || undefined,
        });
        scoreData = {
          contentScore: result.contentScore,
          formScore: result.formScore,
          languageScore: result.languageScore,
          totalScore: result.totalScore,
          normalizedScore: result.normalizedScore,
          feedback: result.feedback,
          strengths: result.strengths,
          improvements: result.improvements,
          grammarErrors: result.grammarErrors,
          vocabularyFeedback: result.vocabularyFeedback,
        };
      } else if (question.section === "speaking" && input.audioUrl) {
        // Transcribe audio first
        let transcription = "";
        try {
          const transcribeResult = await transcribeAudio({ audioUrl: input.audioUrl, language: "en" });
          transcription = 'text' in transcribeResult ? transcribeResult.text : "";
          await updateResponse(responseId, { transcription });
        } catch (e) {
          console.error("Transcription failed:", e);
          transcription = input.responseText || "";
        }

        if (transcription) {
          const result = await scoreSpeakingTask({
            taskType: question.taskType as any,
            prompt: question.prompt || undefined,
            originalText: question.content || undefined,
            transcription,
          });
          scoreData = {
            contentScore: result.contentScore,
            formScore: result.formScore,
            languageScore: result.languageScore,
            pronunciationScore: result.pronunciationScore,
            fluencyScore: result.fluencyScore,
            totalScore: result.totalScore,
            normalizedScore: result.normalizedScore,
            feedback: result.feedback,
            strengths: result.strengths,
            improvements: result.improvements,
            grammarErrors: result.grammarErrors,
            vocabularyFeedback: result.vocabularyFeedback,
            pronunciationFeedback: result.pronunciationFeedback,
            fluencyFeedback: result.fluencyFeedback,
          };
        }
      } else if (["reading", "listening"].includes(question.section)) {
        const result = scoreObjectiveTask({
          taskType: question.taskType,
          correctAnswer: question.correctAnswer,
          selectedOptions: input.selectedOptions,
          responseText: input.responseText,
        });
        scoreData = {
          isCorrect: result.isCorrect,
          totalScore: result.totalScore,
          normalizedScore: result.normalizedScore,
          contentScore: result.isCorrect ? 1 : 0,
          formScore: 1,
          languageScore: 0.5,
        };
      }

      await updateResponse(responseId, scoreData);

      // Update session answered count
      const session = await getSessionById(input.sessionId);
      if (session) {
        await updateSession(input.sessionId, {
          answeredQuestions: (session.answeredQuestions || 0) + 1,
        });
      }

      return { responseId, ...scoreData };
    }),

  transcribeAudio: protectedProcedure
    .input(z.object({ audioUrl: z.string() }))
    .mutation(async ({ input }) => {
      const result = await transcribeAudio({ audioUrl: input.audioUrl, language: "en" });
      const transcription = 'text' in result ? result.text : "";
      return { transcription };
    }),
});

// Analytics router
const analyticsRouter = router({
  myStats: protectedProcedure.query(async ({ ctx }) => {
    return getUserAnalytics(ctx.user.id);
  }),

  todayTarget: protectedProcedure.query(async ({ ctx }) => {
    return getTodayTarget(ctx.user.id);
  }),

  milestones: protectedProcedure.query(async ({ ctx }) => {
    return getUserMilestones(ctx.user.id);
  }),

  generateTarget: protectedProcedure
    .input(z.object({
      targetMinutes: z.number().default(30),
      focusSkills: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await upsertPracticeTarget({
        userId: ctx.user.id,
        targetDate: today,
        targetMinutes: input.targetMinutes,
        focusSkills: input.focusSkills || ["speaking", "writing"],
        recommendedTasks: ["read_aloud", "write_essay", "multiple_choice_single"],
      });
      return { success: true };
    }),
});

// Profile router
const profileRouter = router({
  update: protectedProcedure
    .input(z.object({
      targetScore: z.number().min(10).max(90).optional(),
      currentLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      dailyGoalMinutes: z.number().min(5).max(240).optional(),
      notificationsEnabled: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  questions: questionsRouter,
  sessions: sessionsRouter,
  responses: responsesRouter,
  analytics: analyticsRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
