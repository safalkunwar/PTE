import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Upload, Plus, RefreshCw, Trash2, Edit2, FileText } from "lucide-react";

type TaskType = 
  | "read_aloud"
  | "repeat_sentence"
  | "describe_image"
  | "retell_lecture"
  | "answer_short_question"
  | "summarize_group_discussion"
  | "respond_to_situation"
  | "summarize_written_text"
  | "write_essay"
  | "multiple_choice_single"
  | "multiple_choice_multiple"
  | "reorder_paragraphs"
  | "fill_blanks_reading"
  | "fill_blanks_rw"
  | "summarize_spoken_text"
  | "fill_blanks_listening"
  | "highlight_correct_summary"
  | "select_missing_word"
  | "highlight_incorrect_words"
  | "write_from_dictation";

type Section = "speaking" | "writing" | "reading" | "listening";
type Difficulty = "easy" | "medium" | "hard";

export default function AdminQuestionManager() {
  const [selectedSection, setSelectedSection] = useState<Section>("speaking");
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType>("read_aloud");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateCount, setGenerateCount] = useState(5);

  // Fetch questions by task type
  const { data: questions, isLoading, refetch } = trpc.questions.getByTaskType.useQuery({
    taskType: selectedTaskType,
  });

  // Mutations
  const uploadCSV = trpc.admin.uploadQuestionsCSV.useMutation({
    onSuccess: () => {
      alert("Questions uploaded successfully");
      setCsvFile(null);
      refetch();
    },
    onError: (error: any) => {
      alert(`Error: ${error?.message || "Upload failed"}`);
    },
  });

  const generateQuestions = trpc.admin.generateQuestionsAI.useMutation({
    onSuccess: () => {
      alert(`${generateCount} questions generated successfully`);
      refetch();
    },
    onError: (error: any) => {
      alert(`Error: ${error?.message || "Generation failed"}`);
    },
  });

  const [manualTitle, setManualTitle] = useState("");
  const [manualPrompt, setManualPrompt] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [manualCorrectAnswer, setManualCorrectAnswer] = useState("");
  const [manualTimeLimit, setManualTimeLimit] = useState(30);

  const insertQuestion = trpc.admin.insertQuestion.useMutation({
    onSuccess: () => {
      alert("Question inserted successfully");
      setManualTitle("");
      setManualPrompt("");
      setManualContent("");
      setManualCorrectAnswer("");
      refetch();
    },
    onError: (error: any) => {
      alert(`Error: ${error?.message || "Insertion failed"}`);
    },
  });

  const deleteQuestion = trpc.admin.deleteQuestion.useMutation({
    onSuccess: () => {
      alert("Question deleted successfully");
      refetch();
    },
  });

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const fileContent = await file.text();
    uploadCSV.mutate({
      file: fileContent,
      section: selectedSection,
      taskType: selectedTaskType,
    });
  };

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    generateQuestions.mutate({
      section: selectedSection,
      taskType: selectedTaskType,
      difficulty,
      count: generateCount,
    });
    setIsGenerating(false);
  };

  const taskTypesBySection: Record<Section, TaskType[]> = {
    speaking: [
      "read_aloud",
      "repeat_sentence",
      "describe_image",
      "retell_lecture",
      "answer_short_question",
      "summarize_group_discussion",
      "respond_to_situation",
    ],
    writing: [
      "summarize_written_text",
      "write_essay",
    ],
    reading: [
      "multiple_choice_single",
      "multiple_choice_multiple",
      "reorder_paragraphs",
      "fill_blanks_reading",
      "fill_blanks_rw",
    ],
    listening: [
      "summarize_spoken_text",
      "fill_blanks_listening",
      "highlight_correct_summary",
      "select_missing_word",
      "highlight_incorrect_words",
      "write_from_dictation",
    ],
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Question Manager</h1>
          <p className="text-muted-foreground">Upload, generate, and manage PTE practice questions</p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload CSV</TabsTrigger>
            <TabsTrigger value="generate">Generate AI</TabsTrigger>
            <TabsTrigger value="manual">Manual Insert</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Questions from CSV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Section</label>
                    <Select value={selectedSection} onValueChange={(v) => setSelectedSection(v as Section)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="speaking">Speaking</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="listening">Listening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Task Type</label>
                    <Select value={selectedTaskType} onValueChange={(v) => setSelectedTaskType(v as TaskType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypesBySection[selectedSection].map((task) => (
                          <SelectItem key={task} value={task}>
                            {task.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium">Click to upload CSV file</p>
                    <p className="text-sm text-muted-foreground">or drag and drop</p>
                  </label>
                </div>

                {csvFile && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700">✓ File selected: {csvFile.name}</p>
                  </div>
                )}

                <Button
                  onClick={() => {
                    if (csvFile) {
                      setCsvFile(null);
                    }
                  }}
                  disabled={!csvFile || uploadCSV.isPending}
                  className="w-full"
                >
                  {uploadCSV.isPending ? "Uploading..." : "Upload Questions"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Questions with AI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Section</label>
                    <Select value={selectedSection} onValueChange={(v) => setSelectedSection(v as Section)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="speaking">Speaking</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="listening">Listening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Task Type</label>
                    <Select value={selectedTaskType} onValueChange={(v) => setSelectedTaskType(v as TaskType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypesBySection[selectedSection].map((task) => (
                          <SelectItem key={task} value={task}>
                            {task.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Difficulty</label>
                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Number of Questions</label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={generateCount}
                      onChange={(e) => setGenerateCount(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateQuestions}
                  disabled={isGenerating || generateQuestions.isPending}
                  className="w-full"
                >
                  {isGenerating || generateQuestions.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Insert Tab */}
          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manual Question Insertion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Section</label>
                    <Select value={selectedSection} onValueChange={(v) => setSelectedSection(v as Section)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="speaking">Speaking</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="listening">Listening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Task Type</label>
                    <Select value={selectedTaskType} onValueChange={(v) => setSelectedTaskType(v as TaskType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypesBySection[selectedSection].map((task) => (
                          <SelectItem key={task} value={task}>
                            {task.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Difficulty</label>
                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Time Limit (seconds)</label>
                    <Input
                      type="number"
                      value={manualTimeLimit}
                      onChange={(e) => setManualTimeLimit(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Question Title *</label>
                  <Input
                    placeholder="e.g. Environmental Sustainability Passages"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Prompt / Instructions</label>
                  <Input
                    placeholder="e.g. Read the text aloud..."
                    value={manualPrompt}
                    onChange={(e) => setManualPrompt(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Main Content / Passage</label>
                  <textarea
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Enter full passage or prompt text..."
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Correct Answer (for objective tasks)</label>
                  <Input
                    placeholder="e.g. option_a or exact text"
                    value={manualCorrectAnswer}
                    onChange={(e) => setManualCorrectAnswer(e.target.value)}
                  />
                </div>

                <Button
                  onClick={() => {
                    if (!manualTitle.trim()) {
                      alert("Please enter a question title");
                      return;
                    }
                    insertQuestion.mutate({
                      section: selectedSection,
                      taskType: selectedTaskType,
                      difficulty,
                      title: manualTitle,
                      prompt: manualPrompt,
                      content: manualContent,
                      correctAnswer: manualCorrectAnswer,
                      timeLimit: manualTimeLimit,
                    });
                  }}
                  disabled={insertQuestion.isPending}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {insertQuestion.isPending ? "Inserting..." : "Insert Question"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Section</label>
                    <Select value={selectedSection} onValueChange={(v) => setSelectedSection(v as Section)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="speaking">Speaking</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="listening">Listening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Task Type</label>
                    <Select value={selectedTaskType} onValueChange={(v) => setSelectedTaskType(v as TaskType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypesBySection[selectedSection].map((task) => (
                          <SelectItem key={task} value={task}>
                            {task.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isLoading ? (
                  <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading questions">
                    {[1, 2, 3, 4].map((row) => (
                      <div key={row} className="space-y-2 rounded-lg border p-4">
                        <div className="h-5 w-2/3 rounded bg-muted" />
                        <div className="h-4 w-full rounded bg-muted" />
                        <div className="h-4 w-1/2 rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                ) : questions && questions.length > 0 ? (
                  <div className="space-y-2">
                    {questions && questions.map((question: any) => (
                      <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{question.title}</p>
                          <p className="text-sm text-muted-foreground">{question.difficulty} • ID: {question.id}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteQuestion.mutate({ questionId: question.id })}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No questions found for this task type</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
