# Functional Learning Modes

The Mock Test and Learning Modes now use the same persisted session-question contract as the existing practice scorer. Creating a mode session generates an ordered `questionPlan` from the available question bank and stores it on `practice_sessions`. Each plan entry contains a question ID, task type, and section, so the session can be resumed and navigated without relying on client-only state.

## Supported launch flows

The Mock Test page supports a full 20-question cross-section simulation and a five-question section simulation. Beginner Mode launches a five-question guided session, Exam Mode launches a five-question timed section session, and Diagnostic Mode launches an eight-question cross-skill sample. Revision Mode continues to use its dedicated spaced-repetition route rather than creating a duplicate session shell.

## Session behavior

The first available planned question is included in the launch URL. PracticeSession hydrates the ordered plan from the navigation API, updates the URL when the learner moves between questions, and preserves the existing Pearson task timing, audio, recording, validation, and AI scoring behavior. Previous, Next, Redo, Skip, Save, and Submit actions remain available in the single-column practice layout. Skipping creates an explicit skipped response, while an answer is persisted before the next question becomes available.

A planned session is completed only after its final question is answered or skipped. Intermediate submissions remain in progress and show a Next Question action. Final completion aggregates the latest response for each planned question, preventing retries from inflating the score. The report link is shown after the final step, and section progress reflects practiced, skipped, and remaining questions.

## Reliability and tests

The implementation rejects session plans with no available questions, validates that skipped questions belong to the current session, and preserves the existing per-user ownership checks. The shared session planner, navigation helpers, and latest-response aggregation helper have focused Vitest coverage. The complete suite and production build are required before checkpointing changes.
