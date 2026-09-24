export interface ScoreSimulationInput {
  currentOverall: number;
  targetScore: number;
  speaking: number;
  writing: number;
  reading: number;
  listening: number;
  grammar: number;
  vocabulary: number;
  oralFluency: number;
  pronunciation: number;
  spelling: number;
  writtenDiscourse: number;
}

export interface SkillProjection {
  skill: string;
  current: number;
  projected: number;
  gap: number;
  recommendation: string;
}

export interface ScoreSimulationResult {
  projectedOverall: number;
  isTargetMet: boolean;
  scoreGap: number;
  projections: SkillProjection[];
}

export function simulateTargetScores(input: ScoreSimulationInput, practiceHoursAdded: number = 10): ScoreSimulationResult {
  const boost = Math.min(6, Math.round(practiceHoursAdded * 0.4));

  const skills: Array<{ key: keyof ScoreSimulationInput; name: string; rec: string }> = [
    { key: "speaking", name: "Speaking", rec: "Practice 10 Read Aloud & Repeat Sentence questions daily focusing on phrase chunking." },
    { key: "writing", name: "Writing", rec: "Draft 2 Summarize Written Text paragraphs and 1 Essay weekly with strict timer discipline." },
    { key: "reading", name: "Reading", rec: "Master Fill in the Blanks collocation patterns and Reorder Paragraph reference markers." },
    { key: "listening", name: "Listening", rec: "Drill Write from Dictation and Highlight Incorrect Words daily to eliminate spelling errors." },
    { key: "grammar", name: "Grammar", rec: "Review complex clause structures and subordinating conjunctions for essay and summarize tasks." },
    { key: "vocabulary", name: "Vocabulary", rec: "Build academic word lists and study prepositional collocations for blanks tasks." },
    { key: "oralFluency", name: "Oral Fluency", rec: "Maintain steady 100–160 WPM cadence without self-correction hesitation loops." },
    { key: "pronunciation", name: "Pronunciation", rec: "Emphasize primary word stress and vowel clarity in multisyllabic vocabulary." },
  ];

  const projections: SkillProjection[] = skills.map(({ key, name, rec }) => {
    const current = Number(input[key]) || 55;
    const projected = Math.min(90, Math.round(current + boost * (1 + (input.targetScore - current) * 0.01)));
    const gap = Math.max(0, input.targetScore - current);
    return {
      skill: name,
      current,
      projected,
      gap,
      recommendation: gap > 0 ? rec : "Maintaining strong mastery.",
    };
  });

  const avgProjected = Math.round(projections.reduce((acc, p) => acc + p.projected, 0) / projections.length);
  const projectedOverall = Math.min(90, Math.max(10, avgProjected));
  const scoreGap = Math.max(0, input.targetScore - projectedOverall);

  return {
    projectedOverall,
    isTargetMet: projectedOverall >= input.targetScore,
    scoreGap,
    projections,
  };
}
