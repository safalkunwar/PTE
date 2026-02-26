/**
 * Listening AI Scoring Engine
 *
 * Built on official Pearson PTE Academic scoring criteria (Score Guide v21, Nov 2024).
 * Calibrated with multi-level reference responses at B1, B2, C1, C2 CEFR levels.
 *
 * Task types covered:
 *   - Summarize Spoken Text     → Content (0-2), Form (0-2), Grammar (0-2), Vocabulary (0-2), Spelling (0-2)
 *   - Multiple Choice (Multiple) → Partial credit (+1/-1, min 0)
 *   - Fill in the Blanks         → Partial credit (1 per correct word spelled correctly)
 *   - Highlight Correct Summary  → Correct/incorrect (1 or 0)
 *   - Multiple Choice (Single)   → Correct/incorrect (1 or 0)
 *   - Select Missing Word        → Correct/incorrect (1 or 0)
 *   - Highlight Incorrect Words  → Partial credit (+1/-1, min 0)
 *   - Write from Dictation       → Partial credit (1 per correct word spelled correctly)
 */

import { invokeLLM } from "../_core/llm";

// ─── Official PTE Listening Scoring Rules ─────────────────────────────────────
const LISTENING_SCORING_RULES = `
LISTENING SCORING RULES (Official Pearson PTE Academic, Score Guide v21, Nov 2024)

Summarize Spoken Text (1-2 items):
  Skills: Listening AND Writing.
  CONTENT (0-2):
    2: Provides a good summary of the text. All relevant aspects mentioned.
    1: Provides a fair summary, but one or two aspects missing.
    0: Omits or misrepresents the main aspects.
  FORM (0-2):
    2: Contains 50-70 words.
    1: Contains 40-49 words OR 71-100 words.
    0: Less than 40 words OR more than 100 words. Written in capitals, no punctuation,
       or only bullet points/very short sentences.
  GRAMMAR (0-2):
    2: Correct grammatical structures.
    1: Contains grammatical errors with no hindrance to communication.
    0: Defective grammatical structure which could hinder communication.
  VOCABULARY (0-2):
    2: Appropriate choice of words.
    1: Some lexical errors but with no hindrance to communication.
    0: Defective word choice which could hinder communication.
  SPELLING (0-2):
    2: Correct spelling.
    1: One spelling error.
    0: More than one spelling error.
  Maximum raw score: 10 points.

Multiple Choice, Choose Multiple Answers (1-2 items):
  Skills: Listening.
  Scoring: +1 correct, -1 incorrect, minimum 0.

Fill in the Blanks (2-3 items):
  Skills: Listening AND Writing.
  Scoring: 1 point per correct word spelled correctly. 0 minimum.

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
  Scoring: 1 point per correct word spelled correctly. 0 minimum.
`;

// ─── Multi-level Calibration Anchors for Summarize Spoken Text ───────────────
const LISTENING_CALIBRATION_ANCHORS = `
MULTI-LEVEL CALIBRATION ANCHORS FOR SUMMARIZE SPOKEN TEXT

C2 / Native Speaker Baseline (PTE ~85-90, raw score ~9-10/10):
  Content: 2 — All key points captured accurately.
  Form: 2 — 50-70 words, well-structured.
  Grammar: 2 — Perfect grammatical control.
  Vocabulary: 2 — Precise academic vocabulary, paraphrasing not copying.
  Spelling: 2 — Zero spelling errors.
  Characteristics: "Concise, accurate summary using own words. Academic register.
    No direct copying from the lecture. Captures main argument and supporting points."

C1 Level (PTE ~76-84, raw score ~7-9/10):
  Content: 2 — All relevant aspects mentioned.
  Form: 2 — Within 50-70 word range.
  Grammar: 2 — Rare errors.
  Vocabulary: 1-2 — Good vocabulary, minor imprecision.
  Spelling: 2 — Correct spelling.
  Characteristics: "Good summary covering main points. Mostly own words with some
    borrowed phrases. Clear grammatical structure. Appropriate academic vocabulary."

B2 Level (PTE ~59-75, raw score ~5-7/10):
  Content: 1-2 — Most aspects covered, may miss one or two.
  Form: 2 — Appropriate length.
  Grammar: 1 — Some errors, no communication breakdown.
  Vocabulary: 1 — Some inappropriate choices.
  Spelling: 1 — One spelling error.
  Characteristics: "Covers main points but may miss nuances. Some grammar errors.
    Mix of own words and copied phrases. Generally intelligible."

B1 Level (PTE ~43-58, raw score ~2-4/10):
  Content: 0-1 — Misses important aspects or misrepresents.
  Form: 1-2 — May be too short or too long.
  Grammar: 0-1 — Frequent errors.
  Vocabulary: 0-1 — Limited vocabulary.
  Spelling: 0 — Multiple spelling errors.
  Characteristics: "Limited comprehension. Mainly copies phrases from lecture.
    Frequent grammar and vocabulary errors. May miss the main point."
`;

export interface ListeningScoreResult {
  taskType: string;
  overallScore: number; // 10-90 PTE scale
  rawScore: number;
  maxRawScore: number;
  correctAnswers?: string[];
  userAnswers?: string[];
  traits?: {
    content?: { score: number; maxScore: number; feedback: string };
    form?: { score: number; maxScore: number; feedback: string };
    grammar?: { score: number; maxScore: number; feedback: string };
    vocabulary?: { score: number; maxScore: number; feedback: string };
    spelling?: { score: number; maxScore: number; feedback: string };
  };
  wordCount?: number;
  cefrLevel: string;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  strategyTips: string[];
  modelAnswer?: string;
}

/**
 * Score Summarize Spoken Text.
 * Traits: Content (0-2), Form (0-2), Grammar (0-2), Vocabulary (0-2), Spelling (0-2)
 * Maximum raw score: 10
 */
export async function scoreSummarizeSpokenText(params: {
  lectureTranscript: string;
  response: string;
}): Promise<ListeningScoreResult> {
  const { lectureTranscript, response } = params;
  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;

  const prompt = `You are an expert PTE Academic examiner trained on Pearson's official scoring engine.
Score this Summarize Spoken Text response using the EXACT official Pearson PTE Academic criteria.

TASK: Summarize Spoken Text
LECTURE TRANSCRIPT: "${lectureTranscript}"
TEST TAKER RESPONSE: "${response}"
WORD COUNT: ${wordCount} words

${LISTENING_SCORING_RULES}

${LISTENING_CALIBRATION_ANCHORS}

SCORING INSTRUCTIONS:
1. Check Form first: 50-70 words = 2, 40-49 or 71-100 = 1, outside = 0.
2. Evaluate Content: does it capture all key points from the lecture?
3. Evaluate Grammar.
4. Evaluate Vocabulary: are words appropriate and academic?
5. Count spelling errors: 0=2pts, 1=1pt, 2+=0pts.
6. Calculate raw score = Content + Form + Grammar + Vocabulary + Spelling (max 10).
7. Convert to PTE 10-90: PTE = round(10 + (rawScore/10) × 80)
8. Identify CEFR level using calibration anchors.

IMPORTANT: Penalize direct copying of phrases from the lecture — good summaries paraphrase.

Respond ONLY with valid JSON:
{
  "taskType": "summarize_spoken_text",
  "overallScore": <integer 10-90>,
  "rawScore": <integer 0-10>,
  "maxRawScore": 10,
  "wordCount": ${wordCount},
  "traits": {
    "content": { "score": <0-2>, "maxScore": 2, "feedback": "<which lecture points covered/missed>" },
    "form": { "score": <0-2>, "maxScore": 2, "feedback": "<word count assessment>" },
    "grammar": { "score": <0-2>, "maxScore": 2, "feedback": "<grammar assessment>" },
    "vocabulary": { "score": <0-2>, "maxScore": 2, "feedback": "<vocabulary assessment>" },
    "spelling": { "score": <0-2>, "maxScore": 2, "feedback": "<spelling errors found>" }
  },
  "cefrLevel": "<A1|A2|B1|B2|C1|C2>",
  "overallFeedback": "<3-4 sentence holistic assessment>",
  "strengths": ["<strength 1>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "strategyTips": ["<note-taking tip>", "<paraphrasing tip>"],
  "modelAnswer": "<model 60-word summary at C1 level>"
}`;

  const response_llm = await invokeLLM({
    messages: [
      { role: "system", content: "You are a certified PTE Academic examiner. Return only valid JSON." },
      { role: "user", content: prompt },
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
                spelling: { type: "object", properties: { score: { type: "integer" }, maxScore: { type: "integer" }, feedback: { type: "string" } }, required: ["score", "maxScore", "feedback"], additionalProperties: false },
              },
              required: ["content", "form", "grammar", "vocabulary", "spelling"],
              additionalProperties: false,
            },
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            strategyTips: { type: "array", items: { type: "string" } },
            modelAnswer: { type: "string" },
          },
          required: ["taskType", "overallScore", "rawScore", "maxRawScore", "wordCount", "traits", "cefrLevel", "overallFeedback", "strengths", "improvements", "strategyTips", "modelAnswer"],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response_llm.choices[0].message.content as string) as ListeningScoreResult;
}

/**
 * Score Write from Dictation.
 * 1 point per correct word spelled correctly.
 */
export async function scoreWriteFromDictation(params: {
  originalSentence: string;
  userResponse: string;
}): Promise<ListeningScoreResult> {
  const { originalSentence, userResponse } = params;

  const originalWords = originalSentence.toLowerCase().trim().split(/\s+/);
  const userWords = userResponse.toLowerCase().trim().split(/\s+/);

  // Count correctly spelled words (exact match, case-insensitive)
  let rawScore = 0;
  const wordResults: string[] = [];
  for (let i = 0; i < originalWords.length; i++) {
    const orig = originalWords[i].replace(/[.,!?;:'"]/g, "");
    const user = (userWords[i] || "").replace(/[.,!?;:'"]/g, "");
    if (orig === user) {
      rawScore++;
      wordResults.push(`"${originalWords[i]}" ✓`);
    } else {
      wordResults.push(`"${originalWords[i]}" ✗ (user wrote: "${userWords[i] || "(missing)"}")`);
    }
  }

  const maxRawScore = originalWords.length;
  const pteScore = Math.round(10 + (rawScore / maxRawScore) * 80);
  const cefrLevel = pteScore >= 85 ? "C2" : pteScore >= 76 ? "C1" : pteScore >= 59 ? "B2" : pteScore >= 43 ? "B1" : pteScore >= 29 ? "A2" : "A1";

  const prompt = `You are an expert PTE Academic examiner.
Analyze this Write from Dictation response and provide coaching feedback.

TASK: Write from Dictation
ORIGINAL SENTENCE: "${originalSentence}"
USER RESPONSE: "${userResponse}"

WORD-BY-WORD RESULTS:
${wordResults.join("\n")}

SCORE: ${rawScore}/${maxRawScore} words correct (PTE: ${pteScore}/90, CEFR: ${cefrLevel})

${LISTENING_SCORING_RULES}

Provide:
1. Analysis of which words were missed/misspelled and why.
2. Whether errors are spelling errors, hearing errors, or memory errors.
3. Tips for improving dictation accuracy.

Respond ONLY with valid JSON:
{
  "taskType": "write_from_dictation",
  "overallScore": ${pteScore},
  "rawScore": ${rawScore},
  "maxRawScore": ${maxRawScore},
  "correctAnswers": ["${originalSentence}"],
  "userAnswers": ["${userResponse}"],
  "cefrLevel": "${cefrLevel}",
  "overallFeedback": "<assessment of listening and spelling accuracy>",
  "strengths": ["<what was correct>"],
  "improvements": ["<specific words to practice>", "<spelling patterns to review>"],
  "strategyTips": ["<tip about chunking>", "<tip about spelling strategies>"]
}`;

  const response_llm = await invokeLLM({
    messages: [
      { role: "system", content: "You are a certified PTE Academic examiner. Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "wfd_score",
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
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            strategyTips: { type: "array", items: { type: "string" } },
          },
          required: ["taskType", "overallScore", "rawScore", "maxRawScore", "correctAnswers", "userAnswers", "cefrLevel", "overallFeedback", "strengths", "improvements", "strategyTips"],
          additionalProperties: false,
        },
      },
    },
  });

  const parsed = JSON.parse(response_llm.choices[0].message.content as string) as ListeningScoreResult;
  // Always use the deterministic local score — never trust LLM to count words
  parsed.rawScore = rawScore;
  parsed.maxRawScore = maxRawScore;
  parsed.overallScore = pteScore;
  return parsed;
}
/**
 * Score Highlight Correct Summary..
 * 1 point if correct, 0 if wrong.
 */
export async function scoreHighlightCorrectSummary(params: {
  lectureTranscript: string;
  summaryOptions: string[];
  correctSummary: string;
  userSummary: string;
}): Promise<ListeningScoreResult> {
  const { lectureTranscript, summaryOptions, correctSummary, userSummary } = params;
  const isCorrect = userSummary.toLowerCase().trim() === correctSummary.toLowerCase().trim();
  const rawScore = isCorrect ? 1 : 0;
  const pteScore = isCorrect ? 90 : 10;

  const prompt = `You are an expert PTE Academic examiner.
Analyze this Highlight Correct Summary response.

LECTURE TRANSCRIPT: "${lectureTranscript}"
SUMMARY OPTIONS: ${summaryOptions.map((s, i) => `Option ${i + 1}: "${s}"`).join("\n")}
CORRECT SUMMARY: "${correctSummary}"
USER SELECTED: "${userSummary}"
RESULT: ${isCorrect ? "CORRECT ✓" : "INCORRECT ✗"}

Explain why the correct summary is the best match for the lecture and why the other options are incorrect (too broad, too narrow, contains inaccuracies, etc.).

Respond ONLY with valid JSON:
{
  "taskType": "highlight_correct_summary",
  "overallScore": ${pteScore},
  "rawScore": ${rawScore},
  "maxRawScore": 1,
  "correctAnswers": ["${correctSummary}"],
  "userAnswers": ["${userSummary}"],
  "cefrLevel": "${isCorrect ? "C1" : "B1"}",
  "overallFeedback": "<why the correct summary matches the lecture>",
  "strengths": ${isCorrect ? '["Correctly identified the best summary"]' : '[]'},
  "improvements": ${!isCorrect ? '["<why the selected option was wrong>"]' : '[]'},
  "strategyTips": ["<tip about identifying main idea vs details>", "<tip about eliminating distractors>"]
}`;

  const response_llm = await invokeLLM({
    messages: [
      { role: "system", content: "You are a certified PTE Academic examiner. Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "hcs_score",
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
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            strategyTips: { type: "array", items: { type: "string" } },
          },
          required: ["taskType", "overallScore", "rawScore", "maxRawScore", "correctAnswers", "userAnswers", "cefrLevel", "overallFeedback", "strengths", "improvements", "strategyTips"],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response_llm.choices[0].message.content as string) as ListeningScoreResult;
}

/**
 * Score Fill in the Blanks (Listening).
 * 1 point per correct word spelled correctly.
 */
export async function scoreListeningFillBlanks(params: {
  transcript: string;
  blanks: Array<{ position: number; correctWord: string; userWord: string }>;
}): Promise<ListeningScoreResult> {
  const { transcript, blanks } = params;

  const rawScore = blanks.filter(b =>
    b.userWord.toLowerCase().trim() === b.correctWord.toLowerCase().trim()
  ).length;
  const maxRawScore = blanks.length;
  const pteScore = Math.round(10 + (rawScore / maxRawScore) * 80);
  const cefrLevel = pteScore >= 85 ? "C2" : pteScore >= 76 ? "C1" : pteScore >= 59 ? "B2" : pteScore >= 43 ? "B1" : "A2";

  const blankSummary = blanks.map((b, i) =>
    `Blank ${i + 1}: Correct="${b.correctWord}", User="${b.userWord}" ${b.userWord.toLowerCase() === b.correctWord.toLowerCase() ? "✓" : "✗"}`
  ).join("\n");

  const prompt = `You are an expert PTE Academic examiner.
Analyze this Listening Fill in the Blanks response.

TRANSCRIPT: "${transcript}"
BLANK RESULTS:
${blankSummary}
SCORE: ${rawScore}/${maxRawScore}

For each incorrect blank, explain:
1. What the correct word is and why.
2. Whether it was a spelling error or a hearing error.
3. Phonetic similarity that may have caused confusion.

Respond ONLY with valid JSON:
{
  "taskType": "listening_fill_blanks",
  "overallScore": ${pteScore},
  "rawScore": ${rawScore},
  "maxRawScore": ${maxRawScore},
  "correctAnswers": [${blanks.map(b => `"${b.correctWord}"`).join(", ")}],
  "userAnswers": [${blanks.map(b => `"${b.userWord}"`).join(", ")}],
  "cefrLevel": "${cefrLevel}",
  "overallFeedback": "<assessment of listening and spelling accuracy>",
  "strengths": ["<what was correct>"],
  "improvements": ["<specific words/sounds to practice>"],
  "strategyTips": ["<tip about predicting missing words>", "<tip about spelling>"]
}`;

  const response_llm = await invokeLLM({
    messages: [
      { role: "system", content: "You are a certified PTE Academic examiner. Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "lfib_score",
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
            cefrLevel: { type: "string" },
            overallFeedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            strategyTips: { type: "array", items: { type: "string" } },
          },
          required: ["taskType", "overallScore", "rawScore", "maxRawScore", "correctAnswers", "userAnswers", "cefrLevel", "overallFeedback", "strengths", "improvements", "strategyTips"],
          additionalProperties: false,
        },
      },
    },
  });

  return JSON.parse(response_llm.choices[0].message.content as string) as ListeningScoreResult;
}

/**
 * Main dispatcher for listening tasks.
 */
export async function scoreListeningTask(params: {
  taskType: string;
  lectureTranscript?: string;
  transcript?: string;
  response?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string | string[];
  userAnswer?: string | string[];
  summaryOptions?: string[];
  blanks?: Array<{ position: number; correctWord: string; userWord: string }>;
}): Promise<ListeningScoreResult> {
  const { taskType } = params;

  switch (taskType) {
    case "summarize_spoken_text":
      return scoreSummarizeSpokenText({
        lectureTranscript: params.lectureTranscript || params.transcript || "",
        response: params.response || "",
      });

    case "write_from_dictation":
      return scoreWriteFromDictation({
        originalSentence: (Array.isArray(params.correctAnswer) ? params.correctAnswer[0] : params.correctAnswer) || params.transcript || "",
        userResponse: params.response || (Array.isArray(params.userAnswer) ? params.userAnswer[0] : params.userAnswer) || "",
      });

    case "highlight_correct_summary":
      return scoreHighlightCorrectSummary({
        lectureTranscript: params.lectureTranscript || params.transcript || "",
        summaryOptions: params.summaryOptions || params.options || [],
        correctSummary: (Array.isArray(params.correctAnswer) ? params.correctAnswer[0] : params.correctAnswer) || "",
        userSummary: (Array.isArray(params.userAnswer) ? params.userAnswer[0] : params.userAnswer) || "",
      });

    case "listening_fill_blanks":
      return scoreListeningFillBlanks({
        transcript: params.transcript || "",
        blanks: params.blanks || [],
      });

    case "multiple_choice_single_listening":
    case "select_missing_word": {
      const correctAns = (Array.isArray(params.correctAnswer) ? params.correctAnswer[0] : params.correctAnswer) || "";
      const userAns = (Array.isArray(params.userAnswer) ? params.userAnswer[0] : params.userAnswer) || "";
      const isCorrect = userAns.toLowerCase().trim() === correctAns.toLowerCase().trim();
      return {
        taskType,
        overallScore: isCorrect ? 90 : 10,
        rawScore: isCorrect ? 1 : 0,
        maxRawScore: 1,
        correctAnswers: [correctAns],
        userAnswers: [userAns],
        cefrLevel: isCorrect ? "C1" : "B1",
        overallFeedback: isCorrect
          ? "Correct answer selected. Good listening comprehension."
          : `Incorrect. The correct answer was: "${correctAns}". Focus on listening for the main idea and key details.`,
        strengths: isCorrect ? ["Correctly identified the answer"] : [],
        improvements: !isCorrect ? [`Review the audio and identify why "${correctAns}" is correct`] : [],
        strategyTips: ["Listen for key words that match the options", "Eliminate obviously wrong answers first"],
      };
    }

    default:
      return scoreSummarizeSpokenText({
        lectureTranscript: params.lectureTranscript || params.transcript || "",
        response: params.response || "",
      });
  }
}
