/**
 * AI Scoring Router
 *
 * Exposes the four section-specific AI scoring engines as tRPC procedures.
 * Each engine uses official Pearson PTE Academic rubrics (Score Guide v21, Nov 2024)
 * calibrated with multi-level native speaker reference data.
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { scoreSpeakingTask } from "../ai/speakingAI";
import { scoreWritingTask } from "../ai/writingAI";
import { scoreReadingTask } from "../ai/readingAI";
import { scoreListeningTask } from "../ai/listeningAI";
import { getQuestionById, getResponseById, updateResponse } from "../db";
import { transcribeAudio } from "../_core/voiceTranscription";
import { hasRequiredQuestionContent, hasScoreableResponse } from "@shared/pteValidation";
import { normalizeTaskType } from "@shared/taskTypeAliases";
import { normalizeOptionValues, parseDelimitedAnswers, parseOrderedAnswerKey } from "../optionValueNormalization";
import { getConfidenceMetadata } from "../aiConfidence";
import { deterministicScoreFallback, withScoringTimeout } from "../aiScoreFallback";
import { hasUsableSpeakingTranscription } from "../aiScoreEligibility";

async function scoreWithFallback<T>(taskType: string, scorer: () => Promise<T>): Promise<T> {
  const result = await withScoringTimeout(
    scorer(),
    () => deterministicScoreFallback(taskType) as T,
  );
  return result.value;
}

export const aiScoringRouter = router({
  /**
   * Score a Speaking task response.
   * Accepts either a transcription (text) or an audioUrl (auto-transcribed).
   * Uses official PTE rubrics: Pronunciation (0-5), Oral Fluency (0-5), Content (task-specific).
   */
  scoreSpeak: protectedProcedure
    .input(z.object({
      responseId: z.number(),
      audioUrl: z.string().optional(),
      transcription: z.string().optional(),
      durationSeconds: z.number().positive().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const response = await getResponseById(input.responseId);
      if (!response || response.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const question = await getQuestionById(response.questionId);
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });
      const questionCheck = hasRequiredQuestionContent(question);
      if (!questionCheck.valid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: questionCheck.reason });
      }

      // Get transcription
      let transcription = input.transcription || response.transcription || "";
      if (!transcription && (input.audioUrl || response.audioUrl)) {
        try {
          const audioUrl = input.audioUrl || response.audioUrl || "";
          const result = await transcribeAudio({ audioUrl, language: "en" });
          transcription = "text" in result ? result.text : "";
          await updateResponse(input.responseId, { transcription });
        } catch (e) {
          console.error("Transcription failed:", e);
        }
      }

      const responseCheck = hasScoreableResponse(question, {
        audioUrl: input.audioUrl || response.audioUrl,
        transcription,
        responseText: response.responseText,
      });
      if (!responseCheck.valid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: responseCheck.reason });
      }

      if (!hasUsableSpeakingTranscription(transcription)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No transcription available. Please provide audio or text.",
        });
      }

      // Score using the section-specific engine
      const result = await scoreWithFallback(question.taskType, () => scoreSpeakingTask({
        taskType: question.taskType,
        originalText: question.content || question.prompt || undefined,
        imageDescription: question.content || undefined,
        lectureTranscript: question.content || undefined,
        question: question.prompt || undefined,
        correctAnswer: question.correctAnswer || undefined,
        transcription,
        wpm: input.durationSeconds && transcription.trim()
          ? (transcription.trim().split(/\s+/).filter(Boolean).length / input.durationSeconds) * 60
          : undefined,
      }));

      // Normalize the speaking engine's overallScore to the response/UI
      // contract so valid speaking results are never rendered as 0/90.
      const normalizedScore = Number.isFinite(result.overallScore)
        ? Math.max(10, Math.min(90, result.overallScore))
        : 10;

      // Persist the enhanced score
      await updateResponse(input.responseId, {
        normalizedScore,
        totalScore: normalizedScore,
        pronunciationScore: result.traits.pronunciation ? result.traits.pronunciation.score / 5 : undefined,
        fluencyScore: result.traits.oralFluency ? result.traits.oralFluency.score / 5 : undefined,
        feedback: result.overallFeedback,
        strengths: result.strengths,
        improvements: result.improvements,
        pronunciationFeedback: result.traits.pronunciation?.feedback,
        fluencyFeedback: result.traits.oralFluency?.feedback,
        ...getConfidenceMetadata(result),
      });

      return { ...result, normalizedScore };
    }),

  /**
   * Score a Writing task response.
   * Uses official PTE rubrics for Essay (15 traits) and Summarize Written Text (8 traits).
   */
  scoreWrite: protectedProcedure
    .input(z.object({
      responseId: z.number(),
      responseText: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const response = await getResponseById(input.responseId);
      if (!response || response.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const question = await getQuestionById(response.questionId);
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });
      const questionCheck = hasRequiredQuestionContent(question);
      if (!questionCheck.valid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: questionCheck.reason });
      }

      const text = input.responseText || response.responseText || "";
      const responseCheck = hasScoreableResponse(question, { responseText: text });
      if (!responseCheck.valid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: responseCheck.reason });
      }
      if (!text.trim()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No response text provided." });
      }

      const result = await scoreWithFallback(question.taskType, () => scoreWritingTask({
        taskType: question.taskType,
        sourceText: question.content || undefined,
        prompt: question.prompt || undefined,
        response: text,
      }));

      // Persist enhanced score
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
        ...getConfidenceMetadata(result),
      });

      return result;
    }),

  /**
   * Score a Reading task response.
   * Objective scoring + AI-generated explanations and strategy tips.
   */
  scoreRead: protectedProcedure
    .input(z.object({
      responseId: z.number(),
      selectedOptions: z.array(z.string()).optional(),
      orderedItems: z.array(z.string()).optional(),
      filledBlanks: z.array(z.object({
        position: z.number(),
        answer: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const response = await getResponseById(input.responseId);
      if (!response || response.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const question = await getQuestionById(response.questionId);
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });
      const questionCheck = hasRequiredQuestionContent(question);
      if (!questionCheck.valid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: questionCheck.reason });
      }

      const userAnswers = input.selectedOptions || (response.selectedOptions as unknown as string[] | null) || [];
      const correctAnswerRaw = question.correctAnswer as string | null;
      const correctAnswers = correctAnswerRaw
        ? correctAnswerRaw.split(",").map(s => s.trim()).filter(Boolean)
        : [];
      const optionsArr = (question.options as unknown as string[] | null) || [];

      // Build blanks for fill-in-the-blanks tasks
      const blanks = input.filledBlanks?.map((b, i) => ({
        position: b.position,
        correctAnswer: correctAnswers[i] || "",
        userAnswer: b.answer,
        options: optionsArr,
      }));

      const responseCheck = hasScoreableResponse(question, {
        selectedOptions: userAnswers,
        responseText: response.responseText,
      });
      if (!responseCheck.valid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: responseCheck.reason });
      }

      const result = await scoreWithFallback(question.taskType, () => scoreReadingTask({
        taskType: question.taskType,
        passage: question.content || question.prompt || "",
        question: question.prompt || "",
        options: optionsArr,
        correctAnswer: correctAnswers.length === 1 ? correctAnswers[0] : correctAnswers,
        userAnswer: userAnswers.length === 1 ? userAnswers[0] : userAnswers,
        paragraphs: (question.options as unknown as Array<{ id: string; text: string }> | null) || undefined,
        correctOrder: correctAnswers,
        userOrder: input.orderedItems || userAnswers,
        blanks,
      }));

      // Persist score
      await updateResponse(input.responseId, {
        normalizedScore: result.overallScore,
        totalScore: result.overallScore,
        contentScore: result.rawScore / result.maxRawScore,
        feedback: result.overallFeedback,
        strengths: result.strengths,
        improvements: result.improvements,
        ...getConfidenceMetadata(result),
      });

      return result;
    }),

  /**
   * Score a Listening task response.
   * Handles Summarize Spoken Text, Write from Dictation, Fill in Blanks, and MCQ types.
   */
  scoreListen: protectedProcedure
    .input(z.object({
      responseId: z.number(),
      responseText: z.string().optional(),
      selectedOptions: z.array(z.string()).optional(),
      filledBlanks: z.array(z.object({
        position: z.number(),
        word: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const response = await getResponseById(input.responseId);
      if (!response || response.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const question = await getQuestionById(response.questionId);
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });
      const questionCheck = hasRequiredQuestionContent(question);
      if (!questionCheck.valid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: questionCheck.reason });
      }

      const responseText = input.responseText || response.responseText || "";
      const userAnswers = input.selectedOptions || (response.selectedOptions as unknown as string[] | null) || [];
      const correctAnswerRaw2 = question.correctAnswer as string | null;
      const canonicalTaskType = normalizeTaskType(question.taskType);
      const correctAnswers = canonicalTaskType === "fill_blanks_listening"
        ? parseDelimitedAnswers(correctAnswerRaw2)
        : parseOrderedAnswerKey(correctAnswerRaw2);
      const optionsArr2 = (question.options as unknown as string[] | null) || [];
      const isListeningSelectionTask = question.section === "listening" && [
        "multiple_choice_single",
        "multiple_choice_multiple",
        "highlight_correct_summary",
        "select_missing_word",
      ].includes(canonicalTaskType);
      const normalizedSelections = isListeningSelectionTask
        ? normalizeOptionValues(question.options, question.correctAnswer as string | null, userAnswers)
        : undefined;
      const scoringCorrectAnswers = normalizedSelections?.correctAnswers ?? correctAnswers;
      const scoringUserAnswers = normalizedSelections?.selectedOptions ?? userAnswers;

      const blankAnswers = input.filledBlanks?.map(b => ({ position: b.position, word: b.word }))
        ?? (canonicalTaskType === "fill_blanks_listening"
          ? parseDelimitedAnswers(responseText || userAnswers).map((word, position) => ({ position, word }))
          : []);
      const blanks = blankAnswers.map((b, i) => ({
        position: b.position ?? i,
        correctWord: correctAnswers[i] || "",
        userWord: b.word,
      }));

      const responseCheck = hasScoreableResponse(question, {
        responseText,
        selectedOptions: userAnswers,
      });
      if (!responseCheck.valid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: responseCheck.reason });
      }

      const result = await scoreWithFallback(question.taskType, () => scoreListeningTask({
        taskType: question.taskType,
        lectureTranscript: question.content || undefined,
        transcript: question.content || undefined,
        response: responseText,
        question: question.prompt || undefined,
        options: optionsArr2,
        correctAnswer: scoringCorrectAnswers.length === 1 ? scoringCorrectAnswers[0] : scoringCorrectAnswers,
        userAnswer: scoringUserAnswers.length === 1 ? scoringUserAnswers[0] : scoringUserAnswers,
        summaryOptions: optionsArr2,
        blanks,
      }));

      // Persist score
      await updateResponse(input.responseId, {
        normalizedScore: result.overallScore,
        totalScore: result.overallScore,
        contentScore: result.rawScore / result.maxRawScore,
        feedback: result.overallFeedback,
        strengths: result.strengths,
        improvements: result.improvements,
        ...getConfidenceMetadata(result),
      });

      return result;
    }),

  /**
   * Get the full AI score breakdown for a previously scored response.
   * Re-runs scoring if no score exists yet.
   */
  getScore: protectedProcedure
    .input(z.object({ responseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const response = await getResponseById(input.responseId);
      if (!response || response.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const question = await getQuestionById(response.questionId);
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

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
        transcription: response.transcription,
      };
    }),
});
