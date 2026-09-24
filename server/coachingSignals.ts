export interface GrammarSignal {
  type: "subject-verb agreement" | "tense" | "articles" | "prepositions";
  example: string;
  correction: string;
  explanation: string;
  impactOnScore: "medium";
}

export interface VocabularyMetrics {
  wordCount: number;
  lexicalDiversity: number;
  academicWordCount: number;
  collocationCount: number;
}

const ACADEMIC_WORDS = new Set([
  "analyze", "analysis", "approach", "benefit", "consequently", "constitute", "contribute", "demonstrate",
  "distribution", "economic", "environmental", "factor", "fundamental", "indicate", "innovation", "interpret",
  "significant", "sustainable", "theory", "therefore", "trend", "variation", "whereas", "whereby",
]);

const COLLOCATIONS = [
  /significant\s+(?:impact|role|factor)/i,
  /plays?\s+(?:a|an)\s+(?:important|significant|crucial)\s+role/i,
  /(?:rapid|economic|social|technological)\s+development/i,
  /(?:address|tackle|mitigate)\s+(?:the\s+)?(?:issue|problem|challenge)/i,
];

export function detectGrammarSignals(response: string): GrammarSignal[] {
  const text = response.trim();
  if (!text) return [];
  const signals: GrammarSignal[] = [];
  const push = (signal: GrammarSignal) => {
    if (!signals.some(existing => existing.type === signal.type)) signals.push(signal);
  };

  if (/\b(?:he|she|it)\s+(?:are|were|have|do)\b|\b(?:they|we|you)\s+(?:is|was|has|does)\b/i.test(text)) {
    push({ type: "subject-verb agreement", example: "subject and verb do not agree", correction: "Match the verb to the subject in number and person.", explanation: "Agreement errors reduce grammatical accuracy and can make the response harder to follow.", impactOnScore: "medium" });
  }
  if (/\b(?:yesterday|last\s+year|in\s+\d{4})\b[^.!?]{0,50}\b(?:is|are|will)\b/i.test(text)) {
    push({ type: "tense", example: "past-time marker paired with a present or future verb", correction: "Use a past-tense verb for completed past events.", explanation: "Tense consistency clarifies when events happened.", impactOnScore: "medium" });
  }
  if (/\b(?:a|an)\s+(?:information|advice|research|equipment|evidence)\b/i.test(text)) {
    push({ type: "articles", example: "article used with an uncountable noun", correction: "Use the uncountable noun without a/an, or add a countable unit.", explanation: "Article choice is part of grammatical form in academic writing.", impactOnScore: "medium" });
  }
  if (/\b(?:discuss|depend|interested|responsible|impact)\s+(?:about|of|with|on)\b/i.test(text)) {
    push({ type: "prepositions", example: "verb or adjective paired with an incorrect preposition", correction: "Check the fixed preposition used by the expression.", explanation: "Preposition errors affect naturalness and precise meaning.", impactOnScore: "medium" });
  }
  return signals;
}

export function measureVocabularySophistication(response: string): VocabularyMetrics {
  const words = response.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
  const unique = new Set(words);
  return {
    wordCount: words.length,
    lexicalDiversity: words.length ? Number((unique.size / words.length).toFixed(2)) : 0,
    academicWordCount: words.filter(word => ACADEMIC_WORDS.has(word)).length,
    collocationCount: COLLOCATIONS.filter(pattern => pattern.test(response)).length,
  };
}
