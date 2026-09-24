# Pearson PTE Academic format audit notes

Source: [Pearson PTE Academic & UKVI test format: Speaking & Writing](https://www.pearsonpte.com/pte-academic/test-format/speaking-writing/), accessed 2026-08-14.

Pearson currently lists nine Speaking & Writing question types in this order: Personal Introduction, Read Aloud, Repeat Sentence, Describe Image, Retell Lecture, Answer Short Question, Summarize Group Discussion, Respond to a Situation, Summarize Written Text, and Write Essay. The Speaking & Writing part is listed as 76–84 minutes.

The Personal Introduction is for familiarization and does not contribute to the score; Pearson states 25 seconds to read/prepare and 30 seconds to record, with one recording attempt.

Read Aloud uses text up to 60 words. Pearson states 30–40 seconds to read and prepare, followed by a short tone and a single recording attempt; response time varies by item length.

Important implementation implication: preparation and response durations must be task-specific, the microphone should not record before the opening signal, and non-scored familiarization content must not enter scoring or completion metrics.


Pearson Repeat Sentence procedure: the candidate hears a recorded sentence, with a prompt length of 3–9 seconds. The microphone opens automatically after the audio finishes, the response time is 15 seconds, and the candidate cannot replay the audio or record more than once. The task assesses Listening and Speaking.

Implementation implication: Repeat Sentence must autoplay the prompt, lock replay, start recording only after prompt playback ends, use a 15-second response timer, and keep the single-attempt constraint. A browser TTS fallback may be offered for practice mode only, but it should not be confused with an official recording.


Pearson Describe Image procedure: an image appears on screen; the candidate has 25 seconds to study and prepare, then 40 seconds to speak after a tone. The candidate must not speak before the microphone opens and can record only once. Pearson lists Speaking as the assessed skill.

Implementation implication: Describe Image must require a non-empty image asset or an explicit, clearly labeled practice fallback, use 25 seconds preparation and 40 seconds response, and prevent scoring if the visual prompt is missing.


Pearson Retell Lecture procedure: the candidate listens to or watches a lecture of up to 90 seconds, then has 10 seconds to prepare and 40 seconds to respond. The audio begins automatically; an image may accompany it; notes may be taken on the erasable noteboard. The microphone opens after the preparation countdown and tone, and the candidate can record only once. Pearson lists Listening and Speaking as assessed skills.

Implementation implication: Retell Lecture should autoplay the prompt, keep the 10-second post-audio preparation period, use a 40-second response timer, expose a note-taking area in practice mode, and require prompt media or an explicit fallback before scoring.


Pearson Answer Short Question procedure: the candidate hears a 3–9 second question and has 10 seconds to answer. The microphone opens automatically when the audio finishes; there is no short tone. The response should be one word or a few words, the audio cannot be replayed, and the candidate can record only once. Pearson lists Listening as the assessed skill.

Implementation implication: Answer Short Question should use a 10-second response timer, a short-answer target, automatic prompt playback, no replay in exam mode, and content/media validation before scoring.


Pearson Reading section: 23–30 minutes and five question types. The official current catalog is Fill in the Blanks (Dropdown), Multiple Choice Multiple Answers, Reorder Paragraph, Fill in the Blanks (Drag and Drop), and Multiple Choice Single Answer. Pearson explicitly notes that Reading and Writing: Fill in the Blanks also assesses writing. Dropdown fill-in prompts may contain text up to 300 words; the response is completed by selecting one option per gap. Pearson does not prescribe a fixed per-item answer time.

Implementation implication: task labels and renderer semantics should use Pearson’s official names, dropdown and drag/drop blanks should be modeled separately, and reading objective items should require all required selections before scoring.


Pearson Listening section: 31–39 minutes and eight question types. Audio/video clips begin automatically, each is heard once, and candidates may take notes. The official catalog is Summarize Spoken Text, Multiple Choice Multiple Answers, Fill in the Blanks (Type In), Highlight Correct Summary, Multiple Choice Single Answer, Select Missing Word, Highlight Incorrect Words, and Write from Dictation.

Pearson Summarize Spoken Text: a 60–90 second recording, 10 minutes to listen and write, with a required 50–70 word response; the recording plays once. Pearson Write from Dictation: a 3–5 second sentence, typed into the response box, heard once; it assesses Listening and Writing and awards credit for correct words in correct order.

Implementation implication: listening audio should autoplay once in exam mode, a practice fallback must be labeled as synthesized, note-taking should be available, SST must enforce 50–70 words, and WFD must compare ordered words with partial credit rather than exact-string-only scoring.


Pearson Summarize Group Discussion: listen to a discussion between three people of up to 3 minutes, then use 10 seconds to prepare and 2 minutes to speak. The audio plays once, notes are allowed, the microphone opens after a tone, and recording is allowed once.

Pearson Respond to a Situation: read and listen to an everyday situation with text up to 60 words, use 10 seconds to prepare, and speak for 40 seconds. The audio plays once, notes are allowed, and recording is allowed once.

Implementation implication: these 2025 speaking additions require long response timers (120 seconds for SGD and 40 seconds for RTS), a 10-second post-audio preparation stage, and no replay/second recording in exam mode.


Pearson Summarize Written Text: source text up to 300 words, 10 minutes to answer, and a full single-sentence summary of no more than 75 words; it assesses Reading and Writing.

Pearson Write Essay: a 2–3 sentence prompt, 20 minutes to answer, and a 200–300 word argumentative essay; it assesses Writing.

Implementation implication: both writing tasks need task-specific countdowns, and SWT must reject multiple-sentence responses as a form failure rather than awarding a normal score.


## Speaking question-bank coverage audit — 2026-08-14
The live question bank contains the following speaking coverage: Answer Short Question 18, Describe Image 13 (13 distinct image assets), Read Aloud 25, Repeat Sentence 20, Respond to a Situation 10 (10 stored audio prompts), Re-tell Lecture 2 (2 stored audio prompts), and Summarize Group Discussion 10 (10 stored audio prompts). The database stores taskType as a varchar rather than a closed enum, so the two newer speaking task types are persisted without a separate enum migration; their rows and media were verified directly. Practice mode supplies browser speech synthesis when a stored remote prompt is unavailable.


## Full question-bank audit — 2026-08-14
A live database audit covered 22 persisted task groups across Speaking, Writing, Reading, and Listening. Every audited row had non-empty prompt/content fields. Describe Image had 13 question-specific images; Respond to a Situation and Summarize Group Discussion each had 10 stored audio prompts; Re-tell Lecture had 2 stored audio prompts and uses the practice TTS fallback for missing remote media. Reading option-bearing groups were present for multiple-choice and fill-in tasks. Listening contained 8 current task groups: Fill in the Blanks 7, Highlight Correct Summary 6, Highlight Incorrect Words 7, Multiple Choice Multiple 1, Multiple Choice Single 5, Select Missing Word 7, Summarize Spoken Text 8, and Write from Dictation 20. Listening prompts are synthesized in practice mode when no stored audio URL is available; the UI labels this fallback explicitly.


## Task-format and difficulty audit — 2026-08-14
The shared question-audit rules now check task-specific prompt form, Read Aloud and Respond to a Situation source length limits, Describe Image image presence, objective option presence, audio-first prompt fallback availability, and difficulty metadata. The live database difficulty audit returned zero missing or unsupported difficulty values; persisted difficulty values are constrained to easy, medium, or hard. Practice-mode transcript/TTS fallbacks are documented deviations from the official exam's recorded-audio procedure and are labeled in the UI rather than presented as Pearson recordings.

The final row-level audit found and corrected one persisted Read Aloud item (question 30134) that contained 61 words; one redundant modifier was removed to bring it to 60 words. The same audit was re-run after the update and returned no invalid task groups for required media, options, prompt lengths, or audio-first content.
