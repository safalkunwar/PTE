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
