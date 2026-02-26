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

## Phase 4 — Speaking Section Enhancements (COMPLETED)
- [x] Preparation countdown timer (per task type: Read Aloud=40s, Repeat Sentence=0s, Describe Image=25s, Re-tell Lecture=10s, Answer Short Question=3s)
- [x] Recording phase timer (per task type: Read Aloud=40s, Repeat Sentence=15s, Describe Image=40s, Re-tell Lecture=40s, Answer Short Question=10s)
- [x] Visual prep phase UI: animated SVG circular countdown, teal gradient, task-specific tips, auto-transitions to recording
- [x] Real-time transcription display during recording (Web Speech API live transcript + Whisper final transcription)
- [x] Word-level pronunciation colour highlighting (green=correct, yellow=hesitation, red=mispronounced, blue=extra, grey=missing)
- [x] Pronunciation comparison: original text vs spoken text side by side
- [x] Colour legend with interactive tooltips on hover
- [x] Fluency metrics: WPM, pause count, accuracy %, omission % with colour-coded feedback
- [x] WPM guide (< 80 = too slow, 100–160 = ideal, > 200 = too fast)
- [x] Dedicated SpeakingTask component (client/src/components/SpeakingTask.tsx)
- [x] LCS-based word alignment algorithm for accurate original vs spoken comparison
- [x] Timing info banner showing prep and record durations before task starts
- [x] Server returns Whisper transcription in submit response for client-side word alignment
- [x] getResponseById helper added to db.ts
- [x] All 70 tests still passing, 0 TypeScript errors

## Phase 5 — Speaking UX Enhancements (COMPLETED)
- [x] Skip preparation time button (visible during prep countdown, immediately starts recording)
- [x] Real-time voice-reactive waveform using Web Audio API AnalyserNode (bar chart animates with microphone amplitude)
- [x] Waveform shows flat/idle state during prep, animates during recording, freezes on stop
- [x] Model audio playback using browser TTS (speechSynthesis) for all speaking tasks
- [x] "Hear Model Answer" button with play/pause/stop controls and speed adjustment (Slow/Normal/Fast)
- [x] Visible images for Describe Image tasks (imageUrl from question data)
- [x] Fallback placeholder for Describe Image when no imageUrl is set (animated bar chart placeholder)
- [x] Task image panel with expand/collapse toggle
- [x] Describe Image questions updated with Wikimedia Commons chart/graph images
- [x] 0 TypeScript errors, 70/70 tests passing

## Phase 6 — AI Training & Accuracy Improvements
- [ ] Read and extract full PTE scoring rubrics from ptescoreguide.pdf and pasted_content.txt
- [ ] Rebuild scoring.ts with task-specific system prompts using official PTE criteria
- [ ] Add few-shot calibration examples (anchor responses at 10, 30, 50, 65, 79, 90 score levels)
- [ ] Add chain-of-thought reasoning: AI explains each criterion before assigning score
- [ ] Add structured JSON output schema with strict validation for all scoring tasks
- [ ] Add score confidence field and flag low-confidence responses for human review
- [ ] Rebuild aiCoach.ts with PTE-aligned diagnostic categories and actionable tips
- [ ] Add task-specific coaching prompts: Read Aloud, Repeat Sentence, Describe Image, Essay, SWT
- [ ] Add error pattern recognition: common PTE mistakes per task type
- [ ] Add model answer generation with quality tiers (band 65, band 79, band 90)
- [ ] Add pronunciation phoneme analysis prompt for speaking tasks
- [ ] Add grammar error classification (subject-verb agreement, tense, articles, prepositions)
- [ ] Add vocabulary sophistication scoring (academic word list, collocations, range)
- [ ] Add written discourse coherence scoring (cohesive devices, paragraph structure)
- [ ] Write AI scoring accuracy tests with known-score reference responses
- [ ] Add score normalization calibration table aligned to PTE 10-90 scale

## Phase 7 — System Audit, Concurrency & Premium Animations
- [ ] Audit all DB queries for user-scoped WHERE clauses (no data leakage between users)
- [ ] Audit session creation/management for per-user isolation
- [ ] Audit SRS cards for per-user isolation
- [ ] Audit audio upload endpoint for per-user file namespacing
- [ ] Fix any shared mutable state in server-side code
- [ ] Add framer-motion page transitions (fade+slide between routes)
- [ ] Add staggered list animations on Practice page task cards
- [ ] Add animated score counter on Dashboard and ScoreReport
- [ ] Add premium waveform animation in SpeakingTask
- [ ] Add skeleton loading states for all data-fetching components
- [ ] Add hover micro-interactions on all cards and buttons
- [ ] Add smooth accordion animations on AIFeedbackPanel
- [ ] Add animated progress bars with spring physics
- [ ] Add confetti/celebration animation on high scores
- [ ] Add smooth sidebar navigation highlight transitions
- [ ] Lazy load heavy pages (Analytics, MockTest, RevisionMode)
