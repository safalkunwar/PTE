import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionById, getSessionResponses, createResponse, updateSession, getQuestionById } from "../db";
import { isQuestionAllowedInSession } from "../sessionOwnership";

export const navigationRouter = router({
  getSessionQuestions: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const responses = await getSessionResponses(input.sessionId);
      const responseByQuestionId = new Map(responses.map(response => [response.questionId, response]));
      const plan = Array.isArray(session.questionPlan) ? session.questionPlan as Array<{ questionId: number; taskType: string; section: string }> : [];
      if (plan.length > 0) {
        return plan.map(item => {
          const response = responseByQuestionId.get(item.questionId);
          const isSkipped = Boolean(response && response.normalizedScore === null && response.responseText === null && response.audioUrl === null);
          return {
            id: item.questionId,
            taskType: item.taskType,
            section: item.section,
            status: response?.normalizedScore !== null && response?.normalizedScore !== undefined ? "practiced" : isSkipped ? "skipped" : "undone",
            score: response?.normalizedScore ?? null,
          };
        });
      }
      return responses.map(r => ({
        id: r.questionId,
        taskType: r.question?.taskType,
        section: r.question?.section,
        status: r.normalizedScore !== null ? "practiced" : "undone",
        score: r.normalizedScore,
      }));
    }),

  skipQuestion: protectedProcedure
    .input(z.object({ sessionId: z.number(), questionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (!Number.isInteger(input.questionId) || input.questionId <= 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "A valid question is required before skipping." });
      }
      const question = await getQuestionById(input.questionId);
      if (!question) {
        throw new TRPCError({ code: "NOT_FOUND", message: "The question to skip was not found." });
      }
      if (!isQuestionAllowedInSession(session.section, question.section)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This question does not belong to the selected practice section." });
      }
      const plan = Array.isArray(session.questionPlan) ? session.questionPlan as Array<{ questionId: number; taskType?: string; section?: string }> : [];
      if (plan.length > 0 && !plan.some(item => item.questionId === input.questionId)) {
        // If questionId is not in the plan, append it dynamically to allow seamless practicing without blocking the user
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
        timeTaken: 0,
      });
      return { responseId, status: "skipped" };
    }),

  bookmarkQuestion: protectedProcedure
    .input(z.object({ sessionId: z.number(), questionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return { success: true, status: "bookmarked" };
    }),

  getProgress: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const responses = await getSessionResponses(input.sessionId);
      const plan = Array.isArray(session.questionPlan) ? session.questionPlan as Array<{ questionId: number }> : [];
      const total = plan.length > 0 ? plan.length : responses.length;
      const practiced = responses.filter(r => r.normalizedScore !== null).length;
      const skipped = responses.filter(r => r.normalizedScore === null && r.responseText === null && r.audioUrl === null).length;
      return {
        practiced,
        skipped,
        undone: total - practiced - skipped,
        total,
        percentage: total > 0 ? Math.round((practiced / total) * 100) : 0,
      };
    }),
});
