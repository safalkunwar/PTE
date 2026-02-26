import PTELayout from "@/components/PTELayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "wouter";
import { useState } from "react";
import {
  Mic, PenLine, Eye, Headphones, ArrowRight, Clock, BookOpen,
  ChevronRight, Info, Volume2, FileText
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  { id: "speaking", label: "Speaking", icon: Mic, color: "bg-blue-500", textColor: "text-blue-600", borderColor: "border-blue-200" },
  { id: "writing", label: "Writing", icon: PenLine, color: "bg-purple-500", textColor: "text-purple-600", borderColor: "border-purple-200" },
  { id: "reading", label: "Reading", icon: Eye, color: "bg-green-500", textColor: "text-green-600", borderColor: "border-green-200" },
  { id: "listening", label: "Listening", icon: Headphones, color: "bg-orange-500", textColor: "text-orange-600", borderColor: "border-orange-200" },
];

const taskTypeInfo: Record<string, { label: string; description: string; time: string; tips: string }> = {
  read_aloud: {
    label: "Read Aloud",
    description: "Read a text passage aloud as naturally and clearly as possible.",
    time: "35–40 sec",
    tips: "Focus on pronunciation, natural rhythm, and appropriate pace.",
  },
  repeat_sentence: {
    label: "Repeat Sentence",
    description: "Listen to a sentence and repeat it exactly as you heard it.",
    time: "15 sec",
    tips: "Listen carefully to the entire sentence before repeating. Focus on accuracy.",
  },
  describe_image: {
    label: "Describe Image",
    description: "Describe an image (chart, graph, diagram) in detail.",
    time: "40 sec",
    tips: "Describe the main trend, key data points, and any notable features.",
  },
  retell_lecture: {
    label: "Re-tell Lecture",
    description: "Listen to a lecture and retell the key points in your own words.",
    time: "40 sec",
    tips: "Take notes while listening. Focus on main ideas and supporting details.",
  },
  answer_short_question: {
    label: "Answer Short Question",
    description: "Listen to a question and give a brief, direct answer.",
    time: "10 sec",
    tips: "Answer with one or a few words. Be direct and concise.",
  },
  summarize_written_text: {
    label: "Summarize Written Text",
    description: "Read a passage and write a one-sentence summary (5–75 words).",
    time: "10 min",
    tips: "Include the main idea and key supporting points in one grammatically correct sentence.",
  },
  write_essay: {
    label: "Write Essay",
    description: "Write an essay of 200–300 words on a given topic.",
    time: "20 min",
    tips: "Structure your essay with introduction, body paragraphs, and conclusion. Use linking devices.",
  },
  multiple_choice_single: {
    label: "Multiple Choice (Single)",
    description: "Read or listen to a passage and select the correct answer.",
    time: "2 min",
    tips: "Read all options carefully before selecting. Eliminate obviously wrong answers.",
  },
  multiple_choice_multiple: {
    label: "Multiple Choice (Multiple)",
    description: "Select all correct answers from the options provided.",
    time: "2.5 min",
    tips: "More than one answer is correct. Consider each option independently.",
  },
  reorder_paragraphs: {
    label: "Re-order Paragraphs",
    description: "Arrange the text boxes in the correct order.",
    time: "2 min",
    tips: "Look for logical connectors, topic sentences, and pronoun references.",
  },
  fill_blanks_reading: {
    label: "Fill in the Blanks (Reading)",
    description: "Drag words from the box to fill the blanks in the text.",
    time: "2 min",
    tips: "Read the whole text first. Consider grammar and context for each blank.",
  },
  fill_blanks_rw: {
    label: "Fill in the Blanks (R&W)",
    description: "Select the correct word from a dropdown for each blank.",
    time: "2 min",
    tips: "Consider both meaning and grammatical form when selecting words.",
  },
  summarize_spoken_text: {
    label: "Summarize Spoken Text",
    description: "Listen to a lecture and write a 50–70 word summary.",
    time: "10 min",
    tips: "Take notes while listening. Include main ideas and key details.",
  },
  fill_blanks_listening: {
    label: "Fill in the Blanks (Listening)",
    description: "Listen and type the missing words in the transcript.",
    time: "2 min",
    tips: "Listen carefully and type exactly what you hear, including function words.",
  },
  highlight_correct_summary: {
    label: "Highlight Correct Summary",
    description: "Select the paragraph that best summarizes the recording.",
    time: "1.5 min",
    tips: "Listen for the main idea and overall message of the recording.",
  },
  select_missing_word: {
    label: "Select Missing Word",
    description: "Select the word or phrase that completes the recording.",
    time: "1 min",
    tips: "Listen to the context and predict what word would logically complete the sentence.",
  },
  highlight_incorrect_words: {
    label: "Highlight Incorrect Words",
    description: "Click on words in the transcript that differ from the recording.",
    time: "2 min",
    tips: "Follow the transcript while listening. Click words that sound different.",
  },
  write_from_dictation: {
    label: "Write from Dictation",
    description: "Type the sentence you hear exactly as spoken.",
    time: "30 sec",
    tips: "Listen to the full sentence first, then type. Check spelling carefully.",
  },
};

export default function Practice() {
  const params = useParams<{ section?: string }>();
  const [activeSection, setActiveSection] = useState(params.section || "speaking");
  const [selectedMode, setSelectedMode] = useState<"beginner" | "exam" | "diagnostic" | "revision">("exam");

  const { data: questions, isLoading } = trpc.questions.list.useQuery({
    section: activeSection as any,
    limit: 50,
  });

  const createSession = trpc.sessions.create.useMutation();

  const startPractice = async (questionId: number, taskType: string) => {
    try {
      const session = await createSession.mutateAsync({
        sessionType: "section_practice",
        section: activeSection as any,
        mode: selectedMode,
        totalQuestions: 1,
      });
      window.location.href = `/session/${session.id}?questionId=${questionId}&taskType=${taskType}&mode=${selectedMode}`;
    } catch {
      toast.error("Failed to start practice session");
    }
  };

  const groupedByTaskType = questions?.reduce((acc, q) => {
    if (!acc[q.taskType]) acc[q.taskType] = [];
    acc[q.taskType].push(q);
    return acc;
  }, {} as Record<string, typeof questions>);

  return (
    <PTELayout title="Practice">
      <div className="max-w-5xl space-y-6">
        {/* Section tabs */}
        <div className="flex flex-wrap gap-2">
          {sections.map(({ id, label, icon: Icon, color }, i) => (
            <motion.button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSection === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </motion.button>
          ))}
        </div>

        {/* Mode selector */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-foreground mr-2">Practice Mode:</span>
              {(["beginner", "exam", "diagnostic", "revision"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    selectedMode === mode
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {mode === "beginner" ? "🎓 Beginner" :
                   mode === "exam" ? "⏱ Exam" :
                   mode === "diagnostic" ? "🔍 Diagnostic" : "🔄 Revision"}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedMode === "beginner" && "Guided mode with templates and hints to help you get started."}
              {selectedMode === "exam" && "Strict timing and scoring to simulate real exam conditions."}
              {selectedMode === "diagnostic" && "Identifies your weak areas with detailed skill analysis."}
              {selectedMode === "revision" && "Focuses on high-impact tasks for maximum score improvement."}
            </p>
          </CardContent>
        </Card>

        {/* Task type groups */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="h-32 bg-muted rounded-xl"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        ) : groupedByTaskType && Object.keys(groupedByTaskType).length > 0 ? (
          <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            className="space-y-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {Object.entries(groupedByTaskType).map(([taskType, taskQuestions]) => {
              const info = taskTypeInfo[taskType] || { label: taskType, description: "", time: "—", tips: "" };
              return (
                <Card key={taskType}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">{info.label}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full shrink-0">
                        <Clock className="w-3 h-3" />
                        {info.time}
                      </div>
                    </div>
                    {info.tips && (
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3 mt-2">
                        <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700">{info.tips}</p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {taskQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                              q.difficulty === "easy" ? "bg-green-500" :
                              q.difficulty === "medium" ? "bg-yellow-500" : "bg-red-500"
                            }`} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{q.title}</p>
                              {q.content && (
                                <p className="text-xs text-muted-foreground truncate max-w-md">
                                  {typeof q.content === "string" ? q.content.substring(0, 80) + "..." : ""}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <Badge variant="outline" className="text-xs capitalize hidden sm:flex">
                              {q.difficulty}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => startPractice(q.id, q.taskType)}
                              disabled={createSession.isPending}
                              className="text-xs"
                            >
                              Start <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
          </AnimatePresence>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No questions available for this section yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PTELayout>
  );
}
