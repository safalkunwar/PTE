# PTE Academic Practice Platform - TODO

## Database & Backend
- [x] Extended database schema: practice_sessions, questions, user_responses, scores, skill_scores, notifications
- [x] Question bank seeding with all PTE task types
- [x] tRPC routers: questions, sessions, scoring, analytics, notifications
- [x] LLM scoring engine for writing tasks (essay, summarize written text)
- [x] LLM scoring engine for speaking tasks (read aloud, repeat sentence, describe image)
- [x] Audio transcription integration for speaking tasks
- [x] Score normalization logic (10-90 scale)
- [x] Progress tracking and analytics queries
- [x] Audio upload endpoint (/api/upload-audio)
- [x] Partial credit scoring for Write from Dictation, Reorder Paragraphs, Highlight Incorrect Words

## Frontend - Layout & Navigation
- [x] Global design system (colors, typography, spacing)
- [x] Landing/home page with feature highlights and CTA
- [x] Dashboard layout with sidebar navigation
- [x] Authentication flow (login/logout)
- [x] User profile page

## Frontend - Practice Modules
- [x] Speaking module: Read Aloud
- [x] Speaking module: Repeat Sentence
- [x] Speaking module: Describe Image
- [x] Speaking module: Re-tell Lecture
- [x] Speaking module: Answer Short Question
- [x] Writing module: Summarize Written Text
- [x] Writing module: Write Essay
- [x] Reading module: Multiple Choice (Single)
- [x] Reading module: Multiple Choice (Multiple)
- [x] Reading module: Re-order Paragraphs
- [x] Reading module: Fill in the Blanks (Reading)
- [x] Reading module: Fill in the Blanks (Reading & Writing)
- [x] Listening module: Summarize Spoken Text
- [x] Listening module: Multiple Choice (Single/Multiple)
- [x] Listening module: Fill in the Blanks (Listening)
- [x] Listening module: Highlight Correct Summary
- [x] Listening module: Select Missing Word
- [x] Listening module: Highlight Incorrect Words
- [x] Listening module: Write from Dictation
- [x] Audio recording component with waveform visualization
- [x] Countdown timer component for timed tasks

## Frontend - Score & Feedback
- [x] Score report page (Overall + Communicative Skills + Enabling Skills)
- [x] Diagnostic feedback panel with weakness identification
- [x] Action plan and improvement strategies
- [x] Task-specific guidance and tips

## Frontend - Analytics & Progress
- [x] Progress analytics dashboard with charts
- [x] Score trends over time visualization
- [x] Skill development radar chart
- [x] Performance history table

## Frontend - Mock Test & Learning Modes
- [x] Full mock test simulation (all 4 sections, timed)
- [x] Section-wise practice mode
- [x] Beginner Mode (guided + templates)
- [x] Exam Mode (strict, timed, real scoring)
- [x] Diagnostic Mode (weakness detection)
- [x] Revision Mode (high-impact practice)
- [x] Daily practice targets and roadmap page
- [x] Progress reminders and milestone notifications

## Testing
- [x] auth.logout test
- [x] normalizeToPTE unit tests (6 cases)
- [x] scoreObjectiveTask unit tests (14 cases — MCQ, dictation, reorder, highlight, fill blanks)
- [x] questions.list integration tests
- [x] All 24 tests passing

## Static Results Webpage
- [x] Interactive results overview static webpage
- [x] Score visualization charts (radar, bar, line)
- [x] Skill breakdown interactive display
- [x] Shareable/saveable results page
- [x] Interactive score simulator with sliders
- [x] Improvement roadmap (dynamic)
- [x] Task type tabs for all 20 task types
- [x] Feature comparison table

## Phase 2 — APEUni Redesign & AI Coaching (Completed)
- [x] APEUni-style teal/cyan color scheme and dark sidebar
- [x] PTEMaster branding with teal accent
- [x] Home landing page redesigned in APEUni style
- [x] Dashboard redesigned with dark sidebar and study stats
- [x] AI coaching engine (aiCoach.ts) with task-specific personalized feedback
- [x] AI coaching plan router (getTaskFeedback, getCoachingPlan)
- [x] AIFeedbackPanel component (criterion scoring, error analysis, improvement tips, model answers)
- [x] CoachingPlan page (4-week roadmap, skill gap analysis, daily schedule)
- [x] Integrated AIFeedbackPanel into PracticeSession after submission
- [x] Added AI Coaching Plan to sidebar navigation
- [x] Question bank expanded to 127+ questions (expand-questions.mjs)
- [x] Overview webpage enhanced: AI Feedback preview, 4-week roadmap, skill gap chart, daily schedule

## Phase 3 — Spaced Repetition System (COMPLETED)
- [x] Add spaced_repetition_cards table to schema (SM-2 fields: easeFactor, interval, repetitions, dueDate, lastReviewedAt, totalReviews, lapses)
- [x] Add srs_review_logs table for full review history
- [x] Run migration SQL
- [x] Implement SM-2 algorithm in server/sm2.ts
- [x] Add SRS tRPC router (getDueCards, recordReview, getStats, resetCard, addCard, autoCreateFromSession, resetCard)
- [x] Auto-create SRS cards when a response scores below threshold (shouldCreateCard, autoCreateSrsCardsFromSession)
- [x] Build RevisionMode page with SRS deck UI (card flip, difficulty rating 1-5, keyboard shortcuts)
- [x] Build SRS stats panel (due today, reviewed today, total cards, retention rate)
- [x] Build 14-day review heatmap with colour-coded activity
- [x] Build deck composition state distribution chart
- [x] Build upcoming cards panel
- [x] Build SM-2 explanation and rating guide sidebar
- [x] Show SRS due count badge in sidebar navigation (auto-refreshes every 60s)
- [x] Write SM-2 algorithm unit tests (46 tests covering all SM-2 edge cases)
- [x] All 70 tests passing (46 SM-2 + 23 scoring + 1 auth)
