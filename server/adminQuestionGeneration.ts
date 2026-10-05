import { z } from "zod";

const generatedQuestionSchema = z.object({
  title: z.string().trim().min(1).max(255),
  prompt: z.string().default(""),
  content: z.string().default(""),
  correctAnswer: z.union([z.string(), z.array(z.unknown()), z.record(z.string(), z.unknown())]).default(""),
  modelAnswer: z.string().default(""),
  options: z.array(z.object({
    id: z.string().trim().min(1),
    text: z.string().trim().min(1),
    correct: z.boolean().default(false),
  })).default([]),
  timeLimit: z.number().int().min(0).max(3600).default(30),
  preparationTime: z.number().int().min(0).max(3600).default(0),
  wordLimit: z.number().int().min(1).max(5000).nullable().default(null),
  audioUrl: z.string().url().nullable().default(null),
  imageUrl: z.string().url().nullable().default(null),
});

type RawGeneratedQuestionDraft = z.infer<typeof generatedQuestionSchema>;
export type GeneratedQuestionDraft = Omit<RawGeneratedQuestionDraft, "correctAnswer"> & { correctAnswer: string };

function serializeAnswer(answer: RawGeneratedQuestionDraft["correctAnswer"]): string {
  if (typeof answer === "string") return answer;
  return JSON.stringify(answer);
}

function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => typeof part === "string" ? part : (part && typeof part === "object" && "text" in part ? String(part.text) : ""))
      .join("");
  }
  return "";
}

function stripJsonMarkdown(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

export function parseGeneratedQuestion(content: unknown): GeneratedQuestionDraft {
  const text = stripJsonMarkdown(extractText(content));
  if (!text) throw new Error("The AI returned an empty question.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
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

export const generatedQuestionResponseSchema = {
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
          correct: { type: "boolean" },
        },
        required: ["id", "text", "correct"],
        additionalProperties: false,
      },
    },
    timeLimit: { type: "integer", minimum: 0, maximum: 3600 },
    preparationTime: { type: "integer", minimum: 0, maximum: 3600 },
    wordLimit: { type: ["integer", "null"], minimum: 1, maximum: 5000 },
    audioUrl: { type: ["string", "null"] },
    imageUrl: { type: ["string", "null"] },
  },
  required: ["title", "prompt", "content", "correctAnswer", "modelAnswer", "options", "timeLimit", "preparationTime", "wordLimit", "audioUrl", "imageUrl"],
  additionalProperties: false,
} as const;
