# Pearson PTE Academic Alignment Audit

## Scope

This audit compares the platform's runnable task catalog, timing contracts, media rules, response validation, and objective scoring behavior with the current official Pearson PTE Academic sources. The platform is a practice product and is not presented as Pearson-certified or as an exact replica of Pearson's proprietary software.

## Official references

| Source | Alignment points used |
|---|---|
| [Pearson Speaking & Writing test format](https://www.pearsonpte.com/pte-academic/test-format/speaking-writing/) | Current Speaking and Writing task names, response procedures, and task timing. |
| [Pearson Reading test format](https://www.pearsonpte.com/pte-academic/test-format/reading/) | Reading task taxonomy and interaction patterns. |
| [Pearson Listening test format](https://www.pearsonpte.com/pte-academic/test-format/listening/) | Eight Listening question types, automatically playing clips, single playback, and response timing. |
| [Pearson PTE Academic Test Taker Score Guide](https://www.pearsonpte.com/content/dam/ELL/pte/pearsonpte/pdfs/pte-academic-pdfs/PTE-Academic-Test-Taker-Score-Guide.pdf) | 10–90 score scale, partial-credit rules, form/content gates, and integrated-skill scoring principles. |

## Corrections implemented

The canonical learner-facing taxonomy now includes Personal Introduction as an unscored familiarization task, seven scored Speaking task types, two Writing task types, five Reading task types, and eight Listening task types. The module navbar now uses the canonical IDs for Reading and Listening multiple-choice tasks, exposes Respond to a Situation and Summarize Group Discussion, and routes each dropdown item to a real Practice URL instead of rendering a passive label.

Personal Introduction is backed by an original practice prompt in the question bank, uses 25 seconds of preparation and 30 seconds of recording time, stores the learner's response, and displays an explicit unscored confirmation without invoking the AI score or feedback panel. It is available in Speaking section practice but intentionally excluded from the scored full mock plan.

The shared Speaking timing contract includes the Personal Introduction timing and is keyed per question so transitions reset the recorder and countdown state. Section practice now includes both Listening multiple-choice variants through the section-specific resolver, while the scored full mock remains a 20-task scored plan.

Objective scoring now awards per-blank partial credit for Reading and Writing Fill in the Blanks and Listening Fill in the Blanks. Comma- and newline-separated text responses are normalized in order, while single-answer multiple-choice remains binary and existing partial-credit rules for multiple-answer selection, Reorder Paragraphs, Highlight Incorrect Words, and Write from Dictation remain intact.

## Automated verification

The final verification run passed **192 tests across 40 test files**, followed by a clean production build. Coverage includes canonical route mapping, session planning, Personal Introduction validation, speaking timing, task media coverage, and fill-in-the-blanks partial credit.

## Browser verification note

The live production route `/practice/speaking?taskType=personal_introduction` reached the expected authentication boundary in the sandbox browser. Authenticated interaction could not be manually completed because no browser session was signed in; the route, planner, validation, test, and build checks therefore provide the automated verification basis for this pass.
