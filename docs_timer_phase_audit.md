# Timer Phase Audit

Speaking timers now use the shared `client/src/lib/speakingTiming.ts` contract. The contract contains task-specific preparation and response durations for all seven speaking task types, a safe default for unsupported task labels, and a deterministic countdown transition that clamps at zero and reports completion on the final second.

`SpeakingTask` uses that transition for both preparation and recording intervals. The practice session keys the speaking component by question ID, so moving to another planned task always creates a fresh preparation/recording lifecycle rather than carrying over a completed phase. Recording duration is measured from a stable ref, avoiding stale React state in the recorder stop callback.

Focused tests cover the timing table, fallback duration, and final-second transition. The complete Vitest suite and production build pass after the live timer integration.
