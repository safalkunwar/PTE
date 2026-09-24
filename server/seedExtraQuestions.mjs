import { getDb } from "./db";
import { questions } from "../drizzle/schema";

const EXTRA_QUESTIONS = [
  // Speaking: Read Aloud
  {
    section: "speaking",
    taskType: "read_aloud",
    difficulty: "medium",
    title: "Global Renewable Energy Transition",
    prompt: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible.",
    content: "The rapid acceleration of renewable energy investments worldwide reflects a profound structural shift away from fossil fuels. Solar and wind generation capacities have surpassed previous projections, driven by dramatic cost reductions and supportive government policies across major economies.",
    timeLimit: 40,
    preparationTime: 35,
  },
  {
    section: "speaking",
    taskType: "read_aloud",
    difficulty: "hard",
    title: "Neuroplasticity and Cognitive Recovery",
    prompt: "Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible.",
    content: "Neuroplasticity refers to the remarkable capacity of the central nervous system to reorganize its structural pathways and functional connectivity in response to experiential learning, environmental enrichment, or traumatic neurological injury.",
    timeLimit: 40,
    preparationTime: 35,
  },
  // Speaking: Repeat Sentence
  {
    section: "speaking",
    taskType: "repeat_sentence",
    difficulty: "medium",
    title: "University Library Hours",
    prompt: "You will hear a sentence. Please repeat the sentence exactly as you hear it.",
    content: "The university library will remain open throughout the entire examination period.",
    timeLimit: 15,
    preparationTime: 3,
  },
  // Speaking: Describe Image
  {
    section: "speaking",
    taskType: "describe_image",
    difficulty: "medium",
    title: "Global Smartphone Market Share",
    prompt: "Look at the image below. In 40 seconds, please speak into the microphone and describe what you see in detail.",
    content: "Bar chart illustrating global smartphone shipments by manufacturer for Q3 2025: Brand A leads with 24%, Brand B follows closely at 21%, Brand C at 15%, while others make up 40%.",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    timeLimit: 40,
    preparationTime: 25,
  },
  // Speaking: Re-tell Lecture
  {
    section: "speaking",
    taskType: "retell_lecture",
    difficulty: "hard",
    title: "Urban Heat Island Effect",
    prompt: "You will hear a lecture. After listening, please re-tell the lecture in your own words.",
    content: "Urban areas frequently experience significantly higher temperatures than their surrounding rural peripheries, a phenomenon known as the urban heat island effect, primarily driven by dark asphalt surfaces and dense building materials.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    timeLimit: 40,
    preparationTime: 10,
  },
  // Speaking: Answer Short Question
  {
    section: "speaking",
    taskType: "answer_short_question",
    difficulty: "easy",
    title: "Botanical Plant Part",
    prompt: "You will hear a question. Please give a simple and brief answer.",
    content: "What is the green pigment found in plant leaves that is essential for photosynthesis?",
    correctAnswer: "Chlorophyll",
    timeLimit: 10,
    preparationTime: 0,
  },
  // Speaking: Summarize Group Discussion
  {
    section: "speaking",
    taskType: "summarize_group_discussion",
    difficulty: "medium",
    title: "Corporate Remote Work Policy",
    prompt: "You will hear a group discussion. Summarize the main viewpoints discussed.",
    content: "Discussion among managers regarding hybrid work arrangements, productivity metrics, and employee collaboration challenges.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    timeLimit: 90,
    preparationTime: 10,
  },
  // Speaking: Respond to Situation
  {
    section: "speaking",
    taskType: "respond_to_situation",
    difficulty: "medium",
    title: "Library Book Overdue Notice",
    prompt: "Read the prompt and respond appropriately to the situation.",
    content: "You received a notice that a borrowed research book is overdue. Speak to the librarian to explain your situation and request an extension.",
    timeLimit: 40,
    preparationTime: 10,
  },
  // Writing: Summarize Written Text
  {
    section: "writing",
    taskType: "summarize_written_text",
    difficulty: "medium",
    title: "Artificial Intelligence in Healthcare Diagnostics",
    prompt: "Read and summarize the text below in a single sentence using 5 to 75 words.",
    content: "Artificial intelligence algorithms have demonstrated remarkable diagnostic accuracy in medical imaging, outperforming human radiologists in detecting early-stage pulmonary nodules. However, integration into clinical workflows requires rigorous validation and transparent decision-making pathways to ensure patient safety and clinician trust.",
    correctAnswer: "AI algorithms improve early disease detection in medical imaging, but clinical integration requires rigorous validation and transparent pathways.",
    timeLimit: 600,
    preparationTime: 0,
  },
  // Writing: Write Essay
  {
    section: "writing",
    taskType: "write_essay",
    difficulty: "hard",
    title: "Remote Work vs Traditional Offices",
    prompt: "Write a 200-300 word essay on the following topic: Discuss the advantages and disadvantages of remote working compared to traditional office environments.",
    content: "Remote working has transformed modern employment, offering flexibility while challenging team cohesion.",
    timeLimit: 1200,
    preparationTime: 0,
  },
  // Reading: Multiple Choice Single
  {
    section: "reading",
    taskType: "multiple_choice_single",
    difficulty: "medium",
    title: "Ecosystem Resilience",
    prompt: "Read the text and answer the multiple-choice question by selecting the correct response.",
    content: "Ecosystem resilience measures the capacity of a natural system to absorb disturbance and reorganize while undergoing change so as to still retain essentially the same function, structure, and feedbacks.",
    options: ["A) The speed of ecosystem collapse", "B) The capacity to absorb disturbance while retaining function", "C) The total number of species in a habitat", "D) Resistance to artificial fertilizers"],
    correctAnswer: "B",
    timeLimit: 120,
    preparationTime: 0,
  },
  // Reading: Multiple Choice Multiple
  {
    section: "reading",
    taskType: "multiple_choice_multiple",
    difficulty: "hard",
    title: "Renewable Energy Storage Challenges",
    prompt: "Read the text and select all correct response options.",
    content: "Intermittent renewable energy sources such as wind and solar demand advanced grid storage solutions. Lithium-ion batteries provide fast response times, whereas pumped hydro storage offers long-duration capacity for seasonal demand shifts.",
    options: ["A) Wind and solar are intermittent", "B) Lithium-ion batteries offer fast response times", "C) Pumped hydro provides long-duration capacity", "D) Solar energy requires no storage solutions"],
    correctAnswer: JSON.stringify(["A", "B", "C"]),
    timeLimit: 150,
    preparationTime: 0,
  },
  // Reading: Reorder Paragraphs
  {
    section: "reading",
    taskType: "reorder_paragraphs",
    difficulty: "medium",
    title: "The Evolution of Cartography",
    prompt: "Restore the original paragraph order by dragging the text boxes.",
    content: JSON.stringify([
      { id: "p1", text: "Early cartography relied heavily on travelers' accounts and celestial navigation." },
      { id: "p2", text: "The introduction of the printing press enabled widespread dissemination of standardized maps." },
      { id: "p3", text: "Today, satellite imagery and geographic information systems dominate modern map-making." }
    ]),
    correctAnswer: JSON.stringify(["p1", "p2", "p3"]),
    timeLimit: 180,
    preparationTime: 0,
  },
  // Reading: Fill in the Blanks (Reading)
  {
    section: "reading",
    taskType: "fill_blanks_reading",
    difficulty: "medium",
    title: "Marine Biodiversity Conservation",
    prompt: "Fill in the gaps with the correct vocabulary options.",
    content: "Coral reefs support vast marine [[gap1]] and protect coastal communities from storm surges. However, rising ocean temperatures cause coral [[gap2]].",
    options: JSON.stringify({
      gap1: ["biodiversity", "deserts", "glaciers"],
      gap2: ["bleaching", "flow", "growth"]
    }),
    correctAnswer: JSON.stringify({ gap1: "biodiversity", gap2: "bleaching" }),
    timeLimit: 150,
    preparationTime: 0,
  },
  // Reading & Writing: Fill in the Blanks
  {
    section: "reading",
    taskType: "fill_blanks_rw",
    difficulty: "hard",
    title: "Economic Inflation Dynamics",
    prompt: "Select the correct word for each blank from the drop-down lists.",
    content: "Central banks often raise interest rates to [[gap1]] inflationary pressures when consumer demand outpaces economic [[gap2]].",
    options: JSON.stringify({
      gap1: ["curb", "promote", "ignore"],
      gap2: ["capacity", "recession", "stagnation"]
    }),
    correctAnswer: JSON.stringify({ gap1: "curb", gap2: "capacity" }),
    timeLimit: 180,
    preparationTime: 0,
  },
  // Listening: Summarize Spoken Text
  {
    section: "listening",
    taskType: "summarize_spoken_text",
    difficulty: "medium",
    title: "Behavioral Economics and Decision Making",
    prompt: "You will hear a short lecture. Write a summary of 50-70 words.",
    content: "Behavioral economics demonstrates that humans frequently make irrational financial decisions due to cognitive biases.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    correctAnswer: "Behavioral economics shows humans make irrational financial choices due to cognitive biases.",
    timeLimit: 600,
    preparationTime: 0,
  },
  // Listening: Multiple Choice Single
  {
    section: "listening",
    taskType: "multiple_choice_single",
    difficulty: "medium",
    title: "Archaeological Discovery",
    prompt: "Listen to the recording and answer the multiple-choice question.",
    content: "What was the primary significance of the excavated pottery shards?",
    options: ["A) Trade route connections", "B) Agricultural storage", "C) Religious rituals", "D) Royal taxation"],
    correctAnswer: "A",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    timeLimit: 90,
    preparationTime: 5,
  },
  // Listening: Multiple Choice Multiple
  {
    section: "listening",
    taskType: "multiple_choice_multiple",
    difficulty: "hard",
    title: "Astrophysics Seminar",
    prompt: "Listen to the recording and select all correct response options.",
    content: "Which characteristics of exoplanet atmospheres were highlighted?",
    options: ["A) Water vapor signatures", "B) Methane concentration", "C) Liquid oceans", "D) Surface magnetism"],
    correctAnswer: JSON.stringify(["A", "B"]),
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    timeLimit: 120,
    preparationTime: 5,
  },
  // Listening: Fill in the Blanks
  {
    section: "listening",
    taskType: "fill_blanks_listening",
    difficulty: "medium",
    title: "Geological Survey Report",
    prompt: "You will hear a recording. Type the missing words in each blank.",
    content: "The seismic survey indicated significant [[gap1]] activity along the active [[gap2]].",
    correctAnswer: JSON.stringify({ gap1: "tectonic", gap2: "faultline" }),
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    timeLimit: 120,
    preparationTime: 5,
  },
  // Listening: Highlight Correct Summary
  {
    section: "listening",
    taskType: "highlight_correct_summary",
    difficulty: "medium",
    title: "Marine Migration Patterns",
    prompt: "Listen to the recording and select the paragraph that best summarizes it.",
    options: [
      "A) Whales migrate thousands of miles annually to breeding grounds.",
      "B) Ocean currents remain static throughout the winter months.",
      "C) Marine mammals avoid tropical equatorial waters.",
      "D) Fish populations are unaffected by water temperature."
    ],
    correctAnswer: "A",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    timeLimit: 90,
    preparationTime: 5,
  },
  // Listening: Select Missing Word
  {
    section: "listening",
    taskType: "select_missing_word",
    difficulty: "medium",
    title: "Linguistics Lecture",
    prompt: "You will hear a recording. At the end of the recording, the last word or group of words has been beeped out. Select the correct option.",
    options: ["A) syntax", "B) phonetics", "C) semantics", "D) morphology"],
    correctAnswer: "A",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    timeLimit: 60,
    preparationTime: 5,
  },
  // Listening: Highlight Incorrect Words
  {
    section: "listening",
    taskType: "highlight_incorrect_words",
    difficulty: "hard",
    title: "Global Supply Chain Resilience",
    prompt: "The transcript differs from what is spoken. Click on the words that are different.",
    content: "Modern global supply chains depend heavily on predictable maritime logistics and timely port clearances. Any localized disruption can cascade rapidly across international markets.",
    correctAnswer: JSON.stringify(["maritime", "cascade"]),
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    timeLimit: 90,
    preparationTime: 3,
  },
  // Listening: Write from Dictation
  {
    section: "listening",
    taskType: "write_from_dictation",
    difficulty: "medium",
    title: "Academic Seminar Policy",
    prompt: "You will hear a sentence. Type the sentence exactly as you hear it.",
    content: "Attendance at all weekly seminars is mandatory for postgraduate research students.",
    correctAnswer: "Attendance at all weekly seminars is mandatory for postgraduate research students.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    timeLimit: 30,
    preparationTime: 3,
  },
];

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection failed");
    process.exit(1);
  }

  console.log(`Seeding ${EXTRA_QUESTIONS.length} additional Pearson-aligned questions...`);
  for (const q of EXTRA_QUESTIONS) {
    await db.insert(questions).values({
      ...q,
      createdAt: new Date(),
    });
  }
  console.log("Successfully seeded extra questions across all 20 task types.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
