/** @vitest-environment jsdom */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { getReadingBlankCount, hasCompleteReadingAnswerBankSelection, isReadingAnswerBankTask } from "./readingFillBlanks";
import ReadingFillBlanks from "@/components/ReadingFillBlanks";

describe("Reading Fill in the Blanks answer-bank contract", () => {
  const passage = "The policy _____ evidence and _____ cooperation.";

  it("recognizes canonical and legacy Reading answer-bank task IDs", () => {
    expect(isReadingAnswerBankTask("fill_blanks_reading")).toBe(true);
    expect(isReadingAnswerBankTask("fill_in_blanks_reading")).toBe(true);
  });

  it("requires every inline blank to be filled before submission", () => {
    expect(getReadingBlankCount(passage)).toBe(2);
    expect(hasCompleteReadingAnswerBankSelection(passage, ["supports", "international"])).toBe(true);
    expect(hasCompleteReadingAnswerBankSelection(passage, ["supports", ""])).toBe(false);
  });

  it("assigns a selected answer-bank word to the active inline blank", () => {
    const onAnswersChange = vi.fn();
    render(
      createElement(ReadingFillBlanks, {
        content: passage,
        wordBank: ["supports", "international", "rejects"],
        answers: [],
        onAnswersChange,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "supports" }));
    expect(onAnswersChange).toHaveBeenCalledWith(["supports", ""]);
  });
});
