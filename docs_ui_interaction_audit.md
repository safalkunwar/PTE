# Interactive UI Micro-Interaction Audit

The platform’s shared interaction baseline is implemented in `client/src/components/ui/button.tsx` and `client/src/components/ui/card.tsx`. Shared Buttons now provide a short lift on hover, a press-scale response, and visible keyboard focus treatment. Shared Cards provide a restrained lift and shadow transition so hover feedback does not change layout dimensions.

The raw interactive controls identified by the audit were updated individually because they do not use the shared Button primitive:

| Surface | File | Control coverage |
|---|---|---|
| Admin header | `client/src/components/AdminLayout.tsx` | Mobile menu and notification controls |
| User dropdown | `client/src/components/TopNavbar.tsx` | Profile and logout actions |
| Admin users | `client/src/pages/AdminUsersPage.tsx` | Promote/demote role control |
| Dashboard history | `client/src/pages/Dashboard.tsx` | Report and Continue actions |
| Public landing page | `client/src/pages/Home.tsx` | Go to Dashboard CTA |
| Dashboard sidebar | `client/src/components/DashboardLayout.tsx` | Route items and account trigger |

The sidebar also has a route-bound active indicator in `DashboardLayout.tsx`. The indicator is rendered only for the active route, enters with a spring scale transition, and switches to an instantaneous state when `prefers-reduced-motion` is enabled. The motion policy is isolated in `client/src/lib/sidebarNavigation.ts` so it can be tested independently.

Regression coverage is provided by `client/src/lib/uiMicroInteractions.test.ts` and `client/src/lib/sidebarNavigation.test.ts`. The audit intentionally avoids adding motion to disabled controls and preserves focus rings for keyboard users.
