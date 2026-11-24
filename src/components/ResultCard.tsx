"use client";

import type { AnalyzeResponse, RiskLevel } from "@/types/scam";

interface RiskTheme {
  label: string;
  headerBg: string;
  headerBorder: string;
  badgeBg: string;
  badgeText: string;
  scoreColor: string;
  barFill: string;
  tacticBadge: string;
}

const RISK_THEMES: Record<RiskLevel, RiskTheme> = {
  LOW: {
    label: "LOW RISK",
    headerBg: "bg-emerald-50",
    headerBorder: "border-emerald-200",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    scoreColor: "text-[#059669]",
    barFill: "bg-[#059669]",
    tacticBadge: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  MEDIUM: {
    label: "MEDIUM RISK",
    headerBg: "bg-amber-50",
    headerBorder: "border-amber-200",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
    scoreColor: "text-[#D97706]",
    barFill: "bg-[#D97706]",
    tacticBadge: "border-amber-200 bg-amber-50 text-amber-900",
  },
  HIGH: {
    label: "HIGH RISK",
    headerBg: "bg-red-50",
    headerBorder: "border-red-200",
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
    scoreColor: "text-[#DC2626]",
    barFill: "bg-[#DC2626]",
    tacticBadge: "border-red-200 bg-red-50 text-red-800",
  },
};

function RiskIcon({ level }: { level: RiskLevel }) {
  if (level === "LOW") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-[#059669]"
        aria-hidden="true"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }

  if (level === "MEDIUM") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-[#D97706]"
        aria-hidden="true"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-[#DC2626]"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

interface ResultCardProps {
  result: AnalyzeResponse;
}

export default function ResultCard({ result }: ResultCardProps) {
  const theme = RISK_THEMES[result.risk_level];
  const clampedScore = Math.min(100, Math.max(0, Math.round(result.risk_score)));

  return (
    <section
      aria-label="Analysis Result"
      aria-live="polite"
      className="animate-fade-in-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div
        className={`border-b px-5 py-5 sm:px-6 ${theme.headerBg} ${theme.headerBorder}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <RiskIcon level={result.risk_level} />
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wider ${theme.badgeBg} ${theme.badgeText}`}
            >
              {theme.label}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span
              className={`text-3xl font-extrabold tracking-tight tabular-nums ${theme.scoreColor}`}
            >
              {clampedScore}
            </span>
            <span className="text-sm font-semibold text-[#475569] tabular-nums">
              / 100
            </span>
          </div>
        </div>

        <div
          role="progressbar"
          aria-label="Scam risk score"
          aria-valuenow={clampedScore}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/80 ring-1 ring-inset ring-slate-200/80"
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${theme.barFill}`}
            style={{ width: `${clampedScore}%` }}
          />
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div>
          <h2 className="text-xs font-semibold tracking-wide text-[#475569] uppercase">
            Verdict Summary
          </h2>
          <p className="mt-1.5 text-[15px] leading-relaxed font-medium text-[#0F172A]">
            {result.verdict_summary}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-semibold tracking-wide text-[#475569] uppercase">
              Detected Tactics
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-[#475569] tabular-nums">
              {result.tactics.length}
            </span>
          </div>

          {result.tactics.length === 0 ? (
            <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0 text-[#059669]"
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>No major manipulation tactics detected.</span>
            </div>
          ) : (
            <ul className="mt-2.5 space-y-2.5">
              {result.tactics.map((tactic, index) => (
                <li
                  key={`${tactic.name}-${index}`}
                  className="rounded-xl border border-slate-200 bg-[#FAF9F6]/60 p-3.5"
                >
                  <span
                    className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-semibold ${theme.tacticBadge}`}
                  >
                    {tactic.name}
                  </span>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#475569]">
                    {tactic.explanation}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-wide text-[#475569] uppercase">
            What to Do Next
          </h2>
          <ol className="mt-2.5 space-y-2.5">
            {result.next_steps.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-xs font-bold text-white tabular-nums">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-[#0F172A]">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
