# PTE Academic Cross-Skill Calibration Matrix

## Purpose

This document records the fixed-input reference cases used to verify that the platform’s deterministic scoring paths remain stable across Speaking, Writing, Reading, and Listening. The platform uses a six-band illustrative anchor system at PTE scores **10, 30, 50, 65, 79, and 90**, while preserving task-specific form gates, content gates, and objective answer-key scoring.

The matrix below is an engineering verification artifact. It is not a claim that the platform reproduces Pearson’s proprietary examiner implementation or that the illustrative responses are official Pearson test content.

## Known-response matrix

| Skill | Task | Fixed reference case | Deterministic outcome | Expected PTE band | CEFR |
|---|---|---|---:|---:|---|
| Speaking | Read Aloud | Empty transcription against a non-empty reference passage | Content 0%; pronunciation 0/5; fluency 0/5 | **10** | A1 |
| Speaking | Read Aloud | Partial transcription containing the opening portion of the passage | Content is partial; pronunciation 3/5; fluency 3/5 | **58** | B1 |
| Speaking | Read Aloud | Exact transcription of the complete reference passage | Content 100%; pronunciation 5/5; fluency 5/5 | **90** | C2 |
| Writing | Write Essay | Response below the 120-word minimum | Form gate fails; raw score 0/15 | **10** | A1 |
| Writing | Write Essay | Valid 220-word response with content 1/3 and the remaining model traits at 1/2 | Raw score 9/15 after deterministic form and spelling overrides | **58** | B1 |
| Writing | Write Essay | Valid 220-word response with content 3/3 and all scored traits at their maximum | Raw score 15/15 after deterministic form and spelling overrides | **90** | C2 |
| Reading | Multiple Choice, Single Answer | Correct answer-key selection | 1/1 objective result | **90** | C2 |
| Reading | Multiple Choice, Single Answer | Incorrect answer-key selection | 0/1 objective result | **10** | A1 |
| Listening | Write from Dictation | Exact sentence reproduction | All reference words matched | **90** | C2 |
| Listening | Write from Dictation | Empty response against a non-empty sentence | No reference words matched | **10** | A1 |

## Calibration architecture

### Speaking

`server/ai/referenceCalibration.ts` normalizes the three score-bearing signals used by the live Read Aloud post-processing path: content percentage, pronunciation, and oral fluency. The default blend is **25% content, 40% pronunciation, and 35% fluency**. The blended percentage is mapped through the shared piecewise calibration table, clamped to the PTE range of 10–90, and assigned a CEFR label using the shared reference mapper.

### Writing

The live Write Essay path first applies the deterministic form gate. Responses below 120 words, above 380 words, or written entirely in capitals receive Band 10 and do not proceed to model scoring. Valid responses then receive deterministic form and spelling overrides; the remaining trait scores are combined into a raw score out of 15 and normalized through the shared calibration helper. A zero content score also forces Band 10.

### Reading and Listening

Objective answer-key paths retain deterministic endpoint behavior. Correct single-answer Reading responses and exact Write from Dictation responses normalize to Band 90; empty or incorrect references normalize to Band 10. Partial-credit paths use the same shared table with their task-specific raw-score denominators.

## Test coverage

The matrix is implemented and verified by the following tests:

- `server/ai/knownReferenceCalibration.test.ts` exercises the live Read Aloud and Write Essay paths, plus Reading and Listening endpoint cases, while also verifying that the six anchor descriptions are injected into subjective prompts.
- `server/ai/referenceCalibration.test.ts` tests the pure Speaking, Writing, and objective calibration helpers, including form/content gate behavior.
- `shared/scoreCalibrationTable.test.ts` verifies the common PTE 10–90 interpolation table.

The current verification run covers **164 Vitest tests** after adding the UI micro-interaction and live Writing calibration coverage. A production build is required before each checkpoint.
