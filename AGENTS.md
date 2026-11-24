# ScamShield — Agent Guidelines & Project Context

## 1. Project Overview
**ScamShield** is a lightweight, single-page web application (EdTech / Social Impact Hackathon 2026) that analyzes suspicious SMS messages, Telegram DMs, or job offers and returns an instant risk score (`0–100`), detected manipulation tactics, and 3 concrete safe next steps—with zero login or account friction.

- **Product & Engineering Spec:** [spec.md](./spec.md)
- **Progress & Decisions Tracker:** [progress.md](./progress.md)

## 2. Tech Stack & Pinned Decisions
- **Framework:** Next.js App Router (`next` 15+/16+) with TypeScript (`"strict": true`)
- **Styling:** Tailwind CSS v4 (no external UI component libraries such as shadcn/ui, MUI, or Chakra)
- **AI SDK:** `@google/genai` (server-side only)
- **Gemini Model:** `gemini-3.5-flash-lite` (exact model specified in `spec.md`)
- **Language Support:** Auto-reply in the user's input language (English or Burmese / Myanmar Unicode) for `verdict_summary`, `tactics[].name`, `tactics[].explanation`, and `next_steps[]`, while keeping JSON keys and `risk_level` enum (`"LOW" | "MEDIUM" | "HIGH"`) strictly in English.
- **Persistence:** Browser `localStorage` under key `"scamshield_history"` (hydration-safe via `useEffect`, max 5 recent scans, newest first)
- **Workflow & Deployment:** Direct push to `main` branch on GitHub with Vercel Git auto-deploy

## 3. Security & Architectural Guardrails
1. **Strict Client/Server Boundary:**
   - NEVER import `@google/genai` or reference `GEMINI_API_KEY` in any `"use client"` component.
   - NEVER prefix `GEMINI_API_KEY` with `NEXT_PUBLIC_`.
   - NEVER commit `.env.local` or any real API key/secret to Git. Keep `.env.local.example` updated instead.
2. **Explicitly Out of Scope (Do NOT Build for MVP):**
   - User authentication, login pages, or accounts
   - Database setup (PostgreSQL, Supabase, Neon, Prisma, etc.)
   - Image/screenshot uploads or OCR
   - Multi-page navigation or admin dashboards
3. **Demo Resilience:**
   - `POST /api/analyze` must support `MOCK_MODE="true"` (or automatic fallback when `GEMINI_API_KEY` is missing) with deterministic responses so live hackathon demos never fail.

## 4. Visual Design System (`spec.md` §6)
- **Background:** Warm cream (`#FAF9F6`)
- **Cards:** White (`#FFFFFF`) with subtle slate borders (`border-slate-200`) and soft shadows
- **Primary Text & CTA:** Dark navy (`#0F172A`); Secondary Text: Muted slate (`#475569`)
- **Accent:** Gold (`#DAA520`) for subtle highlights/badges
- **Risk Status Colors:**
  - `LOW` (0–33): Emerald (`#059669` / `bg-emerald-50`)
  - `MEDIUM` (34–69): Amber (`#D97706` / `bg-amber-50`)
  - `HIGH` (70–100): Rose/Red (`#DC2626` / `bg-red-50`)
- **Layout:** Centered single-column (`max-w-2xl mx-auto px-4 py-10`), mobile-first

## 5. Custom Workspace Skills (`.agents/skills/`)
- **`/continue`** — Reads `AGENTS.md`, `spec.md`, and `progress.md`, picks the next unchecked non-manual step, implements it, verifies, and updates `progress.md`.
- **`/askmefirst`** — Asks 2–5 targeted multiple-choice clarifying questions via the pop-up modal (`ask_question`) before making any code edits when requirements or trade-offs are unclear.
- **`/push`** — Runs `npx tsc --noEmit`, `npm run lint`, and `npm run build`, proactively fixes any errors, syncs with `origin/main`, commits cleanly, pushes to `main`, and checks Vercel deployment status.
- **`/pull`** — Safely stashes local work if dirty, fetches and rebases from `origin/main`, restores stash, updates npm dependencies if `package*.json` changed, and summarizes collaborator changes.

## 6. Workflow & Verification Rules
1. Read `spec.md` and `progress.md` before implementing any feature.
2. Update `progress.md` (checkboxes, Decisions Log, and Session Log) whenever a milestone or decision changes.
3. Before committing or pushing, always verify:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npm run build`
4. Keep code modular, clean, and strictly aligned with `spec.md` §3 (`src/types/scam.ts`, `src/app/api/analyze/route.ts`, `src/components/*`, `src/app/*`).
