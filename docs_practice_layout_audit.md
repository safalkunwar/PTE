# Practice Layout Audit

The Practice page now uses an explicit centered responsive workspace contract: `mx-auto w-full max-w-4xl space-y-5`. This keeps the four-module tabs, mode selector, task-type accordions, and question lists in a dense single-column workspace on large screens while allowing the content to use the full available width on small screens. No backend contracts, session creation behavior, or scoring logic were changed.

The layout contract is isolated in `client/src/lib/practiceLayout.ts` and covered by a focused Vitest assertion. The full application test suite and production build pass after the change.
