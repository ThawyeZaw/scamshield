# ScamShield — Detailed Product & Engineering Specification

## 1. Overview
**ScamShield** is a lightweight, single-page web application that analyzes suspicious SMS messages, Telegram DMs, or job offers and returns an instant risk score, detected manipulation tactics, and safe next steps.

- **Hackathon Theme:** Technology for Social Impact (Digital Literacy & Fraud Protection)
- **Target Users:** Students, parents, and everyday mobile users
- **Core Value:** Zero-friction, instant scam verification without requiring an account or login.

---

## 2. Tech Stack & Dependencies
- **Framework:** Next.js 15+ (App Router) with TypeScript (strict mode)
- **Styling:** Tailwind CSS (no external UI component libraries)
- **AI SDK:** `@google/genai` (server-side only; model: `gemini-3.5-flash-lite`)
- **Persistence:** Browser `localStorage` (stores the last 5 scans locally)
- **Deployment:** Vercel

### Environment Variables (`.env.local`)
- `GEMINI_API_KEY` — Google AI Studio API key (server-side only, never prefixed with `NEXT_PUBLIC_`)
- `MOCK_MODE` — Optional (`"true"` | `"false"`, default `"false"`). When `"true"` (or when `GEMINI_API_KEY` is missing), the API returns realistic deterministic mock responses so live demos never fail.

---

## 3. Directory Structure
```text
src/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts        # POST endpoint calling Gemini API (or mock fallback)
│   ├── globals.css             # Tailwind imports + base theme styles
│   ├── layout.tsx              # Root layout, metadata, font setup
│   └── page.tsx                # Main single-page application
├── components/
│   ├── MessageInput.tsx        # Textarea, character counter, 3 preset buttons, submit button
│   ├── ResultCard.tsx          # Risk gauge/badge, verdict summary, tactics list, next steps
│   └── RecentScans.tsx         # localStorage history list (max 5) + Clear History action
└── types/
    └── scam.ts                 # Shared TypeScript interfaces

```

---

## 4. Data Models (`src/types/scam.ts`)

```ts
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface ManipulationTactic {
  name: string;        // e.g., "False Urgency", "Upfront Payment"
  explanation: string; // 1 concise sentence explaining why this applies
}

export interface AnalyzeRequest {
  message: string;
}

export interface AnalyzeResponse {
  risk_level: RiskLevel;
  risk_score: number; // Integer 0 to 100
  verdict_summary: string; // 1-2 plain-language sentences
  tactics: ManipulationTactic[];
  next_steps: string[]; // Exactly 3 concrete, actionable steps
}

export interface ScanHistoryItem {
  id: string;
  timestamp: string; // ISO string
  message: string;
  result: AnalyzeResponse;
}

```

---

## 5. Backend Specification (`POST /api/analyze`)

### Request Validation

* Parse JSON body and extract `message`.
* Reject with `400 Bad Request` (`{ error: "Please enter a message to analyze." }`) if `message` is missing, not a string, or empty after `.trim()`.
* Reject with `400 Bad Request` (`{ error: "Message exceeds 2,000 characters." }`) if `message.length > 2000`.

### AI Integration (`@google/genai`)

* Use `responseMimeType: "application/json"` with a strict `responseSchema` matching `AnalyzeResponse`.
* **System Instruction:**
> You are ScamShield, a consumer fraud and cybersecurity analyst. Analyze the user's pasted message for signs of phishing, job scams, advance-fee fraud, impersonation, or social engineering. Return a strict JSON object with `risk_level` ("LOW" for 0–33, "MEDIUM" for 34–69, "HIGH" for 70–100), `risk_score` (0–100), `verdict_summary` (1–2 clear sentences), `tactics` (array of detected red flags; return an empty array if legitimate), and `next_steps` (3 specific, safe actions the user should take). Be concise, objective, and easy for a teenager or parent to understand.


* Wrap `JSON.parse` in `try/catch`. On upstream or parsing failure, return `500 Internal Server Error` with `{ error: "Analysis failed. Please try again." }`.

### Demo Safety Net (`MOCK_MODE`)

* If `process.env.MOCK_MODE === "true"` or `!process.env.GEMINI_API_KEY`, simulate a 600ms delay and return a realistic mock `AnalyzeResponse`:
* Contains `"OTP"` or `"suspended"` → `HIGH` (94)
* Contains `"registration fee"` or `"$150/day"` → `HIGH` (89)
* Contains `"prepaid"` or `"parcel"` without suspicious links → `LOW` (12)
* Any other text → `MEDIUM` (55)



---

## 6. Frontend UI & UX Specification

### Visual Design System

* **Background:** Warm cream (`#FAF9F6`)
* **Cards:** White (`#FFFFFF`) with subtle slate borders (`border-slate-200`) and soft shadows
* **Primary Text:** Dark navy (`#0F172A`), secondary text muted slate (`#475569`)
* **Accent:** Gold (`#DAA520`) for subtle highlights/badges; dark navy (`#0F172A`) for primary CTA button
* **Layout:** Centered single-column (`max-w-2xl mx-auto px-4 py-10`), mobile-first

### Sections & Interactions

1. **Header:** App title (**ScamShield**), shield icon (inline SVG), and 1-line subtitle: *"Paste a suspicious SMS, Telegram message, or job offer for an instant red-flag check."*
2. **Quick-Test Presets (3 Pill Buttons above the textarea):**
* **Fake Telegram Job:** *"Hi! We are hiring part-time remote reviewers. Earn $150/day just liking YouTube videos. Pay a $20 registration fee via KBZPay to unlock your VIP tasks today!"*
* **Urgent Bank OTP:** *"URGENT: Your bank account will be suspended in 2 hours due to suspicious login. Verify immediately at http://secure-bank-verify-mm.xyz and reply with your 6-digit OTP."*
* **Legitimate Delivery:** *"Hi, your parcel #4821 from ShopMM is out for delivery today between 2 PM and 5 PM. No payment needed (already prepaid)."*
* Clicking a preset populates the textarea immediately.


3. **Message Input Card (`MessageInput.tsx`):**
* Textarea (`rows={5}`, `maxLength={2000}`) with live character counter (`0 / 2000`).
* Primary **"Analyze Message"** button (disabled when empty or loading; shows spinner + *"Analyzing..."* while fetching).
* Inline error banner if the API returns an error.


4. **Result Card (`ResultCard.tsx`):**
* **Risk Header:** Large risk badge + numeric score (`89 / 100`) + horizontal progress bar color-coded by `risk_level`:
* `LOW`: Emerald (`#059669` / `bg-emerald-50`)
* `MEDIUM`: Amber (`#D97706` / `bg-amber-50`)
* `HIGH`: Rose/Red (`#DC2626` / `bg-red-50`)


* **Verdict Summary:** Clear 1–2 sentence takeaway.
* **Detected Tactics:** List of red-flag badges with their 1-sentence explanations (or a calm *"No major manipulation tactics detected"* note if `tactics` is empty).
* **What to Do Next:** Numbered list of the 3 `next_steps`.


5. **Recent Scans (`RecentScans.tsx`):**
* Persisted in `localStorage` under key `"scamshield_history"` (hydration-safe via `useEffect`).
* Stores up to 5 most recent scans (newest first).
* Each item shows a truncated message preview, color-coded risk pill, and relative/short timestamp. Clicking an item loads it back into `ResultCard`.
* Includes a **"Clear History"** button.



---

## 7. Security & Out of Scope

* **Strict Client/Server Boundary:** Never import `@google/genai` or reference `GEMINI_API_KEY` in any `"use client"` component.
* **Out of Scope (Do NOT build):**
* User authentication or login pages
* Database setup (PostgreSQL, Supabase, Neon, etc.)
* Image/screenshot uploads or OCR
* Multi-page navigation or admin dashboards



---

## 8. Verification Criteria

1. All 3 presets populate the textarea and return properly formatted `ResultCard` outputs.
2. Empty input and >2,000-character input are handled gracefully without crashing.
3. Refreshing the browser preserves the last 5 scans in `localStorage`.
4. `npm run build` completes with zero TypeScript or ESLint errors.

```

---

