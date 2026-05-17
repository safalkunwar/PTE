import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { questions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";

export const adminRouter = router({
  // Upload questions from CSV
  uploadQuestionsCSV: adminProcedure
    .input(z.object({
      file: z.string(),
      section: z.enum(["speaking", "writing", "reading", "listening"]),
      taskType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const lines = input.file.split("\n").filter(line => line.trim());
      if (lines.length < 2) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "CSV file must have headers and at least one row" });
      }

      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const titleIdx = headers.indexOf("title");
      const promptIdx = headers.indexOf("prompt");
      const contentIdx = headers.indexOf("content");
      const difficultyIdx = headers.indexOf("difficulty");
      const correctAnswerIdx = headers.indexOf("correct_answer");
      const optionsIdx = headers.indexOf("options");

      if (titleIdx === -1) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "CSV must have a 'title' column" });
      }

      const insertedQuestions = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim());
        if (values.length < 2) continue;

        const questionData = {
          section: input.section,
          taskType: input.taskType,
          title: values[titleIdx] || `Question ${i}`,
          prompt: promptIdx !== -1 ? values[promptIdx] : undefined,
          content: contentIdx !== -1 ? values[contentIdx] : undefined,
          difficulty: (difficultyIdx !== -1 ? values[difficultyIdx] : "medium") as "easy" | "medium" | "hard",
          correctAnswer: correctAnswerIdx !== -1 ? values[correctAnswerIdx] : undefined,
          options: optionsIdx !== -1 ? JSON.parse(values[optionsIdx]) : undefined,
          timeLimit: 30,
          preparationTime: 0,
          createdAt: new Date(),
        };

        const result = await db.insert(questions).values(questionData);
        insertedQuestions.push(result);
      }

      return { success: true, count: insertedQuestions.length };
    }),

  // Generate questions using AI
  generateQuestionsAI: adminProcedure
    .input(z.object({
      section: z.enum(["speaking", "writing", "reading", "listening"]),
      taskType: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      count: z.number().min(1).max(20),
    }))
    .mutation(async ({ input }) => {
      const generatedQuestions = [];

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      for (let i = 0; i < input.count; i++) {
        const prompt = `Generate a ${input.difficulty} difficulty PTE Academic ${input.taskType.replace(/_/g, " ")} question for the ${input.section} section. 
        
        Return a JSON object with these fields:
        - title: Brief title for the question
        - prompt: Instructions for the test taker
        - content: The main content/passage/scenario
        - correctAnswer: The correct answer (for objective tasks)
        - timeLimit: Time limit in seconds
        - preparationTime: Preparation time in seconds
        
        Format the response as valid JSON only, no markdown.`;

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a PTE Academic test expert. Generate realistic and challenging practice questions."
              },
              {
                role: "user",
                content: prompt
              }
            ]
          });

          const content = response.choices[0]?.message?.content as string;
          const questionData = JSON.parse(content);

          const insertData = {
            section: input.section,
            taskType: input.taskType,
            difficulty: input.difficulty,
            title: questionData.title || `Generated ${input.taskType} ${i + 1}`,
            prompt: questionData.prompt,
            content: questionData.content,
            correctAnswer: questionData.correctAnswer,
            timeLimit: questionData.timeLimit || 30,
            preparationTime: questionData.preparationTime || 0,
            createdAt: new Date(),
          };

          await db.insert(questions).values(insertData);
          generatedQuestions.push(insertData);
        } catch (error) {
          console.error(`Failed to generate question ${i + 1}:`, error);
        }
      }

      return { success: true, count: generatedQuestions.length };
    }),

  // Delete a question
  deleteQuestion: adminProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const result = await db
        .delete(questions)
        .where(eq(questions.id, input.questionId));

      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
      }

      return { success: true };
    }),

  // Get questions by task type
  getByTaskType: protectedProcedure
    .input(z.object({ taskType: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const results = await db
        .select()
        .from(questions)
        .where(eq(questions.taskType, input.taskType));

      return results;
    }),
});
