# PTE Academic Task-Catalog Audit

## Official Reference

Pearson’s current PTE Academic materials describe **20 original question types plus two new speaking types**—**Respond to a Situation** and **Summarize Group Discussion**—for **22 scored question types**. Pearson separately presents **Personal Introduction** as a familiarization activity that does **not** contribute to the score. [Pearson test-format page](https://www.pearsonpte.com/pte-academic/test-format/) [Pearson 2025 update](https://www.pearsonpte.com/articles/pte-changes-2025-everything-you-need-to-know/)

| Platform catalog area | Audit result |
|---|---|
| Speaking and Writing | The platform exposes Personal Introduction, seven scored speaking tasks, and two writing tasks. This matches Pearson’s presentation: Personal Introduction is retained as unscored familiarization and the other nine are scored task types. |
| Reading | The platform contains the five official Reading task flows. |
| Listening | The platform contains the eight official Listening task flows. |
| New speaking tasks | Respond to a Situation and Summarize Group Discussion are represented and are included in the active practice catalog. |
| Internal identifiers | Reading and Listening Multiple Choice use a shared internal ID, so there are 21 distinct internal strings but 22 section-specific scored task flows. Section-qualified task links preserve the correct learner route. |
| Legacy records | Persisted Fill in the Blanks aliases normalize to canonical Reading or Listening routes and media rules. |

## Implementation Rule

Every task link must carry both `section` and `taskType`. The section disambiguates shared Multiple Choice identifiers, while `normalizeTaskType()` handles historical Fill in the Blanks IDs. Personal Introduction must remain excluded from score aggregation because Pearson states that it does not contribute to the score.

## Interaction Verification Update

The Reading Fill in the Blanks records use passages with inline `_____` markers and a flat answer-bank array. The generic text-entry fallback was replaced with an inline blank interface and reusable answer bank. Learners can drag an answer to a blank or select a blank and choose a word, with every blank required before submission. The implementation supports the legacy `fill_in_blanks_reading` identifier through the same canonical alias normalization.

Reading and Writing Fill in the Blanks records use either `[[gapN]]` or `{gapN}` markers with an options object keyed by gap. These now render as dropdowns directly in the passage rather than as disconnected controls below it. The option decoder handles both normal JSON and historical double-encoded JSON payloads, and validation requires a choice in every inline dropdown before submission.

Objective scoring now canonicalizes the task identifier before selecting its scoring rule. As a result, legacy Reading and Writing Fill in the Blanks records receive the same ordered, per-blank partial credit as canonical records rather than falling through to binary generic scoring.

## Persisted Taxonomy Cleanup

The remaining five legacy Fill in the Blanks records were migrated to canonical task identifiers: `fill_blanks_reading`, `fill_blanks_rw`, and `fill_blanks_listening`. The compatibility aliases remain in code for historic links and any future imports, but current question-bank records now use the same identifiers as task routing, learner controls, media detection, and objective scoring.

## Reorder Paragraphs Scoring Compatibility

Reorder Paragraphs answer keys are stored as JSON arrays. Objective scoring now decodes that persisted format before calculating adjacent-pair partial credit, so the learner’s sequence is compared with the actual paragraph order rather than with the serialized JSON text.

## Multiple Choice Scoring Compatibility

Multiple Choice keys imported as JSON arrays, including numeric option IDs, are now decoded into normalized selection arrays before exact-match and multiple-selection partial-credit scoring. The learner’s selected option IDs therefore compare with the underlying stored values rather than with their serialized JSON representation.

## Listening Selection Value Compatibility

Listening selection tasks imported from different question sources may store a correct answer as an option ID or as the full option text. A shared normalizer now maps both stored keys and learner-submitted option IDs to the same displayed option text before immediate deterministic scoring and the Listening AI scoring route. Canonical `multiple_choice_single` and `multiple_choice_multiple` identifiers are also explicitly handled by the Listening scorer.

## Answer Short Question Answer-Key Verification

The Answer Short Question bank was audited for content references. Ten prompts had no stored `correctAnswer`, which left their vocabulary/content evaluation without an explicit expected response. Each record now has a concise reference answer, including Photosynthesis, Pacific Ocean, Deoxyribonucleic acid, Sir Isaac Newton, Electrical energy, 206, CO2, Osmosis, and Seven. A scorer regression test verifies that the stored reference answer is passed into the Answer Short Question evaluation prompt.

## Sources

1. [Pearson PTE Academic and UKVI test format](https://www.pearsonpte.com/pte-academic/test-format/)
2. [Pearson PTE Academic Speaking and Writing format](https://www.pearsonpte.com/pte-academic/test-format/speaking-writing/)
3. [Pearson: PTE changes 2025](https://www.pearsonpte.com/articles/pte-changes-2025-everything-you-need-to-know/)
