# Media Reliability Audit

The latest audit pass focused on practice audio and visual prompts without changing the existing Pearson-aligned scoring contract. Listening prompt audio now exposes a loading state, retries a failed media URL with a cache-busting query parameter, and clearly reports when the original asset failed while retaining the synthesized fallback path. Playback remains user-controlled and the download affordance stays suppressed.

Speaking visual prompts now show an explicit loading state and reset media state when the learner moves to another question. Failed image loads expose a retry action instead of silently rendering a simulated chart. Describe Image questions with no usable image are clearly identified as unavailable and remain subject to the existing question-content validation, so an absent visual cannot be treated as scoreable content. Re-tell Lecture can continue with the available lecture prompt or audio when no optional visual aid is provided.

The shared `withMediaRetry` helper is covered by focused tests for URLs with and without existing query parameters. The complete suite and production build were run after the changes.
