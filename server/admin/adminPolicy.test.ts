import { describe, expect, it } from "vitest";
import { canDemoteUser, canSuspendUser } from "./adminPolicy";

describe("admin safety policy", () => {
  it("prevents an administrator from suspending their own account", () => {
    expect(canSuspendUser(10, 10)).toBe(false);
    expect(canSuspendUser(10, 11)).toBe(true);
  });

  it("prevents self-demotion but allows role-preserving self updates", () => {
    expect(canDemoteUser(10, 10, "user")).toBe(false);
    expect(canDemoteUser(10, 10, "admin")).toBe(true);
    expect(canDemoteUser(10, 11, "user")).toBe(true);
  });
});
