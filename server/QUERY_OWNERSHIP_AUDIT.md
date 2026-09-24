# Query Ownership Audit

**Scope:** Learner-owned database access paths in the core session, response, SRS, payment, subscription, and profile flows. This review distinguishes authenticated learner access from intentionally global question-bank reads, administrator-only reporting, and trusted provider or scheduled-job work.

| Data path | Ownership control | Audit result |
|---|---|---|
| User profile | `ctx.user.id` is supplied by protected profile procedures; the helper updates only `users.id = userId`. OAuth upserts use the authenticated provider’s immutable `openId`. | Verified |
| Question bank | Practice question reads are shared learning content. Question mutations are restricted to administrator procedures. | Intentional shared access |
| Practice sessions | ID-based reads and writes are preceded by `session.userId === ctx.user.id` checks in the session and navigation routers. User history and analytics helpers filter by `practiceSessions.userId`. | Verified |
| User responses | Session ownership is verified before submission; response lookups in AI scoring verify `response.userId === ctx.user.id`. | Verified |
| Practice targets and milestones | Read helpers query their respective `userId`; writes receive the protected caller’s ID. | Verified |
| SRS cards and review logs | Due, upcoming, statistics, and automatic-card helpers filter by `userId`; ID-based card reads are checked against the caller before updates. | Verified |
| Payments | User payment history and subscriptions filter by `userId`. eSewa and Khalti verification now scope both payment lookup and status update to the authenticated user. | Repaired and tested |
| Subscription controls | Auto-renew already scopes its update by `userId`. Cancellation and plan lookup now accept an optional `userId` predicate and are called with the authenticated owner. | Repaired and tested |
| Admin reporting and management | Cross-user administration and aggregate metrics are exposed only through `adminOnlyProcedure`; they are not learner data endpoints. | Verified privileged boundary |
| Webhooks and renewal jobs | Provider webhooks and scheduled renewals intentionally operate without a learner session. Their identity boundary is provider verification or trusted server execution, not browser-supplied user IDs. | Classified system access |

## Regression Coverage

`server/payment/paymentRouter.test.ts` verifies that eSewa and Khalti verification queries and updates use the authenticated user ID, that absent cross-user payment records cannot be updated, and that subscription cancellation passes the same owner predicate to lookup and mutation helpers.

## File-by-File Inventory

| File or boundary | Classification | Review conclusion |
|---|---|---|
| `server/db.ts` | Learner-owned helpers plus shared question content | Profile, session history, analytics, targets, milestones, SRS lists, and automatic SRS creation use `userId`. ID-only session, response, and SRS-card helpers are used only after router ownership checks. Questions are intentionally shared content. |
| `server/_core/oauth.ts` | Trusted identity bootstrap | The OAuth callback upserts only the provider-verified `openId`; it accepts no client-selected user ID. |
| `server/_core/sdk.ts` | Trusted identity resolution | Session loading reads and refreshes only the JWT-verified session `openId`; it accepts no record ID from the browser. |
| `server/routers.ts` | Authenticated learner entry point | Session and response IDs are checked against `ctx.user.id` before use; writes inject the authenticated user ID rather than accepting a user ID from the client. |
| `server/routers/navigationRouter.ts` | Authenticated learner entry point | Every session lookup compares `session.userId` to `ctx.user.id` before progress reads, skip, bookmark, or navigation output. |
| `server/routers/aiScoringRouter.ts` | Authenticated learner entry point | Every response lookup compares `response.userId` to `ctx.user.id` before scoring or returning a result. |
| `server/payment/db.ts` | Learner billing helpers plus system aggregates | User payment, subscription, and auto-renew helpers filter by `userId`. Payment verification, subscription lookup, and cancellation now accept and apply a `userId` predicate. Revenue aggregates are administrator or job use. |
| `server/routers/paymentRouter.ts` | Authenticated learner billing entry point | Verification, active-subscription reads, auto-renew, and cancellation pass `ctx.user.id` to ownership-sensitive helpers. |
| `server/webhooks/paymentWebhook.ts` | Trusted provider integration | Unscoped lookups are intentional server-to-server reconciliation after provider verification; no browser-supplied user ID is trusted. |
| `server/payment/renewalService.ts` and `server/scheduled/subscriptionRenewal.ts` | Trusted scheduled execution | System-wide renewal selection and reference lookup are intentional background billing work, not learner request handling. |
| `server/admin/adminDb.ts`, `server/admin/userAdmin.ts`, `server/admin/analyticsDb.ts`, and `server/admin/adminAuth.ts` | Privileged administration | Cross-user reads and role updates are intentionally administrative and are exposed through the administrator-only router boundary. |
| `server/routers/systemAdminRouter.ts` and `server/routers/adminRouter.ts` | Privileged entry point | Data-bearing procedures are protected by an administrator role check; user-management actions include self-protection policy checks. |
| `server/routers/adminRouter.ts` | Shared content and privileged management | Question-bank reads are intentionally shared for authenticated learners; all question creation, update, generation, and deletion entry points use `adminProcedure`. |

### Complete Direct-Access Module Register

The following register covers every server module that imports a database helper or calls `getDb` directly. A module is either learner-scoped, protected by an administrator boundary, or a trusted server-side integration.

| Module | Classification |
|---|---|
| `server/_core/oauth.ts` | Trusted identity bootstrap |
| `server/_core/sdk.ts` | Trusted identity resolution |
| `server/admin/adminAuth.ts` | Administrator identity helper |
| `server/admin/adminDb.ts` | Administrator-only system reporting |
| `server/admin/analyticsDb.ts` | Administrator-only aggregate reporting |
| `server/admin/userAdmin.ts` | Administrator-only user management |
| `server/db.ts` | Learner-scoped helpers and shared questions |
| `server/payment/db.ts` | Learner-scoped billing helpers and trusted aggregate jobs |
| `server/payment/renewalService.ts` | Trusted scheduled billing job |
| `server/routers.ts` | Authenticated learner procedures |
| `server/routers/adminRouter.ts` | Shared question reads and administrator mutations |
| `server/routers/aiScoringRouter.ts` | Authenticated learner response scoring |
| `server/routers/navigationRouter.ts` | Authenticated learner session navigation |
| `server/routers/systemAdminRouter.ts` | Administrator-only reporting and management |
| `server/scheduled/subscriptionRenewal.ts` | Trusted scheduled billing trigger |
| `server/webhooks/paymentWebhook.ts` | Trusted provider webhook reconciliation; its legacy `/khalti/verify` route has no application registration or client caller, while the active browser flow uses the authenticated tRPC procedure |

## Review Rule

Any future procedure accepting an ID for a learner-owned record must either use a helper with a `userId` predicate or load the record and compare its `userId` with `ctx.user.id` before returning, updating, or deleting it. New cross-user or aggregate helpers must remain behind an administrator-only procedure or a trusted server-only integration boundary.
