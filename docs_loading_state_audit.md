# Loading-State Audit

**Audit date:** 2026-08-16

This audit inventories client-side async query surfaces found with `trpc.*.useQuery` or equivalent data hooks. The target behavior is a visible, layout-preserving loading state rather than a blank panel, a text-only wait message, or an invisible `null` return.

| Surface | Async data | Loading treatment | Status |
|---|---|---|---|
| `AdminAnalyticsReal` | Five system analytics queries | KPI, tab, and chart skeleton | Covered |
| `AdminDashboardPage` | System statistics and health | KPI and health skeleton | Covered |
| `AdminPaymentsPage` | Activity/payment logs | Transaction-row skeleton | Covered |
| `AdminQuestionManager` | Questions by task type | Question-card skeleton | Covered |
| `AdminUsersPage` | Activity-derived user list | User-row skeleton | Covered |
| `Analytics` | Personal analytics, history, milestones | Existing page skeleton | Covered |
| `Dashboard` | Personal analytics, target, milestones, history | Existing dashboard loading shell | Covered |
| `PaymentHistory` | Payment history and active subscription | Full billing-page skeleton | Covered |
| `Practice` | Section question list | Existing task-card skeleton | Covered |
| `PracticeSession` | Question, persisted responses, navigation/progress | Question/session skeleton plus existing scoring states | Covered |
| `Profile` | Personal analytics | Existing page-level loading handling | Covered |
| `RevisionMode` stats/deck | SRS statistics and due cards | Stats and review-card skeletons | Covered |
| `RevisionMode` upcoming cards | Upcoming SRS cards | Dedicated upcoming-review skeleton while pending; hides only after resolved empty state | Covered |
| `ScoreReport` | Session score report | Existing report-card skeleton | Covered |
| `SystemAdminPanel` | Stats, health, logs, alerts, performance | KPI inline skeletons and tab-section skeletons | Covered |

Mutation-only pending states such as CoachingPlan generation, AI scoring, audio submission, and payment auto-renewal use explicit progress labels or disabled controls; they are not query loading surfaces and are intentionally not represented as page skeletons.

The audit also confirms that optional empty states remain distinct from loading states. In particular, `RevisionMode` UpcomingCards returns `null` only after its query has resolved and returned no cards; during the request it renders a visible skeleton.

## Final verification note

The final repo-wide query inventory was re-run after the first audit. `AdminDashboardPage` now tracks `healthLoading` independently and renders a system-health skeleton while `getSystemHealth` is pending, even when the statistics query has already resolved. `AdminAnalyticsReal` and all identified page-level query surfaces now expose a layout-preserving skeleton or an equivalent structured loading state. `RevisionMode` UpcomingCards is the only optional section that may disappear, and it does so only after its query resolves empty.

The final query inventory also verified that `Dashboard` waits for its analytics, daily-target, milestones, and history queries with a dashboard skeleton, while `Profile` renders a settings skeleton for its analytics query. This closes the remaining previously uncovered page surfaces.
