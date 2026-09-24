import { describe, expect, it } from "vitest";
import { withMediaRetry } from "./mediaRetry";

describe("withMediaRetry", () => {
  it("leaves the original URL unchanged before a retry", () => {
    expect(withMediaRetry("https://cdn.example.test/prompt.mp3", 0)).toBe("https://cdn.example.test/prompt.mp3");
  });

  it("adds a cache-busting retry parameter to URLs with and without queries", () => {
    expect(withMediaRetry("https://cdn.example.test/prompt.mp3", 2)).toBe("https://cdn.example.test/prompt.mp3?mediaRetry=2");
    expect(withMediaRetry("https://cdn.example.test/prompt.mp3?token=abc", 3)).toBe("https://cdn.example.test/prompt.mp3?token=abc&mediaRetry=3");
  });
});
