# README.md

## Project Overview

This is an AI-powered English proficiency testing platform designed to simulate PTE-style exam tasks.

## Key Features

- Full PTE-style task coverage
- AI-based scoring & feedback
- Skill-wise and enabling-skill analytics
- Exam-like timers and UI flow
- Instructor and student dashboards
- Progress tracking and diagnostics
- Ethical, transparent scoring system

## AI Scoring System

The platform uses a custom-built AI evaluation engine assessing Communicative Skills (Speaking, Writing, Reading, Listening) and Enabling Skills (Grammar, Pronunciation, Oral Fluency, Vocabulary, Spelling, Written Discourse), with scoring normalized on a 10–90 scale.

## Technology Stack

- **Frontend:** React/Next.js
- **Backend:** Node.js/FastAPI
- **AI/NLP:** Speech-to-Text and NLP scoring models
- **Database:** PostgreSQL/Firebase
- **Cloud:** AWS/GCP
- **Auth & Security:** JWT and role-based access

## User Roles

- Students
- Instructors
- Admins

## Legal & Ethical Notice

This project uses independent AI models, is aligned with public PTE scoring descriptors, does not claim to be Pearson PTE, and does not use proprietary test content or algorithms.

## Status

Active Development

## Deploy to GitHub Pages

The front-end can be published as a static site on GitHub Pages so it’s visible at `https://<owner>.github.io/<repo>/`.

1. **Enable GitHub Pages**
   - In your repo go to **Settings → Pages**.
   - Under **Build and deployment**, set **Source** to **GitHub Actions**.

2. **Push to trigger deploy**
   - Pushing to `main` or `master` runs the **Deploy to GitHub Pages** workflow.
   - It builds the client with base path `/<repo>/` and deploys the result.
   - After the workflow finishes, the site is available at `https://<owner>.github.io/<repo>/`.

3. **Note**
   - Only the **static client** is deployed. Auth and data require the Node server and database; deploy those separately (e.g. Railway, Render, Fly.io) and set `VITE_OAUTH_PORTAL_URL` / your API URL if you want the Pages site to talk to a backend.

## Contribution Guidelines

Contributions are welcome! Please adhere to clean code practices and respect assessment ethics.
