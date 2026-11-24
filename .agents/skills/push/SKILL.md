---
name: push
description: >-
  Use when the user invokes /push or asks to verify, commit, push to GitHub,
  and deploy the app. Runs typecheck, lint, and build, proactively fixes errors,
  syncs and pushes to origin/main, and checks Vercel deployment status.
---

# Verify, Push to GitHub, and Deploy

Proactively catch and fix all TypeScript, ESLint, and Next.js build issues before pushing to `main` (which triggers Vercel Git auto-deploy).

## Steps

1. **Pre-Flight Git & Secret Check:**
   - Run `git status` and `git remote -v`.
   - Confirm you are on `main` (or ask before switching/pushing a different branch).
   - If `origin` remote is missing, stop and guide the user through `gh auth login` and `gh repo create` / `git remote add origin <url>`.
   - Verify `.env.local` and any secret files are **not** staged or tracked (`git ls-files .env.local` must be empty). Never commit API keys.

2. **Proactive Error-Fixing Gate:**
   - Run all verification checks:
     ```bash
     npx tsc --noEmit && npm run lint && npm run build
     ```
   - If any check fails:
     - Read the failing file(s), diagnose the root cause, fix the code, and re-run the checks until all three pass with exit code `0`.
     - If a fix requires changing product behavior outside `spec.md`, clarify with the user first.

3. **Sync with Upstream (`origin/main`):**
   - Run `git fetch origin`.
   - If `origin/main` exists and has new commits not in local `main`, run `git pull --rebase origin main`.
   - If rebase conflicts occur, resolve carefully (never silently discard collaborator changes; ask the user if intent is ambiguous), then re-run `npx tsc --noEmit && npm run lint && npm run build`.

4. **Commit & Push:**
   - Update `progress.md` Session Log if meaningful work is being pushed.
   - Stage intended changes (`git add -A` after confirming `git status` shows no secrets or unwanted build artifacts).
   - Commit with a clear message (e.g., `feat: implement /api/analyze endpoint`).
   - Push to GitHub: `git push -u origin main`.

5. **Vercel Deployment Verification:**
   - Pushing to `main` triggers Vercel Git auto-deploy.
   - If the Vercel CLI (`npx vercel` / `vercel`) or Vercel MCP server is available and authenticated, inspect the latest deployment status/build logs and proactively fix any deployment-specific errors (such as missing env vars or server/client bundle issues).
   - Otherwise, confirm the `git push` succeeded and instruct the user to check the Vercel Dashboard deployment URL (and verify `GEMINI_API_KEY` is configured in Vercel Environment Variables).
