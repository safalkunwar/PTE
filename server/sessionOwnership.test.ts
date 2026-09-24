import { describe, expect, it } from "vitest";
import { isQuestionAllowedInSession } from "./sessionOwnership";

describe("practice session question ownership", () => {
  it("allows only matching sections in section practice", () => {
    expect(isQuestionAllowedInSession("speaking", "speaking")).toBe(true);
    expect(isQuestionAllowedInSession("speaking", "writing")).toBe(false);
    expect(isQuestionAllowedInSession("reading", "listening")).toBe(false);
  });

  it("allows every supported question section in a full session", () => {
    expect(isQuestionAllowedInSession("full", "speaking")).toBe(true);
    expect(isQuestionAllowedInSession("full", "writing")).toBe(true);
    expect(isQuestionAllowedInSession("full", "reading")).toBe(true);
    expect(isQuestionAllowedInSession("full", "listening")).toBe(true);
  });
});
