import { describe, expect, it } from "vitest";
import { getNextRenewalDate, getRenewalPaymentReference, shouldCreateRenewalIntent } from "./renewalService";

describe("subscription renewal helpers", () => {
  it("produces a stable idempotency reference for the same subscription period", () => {
    const renewalDate = new Date("2026-08-14T00:00:00.000Z");
    expect(getRenewalPaymentReference(42, renewalDate, new Date("2026-08-15T00:00:00.000Z"))).toBe("renewal-42-2026-08-14");
    expect(getRenewalPaymentReference(42, renewalDate, new Date("2026-08-16T00:00:00.000Z"))).toBe("renewal-42-2026-08-14");
  });

  it("does not create a second renewal intent when one already exists", () => {
    expect(shouldCreateRenewalIntent(null)).toBe(true);
    expect(shouldCreateRenewalIntent({ id: 1, status: "pending" })).toBe(false);
    expect(shouldCreateRenewalIntent({ id: 2, status: "completed" })).toBe(false);
  });

  it("advances monthly and yearly billing periods predictably", () => {
    const source = new Date("2026-01-31T12:00:00.000Z");
    expect(getNextRenewalDate(source, "monthly").getUTCMonth()).toBe(2);
    expect(getNextRenewalDate(source, "yearly").getUTCFullYear()).toBe(2027);
  });
});
