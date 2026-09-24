import { describe, expect, it } from "vitest";
import { scoreReadAloud, scoreRepeatSentence, scoreDescribeImage, scoreRetellLecture } from "./speakingAI";
import { scoreWriteEssay, scoreSummarizeWrittenText } from "./writingAI";
import { scoreObjectiveTask } from "./readingAI";
import { scoreWriteFromDictation } from "./listeningAI";

describe("official PTE scoring calibration anchors", () => {
  it("calibrates Write from Dictation exact match to band 90", async () => {
    const dictation = "Environmental degradation poses a significant threat to global agricultural productivity.";
    const result = await scoreWriteFromDictation({
      originalSentence: dictation,
      userResponse: dictation,
    });
    expect(result.overallScore).toBe(90);
    expect(result.rawScore).toBe(result.maxRawScore);
  });
});
