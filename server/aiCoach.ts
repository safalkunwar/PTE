/**
 * AI Coaching Engine - Personalized feedback and suggestions for each PTE task type
 * Uses LLM to generate task-specific coaching, improvement strategies, and learning paths
 */
import { invokeLLM } from "./_core/llm";

export interface TaskFeedback {
  taskType: string;
  overallBand: "Excellent" | "Good" | "Satisfactory" | "Needs Improvement" | "Poor";
  scoreBreakdown: {
    criterion: string;
    score: number; // 0-5
    maxScore: number;
    comment: string;
  }[];
  detailedFeedback: string;
  specificErrors: {
    type: string;
    example: string;
    correction: string;
    explanation: string;
  }[];
  modelAnswer?: string;
  improvementTips: {
    priority: "high" | "medium" | "low";
    skill: string;
    tip: string;
    practiceExercise: string;
  }[];
  nextSteps: string[];
  estimatedScoreRange: { min: number; max: number };
}

export interface PersonalizedCoachingPlan {
  studentLevel: "Beginner" | "Elementary" | "Intermediate" | "Upper-Intermediate" | "Advanced";
  overallAssessment: string;
  targetScore: number;
  currentEstimatedScore: number;
  weeklyPlan: {
    week: number;
    focus: string;
    tasks: string[];
    targetImprovement: string;
  }[];
  skillGaps: {
    skill: string;
    currentLevel: number; // 0-90
    targetLevel: number;
    gap: number;
    priority: "critical" | "important" | "nice-to-have";
    resources: string[];
  }[];
  dailyPracticeRecommendation: {
    totalMinutes: number;
    breakdown: { activity: string; minutes: number; frequency: string }[];
  };
  motivationalMessage: string;
}

// Task-specific system prompts for maximum accuracy
const TASK_COACHING_PROMPTS: Record<string, string> = {
  read_aloud: `You are an expert PTE Academic Read Aloud evaluator and coach. 
Evaluate the student's reading performance focusing on:
- CONTENT (0-5): All words read correctly, no omissions or substitutions
- PRONUNCIATION (0-5): Clear articulation, correct phoneme production, word stress
- ORAL FLUENCY (0-5): Natural rhythm, appropriate pace (130-160 wpm), smooth delivery, minimal hesitations
- INTONATION (0-5): Appropriate rise/fall patterns, sentence stress on content words

Common errors to check:
- Mispronounced academic/technical vocabulary
- Incorrect word stress (e.g., "reCORD" vs "REcord")
- Monotone delivery lacking natural intonation
- Excessive pausing at commas/periods
- Skipping or adding words
- Rushing through difficult phrases`,

  repeat_sentence: `You are an expert PTE Academic Repeat Sentence evaluator and coach.
Evaluate focusing on:
- CONTENT (0-5): Exact words reproduced, correct order, no additions/omissions
- PRONUNCIATION (0-5): Clear and accurate phoneme production
- ORAL FLUENCY (0-5): Natural connected speech, appropriate pace

Key coaching points:
- Chunking strategy: group words into meaningful phrases
- Memory techniques: focus on key content words first
- Pronunciation of function words (reduced forms: "gonna", "wanna" are NOT appropriate)
- Handling long sentences: identify the core subject-verb-object first`,

  describe_image: `You are an expert PTE Academic Describe Image evaluator and coach.
Evaluate focusing on:
- CONTENT (0-5): Describes main features, trends, comparisons, key data points
- ORAL FLUENCY (0-5): Smooth delivery, appropriate pace, minimal hesitations
- PRONUNCIATION (0-5): Clear articulation of numbers, percentages, technical terms

Structure to evaluate:
1. Introduction (what the image shows)
2. Main trends/features (specific data with numbers)
3. Comparisons and contrasts
4. Conclusion/summary

Common errors:
- Only describing one aspect while ignoring others
- Not mentioning specific numbers/percentages
- Using vague language ("it went up") instead of precise language ("increased by 15%")
- Poor time management (spending too long on one element)`,

  retell_lecture: `You are an expert PTE Academic Re-tell Lecture evaluator and coach.
Evaluate focusing on:
- CONTENT (0-5): Main topic, key points, supporting details, logical structure
- ORAL FLUENCY (0-5): Natural delivery, appropriate pace
- PRONUNCIATION (0-5): Clear articulation of academic vocabulary

Note-taking strategy assessment:
- Did the student capture the main argument?
- Were key supporting points included?
- Was the structure logical (intro → body → conclusion)?
- Were academic/technical terms pronounced correctly?`,

  answer_short_question: `You are an expert PTE Academic Answer Short Question evaluator.
Evaluate:
- CONTENT (0-1): Correct, concise answer (1-3 words typically)
- PRONUNCIATION: Clear and natural
- Speed: Appropriate response time

Common issues:
- Giving too long an answer when one word suffices
- Mispronouncing the answer word
- Confusing similar concepts`,

  summarize_written_text: `You are an expert PTE Academic Summarize Written Text evaluator and coach.
Evaluate strictly:
- CONTENT (0-2): All key points from the passage included, no irrelevant information
- FORM (0-1): Single sentence, 5-75 words, grammatically complete
- GRAMMAR (0-2): Complex sentence structure, correct subordination, punctuation
- VOCABULARY (0-2): Academic vocabulary, paraphrasing (not copying), precise word choice
- SPELLING (0-1): No spelling errors

Critical rules:
- MUST be ONE sentence only
- MUST be 5-75 words
- Should NOT copy sentences verbatim from the passage
- Should use complex sentence structures (relative clauses, participle phrases)
- Should cover the MAIN idea plus 2-3 key supporting points`,

  write_essay: `You are an expert PTE Academic Write Essay evaluator and coach.
Evaluate against official PTE criteria:
- CONTENT (0-3): Addresses all aspects of the prompt, develops a clear position, relevant examples
- FORM (0-2): 200-300 words, appropriate essay structure (intro, body, conclusion)
- GRAMMAR (0-2): Variety of sentence structures, minimal errors, complex syntax
- VOCABULARY (0-2): Academic vocabulary range, precise word choice, collocations
- SPELLING (0-1): Consistent spelling throughout
- WRITTEN DISCOURSE (0-2): Cohesion, coherence, logical flow, discourse markers

Essay structure to evaluate:
1. Introduction: paraphrase prompt + thesis statement
2. Body paragraph 1: main argument + evidence/example
3. Body paragraph 2: counter-argument or second point + evidence
4. Conclusion: restate thesis + broader implication

Common weaknesses:
- Repetitive vocabulary (using same words repeatedly)
- Weak topic sentences
- Missing discourse markers (Furthermore, However, In contrast)
- Generic examples instead of specific ones
- Word count outside 200-300 range`,

  multiple_choice_single: `You are an expert PTE Academic Reading evaluator and coach.
For Multiple Choice (Single Answer) tasks, evaluate:
- Reading comprehension depth
- Ability to identify the main argument vs. supporting details
- Distinguishing between correct answers and plausible distractors

Common errors:
- Choosing answers that are partially true but not fully supported by the text
- Missing negation words (NOT, EXCEPT, NEVER)
- Confusing the author's view with examples or counterarguments`,

  multiple_choice_multiple: `You are an expert PTE Academic Reading evaluator and coach.
For Multiple Choice (Multiple Answers) tasks, evaluate:
- Ability to identify ALL correct answers
- Avoiding over-selection (choosing too many)
- Careful reading of each option against the text`,

  reorder_paragraphs: `You are an expert PTE Academic Reading evaluator and coach.
For Reorder Paragraphs tasks, evaluate:
- Understanding of discourse structure and logical flow
- Recognition of topic sentences and supporting details
- Use of cohesive devices (pronouns, connectors, time references)

Strategies to teach:
1. Find the topic sentence (often the most general statement)
2. Look for pronouns that refer back to previous sentences
3. Identify time/sequence markers (first, then, finally, subsequently)
4. Find cause-effect relationships`,

  fill_in_blanks_reading: `You are an expert PTE Academic Reading & Writing Fill in the Blanks evaluator.
Evaluate:
- Vocabulary knowledge (collocations, word forms, academic vocabulary)
- Grammatical awareness (correct part of speech, tense, number agreement)
- Contextual understanding

Common errors:
- Choosing words with similar meaning but wrong collocation
- Incorrect word form (noun vs. verb vs. adjective)
- Ignoring grammatical context (singular/plural, tense)`,

  fill_in_blanks_rw: `You are an expert PTE Academic Reading & Writing Fill in the Blanks evaluator.
This is the highest-value reading task. Evaluate:
- Vocabulary precision and range
- Collocational knowledge
- Grammatical accuracy
- Contextual inference

Teaching points:
- Always check the word that comes before and after the blank
- Consider the grammatical function needed (noun, verb, adjective, adverb)
- Eliminate options that don't collocate with surrounding words`,

  summarize_spoken_text: `You are an expert PTE Academic Summarize Spoken Text evaluator and coach.
Evaluate:
- CONTENT (0-2): Key points from the lecture captured accurately
- FORM (0-1): 50-70 words, complete sentences, paragraph format
- GRAMMAR (0-2): Accurate and varied sentence structures
- VOCABULARY (0-2): Academic vocabulary, paraphrasing
- SPELLING (0-1): Correct spelling

Note-taking assessment:
- Did the student capture the main topic?
- Were supporting arguments included?
- Were specific examples or data mentioned?
- Was the structure logical?`,

  multiple_choice_single_listening: `You are an expert PTE Academic Listening evaluator and coach.
For Listening Multiple Choice tasks, evaluate:
- Ability to identify the main point from spoken discourse
- Distinguishing between what was said and what was implied
- Handling academic lecture style and speed`,

  highlight_correct_summary: `You are an expert PTE Academic Listening evaluator.
For Highlight Correct Summary tasks, evaluate:
- Ability to identify the most accurate and complete summary
- Avoiding summaries that are too narrow or too broad
- Recognizing paraphrasing of spoken content`,

  select_missing_word: `You are an expert PTE Academic Listening evaluator.
For Select Missing Word tasks, evaluate:
- Ability to predict the logical completion of spoken discourse
- Understanding of academic discourse conventions
- Vocabulary and collocational knowledge`,

  highlight_incorrect_words: `You are an expert PTE Academic Listening evaluator and coach.
For Highlight Incorrect Words tasks, evaluate:
- Ability to simultaneously listen and read
- Attention to detail at the word level
- Speed and accuracy of identification

Strategies:
- Follow the text with your eyes while listening
- Focus on content words (nouns, verbs, adjectives) as these are most often changed
- Don't get distracted by one change and miss others`,

  fill_in_blanks_listening: `You are an expert PTE Academic Listening Fill in the Blanks evaluator.
Evaluate:
- Ability to transcribe spoken words accurately
- Spelling accuracy under time pressure
- Handling of academic vocabulary

Common errors:
- Mishearing similar-sounding words (affect/effect, their/there)
- Spelling errors on academic vocabulary
- Missing function words`,

  write_from_dictation: `You are an expert PTE Academic Write from Dictation evaluator and coach.
This is the highest-value listening task. Evaluate:
- WORD ACCURACY: Each correct word scores 1 point
- SPELLING: Incorrect spelling = 0 points for that word
- WORD ORDER: Words must be in correct position

Scoring: Each correct word = 1 point (max = number of words in sentence)

Common errors:
- Mishearing unstressed function words (a, the, of, to)
- Spelling errors on academic vocabulary
- Omitting words from the middle of the sentence
- Adding extra words not in the original`,
};

/**
 * Generate comprehensive task-specific AI feedback
 */
export async function generateTaskFeedback(params: {
  taskType: string;
  question: string;
  studentResponse: string;
  correctAnswer?: string;
  score: number;
  maxScore: number;
  transcription?: string;
}): Promise<TaskFeedback> {
  const coachingPrompt = TASK_COACHING_PROMPTS[params.taskType] || TASK_COACHING_PROMPTS.write_essay;
  const scorePercentage = params.maxScore > 0 ? (params.score / params.maxScore) * 100 : 0;

  const systemPrompt = `${coachingPrompt}

You are providing detailed coaching feedback to a PTE Academic student.
The student scored ${params.score}/${params.maxScore} (${Math.round(scorePercentage)}%).

Provide actionable, specific, encouraging feedback that helps them improve.
Be specific about WHAT went wrong and HOW to fix it.
Include a model answer or example where appropriate.

Return ONLY valid JSON matching this exact schema:
{
  "overallBand": "<Excellent|Good|Satisfactory|Needs Improvement|Poor>",
  "scoreBreakdown": [
    {"criterion": "<name>", "score": <0-5>, "maxScore": 5, "comment": "<specific comment>"}
  ],
  "detailedFeedback": "<3-5 sentences of detailed, specific feedback>",
  "specificErrors": [
    {"type": "<error type>", "example": "<what student did>", "correction": "<what they should do>", "explanation": "<why this matters>"}
  ],
  "modelAnswer": "<ideal response or key phrases to use>",
  "improvementTips": [
    {"priority": "<high|medium|low>", "skill": "<skill name>", "tip": "<specific actionable tip>", "practiceExercise": "<concrete exercise to practice>"}
  ],
  "nextSteps": ["<step 1>", "<step 2>", "<step 3>"],
  "estimatedScoreRange": {"min": <10-90>, "max": <10-90>}
}`;

  const userMessage = `Task Type: ${params.taskType.replace(/_/g, " ").toUpperCase()}
Question/Prompt: ${params.question}
Student's Response: ${params.studentResponse}
${params.correctAnswer ? `Correct Answer: ${params.correctAnswer}` : ""}
${params.transcription ? `Audio Transcription: ${params.transcription}` : ""}
Score: ${params.score}/${params.maxScore}`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "task_feedback",
          strict: true,
          schema: {
            type: "object",
            properties: {
              overallBand: { type: "string", enum: ["Excellent", "Good", "Satisfactory", "Needs Improvement", "Poor"] },
              scoreBreakdown: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    criterion: { type: "string" },
                    score: { type: "number" },
                    maxScore: { type: "number" },
                    comment: { type: "string" },
                  },
                  required: ["criterion", "score", "maxScore", "comment"],
                  additionalProperties: false,
                },
              },
              detailedFeedback: { type: "string" },
              specificErrors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    example: { type: "string" },
                    correction: { type: "string" },
                    explanation: { type: "string" },
                  },
                  required: ["type", "example", "correction", "explanation"],
                  additionalProperties: false,
                },
              },
              modelAnswer: { type: "string" },
              improvementTips: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    priority: { type: "string", enum: ["high", "medium", "low"] },
                    skill: { type: "string" },
                    tip: { type: "string" },
                    practiceExercise: { type: "string" },
                  },
                  required: ["priority", "skill", "tip", "practiceExercise"],
                  additionalProperties: false,
                },
              },
              nextSteps: { type: "array", items: { type: "string" } },
              estimatedScoreRange: {
                type: "object",
                properties: {
                  min: { type: "number" },
                  max: { type: "number" },
                },
                required: ["min", "max"],
                additionalProperties: false,
              },
            },
            required: ["overallBand", "scoreBreakdown", "detailedFeedback", "specificErrors", "modelAnswer", "improvementTips", "nextSteps", "estimatedScoreRange"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = result.choices[0]?.message?.content as string;
    return JSON.parse(content || "{}") as TaskFeedback;
  } catch (err) {
    console.error("Task feedback generation error:", err);
    return getDefaultTaskFeedback(params.taskType, scorePercentage);
  }
}

/**
 * Generate a personalized coaching plan based on session history
 */
export async function generateCoachingPlan(params: {
  userId: number;
  targetScore: number;
  recentScores: {
    taskType: string;
    section: string;
    score: number;
    maxScore: number;
    date: Date;
  }[];
  skillScores: {
    grammar?: number;
    vocabulary?: number;
    pronunciation?: number;
    fluency?: number;
    spelling?: number;
    writtenDiscourse?: number;
  };
}): Promise<PersonalizedCoachingPlan> {
  const avgScore = params.recentScores.length > 0
    ? params.recentScores.reduce((sum, s) => sum + (s.score / s.maxScore) * 90, 0) / params.recentScores.length
    : 45;

  const sectionScores = params.recentScores.reduce((acc, s) => {
    if (!acc[s.section]) acc[s.section] = { total: 0, count: 0 };
    acc[s.section].total += (s.score / s.maxScore) * 90;
    acc[s.section].count++;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const sectionAverages = Object.entries(sectionScores).map(([section, data]) => ({
    section,
    avg: Math.round(data.total / data.count),
  }));

  const systemPrompt = `You are an expert PTE Academic coach creating a personalized study plan.
Based on the student's performance data, create a detailed, actionable coaching plan.

Student Profile:
- Target Score: ${params.targetScore}/90
- Current Estimated Score: ${Math.round(avgScore)}/90
- Score Gap: ${Math.round(params.targetScore - avgScore)} points needed

Section Performance:
${sectionAverages.map(s => `- ${s.section}: ${s.avg}/90`).join("\n")}

Enabling Skills:
${Object.entries(params.skillScores).map(([k, v]) => `- ${k}: ${v || "N/A"}/90`).join("\n")}

Create a realistic, motivating plan that:
1. Prioritizes the biggest score gaps
2. Provides specific daily practice activities
3. Sets achievable weekly milestones
4. Focuses on high-impact task types (Write from Dictation, Read Aloud, Fill in Blanks are highest scoring)

Return ONLY valid JSON:
{
  "studentLevel": "<Beginner|Elementary|Intermediate|Upper-Intermediate|Advanced>",
  "overallAssessment": "<2-3 sentence honest assessment>",
  "targetScore": ${params.targetScore},
  "currentEstimatedScore": ${Math.round(avgScore)},
  "weeklyPlan": [
    {"week": 1, "focus": "<focus area>", "tasks": ["<task 1>", "<task 2>", "<task 3>"], "targetImprovement": "<specific goal>"}
  ],
  "skillGaps": [
    {"skill": "<skill>", "currentLevel": <0-90>, "targetLevel": <0-90>, "gap": <number>, "priority": "<critical|important|nice-to-have>", "resources": ["<resource 1>", "<resource 2>"]}
  ],
  "dailyPracticeRecommendation": {
    "totalMinutes": <number>,
    "breakdown": [
      {"activity": "<activity>", "minutes": <number>, "frequency": "<daily|3x/week|weekly>"}
    ]
  },
  "motivationalMessage": "<encouraging, personalized message>"
}`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a 4-week coaching plan for this student.` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "coaching_plan",
          strict: true,
          schema: {
            type: "object",
            properties: {
              studentLevel: { type: "string", enum: ["Beginner", "Elementary", "Intermediate", "Upper-Intermediate", "Advanced"] },
              overallAssessment: { type: "string" },
              targetScore: { type: "number" },
              currentEstimatedScore: { type: "number" },
              weeklyPlan: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    week: { type: "number" },
                    focus: { type: "string" },
                    tasks: { type: "array", items: { type: "string" } },
                    targetImprovement: { type: "string" },
                  },
                  required: ["week", "focus", "tasks", "targetImprovement"],
                  additionalProperties: false,
                },
              },
              skillGaps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    skill: { type: "string" },
                    currentLevel: { type: "number" },
                    targetLevel: { type: "number" },
                    gap: { type: "number" },
                    priority: { type: "string", enum: ["critical", "important", "nice-to-have"] },
                    resources: { type: "array", items: { type: "string" } },
                  },
                  required: ["skill", "currentLevel", "targetLevel", "gap", "priority", "resources"],
                  additionalProperties: false,
                },
              },
              dailyPracticeRecommendation: {
                type: "object",
                properties: {
                  totalMinutes: { type: "number" },
                  breakdown: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        activity: { type: "string" },
                        minutes: { type: "number" },
                        frequency: { type: "string" },
                      },
                      required: ["activity", "minutes", "frequency"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["totalMinutes", "breakdown"],
                additionalProperties: false,
              },
              motivationalMessage: { type: "string" },
            },
            required: ["studentLevel", "overallAssessment", "targetScore", "currentEstimatedScore", "weeklyPlan", "skillGaps", "dailyPracticeRecommendation", "motivationalMessage"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = result.choices[0]?.message?.content as string;
    return JSON.parse(content || "{}") as PersonalizedCoachingPlan;
  } catch (err) {
    console.error("Coaching plan generation error:", err);
    return getDefaultCoachingPlan(params.targetScore, Math.round(avgScore));
  }
}

/**
 * Generate instant micro-feedback for a specific error pattern
 */
export async function generateMicroFeedback(params: {
  taskType: string;
  errorType: string;
  studentExample: string;
  correctExample?: string;
}): Promise<{ explanation: string; tip: string; example: string }> {
  try {
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a PTE Academic tutor. Give a brief, clear explanation of this error and how to fix it. Be encouraging and specific. Return JSON: {"explanation": "<2 sentences>", "tip": "<1 actionable tip>", "example": "<corrected example>"}`
        },
        {
          role: "user",
          content: `Task: ${params.taskType}\nError: ${params.errorType}\nStudent wrote: "${params.studentExample}"\n${params.correctExample ? `Correct: "${params.correctExample}"` : ""}`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "micro_feedback",
          strict: true,
          schema: {
            type: "object",
            properties: {
              explanation: { type: "string" },
              tip: { type: "string" },
              example: { type: "string" },
            },
            required: ["explanation", "tip", "example"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = result.choices[0]?.message?.content as string;
    return JSON.parse(content || "{}");
  } catch {
    return {
      explanation: "This is a common error in PTE Academic tasks.",
      tip: "Review this area and practice with similar examples.",
      example: params.correctExample || "See the model answer for reference.",
    };
  }
}

function getDefaultTaskFeedback(taskType: string, scorePercentage: number): TaskFeedback {
  const band = scorePercentage >= 85 ? "Excellent"
    : scorePercentage >= 70 ? "Good"
    : scorePercentage >= 55 ? "Satisfactory"
    : scorePercentage >= 40 ? "Needs Improvement"
    : "Poor";

  return {
    taskType,
    overallBand: band as TaskFeedback["overallBand"],
    scoreBreakdown: [
      { criterion: "Content", score: Math.round(scorePercentage / 20), maxScore: 5, comment: "Your response addressed the task requirements." },
      { criterion: "Language", score: Math.round(scorePercentage / 20), maxScore: 5, comment: "Work on improving language accuracy and range." },
    ],
    detailedFeedback: `Your response scored ${Math.round(scorePercentage)}% on this ${taskType.replace(/_/g, " ")} task. ${band === "Excellent" ? "Excellent work! You demonstrated strong command of the task requirements." : "There is room for improvement. Focus on the specific areas highlighted below."}`,
    specificErrors: [],
    modelAnswer: "Please review the task guidelines and model answers in the learning resources section.",
    improvementTips: [
      {
        priority: "high",
        skill: "Task Strategy",
        tip: `For ${taskType.replace(/_/g, " ")} tasks, always read the instructions carefully and plan your response before starting.`,
        practiceExercise: "Complete 5 similar practice questions daily, reviewing feedback after each attempt.",
      },
    ],
    nextSteps: [
      "Review the model answer and identify differences from your response",
      "Practice 3 similar questions focusing on the weakest area",
      "Record yourself and listen back to identify pronunciation issues",
    ],
    estimatedScoreRange: {
      min: Math.max(10, Math.round(scorePercentage * 0.8)),
      max: Math.min(90, Math.round(scorePercentage * 0.9 + 10)),
    },
  };
}

function getDefaultCoachingPlan(targetScore: number, currentScore: number): PersonalizedCoachingPlan {
  const gap = targetScore - currentScore;
  return {
    studentLevel: currentScore >= 70 ? "Upper-Intermediate" : currentScore >= 55 ? "Intermediate" : "Elementary",
    overallAssessment: `You are currently estimated at ${currentScore}/90 with a target of ${targetScore}/90. With focused practice on your weak areas, you can close this ${gap}-point gap within 4-8 weeks.`,
    targetScore,
    currentEstimatedScore: currentScore,
    weeklyPlan: [
      { week: 1, focus: "Foundation Skills", tasks: ["Complete 10 Read Aloud questions", "Practice 15 Write from Dictation", "Review grammar fundamentals"], targetImprovement: "+3-5 points on Speaking" },
      { week: 2, focus: "Writing Skills", tasks: ["Write 3 essays with feedback", "Summarize 5 texts", "Study academic vocabulary list"], targetImprovement: "+3-5 points on Writing" },
      { week: 3, focus: "Reading & Listening", tasks: ["Complete 20 MCQ questions", "Practice Fill in the Blanks daily", "Listen to academic lectures"], targetImprovement: "+3-5 points on Reading/Listening" },
      { week: 4, focus: "Mock Tests & Consolidation", tasks: ["Complete 2 full mock tests", "Review all weak areas", "Focus on time management"], targetImprovement: "Consolidate all gains" },
    ],
    skillGaps: [
      { skill: "Oral Fluency", currentLevel: currentScore - 5, targetLevel: targetScore, gap: gap + 5, priority: "critical", resources: ["Read Aloud practice daily", "Shadowing technique with native speakers"] },
      { skill: "Written Discourse", currentLevel: currentScore, targetLevel: targetScore, gap, priority: "important", resources: ["Essay structure templates", "Academic writing guides"] },
    ],
    dailyPracticeRecommendation: {
      totalMinutes: 90,
      breakdown: [
        { activity: "Read Aloud (5 questions)", minutes: 20, frequency: "daily" },
        { activity: "Write from Dictation (10 sentences)", minutes: 15, frequency: "daily" },
        { activity: "Essay Writing", minutes: 25, frequency: "3x/week" },
        { activity: "Listening Practice", minutes: 20, frequency: "daily" },
        { activity: "Vocabulary Review", minutes: 10, frequency: "daily" },
      ],
    },
    motivationalMessage: `You're ${gap} points away from your target. Every practice session brings you closer. Focus on Write from Dictation and Read Aloud as they offer the highest score gains per hour of practice. You've got this!`,
  };
}
