export interface TaskStudyResource {
  taskType: string;
  title: string;
  overview: string;
  strategySummary: string;
  templates: string[];
  commonMistakes: string[];
  timingAndFormat?: string;
  stepByStep?: string[];
  quickChecklist?: string[];
  practiceDrills?: string[];
  sampleBreakdown: {
    heading: string;
    description: string;
  };
}

export const TASK_STUDY_RESOURCES: Record<string, TaskStudyResource> = {
  read_aloud: {
    taskType: "read_aloud",
    title: "Read Aloud Study Guide",
    overview: "Read Aloud evaluates reading and speaking skills. You must read a short text naturally and clearly within 30 to 40 seconds.",
    strategySummary: "Maintain a steady speaking pace between 100 and 160 words per minute. Group words into meaningful phrases rather than reading word by word, and apply natural sentence intonation.",
    templates: [
      "Chunking rule: Pause briefly after commas and take a full breath at period boundaries.",
      "Emphasis pattern: Highlight key nouns, verbs, and adjectives while keeping auxiliary words light."
    ],
    commonMistakes: [
      "Rushing through the passage and slurring difficult multisyllabic vocabulary.",
      "Self-correcting repeatedly, which damages oral fluency scores."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes directly to both Speaking and Reading scores. Content (5 pts), Pronunciation (5 pts), and Oral Fluency (5 pts)."
    }
  },
  repeat_sentence: {
    taskType: "repeat_sentence",
    title: "Repeat Sentence Study Guide",
    overview: "Listen to a spoken sentence and repeat it exactly as heard without adding, omitting, or substituting words.",
    strategySummary: "Focus on capturing the rhythm and chunking of the sentence rather than memorizing isolated words. Repeat immediately with natural intonation.",
    templates: [
      "Chunk retention: Group 3-4 word phrases in your head as the speaker finishes.",
      "Fallback rule: If a word is missed, keep going smoothly rather than stuttering."
    ],
    commonMistakes: [
      "Failing to match the speaker's cadence and pausing awkwardly in the middle of the sentence.",
      "Hesitating when a difficult word is encountered."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes heavily to Speaking and Listening scores. Content (3 pts), Pronunciation (5 pts), and Oral Fluency (5 pts)."
    }
  },
  describe_image: {
    taskType: "describe_image",
    title: "Describe Image Study Guide",
    overview: "Examine a graph, chart, map, or process diagram and describe key trends, peaks, and comparisons within 40 seconds.",
    strategySummary: "Use a structured 3-part framework: state the overall title and type of visual, highlight the highest and lowest data points or major stages, and conclude with a summary trend.",
    templates: [
      "Introduction: 'The given chart illustrates information about [Topic] over a period of time.'",
      "Body details: 'Notably, the highest figure is recorded at [Value], whereas the lowest is [Value].'",
      "Conclusion: 'Overall, the diagram demonstrates a clear upward/downward trend in [Category].'"
    ],
    commonMistakes: [
      "Spending too much preparation time reading every minor data label instead of identifying the main trend.",
      "Running out of time before delivering a concluding sentence."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Speaking. Content (3 pts), Pronunciation (5 pts), and Oral Fluency (5 pts)."
    }
  },
  retell_lecture: {
    taskType: "retell_lecture",
    title: "Re-tell Lecture Study Guide",
    overview: "Listen to an academic lecture recording and summarize the core arguments, examples, and conclusion within 40 seconds.",
    strategySummary: "Take structured notes focusing on the main topic, 2-3 supporting arguments, and the concluding speaker takeaway.",
    templates: [
      "Introduction: 'The lecture primarily discusses [Topic] and its significance in [Field].'",
      "Body points: 'Furthermore, the speaker points out that [Key Point 1] and elaborates on [Key Point 2].'",
      "Conclusion: 'In conclusion, the lecture highlights the importance of understanding [Final Takeaway].'"
    ],
    commonMistakes: [
      "Memorizing disjointed phrases without synthesizing the lecturer's core argument.",
      "Speaking too quickly and stuttering when recalling notes."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Speaking and Listening. Content (3 pts), Pronunciation (5 pts), and Oral Fluency (5 pts)."
    }
  },
  answer_short_question: {
    taskType: "answer_short_question",
    title: "Answer Short Question Study Guide",
    overview: "Listen to a direct factual question and answer with one or a few words.",
    strategySummary: "Keep your response concise and immediate. Do not construct full sentences unless necessary; output the direct noun or phrase.",
    templates: [
      "Direct response format: [Single Word / Short Noun Phrase]"
    ],
    commonMistakes: [
      "Overthinking and adding unnecessary explanatory clauses.",
      "Hesitating after the audio prompt ends."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Speaking and Listening vocabulary score. 1 mark per correct answer."
    }
  },
  summarize_group_discussion: {
    taskType: "summarize_group_discussion",
    title: "Summarize Group Discussion Study Guide",
    overview: "Listen to a multi-speaker academic conversation and summarize key viewpoints, agreements, and conclusions.",
    strategySummary: "Track distinct speaker viewpoints and note where participants agree or disagree before synthesizing the overarching outcome.",
    templates: [
      "Speaker breakdown: 'The discussion involves multiple speakers debating [Topic].'",
      "Synthesis: 'While Speaker A emphasizes [Point], Speaker B suggests [Point].'",
      "Outcome: 'Ultimately, the group concludes that [Resolution].'"
    ],
    commonMistakes: [
      "Focusing exclusively on the first speaker and missing later counter-arguments.",
      "Exceeding the 2-minute response window or trailing off prematurely."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Speaking and Listening. Content (3 pts), Pronunciation (5 pts), Oral Fluency (5 pts)."
    }
  },
  respond_to_situation: {
    taskType: "respond_to_situation",
    title: "Respond to a Situation Study Guide",
    overview: "Read a real-world scenario prompt and deliver an appropriate spoken response addressing the problem politely and directly.",
    strategySummary: "Acknowledge the situation immediately, state your request or proposal clearly, and maintain a polite, professional register.",
    templates: [
      "Opening: 'Hello, I am calling regarding [Issue]...'",
      "Resolution request: 'Would it be possible to arrange [Solution]?'"
    ],
    commonMistakes: [
      "Failing to address all constraints mentioned in the scenario prompt.",
      "Using overly informal or abrupt language."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Speaking. Content (3 pts), Pronunciation (5 pts), Oral Fluency (5 pts)."
    }
  },
  summarize_written_text: {
    taskType: "summarize_written_text",
    title: "Summarize Written Text Study Guide",
    overview: "Read a passage and write a single, cohesive sentence summarizing the main idea within 5 to 75 words.",
    strategySummary: "Combine the central thesis and primary supporting points into one compound or complex sentence using correct punctuation.",
    templates: [
      "Complex sentence template: 'Although [Minor Context], the passage primarily argues that [Main Idea], and further highlights [Supporting Detail].'"
    ],
    commonMistakes: [
      "Writing multiple sentences separated by periods instead of a single sentence.",
      "Exceeding 75 words or omitting the passage's primary focus."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Writing and Reading. Content (2 pts), Form (1 pt), Grammar (2 pts), Vocabulary (2 pts)."
    }
  },
  write_essay: {
    taskType: "write_essay",
    title: "Write Essay Study Guide (High Score Weightage)",
    overview: "Write a 200–300 word argumentative or analytical essay responding to a prompt. Heavily weighted for Writing, Grammar, Vocabulary, and Written Discourse.",
    strategySummary: "Adopt a rigorous 4-paragraph template ensuring precise thesis formulation, paragraph transitions, and 220–280 word count control.",
    templates: [
      "Paragraph 1 (Intro): 'The question of whether [Topic] is a subject of considerable debate in modern society. While some individuals argue that [Perspective A], I firmly believe that [Perspective B] due to [Key Reason 1] and [Key Reason 2].'",
      "Paragraph 2 (Body 1): 'To begin with, [Argument 1] plays a pivotal role in this context. For example, recent studies indicate that [Concrete Evidence/Example], which demonstrates the profound impact of [Keyword].'",
      "Paragraph 3 (Body 2): 'Furthermore, another critical factor to consider is [Argument 2]. Consequently, stakeholders must evaluate how [Secondary Evidence] shapes the broader landscape of [Field].'",
      "Paragraph 4 (Conclusion): 'In conclusion, although valid arguments exist on both sides, the benefits of [Preferred Stance] clearly outweigh the drawbacks. Ultimately, society stands to gain when [Final Recommendation].'"
    ],
    commonMistakes: [
      "Writing under 200 words or over 300 words, resulting in severe Form penalties.",
      "Failing to maintain a consistent academic tone and paragraph indentation."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Writing. Content (3 pts), Form (2 pts), Grammar (2 pts), Vocabulary (2 pts), Written Discourse (2 pts), Spelling (2 pts)."
    }
  },
  multiple_choice_single: {
    taskType: "multiple_choice_single",
    title: "Multiple Choice (Single Answer) Study Guide",
    overview: "Read a passage and select the single best option answering the question.",
    strategySummary: "Read the prompt question first so you know what information to scan for in the passage. Eliminate incorrect distractors before choosing.",
    templates: [
      "Scan strategy: Look for synonym matches between the question stem and text sentences."
    ],
    commonMistakes: [
      "Selecting an option that is factually true according to general knowledge but unsupported by the passage text.",
      "Rushing through without checking all four options."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Reading. 1 mark for correct answer, 0 for incorrect."
    }
  },
  multiple_choice_multiple: {
    taskType: "multiple_choice_multiple",
    title: "Multiple Choice (Multiple Answers) Study Guide",
    overview: "Read a passage and select all correct response options. Negative marking applies.",
    strategySummary: "Evaluate each option independently against the passage. If unsure about an option, omit it to avoid negative score deductions.",
    templates: [
      "Safety rule: Only select options that have direct textual support in the passage."
    ],
    commonMistakes: [
      "Guessing blindly on uncertain options, leading to negative scoring penalties.",
      "Selecting only one option when multiple are required."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Reading. +1 per correct choice, −1 per incorrect choice (minimum 0)."
    }
  },
  reorder_paragraphs: {
    taskType: "reorder_paragraphs",
    title: "Re-order Paragraphs Study Guide",
    overview: "Restore scrambled text boxes to their correct logical sequence.",
    strategySummary: "Identify the independent topic sentence (no pronoun references or dependent conjunctions at the start), then pair paragraphs using lexical chains and reference links.",
    templates: [
      "Topic sentence rule: Look for standalone noun phrases without preceding pronouns (this, these, furthermore, however).",
      "Pairing rule: Match pronoun antecedents and chronological/logical transitions between adjacent blocks."
    ],
    commonMistakes: [
      "Guessing the entire sequence without establishing independent topic sentences first.",
      "Ignoring transition markers like 'consequently' or 'on the other hand'."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Reading. 1 mark per correctly placed adjacent pair."
    }
  },
  fill_blanks_reading: {
    taskType: "fill_blanks_reading",
    title: "Fill in the Blanks (Reading) Study Guide",
    overview: "Drag correct vocabulary words from the word bank to fill missing gaps in a reading passage.",
    strategySummary: "Analyze the grammatical category (noun, verb, adjective, adverb) and collocations required immediately before and after each blank.",
    templates: [
      "Collocation check: Match standard phrasing (e.g., 'play a crucial role', 'take into account')."
    ],
    commonMistakes: [
      "Placing words solely based on translation without checking grammatical part of speech.",
      "Leaving blanks empty when unsure."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Reading. 1 mark per correct blank."
    }
  },
  fill_blanks_rw: {
    taskType: "fill_blanks_rw",
    title: "Fill in the Blanks (Reading & Writing) Study Guide",
    overview: "Select the correct word from dropdown menus to complete missing blanks in an academic text.",
    strategySummary: "Examine semantic register, tense agreement, and fixed prepositional collocations for each dropdown option.",
    templates: [
      "Dropdown strategy: Read the full sentence before choosing to ensure contextual coherence."
    ],
    commonMistakes: [
      "Choosing words that fit grammatically but violate standard academic collocations.",
      "Ignoring surrounding tense consistency."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to both Reading and Writing. 1 mark per correct blank."
    }
  },
  summarize_spoken_text: {
    taskType: "summarize_spoken_text",
    title: "Summarize Spoken Text Study Guide",
    overview: "Listen to a 60–90 second audio recording and write a 50–70 word academic summary.",
    strategySummary: "Record key terms and speaker arguments during audio playback, then synthesize into a well-punctuated 50–70 word paragraph.",
    templates: [
      "Summary structure: 'The speaker discusses [Topic], explaining that [Argument 1] and [Argument 2]. Ultimately, the lecture concludes that [Takeaway].'"
    ],
    commonMistakes: [
      "Writing under 50 words or over 70 words, causing automatic form failure.",
      "Including minor tangent examples while missing the primary lecture thesis."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Listening and Writing. Content (2 pts), Form (1 pt), Grammar (2 pts), Vocabulary (2 pts), Spelling (2 pts)."
    }
  },
  fill_blanks_listening: {
    taskType: "fill_blanks_listening",
    title: "Fill in the Blanks (Listening) Study Guide",
    overview: "Listen to an audio recording and type missing words into the transcript as you hear them.",
    strategySummary: "Follow the transcript cursor closely and type rapidly. Double-check spelling since spelling errors receive zero credit.",
    templates: [
      "Pacing rule: Keep your cursor near the audio playback position so you don't fall behind."
    ],
    commonMistakes: [
      "Making minor spelling mistakes on plurals or suffixes.",
      "Hesitating on a word and missing the next two blanks."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Listening and Writing. 1 mark per correctly spelled word."
    }
  },
  highlight_correct_summary: {
    taskType: "highlight_correct_summary",
    title: "Highlight Correct Summary Study Guide",
    overview: "Listen to an audio recording and select the paragraph summary that best captures the recording's core message.",
    strategySummary: "Take notes on the speaker's overarching thesis before looking at the options. Eliminate options that contain minor inaccuracies or omit major themes.",
    templates: [
      "Evaluation rule: Compare each summary option against your core lecture notes."
    ],
    commonMistakes: [
      "Choosing a summary option because it sounds professional even if it contradicts a detail in the recording.",
      "Failing to read all options thoroughly."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Listening and Reading. 1 mark for correct option, 0 for incorrect."
    }
  },
  select_missing_word: {
    taskType: "select_missing_word",
    title: "Select Missing Word Study Guide",
    overview: "Listen to a recorded audio passage where the final word or group of words has been replaced by a beep. Select the correct completion option.",
    strategySummary: "Pay close attention to the argument flow and topic vocabulary leading up to the final beep so you can anticipate the conclusion.",
    templates: [
      "Anticipation rule: Track the lexical theme of the final sentence to deduce the missing term."
    ],
    commonMistakes: [
      "Choosing an option that fits grammatically but introduces an unrelated subject.",
      "Losing concentration near the end of the audio clip."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Listening. 1 mark for correct selection, 0 for incorrect."
    }
  },
  highlight_incorrect_words: {
    taskType: "highlight_incorrect_words",
    title: "Highlight Incorrect Words Study Guide",
    overview: "Listen to an audio recording while following a transcript. Click on words in the transcript that differ from what the speaker says.",
    strategySummary: "Glide your cursor along the transcript in sync with the audio speaker. Incorrect words are typically substituted synonyms.",
    templates: [
      "Tracking rule: Keep your eyes slightly ahead of the audio playback to catch substitutions instantly."
    ],
    commonMistakes: [
      "Clicking correct words due to hesitation, triggering negative marking penalties.",
      "Falling behind the audio speaker."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes to Listening and Reading. +1 per correct selection, −1 per incorrect click (minimum 0)."
    }
  },
  write_from_dictation: {
    taskType: "write_from_dictation",
    title: "Write from Dictation Study Guide",
    overview: "Listen to a spoken sentence and type it accurately into the response box.",
    strategySummary: "Write down the initial letters of each word on scratch paper or type shorthand immediately, then reconstruct the full sentence with correct spelling and punctuation.",
    templates: [
      "Shorthand rule: Jot down the first letter of every word (e.g., 'The quick brown fox' → 't q b f') to secure complete word order."
    ],
    commonMistakes: [
      "Forgetting plural endings (-s, -es) or past tense markers (-ed).",
      "Failing to check spelling on challenging academic words."
    ],
    sampleBreakdown: {
      heading: "Scoring Weight & Impact",
      description: "Contributes heavily to Listening and Writing scores. 1 mark per correctly spelled word."
    }
  }
};

const TASK_RESOURCE_EXTENSIONS: Record<string, Pick<TaskStudyResource, "timingAndFormat" | "stepByStep" | "quickChecklist" | "practiceDrills">> = {
  personal_introduction: {
    timingAndFormat: "25 seconds to prepare and up to 30 seconds to respond; unscored familiarisation task.",
    stepByStep: ["Check your microphone.", "State your background clearly.", "Finish naturally without rushing."],
    quickChecklist: ["Natural delivery", "Clear volume", "Short, organised response"],
    practiceDrills: ["Record a 20-second introduction and listen for volume and pace.", "Repeat the same introduction with one new detail."],
  },
  read_aloud: {
    timingAndFormat: "30–40 seconds to prepare and approximately 30–40 seconds to speak, depending on the prompt.",
    stepByStep: ["Scan punctuation and difficult words.", "Group the text into meaningful phrases.", "Read continuously with controlled intonation."],
    quickChecklist: ["No skipped words", "Phrase-level pauses", "Steady 100–160 WPM pace"],
    practiceDrills: ["Mark slash pauses in three passages before recording.", "Shadow a model reading, then record without the model."],
  },
  repeat_sentence: {
    timingAndFormat: "Listen once, then repeat immediately; the response window is short and content accuracy matters.",
    stepByStep: ["Listen for the sentence rhythm.", "Retain 3–4 word chunks.", "Repeat all remembered words smoothly."],
    quickChecklist: ["Immediate start", "Correct word order", "No self-correction loops"],
    practiceDrills: ["Repeat sentences in chunks of four words.", "Practise retaining function words such as articles and prepositions."],
  },
  describe_image: {
    timingAndFormat: "Use preparation time to identify the visual type, main trend, and two supporting details; speak for about 40 seconds.",
    stepByStep: ["Name the visual and topic.", "State the overall trend.", "Compare the highest, lowest, or most important features.", "Conclude with one clear takeaway."],
    quickChecklist: ["Overview first", "At least two details", "Clear conclusion"],
    practiceDrills: ["Describe one chart using only four sentences.", "Practise comparing two categories without reading every label."],
  },
  retell_lecture: {
    timingAndFormat: "Listen and take notes, then retell the main ideas in a concise spoken response.",
    stepByStep: ["Note the topic.", "Capture two or three key points.", "Connect the points with simple discourse markers.", "End with the speaker's conclusion."],
    quickChecklist: ["Main topic", "Supporting points", "Logical sequence", "Audible conclusion"],
    practiceDrills: ["Create a five-word note for each key idea.", "Retell a short lecture in topic–points–conclusion order."],
  },
  answer_short_question: {
    timingAndFormat: "Listen to a factual question and answer with the shortest correct word or phrase.",
    stepByStep: ["Identify the question type.", "Retrieve the key noun or phrase.", "Answer immediately and stop."],
    quickChecklist: ["Relevant answer", "No unnecessary explanation", "Fast response"],
    practiceDrills: ["Answer common academic vocabulary questions in one phrase.", "Practise distinguishing who, where, when, and what questions."],
  },
  respond_to_situation: {
    timingAndFormat: "Use the preparation period to plan the purpose, audience, and polite action before responding to the situation.",
    stepByStep: ["Identify the relationship and goal.", "Open politely.", "State the request or response.", "Close with an appropriate next step."],
    quickChecklist: ["Situation addressed", "Appropriate tone", "Complete response"],
    practiceDrills: ["Respond to one formal and one informal situation.", "Rewrite a direct request in a more polite form."],
  },
  summarize_group_discussion: {
    timingAndFormat: "Listen to multiple viewpoints, then synthesise the central issue and outcome in a structured response.",
    stepByStep: ["Note the shared topic.", "Assign one idea to each speaker.", "Identify agreement or contrast.", "Summarise the final position."],
    quickChecklist: ["Multiple viewpoints", "Comparison language", "Overall synthesis"],
    practiceDrills: ["Use a two-column note grid for speaker viewpoints.", "Summarise a discussion in four connected sentences."],
  },
  summarize_written_text: {
    timingAndFormat: "Write one grammatically complete sentence within the task time and keep the response within the required word range.",
    stepByStep: ["Find the thesis.", "Select the two most important supporting ideas.", "Join them with a logical linker.", "Check one-sentence form and punctuation."],
    quickChecklist: ["One sentence", "Main idea retained", "No irrelevant example", "Correct punctuation"],
    practiceDrills: ["Reduce a paragraph to 20 words, then expand to the target range.", "Combine three short sentences using an accurate subordinating linker."],
  },
  write_essay: {
    timingAndFormat: "Plan, draft, and proofread a structured essay within the official response window and target word range.",
    stepByStep: ["Choose a clear position.", "Outline two body arguments.", "Add an example or explanation to each.", "Proofread grammar, spelling, and paragraph links."],
    quickChecklist: ["Position is explicit", "Two developed arguments", "Logical paragraphs", "Proofread ending"],
    practiceDrills: ["Write a three-minute outline before drafting.", "Proofread one paragraph only for verbs, articles, and agreement."],
  },
  multiple_choice_single: {
    timingAndFormat: "Read or listen for the central idea, select one answer, and avoid changing a supported choice without evidence.",
    stepByStep: ["Read the question first.", "Eliminate contradictions.", "Compare the remaining options to the source.", "Select one answer."],
    quickChecklist: ["Question understood", "Distractors eliminated", "Exactly one selection"],
    practiceDrills: ["Explain why each distractor is wrong.", "Answer once from the source, then verify with a second reading."],
  },
  multiple_choice_multiple: {
    timingAndFormat: "Select every option supported by the source; incorrect extra selections can reduce objective credit.",
    stepByStep: ["Find the evidence for each option.", "Mark supported statements.", "Reject broad or contradicted claims.", "Submit only the evidence-backed set."],
    quickChecklist: ["Evidence for every choice", "No unsupported extras", "All options reviewed"],
    practiceDrills: ["Label each option supported, contradicted, or not mentioned.", "Practise stopping once the evidence-backed set is complete."],
  },
  reorder_paragraphs: {
    timingAndFormat: "Arrange the text segments into a coherent sequence using topic sentences, pronouns, and linking devices.",
    stepByStep: ["Find the opening sentence.", "Pair references with their antecedents.", "Follow chronology or cause and effect.", "Check adjacent pair logic."],
    quickChecklist: ["Opening is general", "References resolved", "Transitions flow", "Ending completes the idea"],
    practiceDrills: ["Underline pronouns and connectors before ordering.", "Explain the link between each adjacent pair."],
  },
  fill_blanks_reading: {
    timingAndFormat: "Use grammar, collocation, and meaning to place the correct word in each reading blank.",
    stepByStep: ["Read the complete sentence.", "Predict the part of speech.", "Compare collocations.", "Re-read the paragraph after filling all gaps."],
    quickChecklist: ["Grammar fit", "Collocation fit", "Meaning fit", "Every blank answered"],
    practiceDrills: ["Predict a word before viewing the options.", "Build a collocation notebook from every missed blank."],
  },
  fill_blanks_rw: {
    timingAndFormat: "Choose one option for each dropdown blank and verify the full passage for grammar and academic register.",
    stepByStep: ["Read before and after the gap.", "Remove words with the wrong form.", "Compare meaning and collocation.", "Confirm every dropdown is selected."],
    quickChecklist: ["One choice per gap", "Tense agreement", "Academic register", "Full passage reread"],
    practiceDrills: ["Sort options by noun, verb, adjective, and adverb form.", "Create a four-column collocation log: verb, noun, adjective, preposition."],
  },
  summarize_spoken_text: {
    timingAndFormat: "Listen once, take compact notes, and write a concise summary within the target word range.",
    stepByStep: ["Capture topic and thesis.", "Note two supporting ideas.", "Draft with a clear subject and verb.", "Check word count and spelling."],
    quickChecklist: ["Main point", "Supporting details", "Target word range", "Proofread"],
    practiceDrills: ["Use a three-line note template during audio.", "Rewrite a long note set into a 50–70 word paragraph."],
  },
  fill_blanks_listening: {
    timingAndFormat: "Type the missing words while listening once; spelling and grammatical form are important.",
    stepByStep: ["Track the transcript position.", "Type the word immediately.", "Use context to repair endings.", "Proofread remaining blanks after playback."],
    quickChecklist: ["Audio tracking", "Correct spelling", "Correct word form", "No skipped blanks"],
    practiceDrills: ["Transcribe short clips with a pause after each sentence.", "Practise plural, past-tense, and derivational endings."],
  },
  highlight_correct_summary: {
    timingAndFormat: "Listen for the speaker's thesis and choose the summary that matches the overall meaning, not one isolated detail.",
    stepByStep: ["Write the thesis in a few words.", "Compare each option to the thesis.", "Reject contradictions and over-specific distractors.", "Select the best complete summary."],
    quickChecklist: ["Thesis match", "No contradiction", "Complete coverage"],
    practiceDrills: ["Summarise the audio before reading choices.", "Underline the exact phrase that invalidates each distractor."],
  },
  select_missing_word: {
    timingAndFormat: "Use the argument and grammar leading to the beep to anticipate the missing conclusion.",
    stepByStep: ["Track the topic vocabulary.", "Predict the grammatical form.", "Compare each completion.", "Choose the option that closes the argument."],
    quickChecklist: ["Topic continuity", "Grammar fit", "Logical ending"],
    practiceDrills: ["Pause before the final sentence and predict the next word.", "Explain why the correct option completes the speaker's logic."],
  },
  highlight_incorrect_words: {
    timingAndFormat: "Follow the audio and transcript together; select only words that differ from what is spoken.",
    stepByStep: ["Read slightly ahead.", "Track the speaker's exact word.", "Click only confirmed mismatches.", "Avoid guessing on similar words."],
    quickChecklist: ["Audio-text synchronisation", "Confirmed mismatch", "No false positives"],
    practiceDrills: ["Shadow a transcript while marking substitutions.", "Practise distinguishing similar sounds before clicking."],
  },
  write_from_dictation: {
    timingAndFormat: "Listen once and reproduce the sentence with correct word order, spelling, and endings.",
    stepByStep: ["Capture the sentence skeleton.", "Write content words.", "Restore function words and endings.", "Proofread the full sentence."],
    quickChecklist: ["All key words", "Correct order", "Spelling", "Plural/tense endings"],
    practiceDrills: ["Use first-letter shorthand for every word.", "Review missed words by category: sound, spelling, order, or omission."],
  },
};

const TASK_RESOURCE_ALIASES: Record<string, string> = {
  reading_writing_fill_blanks: "fill_blanks_rw",
  listening_multiple_choice_single: "multiple_choice_single",
  listening_multiple_choice_multiple: "multiple_choice_multiple",
};

TASK_STUDY_RESOURCES.personal_introduction = {
  taskType: "personal_introduction",
  title: "Personal Introduction Guide",
  overview: "Introduce yourself briefly at the start of the PTE Academic test. This response is not scored, but it helps you become comfortable with the microphone and test environment.",
  strategySummary: "Use the preparation time to organize a short, natural introduction about your name, background, interests, or goals. Do not attempt to use this response to demonstrate advanced memorized language.",
  templates: [
    "Structure: name and background → current study or work → interests or future goal.",
    "Delivery rule: Speak naturally and keep the introduction concise and easy to follow."
  ],
  commonMistakes: [
    "Treating the introduction as a scored task and becoming anxious about the result.",
    "Reading a memorized script in a way that sounds unnatural or disconnected."
  ],
  sampleBreakdown: {
    heading: "Scoring Status",
    description: "This introduction is not scored. Use it to check your microphone and settle into the exam environment."
  }
};

export function getTaskStudyResource(taskType: string): TaskStudyResource {
  const resolvedTaskType = TASK_RESOURCE_ALIASES[taskType] ?? taskType;
  const baseResource = TASK_STUDY_RESOURCES[resolvedTaskType];
  if (baseResource) {
    return { ...baseResource, ...TASK_RESOURCE_EXTENSIONS[resolvedTaskType] };
  }
  return {
    taskType,
    title: "PTE Task Study Guide",
    overview: "Review official guidelines and strategic frameworks for this PTE Academic task type.",
    strategySummary: "Practice consistently, manage your time according to Pearson exam standards, and review AI feedback after each attempt.",
    templates: ["Maintain steady pacing and clear articulation."],
    commonMistakes: ["Rushing through prompts without checking requirements."],
    sampleBreakdown: {
      heading: "Scoring & Strategy",
      description: "Aligned with Pearson PTE Academic scoring and timing standards."
    }
  };
}
