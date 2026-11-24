---
name: continue
description: >-
  Use when the user invokes /continue or asks to continue building the project.
  Reads AGENTS.md, spec.md, and progress.md, selects the next unchecked non-manual
  task, implements it per spec, verifies types/lint/build, and updates progress.md.
---

# Continue Next Implementation Step

Resume work on **ScamShield** smoothly from the current project state recorded in `progress.md`.

## Steps

1. **Load Project Context (Read-Only):**
   - Read `AGENTS.md`, `spec.md`, and `progress.md`.
   - Run `git status` to check for uncommitted changes or unexpected state.

2. **Identify the Next Task:**
   - Find the first unchecked `- [ ]` item in `progress.md` that is **not** marked `(Manual)`.
   - If all remaining items are `(Manual)` or Phase 1 is complete, report the current status and ask the user whether they want to start Phase 2 stretch goals or complete a manual step.
   - If a requirement in the next step has genuine ambiguity or an unmade design choice, pause and follow the `askmefirst` workflow (`ask_question`) before editing code.

3. **Implement Strictly According to Spec:**
   - Follow all conventions, visual tokens, file paths, and security guardrails in `AGENTS.md` and `spec.md`.
   - Never import `@google/genai` or reference `GEMINI_API_KEY` in `"use client"` files.
   - Do not build out-of-scope features (auth, DB, OCR, multi-page navigation) unless explicitly requested.

4. **Verify Before Marking Done:**
   - Run:
     ```bash
     npx tsc --noEmit && npm run lint && npm run build
     ```
   - Fix any TypeScript, ESLint, or Next.js build errors before proceeding.
   - When implementing API routes or UI flows, verify runtime behavior (e.g., via dev server / smoke request or browser check) as appropriate for the step.

5. **Update `progress.md`:**
   - Mark the completed step `- [x]`.
   - Update the **Current Phase** header if a phase transitioned.
   - Append a concise bullet under **Session Log** with today's date, what was implemented, and what was verified.

6. **Report to User:**
   - Summarize what was implemented, verification results, and what the next unchecked step in `progress.md` is (so the user can run `/continue` again or `/push`).
