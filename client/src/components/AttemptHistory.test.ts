/** @vitest-environment jsdom */
import React, { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { InlineAttemptHistory } from "./AttemptHistory";

describe("InlineAttemptHistory", () => {
  it("shows saved audio playback, transcription, and an earned score below a completed task", () => {
    const { container } = render(createElement(InlineAttemptHistory, {
      attempts: [{
        id: 1,
        timestamp: new Date("2026-08-21T00:00:00Z"),
        score: 72,
        maxScore: 90,
        audioUrl: "https://example.test/attempt.webm",
        transcription: "The lecture described a sustainable transport plan.",
        taskType: "retell_lecture",
      }],
    }));

    expect(screen.getByRole("region", { name: "Recent attempts" })).toBeTruthy();
    expect(screen.getByText("72/90")).toBeTruthy();
    expect(screen.getByText(/Transcription:/)).toBeTruthy();
    expect(container.querySelector("audio")?.getAttribute("src")).toBe("https://example.test/attempt.webm");
  });

  it("does not invent a score for an unscored familiarization attempt", () => {
    render(createElement(InlineAttemptHistory, {
      attempts: [{
        id: 2,
        timestamp: new Date("2026-08-21T00:00:00Z"),
        audioUrl: "https://example.test/intro.webm",
        taskType: "personal_introduction",
      }],
    }));

    expect(screen.getByText("Unscored")).toBeTruthy();
    expect(screen.queryByText(/0\/1/)).toBeNull();
  });
});
