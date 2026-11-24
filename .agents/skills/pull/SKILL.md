---
name: pull
description: >-
  Use when the user invokes /pull or asks to pull latest changes from GitHub.
  Safely preserves local edits, fetches and rebases from origin/main, updates
  dependencies if needed, and summarizes collaborator changes.
---

# Pull Latest Changes from GitHub

Keep the local workspace cleanly synchronized with collaborators on GitHub (`origin/main`).

## Steps

1. **Check Git State & Remote:**
   - Run `git status` and `git remote -v`.
   - If `.git` or `origin` does not exist, stop and guide the user to connect the GitHub remote first.

2. **Safely Preserve Local Uncommitted Changes:**
   - If `git status --porcelain` is non-empty, stash local changes before pulling:
     ```bash
     git stash push -u -m "pre-pull-auto-stash"
     ```
   - Remember whether a stash was created so it can be restored cleanly.

3. **Fetch & Rebase from `origin/main`:**
   - Run:
     ```bash
     git fetch origin
     git pull --rebase origin main
     ```
   - (If currently on a different tracked branch, pull that branch instead.)
   - If rebase conflicts occur:
     - Inspect conflicted files (`git diff --name-only --diff-filter=U`).
     - Resolve trivial non-overlapping conflicts carefully, or pause and ask the user before overwriting collaborator changes.

4. **Restore Local Work (If Stashed):**
   - Run `git stash pop` if a stash was created in Step 2.
   - If popping the stash creates conflicts, explain which files conflict and help resolve them without losing local work.

5. **Post-Pull Sync & Health Check:**
   - Check `git diff --name-only HEAD@{1}..HEAD` (or recent pulled commits) for changes to `package.json` or `package-lock.json`; if changed, run `npm install`.
   - If source files changed, run `npx tsc --noEmit` to catch integration issues early.
   - Read `progress.md` to see if collaborators updated project milestones.

6. **Summarize for User:**
   - List pulled commits/files, whether dependencies were updated, any conflicts/type errors found, and the current next step in `progress.md`.
