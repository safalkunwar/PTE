import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const paymentDbMocks = vi.hoisted(() => ({
  getPaymentByReferenceId: vi.fn(),
  updatePaymentStatus: vi.fn(),
  getSubscriptionWithPlan: vi.fn(),
  cancelSubscription: vi.fn(),
}));
const esewaMocks = vi.hoisted(() => ({ verifyESewaPayment: vi.fn() }));
const khaltiMocks = vi.hoisted(() => ({ verifyKhaltiPayment: vi.fn() }));

vi.mock("./db", () => ({
  getPaymentByReferenceId: paymentDbMocks.getPaymentByReferenceId,
  updatePaymentStatus: paymentDbMocks.updatePaymentStatus,
  createPayment: vi.fn(), getUserPayments: vi.fn(), getSubscriptionPlans: vi.fn(),
  createSubscription: vi.fn(), getUserActiveSubscription: vi.fn(), getUserSubscriptions: vi.fn(),
  updateSubscriptionAutoRenew: vi.fn(),
  cancelSubscription: paymentDbMocks.cancelSubscription,
  getSubscriptionWithPlan: paymentDbMocks.getSubscriptionWithPlan,
}));
vi.mock("./esewa", () => ({
  verifyESewaPayment: esewaMocks.verifyESewaPayment,
  createESewaPaymentRequest: vi.fn(), generateReferenceId: vi.fn(),
}));
vi.mock("./khalti", () => ({
  verifyKhaltiPayment: khaltiMocks.verifyKhaltiPayment,
  createKhaltiPaymentRequest: vi.fn(), generateReferenceId: vi.fn(), nprToKhalti: vi.fn(),
}));

import { paymentRouter } from "../routers/paymentRouter";

function createContext(): TrpcContext {
  return {
    user: { id: 1, openId: "payment-owner", email: "owner@example.com", name: "Payment owner", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("payment verification ownership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    esewaMocks.verifyESewaPayment.mockResolvedValue({ success: true, transactionCode: "other-user-reference" });
    khaltiMocks.verifyKhaltiPayment.mockResolvedValue({ success: true, transactionId: "khalti-transaction" });
  });

  it("does not update a payment record that is not owned by the current user", async () => {
    paymentDbMocks.getPaymentByReferenceId.mockResolvedValue(undefined);
    const caller = paymentRouter.createCaller(createContext());

    await expect(caller.verifyESewaPayment({ transactionCode: "submitted-code" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(paymentDbMocks.getPaymentByReferenceId).toHaveBeenCalledWith("other-user-reference", 1);
    expect(paymentDbMocks.updatePaymentStatus).not.toHaveBeenCalled();
  });

  it("updates a verified payment only with the current user's ownership predicate", async () => {
    paymentDbMocks.getPaymentByReferenceId.mockResolvedValue({ id: 55, userId: 1 });
    const caller = paymentRouter.createCaller(createContext());

    await expect(caller.verifyESewaPayment({ transactionCode: "submitted-code" })).resolves.toMatchObject({ success: true });
    expect(paymentDbMocks.updatePaymentStatus).toHaveBeenCalledWith(
      55, "completed", "other-user-reference", expect.objectContaining({ verificationResponse: expect.any(Object) }), 1,
    );
  });

  it("scopes Khalti verification updates to the authenticated payment owner", async () => {
    paymentDbMocks.getPaymentByReferenceId.mockResolvedValue({ id: 56, userId: 1 });
    const caller = paymentRouter.createCaller(createContext());

    await expect(caller.verifyKhaltiPayment({ pidx: "khalti-reference", transactionId: "submitted-tx", amount: 1000 }))
      .resolves.toMatchObject({ success: true });

    expect(paymentDbMocks.getPaymentByReferenceId).toHaveBeenCalledWith("khalti-reference", 1);
    expect(paymentDbMocks.updatePaymentStatus).toHaveBeenCalledWith(
      56, "completed", "khalti-transaction", expect.objectContaining({ verificationResponse: expect.any(Object) }), 1,
    );
  });

  it("cancels a subscription only through a user-scoped lookup and update", async () => {
    paymentDbMocks.getSubscriptionWithPlan.mockResolvedValue({ id: 77, userId: 1 });
    const caller = paymentRouter.createCaller(createContext());

    await expect(caller.cancelSubscription({ subscriptionId: 77 })).resolves.toEqual({ success: true });

    expect(paymentDbMocks.getSubscriptionWithPlan).toHaveBeenCalledWith(77, 1);
    expect(paymentDbMocks.cancelSubscription).toHaveBeenCalledWith(77, 1);
  });

  it("does not cancel a subscription that is absent from the current user's scoped lookup", async () => {
    paymentDbMocks.getSubscriptionWithPlan.mockResolvedValue(undefined);
    const caller = paymentRouter.createCaller(createContext());

    await expect(caller.cancelSubscription({ subscriptionId: 78 })).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(paymentDbMocks.getSubscriptionWithPlan).toHaveBeenCalledWith(78, 1);
    expect(paymentDbMocks.cancelSubscription).not.toHaveBeenCalled();
  });
});
