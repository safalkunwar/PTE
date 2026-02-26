/**
 * Writing AI Scoring Engine
 *
 * Built on official Pearson PTE Academic scoring rubrics (Score Guide v21, Nov 2024).
 * Calibrated with multi-level native speaker reference responses at B1, B2, C1, C2.
 *
 * Task types covered:
 *   - Summarize Written Text → Content (0-2), Form (0-2), Grammar (0-2), Vocabulary (0-2)
 *   - Write Essay            → Content (0-3), Form (0-2), Development/Structure/Coherence (0-2),
 *                              Grammar (0-2), General Linguistic Range (0-2),
 *                              Vocabulary Range (0-2), Spelling (0-2)
 */

import { invokeLLM } from "../_core/llm";

// ─── Official PTE Writing Rubrics ─────────────────────────────────────────────

const SUMMARIZE_WRITTEN_TEXT_RUBRIC = `
SUMMARIZE WRITTEN TEXT — OFFICIAL PEARSON SCORING CRITERIA (Score Guide v21, Nov 2024)

FORM (0-2):
  Score 2: Is written in one, single, complete sentence.
  Score 1: (Not applicable — form is binary for SWT)
  Score 0: Not written in one single, complete sentence OR contains fewer than 5 or more than 75 words.
           Summary is written in capital letters.

CONTENT (0-2):
  Score 2: Provides a good summary of the text. All relevant aspects mentioned.
  Score 1: Provides a fair summary of the text but misses one or two aspects.
  Score 0: Omits or misrepresents the main aspects of the text.

GRAMMAR (0-2):
  Score 2: Has correct grammatical structure.
  Score 1: Contains grammatical errors but with no hindrance to communication.
  Score 0: Has defective grammatical structure which could hinder communication.

VOCABULARY (0-2):
  Score 2: Has appropriate choice of words.
  Score 1: Contains lexical errors but with no hindrances to communication.
  Score 0: Has defective word choice which could hinder communication.

IMPORTANT: If the response scores 0 for Form, the entire response scores 0.
Maximum raw score: 8 points (Form 2 + Content 2 + Grammar 2 + Vocabulary 2).
`;

const WRITE_ESSAY_RUBRIC = `
WRITE ESSAY — OFFICIAL PEARSON SCORING CRITERIA (Score Guide v21, Nov 2024)

CONTENT (0-3):
  Score 3: Adequately deals with the prompt.
  Score 2: Deals with the prompt but does not deal with one minor aspect.
  Score 1: Deals with the prompt but omits a major aspect or more than one minor aspect.
  Score 0: Does not deal properly with the prompt. Includes responses with significant
           pre-prepared/memorized material.

FORM (0-2):
  Score 2: Length is between 200 and 300 words.
  Score 1: Length is between 120-199 or 301-380 words.
  Score 0: Length is less than 120 or more than 380 words. Essay written in capital letters,
           contains no punctuation, or only consists of bullet points or very short sentences.

DEVELOPMENT, STRUCTURE AND COHERENCE (0-2):
  Score 2: Shows good development and logical structure.
  Score 1: Is incidentally less well structured; some elements or paragraphs are poorly linked.
  Score 0: Lacks coherence and mainly consists of lists or loose elements.

GRAMMAR (0-2):
  Score 2: Shows consistent grammatical control of complex language. Errors are rare and difficult to spot.
  Score 1: Shows a relatively high degree of grammatical control. No mistakes which would lead to misunderstandings.
  Score 0: Contains mainly simple structures and/or several basic mistakes.

GENERAL LINGUISTIC RANGE (0-2):
  Score 2: Exhibits mastery of a wide range of language to formulate thoughts precisely, give emphasis,
           differentiate and eliminate ambiguity. No sign that the test taker is restricted.
  Score 1: Sufficient range of language to provide clear descriptions, express viewpoints and develop arguments.
  Score 0: Contains mainly basic language and lacks precision.

VOCABULARY RANGE (0-2):
  Score 2: Good command of a broad lexical repertoire, idiomatic expressions and colloquialisms.
  Score 1: Shows a good range of vocabulary for matters connected to general academic topics.
           Lexical shortcomings lead to circumlocution or some imprecision.
  Score 0: Contains mainly basic vocabulary insufficient to deal with the topic at the required level.

SPELLING (0-2):
  Score 2: Correct spelling throughout.
  Score 1: One spelling error.
  Score 0: More than one spelling error.

IMPORTANT: If the response scores 0 for Content OR Form, the entire response scores 0.
Maximum raw score: 15 points.
`;

// ─── Multi-level Native Speaker Calibration Anchors ──────────────────────────
/**
 * Calibration data drawn from:
 *   1. Pearson PTE Score Guide v21 — official B1/B2/C1 essay samples with human rater scores
 *   2. Pearson Language Testing division commentary on each sample
 *   3. Native English speaker (C2) baseline characteristics
 */
const WRITING_CALIBRATION_ANCHORS = `
MULTI-LEVEL NATIVE SPEAKER CALIBRATION ANCHORS FOR WRITING

C2 / Native Speaker Baseline (PTE ~85-90, raw essay score ~14-15/15):
  Content: 3 — Fully addresses all aspects of the prompt with sophisticated argumentation.
  Form: 2 — 200-300 words, perfectly structured.
  Development: 2 — Masterful organization, seamless transitions, compelling logical flow.
  Grammar: 2 — Zero grammatical errors, complex sentence structures used naturally.
  Linguistic Range: 2 — Exceptional vocabulary, idiomatic expressions, precise word choice.
  Vocabulary: 2 — Academic vocabulary, collocations, no circumlocution.
  Spelling: 2 — Perfect spelling.
  Characteristics: "Reads like a native academic writer. Sophisticated argument structure,
    varied sentence types, precise academic vocabulary, zero errors."

C1 Level (PTE ~76-84, raw essay score ~11-13/15):
  Content: 2-3 — Addresses the prompt well, covers most aspects.
  Form: 2 — Appropriate length.
  Development: 2 — Good structure, logical paragraphing, appropriate transitions.
  Grammar: 2 — Rare errors, complex language controlled.
  Linguistic Range: 2 — Wide range, no communication restrictions.
  Vocabulary: 1-2 — Good academic vocabulary, minor imprecision.
  Spelling: 1-2 — At most one spelling error.
  Example (C1, Tobacco essay, from Pearson Score Guide):
    "Clear, well-structured exposition on the topic which touches upon the relevant issues.
     Points of view are given at some length with subsidiary points. Reasons and relevant
     examples are demonstrated. General linguistic range and vocabulary range are excellent.
     Phrasing and word choice are appropriate. Very few grammar errors. Spelling is excellent."
    Machine scores: Content 2.74, DSC 1.97, Form 2.00, GLR 2.00, Grammar 1.70, Spelling 1.00, Vocab 1.82
    Total: 13.23/15

B2 Level (PTE ~59-75, raw essay score ~8-10/15):
  Content: 2-3 — Systematic argument, highlights significant points, relevant supporting detail.
  Form: 2 — Appropriate length.
  Development: 1-2 — Structured but some weak links between paragraphs.
  Grammar: 1 — Some obvious errors, no misunderstandings.
  Linguistic Range: 1 — Sufficient range but some imprecision.
  Vocabulary: 1 — Good range but some inappropriate choices.
  Spelling: 0 — Multiple spelling errors.
  Example (B2, Tobacco essay, from Pearson Score Guide):
    "A systematic argument with appropriate highlighting of significant points and relevant
     supporting detail. Ability to evaluate different ideas demonstrated. However, some
     obvious grammar errors and inappropriate use of vocabulary. Quite a number of spelling errors."
    Machine scores: Content 2.25, DSC 1.17, Form 2.00, GLR 1.42, Grammar 1.68, Spelling 0.00, Vocab 1.32
    Total: 9.84/15

B1 Level (PTE ~43-58, raw essay score ~5-7/15):
  Content: 1-2 — Simple essay, minimal answer, insufficient supporting ideas.
  Form: 2 — Appropriate length.
  Development: 0-1 — Lacking logic and coherence.
  Grammar: 1 — Frequent misuse.
  Linguistic Range: 1 — Limited range.
  Vocabulary: 1 — Limited and inappropriate at times.
  Spelling: 0 — Multiple spelling errors.
  Example (B1, Tobacco essay, from Pearson Score Guide):
    "The response is a simple essay which gives a minimal answer to the prompt.
     The argument contains insufficient supporting ideas. The structure is lacking in logic
     and coherence. There is frequent misuse of grammar and vocabulary. Vocabulary range
     is limited and inappropriate at times."
    Machine scores: Content 1.80, DSC 1.35, Form 2.00, GLR 1.03, Grammar 1.07, Spelling 0.00, Vocab 0.93
    Total: 8.18/15

A2 Level (PTE ~29-42, raw essay score ~2-4/15):
  Content: 0-1 — Does not properly address the prompt or very superficial.
  Form: 1-2 — May be too short or too long.
  Development: 0 — No coherent structure.
  Grammar: 0 — Many basic mistakes.
  Linguistic Range: 0 — Basic language only.
  Vocabulary: 0 — Basic vocabulary insufficient for the topic.
  Spelling: 0 — Many spelling errors.
`;

export interface WritingScoreResult {
  taskType: string;
  overallScore: number; // 10-90 PTE scale
  rawScore: number; // raw points out of max
  maxRawScore: number;
  traits: {
    content: { score: number; maxScore: number; feedback: string };
    form: { score: number; maxScore: number; feedback: string };
    grammar: { score: number; maxScore: number; feedback: string };
    vocabulary: { score: number; maxScore: number; feedback: string };
    development?: { score: number; maxScore: number; feedback: string };
    linguisticRange?: { score: number; maxScore: number; feedback: string };
    spelling?: { score: number; maxScore: number; feedback: string };
  };
  wordCount: number;
  cefrLevel: string;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  modelAnswer?: string;
  grammarErrors?: string[];
  vocabularyFeedback?: string;
}

/**
 * Score a Summarize Written Text response.
 * Traits: Form (0-2), Content (0-2), Grammar (0-2), Vocabulary (0-2)
 * Maximum raw score: 8
 */
export async function scoreSummarizeWrittenText(params: {
  sourceText: string;
  response: string;
}): Promise<WritingScoreResult> {
  const { sourceText, response } = params;
  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;

  const prompt = `You are an expert PTE Academic examiner trained on Pearson's official scoring engine.
Score this Summarize Written Text response using the EXACT official Pearson PTE Academic criteria.

TASK: Summarize Written Text
SOURCE TEXT: "${sourceText}"
TEST TAKER RESPONSE: "${response}"
WORD COUNT: ${wordCount} words

${SUMMARIZE_WRITTEN_TEXT_RUBRIC}

${WRITING_CALIBRATION_ANCHORS}

SCORING INSTRUCTIONS:
1. Check Form first: must be ONE complete sentence, 5-75 words. If Form=0, all scores=0.
2. Evaluate Content: how well does it summarize the main points?
3. Evaluate Grammar: sentence structure correctness.
4. Evaluate Vocabulary: appropriateness of word choice.
5. Calculate raw score = Form + Content + Grammar + Vocabulary (max 8).
6. Convert to PTE 10-90 scale: PTE = round(10 + (rawScore/8) × 80)
7. Identify CEFR level.

IMPORTANT: Be strict about the Form requirement — it must be a single complete sentence.
If the response is two sentences, Form = 0 and total = 0.

Respond ONLY with valid JSON:
{
  "taskType": "summarize_written_text",
  "overallScore": <integer 10-90>,
  "rawScore": <integer 0-8>,
  "maxRawScore": 8,
  "wordCount": ${wordCount},
  "traits": {
    "form": { "score": <0 or 2>, "maxScore": 2, "feedback": "<single sentence? word count?>" },
    "content": { "score": <0-2>, "maxScore": 2, "feedback": "<which main points covered/missed>" },
    "grammar": { "score": <0-2>, "maxScore": 2, "feedback": "<specific grammar issues>" },
    "vocabulary": { "score": <0-2>, "maxScore": 2, "feedback": "<word choice assessment>" }
  },
  "cefrLevel": "<A1|A2|B1|B2|C1|C2>",
  "overallFeedback": "<2-3 sentence holistic assessment>",
  "strengths": ["<strength 1>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "grammarErrors": ["<specific grammar error 1>", "<specific grammar error 2>"],
  "vocabularyFeedback": "<vocabulary assessment>",
  "modelAnswer": "<model one-sentence summary at C1 level>"
}`;

  const response_llm = await invokeLLM({
    messages: [
      { role: "system", content: "You are a certified PTE Academic examiner. Return only valid JSON." },
      { role: "user", content: prompt },
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
                form: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                content: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                grammar: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                vocabulary: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
              },
              required: ["form", "content", "grammar", "vocabulary"],
              additionalProperties: false,
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            grammarErrors: { type: "array", items: { type: "string" } },
            vocabularyFeedback: { type: "string" },
            modelAnswer: { type: "string" },
          },
          required: ["taskType", "overallScore", "rawScore", "maxRawScore", "wordCount", "traits", "cefrLevel", "overallFeedback", "strengths", "improvements", "grammarErrors", "vocabularyFeedback", "modelAnswer"],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response_llm.choices[0].message.content as string) as WritingScoreResult;
}

/**
 * Score a Write Essay response.
 * Traits: Content (0-3), Form (0-2), DSC (0-2), Grammar (0-2), GLR (0-2), Vocab (0-2), Spelling (0-2)
 * Maximum raw score: 15
 */
export async function scoreWriteEssay(params: {
  prompt: string;
  response: string;
}): Promise<WritingScoreResult> {
  const { prompt: essayPrompt, response } = params;
  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;

  const llmPrompt = `You are an expert PTE Academic examiner trained on Pearson's official scoring engine.
Score this Write Essay response using the EXACT official Pearson PTE Academic criteria.

ESSAY PROMPT: "${essayPrompt}"
TEST TAKER ESSAY: "${response}"
WORD COUNT: ${wordCount} words

${WRITE_ESSAY_RUBRIC}

${WRITING_CALIBRATION_ANCHORS}

SCORING INSTRUCTIONS:
1. Check Content first: does it address the prompt? If Content=0, total=0.
2. Check Form: is the word count 200-300 (score 2), 120-199 or 301-380 (score 1), or outside (score 0)?
   If Form=0, total=0.
3. Evaluate Development, Structure and Coherence (DSC).
4. Evaluate Grammar.
5. Evaluate General Linguistic Range (GLR).
6. Evaluate Vocabulary Range.
7. Count spelling errors (0=2 points, 1 error=1 point, 2+=0 points).
8. Calculate raw score = Content + Form + DSC + Grammar + GLR + Vocab + Spelling (max 15).
9. Convert to PTE 10-90: PTE = round(10 + (rawScore/15) × 80)
10. Identify CEFR level using the calibration anchors.

Respond ONLY with valid JSON:
{
  "taskType": "write_essay",
  "overallScore": <integer 10-90>,
  "rawScore": <integer 0-15>,
  "maxRawScore": 15,
  "wordCount": ${wordCount},
  "traits": {
    "content": { "score": <0-3>, "maxScore": 3, "feedback": "<does it address the prompt?>" },
    "form": { "score": <0-2>, "maxScore": 2, "feedback": "<word count assessment>" },
    "development": { "score": <0-2>, "maxScore": 2, "feedback": "<structure and coherence assessment>" },
    "grammar": { "score": <0-2>, "maxScore": 2, "feedback": "<grammar assessment with examples>" },
    "linguisticRange": { "score": <0-2>, "maxScore": 2, "feedback": "<language range assessment>" },
    "vocabulary": { "score": <0-2>, "maxScore": 2, "feedback": "<vocabulary range assessment>" },
    "spelling": { "score": <0-2>, "maxScore": 2, "feedback": "<spelling errors found>" }
  },
  "cefrLevel": "<A1|A2|B1|B2|C1|C2>",
  "overallFeedback": "<3-4 sentence holistic assessment comparing to calibration anchors>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "grammarErrors": ["<specific error 1>", "<specific error 2>"],
  "vocabularyFeedback": "<specific vocabulary feedback>",
  "modelAnswer": "<opening paragraph of a C1-level model essay>"
}`;

  const response_llm = await invokeLLM({
    messages: [
      { role: "system", content: "You are a certified PTE Academic examiner. Return only valid JSON." },
      { role: "user", content: llmPrompt },
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
                content: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                form: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                development: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                grammar: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                linguisticRange: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                vocabulary: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
                spelling: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
              },
              required: ["content", "form", "development", "grammar", "linguisticRange", "vocabulary", "spelling"],
              additionalProperties: false,
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            grammarErrors: { type: "array", items: { type: "string" } },
            vocabularyFeedback: { type: "string" },
            modelAnswer: { type: "string" },
          },
          required: ["taskType", "overallScore", "rawScore", "maxRawScore", "wordCount", "traits", "cefrLevel", "overallFeedback", "strengths", "improvements", "grammarErrors", "vocabularyFeedback", "modelAnswer"],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response_llm.choices[0].message.content as string) as WritingScoreResult;
}

/**
 * Main dispatcher for writing tasks.
 */
export async function scoreWritingTask(params: {
  taskType: string;
  sourceText?: string;
  prompt?: string;
  response: string;
}): Promise<WritingScoreResult> {
  switch (params.taskType) {
    case "summarize_written_text":
      return scoreSummarizeWrittenText({
        sourceText: params.sourceText || params.prompt || "",
        response: params.response,
      });
    case "write_essay":
      return scoreWriteEssay({
        prompt: params.prompt || params.sourceText || "",
        response: params.response,
      });
    default:
      return scoreWriteEssay({
        prompt: params.prompt || "",
        response: params.response,
      });
  }
}
