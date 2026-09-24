# Practice and Mock Mode Separation

Practice Mode now preserves three categories of flow. Beginner, Exam, and Diagnostic selections create the existing protected section-practice session with the selected mode persisted in the session record. Mock Test creation uses the persisted ordered question plan and carries explicit mock-test context through the question URL. Revision Mode is intentionally different: selecting it from the Practice page routes to the dedicated `/revision` spaced-repetition experience instead of creating a standard timed practice session.

This separation prevents Revision Mode from accidentally bypassing its SRS queue and prevents a normal section practice session from being presented as a full mock test. The routing policy is isolated in `client/src/lib/practiceModeRouting.ts` with focused tests for dedicated and normal modes. The full test suite and production build pass after the change.
