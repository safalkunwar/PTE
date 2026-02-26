import { invokeLLM } from "./_core/llm";

export interface ScoringResult {
  contentScore: number; // 0-1
  formScore: number; // 0-1
  languageScore: number; // 0-1
  pronunciationScore?: number; // 0-1
  fluencyScore?: number; // 0-1
  totalScore: number; // 0-100
  normalizedScore: number; // 10-90
  feedback: string;
  strengths: string[];
  improvements: string[];
  grammarErrors: string[];
  vocabularyFeedback: string;
  pronunciationFeedback?: string;
  fluencyFeedback?: string;
  // Enabling skills
  grammarScore: number; // 0-90
  vocabularyScore: number; // 0-90
  spellingScore: number; // 0-90
  writtenDiscourseScore: number; // 0-90
  oralFluencyScore?: number; // 0-90
  pronunciationSkillScore?: number; // 0-90
}

// Normalize raw score (0-100) to PTE scale (10-90)
export function normalizeToPTE(rawScore: number): number {
  const clamped = Math.max(0, Math.min(100, rawScore));
  return Math.round(10 + (clamped / 100) * 80);
}

// Score a writing task (essay or summarize written text)
export async function scoreWritingTask(params: {
  taskType: "write_essay" | "summarize_written_text";
  prompt: string;
  content?: string; // source text for summarize
  response: string;
  wordLimit?: number;
}): Promise<ScoringResult> {
  const systemPrompt = `You are an expert PTE Academic scoring engine aligned with the official Pearson PTE score guide.
Score the following ${params.taskType === "write_essay" ? "essay" : "summary"} response strictly according to PTE Academic criteria.

Scoring Criteria:
1. CONTENT (0-1): Task relevance, complete response, topic adherence, key ideas coverage
2. FORM (0-1): Word count compliance (${params.wordLimit ? `target: ${params.wordLimit} words` : "appropriate length"}), structure, format
3. LANGUAGE (0-1): Grammar accuracy, vocabulary range, sentence variety, cohesion, coherence
4. SPELLING (0-1): Correct spelling throughout

Return ONLY valid JSON matching this exact schema:
{
  "contentScore": <0.0-1.0>,
  "formScore": <0.0-1.0>,
  "languageScore": <0.0-1.0>,
  "spellingScore": <0.0-1.0>,
  "totalScore": <0-100>,
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "grammarErrors": ["<error 1>", "<error 2>"],
  "vocabularyFeedback": "<vocabulary assessment>",
  "grammarScore": <10-90>,
  "vocabularyScore": <10-90>,
  "spellingSkillScore": <10-90>,
  "writtenDiscourseScore": <10-90>
}`;

  const userMessage = params.taskType === "summarize_written_text"
    ? `Source Text:\n${params.content}\n\nStudent's Summary:\n${params.response}`
    : `Essay Prompt:\n${params.prompt}\n\nStudent's Essay:\n${params.response}`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "writing_score",
          strict: true,
          schema: {
            type: "object",
            properties: {
              contentScore: { type: "number" },
              formScore: { type: "number" },
              languageScore: { type: "number" },
              spellingScore: { type: "number" },
              totalScore: { type: "number" },
              feedback: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              improvements: { type: "array", items: { type: "string" } },
              grammarErrors: { type: "array", items: { type: "string" } },
              vocabularyFeedback: { type: "string" },
              grammarScore: { type: "number" },
              vocabularyScore: { type: "number" },
              spellingSkillScore: { type: "number" },
              writtenDiscourseScore: { type: "number" },
            },
            required: ["contentScore","formScore","languageScore","spellingScore","totalScore","feedback","strengths","improvements","grammarErrors","vocabularyFeedback","grammarScore","vocabularyScore","spellingSkillScore","writtenDiscourseScore"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = result.choices[0]?.message?.content as string;
    const parsed = JSON.parse(content || "{}");

    return {
      contentScore: parsed.contentScore ?? 0.5,
      formScore: parsed.formScore ?? 0.5,
      languageScore: parsed.languageScore ?? 0.5,
      totalScore: parsed.totalScore ?? 50,
      normalizedScore: normalizeToPTE(parsed.totalScore ?? 50),
      feedback: parsed.feedback ?? "Assessment completed.",
      strengths: parsed.strengths ?? [],
      improvements: parsed.improvements ?? [],
      grammarErrors: parsed.grammarErrors ?? [],
      vocabularyFeedback: parsed.vocabularyFeedback ?? "",
      grammarScore: parsed.grammarScore ?? 50,
      vocabularyScore: parsed.vocabularyScore ?? 50,
      spellingScore: parsed.spellingSkillScore ?? 50,
      writtenDiscourseScore: parsed.writtenDiscourseScore ?? 50,
    };
  } catch (err) {
    console.error("Writing scoring error:", err);
    return getDefaultScore();
  }
}

// Score a speaking task using transcription
export async function scoreSpeakingTask(params: {
  taskType: "read_aloud" | "repeat_sentence" | "describe_image" | "retell_lecture" | "answer_short_question";
  prompt?: string;
  originalText?: string; // for read_aloud and repeat_sentence
  transcription: string;
  timeTaken?: number;
}): Promise<ScoringResult> {
  const systemPrompt = `You are an expert PTE Academic speaking evaluator aligned with the official Pearson PTE score guide.
Evaluate the following transcribed speech for a ${params.taskType.replace(/_/g, " ")} task.

Scoring Criteria:
1. CONTENT (0-1): Relevance, completeness, accuracy to source (if applicable)
2. PRONUNCIATION (0-1): Clarity, native-like pronunciation, phoneme accuracy
3. ORAL FLUENCY (0-1): Natural flow, appropriate pace, minimal hesitations/repairs
4. LANGUAGE (0-1): Grammar, vocabulary, sentence structure

Return ONLY valid JSON:
{
  "contentScore": <0.0-1.0>,
  "pronunciationScore": <0.0-1.0>,
  "fluencyScore": <0.0-1.0>,
  "languageScore": <0.0-1.0>,
  "totalScore": <0-100>,
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "grammarErrors": ["<error 1>"],
  "vocabularyFeedback": "<vocabulary note>",
  "pronunciationFeedback": "<specific pronunciation feedback>",
  "fluencyFeedback": "<fluency feedback>",
  "oralFluencyScore": <10-90>,
  "pronunciationSkillScore": <10-90>,
  "grammarScore": <10-90>,
  "vocabularyScore": <10-90>
}`;

  const userMessage = params.originalText
    ? `Original Text: "${params.originalText}"\n\nTranscribed Response: "${params.transcription}"`
    : `Task: ${params.prompt}\n\nTranscribed Response: "${params.transcription}"`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "speaking_score",
          strict: true,
          schema: {
            type: "object",
            properties: {
              contentScore: { type: "number" },
              pronunciationScore: { type: "number" },
              fluencyScore: { type: "number" },
              languageScore: { type: "number" },
              totalScore: { type: "number" },
              feedback: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              improvements: { type: "array", items: { type: "string" } },
              grammarErrors: { type: "array", items: { type: "string" } },
              vocabularyFeedback: { type: "string" },
              pronunciationFeedback: { type: "string" },
              fluencyFeedback: { type: "string" },
              oralFluencyScore: { type: "number" },
              pronunciationSkillScore: { type: "number" },
              grammarScore: { type: "number" },
              vocabularyScore: { type: "number" },
            },
            required: ["contentScore","pronunciationScore","fluencyScore","languageScore","totalScore","feedback","strengths","improvements","grammarErrors","vocabularyFeedback","pronunciationFeedback","fluencyFeedback","oralFluencyScore","pronunciationSkillScore","grammarScore","vocabularyScore"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = result.choices[0]?.message?.content as string;
    const parsed = JSON.parse(content || "{}");

    return {
      contentScore: parsed.contentScore ?? 0.5,
      formScore: 1.0,
      languageScore: parsed.languageScore ?? 0.5,
      pronunciationScore: parsed.pronunciationScore ?? 0.5,
      fluencyScore: parsed.fluencyScore ?? 0.5,
      totalScore: parsed.totalScore ?? 50,
      normalizedScore: normalizeToPTE(parsed.totalScore ?? 50),
      feedback: parsed.feedback ?? "Assessment completed.",
      strengths: parsed.strengths ?? [],
      improvements: parsed.improvements ?? [],
      grammarErrors: parsed.grammarErrors ?? [],
      vocabularyFeedback: parsed.vocabularyFeedback ?? "",
      pronunciationFeedback: parsed.pronunciationFeedback ?? "",
      fluencyFeedback: parsed.fluencyFeedback ?? "",
      grammarScore: parsed.grammarScore ?? 50,
      vocabularyScore: parsed.vocabularyScore ?? 50,
      spellingScore: 50,
      writtenDiscourseScore: 50,
      oralFluencyScore: parsed.oralFluencyScore ?? 50,
      pronunciationSkillScore: parsed.pronunciationSkillScore ?? 50,
    };
  } catch (err) {
    console.error("Speaking scoring error:", err);
    return getDefaultScore();
  }
}

// Generate diagnostic feedback and action plan
export async function generateDiagnosticFeedback(params: {
  overallScore: number;
  speakingScore?: number;
  writingScore?: number;
  readingScore?: number;
  listeningScore?: number;
  grammarScore?: number;
  vocabularyScore?: number;
  pronunciationScore?: number;
  fluencyScore?: number;
  spellingScore?: number;
  writtenDiscourseScore?: number;
  targetScore?: number;
}): Promise<{ weakSkills: string[]; strongSkills: string[]; actionPlan: string }> {
  const systemPrompt = `You are a PTE Academic coach. Based on the student's scores, identify weak/strong skills and create a personalized action plan.
Return ONLY valid JSON:
{
  "weakSkills": ["<skill 1>", "<skill 2>"],
  "strongSkills": ["<skill 1>"],
  "actionPlan": "<detailed 3-5 sentence personalized action plan with specific daily practice recommendations>"
}`;

  const scoresSummary = `
Overall: ${params.overallScore}/90 (Target: ${params.targetScore || 65}/90)
Speaking: ${params.speakingScore || "N/A"}, Writing: ${params.writingScore || "N/A"}
Reading: ${params.readingScore || "N/A"}, Listening: ${params.listeningScore || "N/A"}
Grammar: ${params.grammarScore || "N/A"}, Vocabulary: ${params.vocabularyScore || "N/A"}
Pronunciation: ${params.pronunciationScore || "N/A"}, Oral Fluency: ${params.fluencyScore || "N/A"}
Spelling: ${params.spellingScore || "N/A"}, Written Discourse: ${params.writtenDiscourseScore || "N/A"}`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: scoresSummary },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "diagnostic",
          strict: true,
          schema: {
            type: "object",
            properties: {
              weakSkills: { type: "array", items: { type: "string" } },
              strongSkills: { type: "array", items: { type: "string" } },
              actionPlan: { type: "string" },
            },
            required: ["weakSkills", "strongSkills", "actionPlan"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = result.choices[0]?.message?.content as string;
    return JSON.parse(content || "{}");
  } catch {
    return {
      weakSkills: ["Pronunciation", "Grammar"],
      strongSkills: ["Vocabulary"],
      actionPlan: "Focus on daily speaking practice for 20 minutes, targeting pronunciation and fluency. Practice grammar exercises and review common error patterns.",
    };
  }
}

function getDefaultScore(): ScoringResult {
  return {
    contentScore: 0.5,
    formScore: 0.5,
    languageScore: 0.5,
    totalScore: 50,
    normalizedScore: 50,
    feedback: "Your response has been recorded. Keep practicing to improve your score.",
    strengths: ["Attempted the task"],
    improvements: ["Work on content relevance", "Improve language accuracy"],
    grammarErrors: [],
    vocabularyFeedback: "Continue expanding your vocabulary.",
    grammarScore: 50,
    vocabularyScore: 50,
    spellingScore: 50,
    writtenDiscourseScore: 50,
  };
}

// Score objective tasks (MCQ, fill blanks, etc.) with partial credit support
export function scoreObjectiveTask(params: {
  taskType: string;
  correctAnswer: string | null;
  selectedOptions?: string[];
  responseText?: string;
}): { isCorrect: boolean; totalScore: number; normalizedScore: number } {
  if (!params.correctAnswer) {
    return { isCorrect: false, totalScore: 0, normalizedScore: 10 };
  }

  // ── Write from Dictation: word-level partial credit ──────────────────────
  if (params.taskType === "write_from_dictation") {
    const correctWords = params.correctAnswer.trim().toLowerCase().split(/\s+/);
    const responseWords = (params.responseText || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (responseWords.length === 0) return { isCorrect: false, totalScore: 0, normalizedScore: 10 };
    const matchCount = responseWords.filter(w => correctWords.includes(w)).length;
    const accuracy = matchCount / correctWords.length;
    const totalScore = Math.round(accuracy * 100);
    return { isCorrect: accuracy >= 0.95, totalScore, normalizedScore: normalizeToPTE(totalScore) };
  }

  // ── Reorder Paragraphs: adjacent-pair partial credit ─────────────────────
  if (params.taskType === "reorder_paragraphs") {
    let correctOrder: string[];
    try {
      correctOrder = JSON.parse(params.correctAnswer);
    } catch {
      correctOrder = params.correctAnswer.split(",").map(s => s.trim());
    }
    const selected = params.selectedOptions || [];
    if (selected.length === 0) return { isCorrect: false, totalScore: 0, normalizedScore: 10 };
    // Score by counting correctly ordered adjacent pairs
    const totalPairs = correctOrder.length - 1;
    if (totalPairs <= 0) {
      const isCorrect = selected[0] === correctOrder[0];
      return { isCorrect, totalScore: isCorrect ? 100 : 0, normalizedScore: normalizeToPTE(isCorrect ? 100 : 0) };
    }
    let correctPairs = 0;
    for (let i = 0; i < correctOrder.length - 1; i++) {
      const posA = selected.indexOf(correctOrder[i]);
      const posB = selected.indexOf(correctOrder[i + 1]);
      if (posA !== -1 && posB !== -1 && posA < posB) correctPairs++;
    }
    const accuracy = correctPairs / totalPairs;
    const totalScore = Math.round(accuracy * 100);
    return { isCorrect: accuracy >= 0.95, totalScore, normalizedScore: normalizeToPTE(totalScore) };
  }

  // ── Highlight Incorrect Words: set-based partial credit ──────────────────
  if (params.taskType === "highlight_incorrect_words") {
    let correctSet: string[];
    try {
      correctSet = JSON.parse(params.correctAnswer);
    } catch {
      correctSet = params.correctAnswer.split(",").map(s => s.trim());
    }
    const selected = (params.selectedOptions || []).map(s => s.trim().toLowerCase());
    const correct = correctSet.map(s => s.trim().toLowerCase());
    const truePositives = selected.filter(s => correct.includes(s)).length;
    const falsePositives = selected.filter(s => !correct.includes(s)).length;
    const precision = selected.length > 0 ? truePositives / selected.length : 0;
    const recall = correct.length > 0 ? truePositives / correct.length : 0;
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const totalScore = Math.round(f1 * 100);
    return { isCorrect: f1 >= 0.95, totalScore, normalizedScore: normalizeToPTE(totalScore) };
  }

  // ── Fill in the Blanks (Reading/Listening): per-blank partial credit ──────
  if (["fill_blanks_reading", "fill_blanks_rw", "fill_blanks_listening"].includes(params.taskType)) {
    const correctAnswers = params.correctAnswer.split(",").map(s => s.trim().toLowerCase());
    const responseAnswers = (params.responseText || "").split(",").map(s => s.trim().toLowerCase());
    const matchCount = correctAnswers.filter((ans, i) => responseAnswers[i] === ans).length;
    const accuracy = correctAnswers.length > 0 ? matchCount / correctAnswers.length : 0;
    const totalScore = Math.round(accuracy * 100);
    return { isCorrect: accuracy >= 0.95, totalScore, normalizedScore: normalizeToPTE(totalScore) };
  }

  // ── Standard MCQ / single-select ─────────────────────────────────────────
  let isCorrect = false;

  if (params.selectedOptions && params.selectedOptions.length > 0) {
    const correct = params.correctAnswer.split(",").map(s => s.trim().toLowerCase()).sort();
    const selected = params.selectedOptions.map(s => s.trim().toLowerCase()).sort();
    isCorrect = JSON.stringify(correct) === JSON.stringify(selected);
  } else if (params.responseText) {
    isCorrect = params.responseText.trim().toLowerCase() === params.correctAnswer.trim().toLowerCase();
  }

  const totalScore = isCorrect ? 100 : 0;
  return { isCorrect, totalScore, normalizedScore: normalizeToPTE(totalScore) };
}
