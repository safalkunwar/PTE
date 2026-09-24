import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../_core/llm", () => ({ invokeLLM: vi.fn() }));

import { invokeLLM } from "../_core/llm";
import { scoreReadAloud, scoreSpeakingTask } from "./speakingAI";
import { scoreWriteEssay, scoreWritingTask } from "./writingAI";
import { scoreReadingTask } from "./readingAI";
import { scoreWriteFromDictation } from "./listeningAI";

const mockInvokeLLM = vi.mocked(invokeLLM);

function mockJson(value: object) {
  mockInvokeLLM.mockResolvedValueOnce({
    choices: [{ message: { content: JSON.stringify(value) } }],
  } as any);
}

const sixBandLabels = ["10 (zero/near-zero)", "30 (limited)", "50 (competent)", "65 (good)", "79 (very good)", "90 (expert)"];

describe("known-response calibration matrix", () => {
  beforeEach(() => vi.resetAllMocks());

  it("keeps deterministic Reading correct and incorrect references at the endpoints", async () => {
    const readingExplanation = {
      taskType: "multiple_choice_single",
      overallScore: 50,
      rawScore: 0,
      maxRawScore: 1,
      correctAnswers: ["A"],
      userAnswers: ["A"],
      explanation: "The answer is supported by the passage.",
      cefrLevel: "B1",
      overallFeedback: "Deterministic answer-key score.",
      strengths: [],
      improvements: [],
      strategyTips: [],
    };
    mockJson(readingExplanation);
    const correct = await scoreReadingTask({
      taskType: "multiple_choice_single",
      passage: "Renewable energy reduces dependence on finite fuels.",
      question: "What does renewable energy reduce?",
      options: ["Dependence on finite fuels", "Access to electricity"],
      correctAnswer: "A",
      userAnswer: "A",
    });
    mockJson({ ...readingExplanation, userAnswers: ["B"] });
    const incorrect = await scoreReadingTask({
      taskType: "multiple_choice_single",
      passage: "Renewable energy reduces dependence on finite fuels.",
      question: "What does renewable energy reduce?",
      options: ["Dependence on finite fuels", "Access to electricity"],
      correctAnswer: "A",
      userAnswer: "B",
    });

    expect(correct.overallScore).toBe(90);
    expect(incorrect.overallScore).toBe(10);
  });

  it("keeps deterministic Listening dictation references at the endpoints", async () => {
    const sentence = "Universities increasingly use digital libraries to support research.";
    const dictationExplanation = {
      taskType: "write_from_dictation",
      overallScore: 50,
      rawScore: 0,
      maxRawScore: 1,
      correctAnswers: [sentence],
      userAnswers: [sentence],
      cefrLevel: "B1",
      overallFeedback: "Deterministic word-match score.",
      strengths: [],
      improvements: [],
      strategyTips: [],
    };
    mockJson(dictationExplanation);
    const exact = await scoreWriteFromDictation({ originalSentence: sentence, userResponse: sentence });
    mockJson({ ...dictationExplanation, userAnswers: [""] });
    const empty = await scoreWriteFromDictation({ originalSentence: sentence, userResponse: "" });

    expect(exact.overallScore).toBe(90);
    expect(empty.overallScore).toBe(10);
  });

  it("injects the complete six-band anchor set into Speaking subjective prompts", async () => {
    mockJson({
      taskType: "read_aloud",
      overallScore: 90,
      rawScore: 15,
      maxRawScore: 15,
      traits: {
        pronunciation: { score: 5, maxScore: 5, feedback: "Clear" },
        oralFluency: { score: 5, maxScore: 5, feedback: "Smooth" },
      },
      cefrLevel: "C2",
      overallFeedback: "Complete reference response.",
      strengths: [], improvements: [], strategyTips: [], wordLevelFeedback: "",
    });
    const text = "The department released a comprehensive report on regional demographic trends.";
    const result = await scoreSpeakingTask({ taskType: "read_aloud", originalText: text, transcription: text });
    const prompt = JSON.stringify(mockInvokeLLM.mock.calls[0]?.[0]);

    expect(result.overallScore).toBe(90);
    for (const label of sixBandLabels) expect(prompt).toContain(label);
  });

  it("normalizes fixed Read Aloud low, middle, and high references through live post-processing", async () => {
    const reference = "The department released a comprehensive report on regional demographic trends.";
    const makeSpeakingResult = (score: number) => ({
      taskType: "read_aloud",
      overallScore: score,
      rawScore: score,
      maxRawScore: 90,
      traits: {
        pronunciation: { score: score === 10 ? 0 : score === 58 ? 3 : 5, maxScore: 5, feedback: "Reference trait" },
        oralFluency: { score: score === 10 ? 0 : score === 58 ? 3 : 5, maxScore: 5, feedback: "Reference trait" },
        content: { score: 0, maxScore: 10, feedback: "Deterministic content" },
      },
      cefrLevel: "B1",
      overallFeedback: "Reference response.",
      strengths: [], improvements: [], wordLevelFeedback: "",
    });
    mockJson(makeSpeakingResult(10));
    const low = await scoreReadAloud({ originalText: reference, transcription: "" });
    mockJson(makeSpeakingResult(58));
    const middle = await scoreReadAloud({ originalText: reference, transcription: "The department released a comprehensive report" });
    mockJson(makeSpeakingResult(90));
    const high = await scoreReadAloud({ originalText: reference, transcription: reference });

    expect(low.overallScore).toBe(10);
    expect(middle.overallScore).toBe(58);
    expect(high.overallScore).toBe(90);
  });

  it("normalizes fixed Write Essay low, middle, and high references through the live scorer", async () => {
    const prompt = "Discuss whether technology improves access to education.";
    const validResponse = Array.from({ length: 220 }, (_, index) => index % 2 === 0 ? "Technology" : "supports").join(" ");
    const makeEssayResult = (content: number, trait: number) => ({
      taskType: "write_essay",
      overallScore: 50,
      rawScore: 0,
      maxRawScore: 15,
      wordCount: 220,
      traits: {
        content: { score: content, maxScore: 3, feedback: "Reference content" },
        form: { score: 0, maxScore: 2, feedback: "Overridden" },
        grammar: { score: trait, maxScore: 2, feedback: "Reference grammar" },
        vocabulary: { score: trait, maxScore: 2, feedback: "Reference vocabulary" },
        spelling: { score: 0, maxScore: 2, feedback: "Overridden" },
        development: { score: trait, maxScore: 2, feedback: "Reference development" },
        linguisticRange: { score: trait, maxScore: 2, feedback: "Reference range" },
      },
      cefrLevel: "B1",
      overallFeedback: "Reference essay.",
      strengths: [], improvements: [], grammarErrors: [], vocabularyFeedback: "Reference", modelAnswer: "",
    });

    const low = await scoreWriteEssay({ prompt, response: "Too short." });
    mockJson(makeEssayResult(1, 1));
    const middle = await scoreWriteEssay({ prompt, response: validResponse });
    mockJson(makeEssayResult(3, 2));
    const high = await scoreWriteEssay({ prompt, response: validResponse });

    expect(low.overallScore).toBe(10);
    expect(middle.overallScore).toBe(58);
    expect(high.overallScore).toBe(90);
  });

  it("injects the complete six-band anchor set into Writing subjective prompts", async () => {
    mockJson({
      taskType: "write_essay",
      overallScore: 79,
      rawScore: 14,
      maxRawScore: 15,
      wordCount: 220,
      traits: {
        content: { score: 3, maxScore: 3, feedback: "Relevant" },
        form: { score: 2, maxScore: 2, feedback: "In range" },
        grammar: { score: 2, maxScore: 2, feedback: "Accurate" },
        vocabulary: { score: 2, maxScore: 2, feedback: "Broad" },
        spelling: { score: 1, maxScore: 1, feedback: "Accurate" },
        development: { score: 2, maxScore: 2, feedback: "Developed" },
        linguisticRange: { score: 2, maxScore: 2, feedback: "Flexible" },
        coherence: { score: 2, maxScore: 2, feedback: "Coherent" },
        discourse: { score: 2, maxScore: 2, feedback: "Cohesive" },
      },
      cefrLevel: "C1",
      overallFeedback: "Strong reference response.",
      strengths: [], improvements: [], strategyTips: [], grammarErrors: [],
      vocabularyFeedback: "Broad", modelAnswer: "",
    });
    const response = Array.from({ length: 220 }, (_, index) => index % 2 === 0 ? "Technology" : "supports").join(" ");
    const result = await scoreWritingTask({ taskType: "write_essay", prompt: "Discuss technology and education.", response });
    const prompt = JSON.stringify(mockInvokeLLM.mock.calls[0]?.[0]);

    expect(result.overallScore).toBeGreaterThanOrEqual(79);
    for (const label of sixBandLabels) expect(prompt).toContain(label);
  });
});
