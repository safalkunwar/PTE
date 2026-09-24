import { describe, expect, it } from "vitest";
import { requiresLoadedVisualPrompt, validateVisualPromptReadiness } from "./visualPromptValidation";

describe("visual prompt validation", () => {
  it("requires a loaded visual prompt for Describe Image", () => {
    expect(requiresLoadedVisualPrompt("describe_image")).toBe(true);
    expect(validateVisualPromptReadiness("describe_image", false)).toEqual({
      valid: false,
      reason: "The Describe Image visual prompt must load before this response can be submitted or scored.",
    });
    expect(validateVisualPromptReadiness("describe_image", true)).toEqual({ valid: true });
  });

  it("does not impose an image requirement on non-visual tasks", () => {
    expect(requiresLoadedVisualPrompt("retell_lecture")).toBe(false);
    expect(validateVisualPromptReadiness("read_aloud", false)).toEqual({ valid: true });
  });
});
