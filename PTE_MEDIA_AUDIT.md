# PTE Task-Media Reliability Audit

## Scope and Result

The question bank was reviewed by task type for stored `audioUrl` and `imageUrl` coverage. All **Describe Image** records currently have an image source. Original audio is present for every **Summarize Group Discussion** record and most **Respond to a Situation** records, but it is incomplete for several audio-first task types, including Answer Short Question, Retell Lecture, and most Listening records.

The learner-facing safeguard is therefore intentional: audio-first prompts automatically use original audio where it exists and use the platform’s synthesized prompt fallback when it does not. A media loading error exposes a retry control and makes the fallback available rather than leaving the task blank. Legacy persisted IDs such as `fill_in_blanks_listening` are now normalized before media detection, so they receive the same audio treatment as their canonical task type.

| Audit area | Current safeguard |
|---|---|
| Describe Image | Requires an image task source; the reviewed records include image URLs. |
| Audio-first tasks with original media | The session player autoplays the stored source and retries a failed media request. |
| Audio-first tasks without original media | The session player synthesizes the question content or prompt and informs the learner that synthesized audio is in use. |
| Legacy task IDs | Media requirement detection normalizes persisted aliases before deciding whether to show the audio player. |

## Follow-up Content Work

Original, licensed recordings should still be added for task-bank rows that currently use synthesized prompts. This is a content-quality improvement rather than a task-blocking failure: each audited audio-first flow now has a visible playable path.

## Listening Routing Verification

The listening bank stores generic `multiple_choice_single` and `multiple_choice_multiple` IDs that are also used by Reading. The session now evaluates the question section together with its task type. Consequently, these two types are rendered as audio-first only for Listening and continue to display as text-first questions for Reading.

The audit also found one legacy `fill_in_blanks_listening` row. Its audio requirement was already normalized, but its answer field was not. The learner interaction now normalizes that persisted ID before choosing the text-entry component, so legacy and canonical Listening Fill in the Blanks questions both provide prompt playback and a response field.

The prompt transcript remains hidden before submission for the affected Listening flows. Stored audio plays when available; otherwise, the existing synthesized fallback uses the stored prompt content and reports that fallback to the learner. Regression coverage now tests section-aware MCQ audio routing and legacy Fill in the Blanks response handling.

The same flow review found that **Summarize Spoken Text** had prompt playback and server-side scoring but no learner text-entry interface. It now provides a dedicated 50–70-word response area with a live word count and target reminder. The response field uses the existing Listening scoring route and is covered by the shared listening-response contract test.

## Question-Bank Completeness Update

The question-bank audit found two Listening selection records with neither usable prompt text nor topic-matched audio: **Marine Migration Patterns** and **Linguistics Lecture**. Both now contain complete source text and intentionally use the synthesized prompt fallback rather than unrelated music. Their answer options and keys remain unchanged.

The same audit found missing instruction and timing metadata on ten Respond to a Situation and ten Summarize Group Discussion records. They now carry task-specific learner instructions and the platform’s configured 10-second preparation plus 40- or 120-second response timing values. Regression coverage verifies that audio-first selection tasks can use prompt text when stored audio is unavailable.

## Placeholder-Audio Removal

Twenty-eight audio-first records used either generic SoundHelix music or non-resolving `example.com` URLs that did not represent their stored PTE prompt content. Those URLs were removed so these records use the existing synthesized prompt path instead. A shared media helper now rejects known placeholder and example audio URLs at render time, preventing any future record with those sources from bypassing the topic-matched fallback.

## Highlight Incorrect Words Repair

All eight current Highlight Incorrect Words records now have original platform-hosted prompt audio and answer keys, allowing fair objective scoring. The repaired recordings deliberately differ from their displayed transcripts at documented word-level positions. Their answer keys use those displayed mismatches, and objective scoring now parses the JSON-encoded keys stored in the question bank before applying partial credit and false-positive penalties.

## Write From Dictation Reference Answers

Twelve Write From Dictation questions had usable prompt text but no stored reference answer. Their reference answers were restored directly from that verified prompt text, matching the synthesized playback source used in practice. The shared question audit now rejects any deterministic objective task that lacks a reference answer, preventing the same gap from being published again.

## Summarize Spoken Text Scoring Policy

Summarize Spoken Text is a written Listening response and is now held in a pending state after submission until the existing section-specific Listening scorer evaluates its content, form, grammar, vocabulary, and spelling. The submission route no longer assigns a temporary generic objective score to this task, so an asynchronous scoring interruption cannot leave a learner with a misleading exact-match result.

## Listening Fill in the Blanks Scoring Repair

Listening Fill in the Blanks now uses the canonical `fill_blanks_listening` identifier throughout the AI scoring path. The dispatcher normalizes legacy aliases before routing to the deterministic per-blank scorer, preventing the task from falling through to generic Summarize Spoken Text scoring. The submission route also converts the learner's comma- or newline-separated response into ordered blank objects before scoring, while preserving any explicitly supplied blank positions.

The live question bank contains eight FIB-L records. Six store JSON-array answer keys and two store JSON-object keys (`gap1`, `gap2`, or `gap3`); all eight are now decoded into the same ordered answer array. Regression coverage verifies canonical dispatch, JSON-array/object decoding, legacy delimited keys, and partial-credit scoring. Focused validation passed with 22 tests, and the full suite passed with 70 test files and 285 tests.

## 2026-09-25 — Pearson Speaking Score-Guide Reliability Guard

Compared the speaking scorer with the supplied Pearson PTE Academic Score Guide, especially the Read Aloud and Repeat Sentence trait tables and the Pronunciation/Oral Fluency descriptors on pages 15–17 and 45–46. Added a deterministic post-AI guard for materially incomplete or pause-heavy recordings: responses of three words or fewer, or very low-rate responses with insufficient speech, cannot receive an inflated Oral Fluency 2+ result; Pronunciation is also capped when the recording provides insufficient evidence. Answer Short Question is excluded because Pearson permits a short direct answer for that task. Repeat Sentence continues to use the official deterministic content mapping (3 for all words, 2 for at least 50%, 1 for less than 50%, 0 for almost nothing). The guard preserves task-specific content scoring when recalculating the overall score and provides actionable feedback about sustained speech and pauses.

Validation completed: 70 Vitest files / 288 tests, TypeScript check, and production build.


## 2026-09-30 — Session Section Ownership and Exam-Mode Guard

Repaired a session failure where a question from one module could be selected or appended to a session belonging to another module. Session creation now rejects mismatched target questions and never falls back to an unscoped question; response submission validates section ownership before changing the session plan; and navigation filters legacy/corrupted plans to questions that truly belong to the session section. Ordinary Practice exam-mode clicks now open the proper Mock Test flow, while direct exam-mode session links are rejected unless they belong to a mock test or an exam-mode sectional test. This prevents misleading session state and the `This question does not belong to the selected practice section` mutation error.

## 2026-09-30 — Exam-Mode Eligibility Follow-up

Tightened exam-mode entry after resume: one-question section practice sessions cannot be created with exam mode, and the learner session redirects to the Mock Test entry when an exam-mode URL is not backed by a mock test or a multi-question sectional plan. Ordinary task practice remains non-exam by default. Full validation passed again with 70 Vitest files / 288 tests, TypeScript check, and production build.

## 2026-09-30 — Pause and Save-Progress Visibility

Restricted the `Pause Test & Save Progress` control to valid exam flows only: real full mock tests and multi-question sectional tests. Ordinary task practice, beginner mode, diagnostic mode, revision mode, and legacy one-question sessions no longer show test-pause controls. Validation passed with focused UI/session tests, TypeScript check, production build, and the complete regression suite.

## 2026-09-30 — Learning Modes Exam Entry

Aligned Learning Modes with the test-only exam policy. Selecting Exam Mode from Learning Modes now opens the dedicated Mock Test flow instead of creating a one-off section practice session. The shared mode-routing helper and regression tests now enforce `/mock-test` as the only ordinary UI entry for exam mode; Beginner and Diagnostic continue to create their appropriate learning sessions, while Revision retains its dedicated route.

## 2026-10-01 — Next Button Navigation Repair

Repaired session navigation so Next, Back, and Skip use the server-loaded session question list as a fallback while local question state is hydrating. This prevents valid multi-question tests from appearing as `1 / 1`, disables Next incorrectly, or making the handler a no-op after submission. The question counter, final-question logic, and skip progression now use the same navigable list.

## 2026-10-01 — Navbar Task Direct Launch

Updated GlobalModuleNavbar task links to mark the selected task for immediate launch. Practice now selects a random question from that task type and starts its dedicated one-question practice session automatically after the task bank loads, instead of leaving the learner on the full task list. This applies to tasks such as Retell Lecture while preserving the selected Beginner/Diagnostic/Revision mode behavior; Exam mode still routes to Mock Test.

## 2026-10-01 — Focused Task Difficulty Selector

Added a difficulty selector beside the focused task controls in Practice. Learners can choose All difficulties, Easy, Medium, or Hard; the visible question list and Random Question action filter to that choice, with a clear empty state when no questions exist at the selected level. Direct navbar task launches continue to open the selected task automatically, using all difficulties by default.

## 2026-10-01 — Practice Module Card Deduplication

Removed the duplicate Speaking, Writing, Reading, and Listening section-card grid from the Practice page. Module selection now remains in the existing PremiumHeader top navigation, while `/practice/:section` continues to control the active task bank and URL-based task focus. This reduces vertical space and avoids presenting two competing module selectors.

## 2026-10-01 — Direct Navbar Task Landing

Removed the intermediate full Practice-list flash for navbar task links. When a task link carries the auto-start flag, Practice now shows a focused launch state while the selected task bank loads and its one-question session is created, then redirects directly to that task session. This keeps the learner on the requested task instead of briefly presenting unrelated task cards.

## 2026-10-01 — Removed Redundant Skip Question Control

Removed Skip Question from the learner session navigation because it duplicated the working Next action. Deleted the unused skip mutation and handler from PracticeSession while retaining Back, Redo, Next, and Bookmark. Forward navigation is now represented by one clear Next button.

## 2026-10-01 — PremiumHeader Direct Task Navigation Fix

Fixed the actual persistent PremiumHeader task menu so task clicks include `start=1` and launch the selected task session directly. Previously, the menu used the section Practice route without the auto-start flag, which caused learners to land on the full task list and scroll. Added regression coverage for the Retell Lecture route.

## 2026-10-04 — Removed Duplicate Practice Module Progress Row

Removed the redundant Speaking/Writing/Reading/Listening progress row from the Practice session header, including displays such as `0/1` and `0/0`. The global top navigation remains the single module/task navigation surface; the session header now shows only the focused task, difficulty, question position, and applicable timer. Removed the unused module-progress query and state from PracticeSession.

## 2026-10-04 — Next and Redo Interaction Repair

Next is now enabled immediately after a question is viewed, including focused one-question practice sessions. In a multi-question session it advances through the loaded plan; at the end of ordinary practice it opens another focused question of the same task, while the final exam question gives clear submit guidance. Redo now resets response fields, timing, scoring state, and remounts speaking controls so preparation/recording starts from the beginning.

## 2026-10-04 — Navbar Task List Landing

Changed task clicks in both PremiumHeader and GlobalModuleNavbar to open `/practice/:section?taskType=...` without the auto-start flag. Practice uses the task type query to expand the selected task and show its question list, allowing learners to choose a specific question instead of being sent automatically to the first question.

## 2026-10-05 — Admin Panel Reliability Audit

Repaired the administrator workflows that were still presenting incomplete or non-functional behavior. The Users page now reads persisted users through `systemAdmin.listUsers`, supports search, refresh, promote/demote, and suspend/restore actions through protected mutations, and displays real role/status/sign-in data. The Payment Management page now uses persisted payment-revenue analytics rather than activity-log placeholders, including gateway revenue, failed payments, active subscription breakdown, and daily completed revenue. The Question Manager now uploads the selected CSV only when the upload button is pressed, waits correctly for AI generation, supports editing existing questions through a protected update procedure, and exposes the full supported speaking, writing, reading, and listening task catalog. Dead AdminLayout links were replaced with reachable Questions and System Admin destinations, and `/admin` now opens the data-backed dashboard. TypeScript validation, the full 70-file/290-test suite, and the production build passed.
