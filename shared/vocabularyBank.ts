export interface VocabularyItem {
  id: string;
  collocation: string;
  meaning: string;
  example: string;
  pteTaskType: string;
}

export const PTE_VOCABULARY_BANK: VocabularyItem[] = [
  {
    id: "v1",
    collocation: "Profound structural shift",
    meaning: "A deep and fundamental change in system organization.",
    example: "The transition to renewable energy represents a profound structural shift.",
    pteTaskType: "read_aloud",
  },
  {
    id: "v2",
    collocation: "Mitigate adverse impacts",
    meaning: "To make negative consequences less severe or harmful.",
    example: "Governments must implement policies to mitigate adverse impacts of climate change.",
    pteTaskType: "summarize_written_text",
  },
  {
    id: "v3",
    collocation: "Empirical evidence indicates",
    meaning: "Verifiable observation or data shows or points to a conclusion.",
    example: "Empirical evidence indicates that early intervention improves educational outcomes.",
    pteTaskType: "write_essay",
  },
  {
    id: "v4",
    collocation: "Cognitive flexibility",
    meaning: "The mental ability to switch between thinking about two different concepts.",
    example: "Bilingualism enhances cognitive flexibility and problem-solving skills.",
    pteTaskType: "retell_lecture",
  },
  {
    id: "v5",
    collocation: "Socioeconomic disparity",
    meaning: "Differences in economic and social wealth between people or groups.",
    example: "Policymakers struggle to address growing socioeconomic disparity in urban centers.",
    pteTaskType: "summarize_spoken_text",
  },
  {
    id: "v6",
    collocation: "Intermittent renewable sources",
    meaning: "Energy sources like wind and solar that do not produce power continuously.",
    example: "Integrating intermittent renewable sources requires advanced grid storage.",
    pteTaskType: "multiple_choice_multiple",
  },
  {
    id: "v7",
    collocation: "Ecosystem resilience",
    meaning: "An ecosystem's ability to recover from disturbance.",
    example: "Biodiversity conservation is vital for maintaining ecosystem resilience.",
    pteTaskType: "fill_blanks_reading",
  },
  {
    id: "v8",
    collocation: "Urban heat island effect",
    meaning: "Metropolitan areas significantly warmer than rural surroundings.",
    example: "Green roofing initiatives help combat the urban heat island effect.",
    pteTaskType: "describe_image",
  },
];
