import { describe, expect, it } from "vitest";
import { PTE_TASK_PROCEDURES } from "./pteTaskConfig";
import { hasRequiredQuestionContent, hasScoreableResponse } from "./pteValidation";

describe("PTE task procedure catalog", () => {
  it("covers the current Pearson task catalog including the non-scored introduction", () => {
    // 21 canonical Pearson entries plus two section-specific Listening aliases.
    expect(Object.keys(PTE_TASK_PROCEDURES)).toHaveLength(23);
    expect(PTE_TASK_PROCEDURES.summarize_group_discussion.responseSeconds).toBe(120);
    expect(PTE_TASK_PROCEDURES.respond_to_situation.preparationSeconds).toBe(10);
    expect(PTE_TASK_PROCEDURES.summarize_spoken_text.timeLimitSeconds).toBe(600);
    expect(PTE_TASK_PROCEDURES.write_essay.timeLimitSeconds).toBe(1200);
  });
});

describe("Pearson question and response validation", () => {
  it("rejects a question with no usable prompt source", () => {
    const result = hasRequiredQuestionContent({
      taskType: "retell_lecture",
      prompt: "",
      content: "",
      audioUrl: "https://example.com/placeholder.mp3",
    });
    expect(result.valid).toBe(false);
  });

  it("accepts Listening selection tasks with source text for synthesized prompt fallback", () => {
    const question = {
      section: "listening",
      taskType: "highlight_correct_summary",
      prompt: "Listen and select the best summary.",
      content: "Marine mammals migrate between feeding and breeding grounds.",
      options: ["Migration summary", "Unrelated summary"],
      correctAnswer: "Migration summary",
    };

    expect(hasRequiredQuestionContent(question).valid).toBe(true);
    expect(hasScoreableResponse(question, { selectedOptions: ["Migration summary"] }).valid).toBe(true);
  });

  it("accepts Select Missing Word source text when stored audio is unavailable", () => {
    const question = {
      section: "listening",
      taskType: "select_missing_word",
      prompt: "Listen and select the missing word.",
      content: "The branch of linguistics that studies sentence structure is",
      options: ["syntax", "phonetics"],
      correctAnswer: "syntax",
    };

    expect(hasRequiredQuestionContent(question).valid).toBe(true);
  });

  it("rejects blank objective responses before scoring", () => {
    const result = hasScoreableResponse(
      { taskType: "multiple_choice_single", prompt: "Choose one", options: [{ id: "a", text: "A" }] },
      { selectedOptions: [] },
    );
    expect(result.valid).toBe(false);
  });

  it("requires one sentence for Summarize Written Text", () => {
    const question = { taskType: "summarize_written_text", prompt: "Summarize this passage", content: "A passage." };
    expect(hasScoreableResponse(question, { responseText: "First sentence. Second sentence." }).valid).toBe(false);
    expect(hasScoreableResponse(question, { responseText: "A concise summary of the passage." }).valid).toBe(true);
  });

  it("does not block non-empty essays solely because they are outside the target range", () => {
    const question = { taskType: "write_essay", prompt: "Discuss this topic", content: "Topic." };
    expect(hasScoreableResponse(question, { responseText: "A short but non-empty response." }).valid).toBe(true);
  });

  it("accepts a recorded speaking response only when prompt content is available", () => {
    expect(hasScoreableResponse(
      { taskType: "describe_image", prompt: "Describe the image", imageUrl: "/assets/image.png" },
      { audioUrl: "/practice-recording.webm" },
    ).valid).toBe(true);
  });

  it("validates Personal Introduction as a recorded, unscored familiarization response", () => {
    const question = {
      taskType: "personal_introduction",
      prompt: "Please introduce yourself.",
      content: "Please introduce yourself.",
    };
    expect(hasRequiredQuestionContent(question).valid).toBe(true);
    expect(hasScoreableResponse(question, { audioUrl: "/practice-recording.webm" }).valid).toBe(true);
  });

  it("accepts object-shaped gap options for Reading & Writing Fill in the Blanks", () => {
    const question = {
      taskType: "fill_blanks_rw",
      prompt: "Complete the passage.",
      content: "Food culture varies across societies with {gap1}.",
      options: {
        gap1: ["experiences", "experiments"],
      },
      correctAnswer: JSON.stringify({ gap1: "experiences" }),
    };
    expect(hasRequiredQuestionContent(question).valid).toBe(true);
    expect(hasScoreableResponse(question, { selectedOptions: ["experiences"] }).valid).toBe(true);
  });
});
