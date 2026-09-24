/** @vitest-environment jsdom */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { getInlineDropdownBlankIds, hasCompleteInlineDropdownSelection, isInlineDropdownFillBlanksTask } from "./inlineDropdownFillBlanks";
import InlineDropdownFillBlanks from "@/components/InlineDropdownFillBlanks";

describe("Reading and Writing Fill in the Blanks inline dropdown contract", () => {
  const passage = "Banks act to [[gap1]] pressure when demand exceeds {gap2}.";

  it("recognizes canonical and legacy task IDs with either persisted gap notation", () => {
    expect(isInlineDropdownFillBlanksTask("fill_blanks_rw")).toBe(true);
    expect(isInlineDropdownFillBlanksTask("fill_in_blanks_reading_writing")).toBe(true);
    expect(getInlineDropdownBlankIds(passage)).toEqual(["gap1", "gap2"]);
  });

  it("requires a selection for every inline dropdown", () => {
    expect(hasCompleteInlineDropdownSelection(passage, ["curb", "capacity"])).toBe(true);
    expect(hasCompleteInlineDropdownSelection(passage, ["curb", ""])).toBe(false);
  });

  it("writes an inline dropdown choice to the matching blank", () => {
    const onAnswersChange = vi.fn();
    render(createElement(InlineDropdownFillBlanks, {
      content: passage,
      groups: [
        { id: "gap1", choices: ["curb", "promote"] },
        { id: "gap2", choices: ["capacity", "recession"] },
      ],
      answers: [],
      onAnswersChange,
    }));

    fireEvent.change(screen.getByLabelText("Blank 1"), { target: { value: "curb" } });
    expect(onAnswersChange).toHaveBeenCalledWith(["curb", ""]);
  });
});
