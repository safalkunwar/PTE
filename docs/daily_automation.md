# Daily Question Update & GitHub Sync Automation

## Overview
This document outlines the operational procedure and automated workflow for daily question-bank expansion and GitHub synchronization for the PTE Academic Practice Platform, adhering to the requirements of the free plan quota and Pearson alignment standards [1].

## Workflow Architecture
1. **Daily Question Ingestion**: New official PTE questions across all 20 task types (Speaking, Writing, Reading, Listening) are ingested daily via automated scrapers or manual admin panel insertion.
2. **Validation & Scoring Calibration**: Each question is validated against Pearson's official timing, word count, and scoring guidelines (e.g., automated AI scoring via Gemini 2.5 Flash with prompt anchors for Oral Fluency, Pronunciation, and Content).
3. **GitHub Sync**: Daily commits are pushed to the private repository via GitHub CLI (`gh repo clone`, `git commit`, `git push`), maintaining a separate admin panel branch (`admin-panel`) for privileged question management.

## Automation Schedule
- **Frequency**: Daily at 02:00 UTC (low-traffic window).
- **Trigger**: Heartbeat cron or manual trigger via the admin dashboard.
- **Quota Management**: Operates within free-tier API rate limits with exponential backoff and batching.

---
References:
[1] Pearson PLC, *PTE Academic Official Guide & Scoring Guide*, 2026.
