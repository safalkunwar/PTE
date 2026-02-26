/**
 * Reading AI Scoring Engine
 *
 * Built on official Pearson PTE Academic scoring criteria (Score Guide v21, Nov 2024).
 * Reading tasks are primarily objectively scored (correct/incorrect or partial credit).
 * This engine adds explanation generation and strategy coaching on top of objective scoring.
 *
 * Task types covered:
 *   - Reading & Writing: Fill in the Blanks  → Partial credit (1 per correct blank)
 *   - Multiple Choice (Multiple Answers)      → Partial credit (+1 correct, -1 incorrect)
 *   - Re-order Paragraphs                     → Partial credit (1 per correct adjacent pair)
 *   - Reading: Fill in the Blanks             → Partial credit (1 per correct blank)
 *   - Multiple Choice (Single Answer)         → Correct/incorrect (1 or 0)
 */

import { invokeLLM } from "../_core/llm";

// ─── Official PTE Reading Scoring Rules ───────────────────────────────────────
const READING_SCORING_RULES = `
READING SCORING RULES (Official Pearson PTE Academic, Score Guide v21, Nov 2024)

Reading & Writing: Fill in the Blanks (5-6 items):
  Scoring: Partial credit — 1 point for each correctly completed blank.
  Minimum score: 0. No negative marking.
  Skills assessed: Reading AND Writing.

Multiple Choice, Choose Multiple Answers (1-2 items):
  Scoring: Partial credit — +1 for each correct option selected, -1 for each incorrect option.
  Minimum score: 0 (cannot go below 0).
  Skills assessed: Reading.

Re-order Paragraphs (2-3 items):
  Scoring: Partial credit — 1 point for each correctly ordered ADJACENT PAIR of text boxes.
  Example: If correct order is [A,B,C,D] and test taker answers [A,C,B,D]:
    Adjacent pairs in answer: (A,C), (C,B), (B,D)
    Correct adjacent pairs: (A,B)=No, (B,C)=No, (C,D)=No → but (A,C) no, (C,B) no, (B,D) no
    Actually: check if each consecutive pair in the answer matches a consecutive pair in the correct order.
  Minimum score: 0.
  Skills assessed: Reading.

Reading: Fill in the Blanks (4-5 items):
  Scoring: Partial credit — 1 point for each correctly completed blank.
  Minimum score: 0.
  Skills assessed: Reading.

Multiple Choice, Choose Single Answer (1-2 items):
  Scoring: Correct/incorrect — 1 point if correct, 0 if incorrect.
  Skills assessed: Reading.
`;

// ─── Reading Strategy Coaching by CEFR Level ─────────────────────────────────
const READING_STRATEGY_COACHING = `
READING STRATEGY COACHING BY CEFR LEVEL

C2/C1 — Advanced Strategies:
  - Skim for global meaning, scan for specific information simultaneously.
  - Use discourse markers (however, furthermore, consequently) to identify text structure.
  - Infer meaning from context for unknown vocabulary.
  - For FIB: consider collocation patterns and register consistency.
  - For Re-order: look for pronoun references, topic sentences, and logical connectors.

B2 — Upper-Intermediate Strategies:
  - Read topic sentences of each paragraph to get the main idea.
  - For MCQ: eliminate obviously wrong options first, then compare remaining.
  - For FIB: check grammatical fit (noun/verb/adjective) before semantic fit.
  - For Re-order: identify the introduction (no pronoun reference to preceding text).

B1 — Intermediate Strategies:
  - Focus on key words in the question to guide reading.
  - For MCQ: re-read the relevant paragraph before choosing.
  - For FIB: try each option in the blank and read the whole sentence aloud.
  - For Re-order: look for time markers (first, then, finally) and cause-effect language.
`;

export interface ReadingScoreResult {
  taskType: string;
  overallScore: number; // 10-90 PTE scale
  rawScore: number;
  maxRawScore: number;
  correctAnswers: string[];
  userAnswers: string[];
  explanation: string; // Why each answer is correct/incorrect
  cefrLevel: string;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  strategyTips: string[];
}

/**
 * Score Reading & Writing Fill in the Blanks.
 * Each blank: 1 point if correct, 0 if wrong.
 */
export async function scoreReadingFillBlanks(params: {
  passage: string;
  blanks: Array<{ position: number; correctAnswer: string; userAnswer: string; options: string[] }>;
  taskType: "reading_fill_blanks" | "reading_writing_fill_blanks";
}): Promise<ReadingScoreResult> {
  const { passage, blanks, taskType } = params;

  const rawScore = blanks.filter(b =>
    b.userAnswer.toLowerCase().trim() === b.correctAnswer.toLowerCase().trim()
  ).length;
  const maxRawScore = blanks.length;
  const pteScore = Math.round(10 + (rawScore / maxRawScore) * 80);
  const cefrLevel = pteScore >= 85 ? "C2" : pteScore >= 76 ? "C1" : pteScore >= 59 ? "B2" : pteScore >= 43 ? "B1" : pteScore >= 29 ? "A2" : "A1";

  const blankSummary = blanks.map((b, i) =>
    `Blank ${i + 1}: Correct="${b.correctAnswer}", User="${b.userAnswer}", Options=[${b.options.join(", ")}], ${b.userAnswer.toLowerCase() === b.correctAnswer.toLowerCase() ? "✓ CORRECT" : "✗ WRONG"}`
  ).join("\n");

  const prompt = `You are an expert PTE Academic examiner.
Analyze this Fill in the Blanks reading response and provide detailed explanations.

TASK TYPE: ${taskType === "reading_writing_fill_blanks" ? "Reading & Writing: Fill in the Blanks" : "Reading: Fill in the Blanks"}
PASSAGE: "${passage}"

BLANK RESULTS:
${blankSummary}

SCORE: ${rawScore}/${maxRawScore} (PTE: ${pteScore}/90, CEFR: ${cefrLevel})

${READING_SCORING_RULES}
${READING_STRATEGY_COACHING}

For each INCORRECT blank, explain:
1. Why the correct answer is right (grammatical fit, semantic fit, collocation, context clues).
2. Why the user's answer is wrong.
3. What vocabulary/grammar knowledge would help.

Respond ONLY with valid JSON:
{
  "taskType": "${taskType}",
  "overallScore": ${pteScore},
  "rawScore": ${rawScore},
  "maxRawScore": ${maxRawScore},
  "correctAnswers": [${blanks.map(b => `"${b.correctAnswer}"`).join(", ")}],
  "userAnswers": [${blanks.map(b => `"${b.userAnswer}"`).join(", ")}],
  "explanation": "<detailed explanation of each blank, especially incorrect ones>",
  "cefrLevel": "${cefrLevel}",
  "overallFeedback": "<2-3 sentence assessment of reading comprehension and vocabulary>",
  "strengths": ["<what the user did well>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>"],
  "strategyTips": ["<strategy tip 1>", "<strategy tip 2>"]
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are a certified PTE Academic examiner. Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "fill_blanks_score",
        strict: true,
        schema: {
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
            strategyTips: { type: "array", items: { type: "string" } },
          },
          required: ["taskType", "overallScore", "rawScore", "maxRawScore", "correctAnswers", "userAnswers", "explanation", "cefrLevel", "overallFeedback", "strengths", "improvements", "strategyTips"],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response.choices[0].message.content as string) as ReadingScoreResult;
}

/**
 * Score Multiple Choice (Single Answer).
 * 1 point if correct, 0 if wrong.
 */
export async function scoreMultipleChoiceSingle(params: {
  passage: string;
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
}): Promise<ReadingScoreResult> {
  const { passage, question, options, correctAnswer, userAnswer } = params;

  const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  const rawScore = isCorrect ? 1 : 0;
  const pteScore = isCorrect ? 90 : 10;
  const cefrLevel = isCorrect ? "C1" : "B1";

  const prompt = `You are an expert PTE Academic examiner.
Analyze this Multiple Choice (Single Answer) reading response.

PASSAGE: "${passage}"
QUESTION: "${question}"
OPTIONS: ${options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(", ")}
CORRECT ANSWER: "${correctAnswer}"
USER ANSWER: "${userAnswer}"
RESULT: ${isCorrect ? "CORRECT ✓" : "INCORRECT ✗"}

${READING_SCORING_RULES}
${READING_STRATEGY_COACHING}

Explain:
1. Why the correct answer is right (cite specific evidence from the passage).
2. If wrong, why the user's answer is incorrect and what distractor trap they fell into.
3. What reading skill this question tests (main idea, detail, inference, vocabulary, etc.).

Respond ONLY with valid JSON:
{
  "taskType": "multiple_choice_single",
  "overallScore": ${pteScore},
  "rawScore": ${rawScore},
  "maxRawScore": 1,
  "correctAnswers": ["${correctAnswer}"],
  "userAnswers": ["${userAnswer}"],
  "explanation": "<detailed explanation with passage evidence>",
  "cefrLevel": "${cefrLevel}",
  "overallFeedback": "<assessment of reading comprehension skill demonstrated>",
  "strengths": ${isCorrect ? '["Correctly identified the answer"]' : '[]'},
  "improvements": ${!isCorrect ? '["<what to look for next time>"]' : '[]'},
  "strategyTips": ["<strategy tip for this question type>"]
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are a certified PTE Academic examiner. Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "mcq_single_score",
        strict: true,
        schema: {
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
            strategyTips: { type: "array", items: { type: "string" } },
          },
          required: ["taskType", "overallScore", "rawScore", "maxRawScore", "correctAnswers", "userAnswers", "explanation", "cefrLevel", "overallFeedback", "strengths", "improvements", "strategyTips"],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response.choices[0].message.content as string) as ReadingScoreResult;
}

/**
 * Score Multiple Choice (Multiple Answers).
 * +1 for each correct option, -1 for each incorrect option. Minimum 0.
 */
export async function scoreMultipleChoiceMultiple(params: {
  passage: string;
  question: string;
  options: string[];
  correctAnswers: string[];
  userAnswers: string[];
}): Promise<ReadingScoreResult> {
  const { passage, question, options, correctAnswers, userAnswers } = params;

  let rawScore = 0;
  for (const ua of userAnswers) {
    if (correctAnswers.some(ca => ca.toLowerCase().trim() === ua.toLowerCase().trim())) {
      rawScore += 1;
    } else {
      rawScore -= 1;
    }
  }
  rawScore = Math.max(0, rawScore);
  const maxRawScore = correctAnswers.length;
  const pteScore = Math.round(10 + (rawScore / maxRawScore) * 80);
  const cefrLevel = pteScore >= 85 ? "C2" : pteScore >= 76 ? "C1" : pteScore >= 59 ? "B2" : pteScore >= 43 ? "B1" : "A2";

  const prompt = `You are an expert PTE Academic examiner.
Analyze this Multiple Choice (Multiple Answers) reading response.

PASSAGE: "${passage}"
QUESTION: "${question}"
OPTIONS: ${options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join("; ")}
CORRECT ANSWERS: [${correctAnswers.join(", ")}]
USER ANSWERS: [${userAnswers.join(", ")}]
SCORING: +1 correct, -1 incorrect, minimum 0
RAW SCORE: ${rawScore}/${maxRawScore}

${READING_SCORING_RULES}
${READING_STRATEGY_COACHING}

Explain each option: why it is correct or incorrect, citing passage evidence.
Note any negative marking penalties the user incurred.

Respond ONLY with valid JSON:
{
  "taskType": "multiple_choice_multiple",
  "overallScore": ${pteScore},
  "rawScore": ${rawScore},
  "maxRawScore": ${maxRawScore},
  "correctAnswers": [${correctAnswers.map(a => `"${a}"`).join(", ")}],
  "userAnswers": [${userAnswers.map(a => `"${a}"`).join(", ")}],
  "explanation": "<explanation of each option with passage evidence>",
  "cefrLevel": "${cefrLevel}",
  "overallFeedback": "<assessment including negative marking strategy>",
  "strengths": ["<what user got right>"],
  "improvements": ["<what to avoid>", "<negative marking strategy>"],
  "strategyTips": ["<tip about negative marking>", "<tip about eliminating distractors>"]
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are a certified PTE Academic examiner. Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "mcq_multiple_score",
        strict: true,
        schema: {
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
            strategyTips: { type: "array", items: { type: "string" } },
          },
          required: ["taskType", "overallScore", "rawScore", "maxRawScore", "correctAnswers", "userAnswers", "explanation", "cefrLevel", "overallFeedback", "strengths", "improvements", "strategyTips"],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response.choices[0].message.content as string) as ReadingScoreResult;
}

/**
 * Score Re-order Paragraphs.
 * 1 point per correctly ordered adjacent pair.
 */
export async function scoreReorderParagraphs(params: {
  paragraphs: Array<{ id: string; text: string }>;
  correctOrder: string[];
  userOrder: string[];
}): Promise<ReadingScoreResult> {
  const { paragraphs, correctOrder, userOrder } = params;

  // Calculate adjacent pair score
  let rawScore = 0;
  for (let i = 0; i < userOrder.length - 1; i++) {
    const userPair = `${userOrder[i]}-${userOrder[i + 1]}`;
    for (let j = 0; j < correctOrder.length - 1; j++) {
      if (`${correctOrder[j]}-${correctOrder[j + 1]}` === userPair) {
        rawScore++;
        break;
      }
    }
  }
  const maxRawScore = correctOrder.length - 1;
  const pteScore = Math.round(10 + (rawScore / maxRawScore) * 80);
  const cefrLevel = pteScore >= 85 ? "C2" : pteScore >= 76 ? "C1" : pteScore >= 59 ? "B2" : pteScore >= 43 ? "B1" : "A2";

  const paragraphTexts = paragraphs.map(p => `[${p.id}]: "${p.text.substring(0, 100)}..."`).join("\n");

  const prompt = `You are an expert PTE Academic examiner.
Analyze this Re-order Paragraphs reading response.

PARAGRAPHS:
${paragraphTexts}

CORRECT ORDER: [${correctOrder.join(" → ")}]
USER ORDER: [${userOrder.join(" → ")}]
ADJACENT PAIR SCORE: ${rawScore}/${maxRawScore}

${READING_SCORING_RULES}
${READING_STRATEGY_COACHING}

Explain:
1. Why the correct order is logical (discourse markers, pronoun references, topic flow).
2. Which adjacent pairs the user got right and wrong.
3. What clues in the text indicate the correct sequence.

Respond ONLY with valid JSON:
{
  "taskType": "reorder_paragraphs",
  "overallScore": ${pteScore},
  "rawScore": ${rawScore},
  "maxRawScore": ${maxRawScore},
  "correctAnswers": [${correctOrder.map(o => `"${o}"`).join(", ")}],
  "userAnswers": [${userOrder.map(o => `"${o}"`).join(", ")}],
  "explanation": "<explanation of correct order with discourse clues>",
  "cefrLevel": "${cefrLevel}",
  "overallFeedback": "<assessment of text structure comprehension>",
  "strengths": ["<correctly ordered pairs>"],
  "improvements": ["<what clues were missed>"],
  "strategyTips": ["<tip about discourse markers>", "<tip about pronoun references>"]
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are a certified PTE Academic examiner. Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "reorder_score",
        strict: true,
        schema: {
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
            strategyTips: { type: "array", items: { type: "string" } },
          },
          required: ["taskType", "overallScore", "rawScore", "maxRawScore", "correctAnswers", "userAnswers", "explanation", "cefrLevel", "overallFeedback", "strengths", "improvements", "strategyTips"],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response.choices[0].message.content as string) as ReadingScoreResult;
}

/**
 * Main dispatcher for reading tasks.
 */
export async function scoreReadingTask(params: {
  taskType: string;
  passage?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string | string[];
  userAnswer?: string | string[];
  paragraphs?: Array<{ id: string; text: string }>;
  correctOrder?: string[];
  userOrder?: string[];
  blanks?: Array<{ position: number; correctAnswer: string; userAnswer: string; options: string[] }>;
}): Promise<ReadingScoreResult> {
  const { taskType } = params;

  switch (taskType) {
    case "reading_fill_blanks":
    case "reading_writing_fill_blanks":
      return scoreReadingFillBlanks({
        passage: params.passage || "",
        blanks: params.blanks || [],
        taskType: taskType as "reading_fill_blanks" | "reading_writing_fill_blanks",
      });

    case "multiple_choice_single":
      return scoreMultipleChoiceSingle({
        passage: params.passage || "",
        question: params.question || "",
        options: params.options || [],
        correctAnswer: (Array.isArray(params.correctAnswer) ? params.correctAnswer[0] : params.correctAnswer) || "",
        userAnswer: (Array.isArray(params.userAnswer) ? params.userAnswer[0] : params.userAnswer) || "",
      });

    case "multiple_choice_multiple":
      return scoreMultipleChoiceMultiple({
        passage: params.passage || "",
        question: params.question || "",
        options: params.options || [],
        correctAnswers: Array.isArray(params.correctAnswer) ? params.correctAnswer : [params.correctAnswer || ""],
        userAnswers: Array.isArray(params.userAnswer) ? params.userAnswer : [params.userAnswer || ""],
      });

    case "reorder_paragraphs":
      return scoreReorderParagraphs({
        paragraphs: params.paragraphs || [],
        correctOrder: params.correctOrder || [],
        userOrder: params.userOrder || [],
      });

    default:
      return scoreMultipleChoiceSingle({
        passage: params.passage || "",
        question: params.question || "",
        options: params.options || [],
        correctAnswer: (Array.isArray(params.correctAnswer) ? params.correctAnswer[0] : params.correctAnswer) || "",
        userAnswer: (Array.isArray(params.userAnswer) ? params.userAnswer[0] : params.userAnswer) || "",
      });
  }
}
