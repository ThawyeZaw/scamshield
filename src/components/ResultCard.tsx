"use client";

import { useEffect, useState } from "react";
import type { AnalyzeResponse, RiskLevel } from "@/types/scam";

interface RiskTheme {
  label: string;
  editorialTitle: string;
  headerBg: string;
  headerBorder: string;
  badgeBg: string;
  badgeText: string;
  scoreColor: string;
  strokeHex: string;
  barFill: string;
  tacticBadge: string;
}

const RISK_THEMES: Record<RiskLevel, RiskTheme> = {
  LOW: {
    label: "LOW RISK",
    editorialTitle: "Safe Signal",
    headerBg: "bg-emerald-50/90",
    headerBorder: "border-emerald-200",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    scoreColor: "text-[#059669]",
    strokeHex: "#059669",
    barFill: "bg-[#059669]",
    tacticBadge: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  MEDIUM: {
    label: "MEDIUM RISK",
    editorialTitle: "Proceed Carefully",
    headerBg: "bg-amber-50/90",
    headerBorder: "border-amber-200",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
    scoreColor: "text-[#D97706]",
    strokeHex: "#D97706",
    barFill: "bg-[#D97706]",
    tacticBadge: "border-amber-200 bg-amber-50 text-amber-900",
  },
  HIGH: {
    label: "HIGH RISK",
    editorialTitle: "High Scam Risk",
    headerBg: "bg-red-50/90",
    headerBorder: "border-red-200",
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
    scoreColor: "text-[#DC2626]",
    strokeHex: "#DC2626",
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
        className="h-4 w-4 text-[#059669]"
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
        className="h-4 w-4 text-[#D97706]"
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
      className="h-4 w-4 text-[#DC2626]"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

const GAUGE_RADIUS = 48;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

function RiskGauge({
  score,
  theme,
}: {
  score: number;
  theme: RiskTheme;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frameId = 0;
    let startTime: number | null = null;
    const duration = 650;

    const tick = (now: number) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setAnimatedScore(score);
        return;
      }

      if (startTime === null) {
        startTime = now;
      }

      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(score * eased);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [score]);

  const roundedScore = Math.round(animatedScore);
  const dashOffset =
    GAUGE_CIRCUMFERENCE * (1 - Math.min(100, Math.max(0, animatedScore)) / 100);

  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white/85 shadow-sm ring-1 ring-slate-200/70">
      <svg
        viewBox="0 0 120 120"
        className="h-28 w-28 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          r={GAUGE_RADIUS}
          fill="none"
          stroke="rgba(15, 23, 42, 0.08)"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={GAUGE_RADIUS}
          fill="none"
          stroke={theme.strokeHex}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={GAUGE_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-mono text-2xl font-extrabold leading-none tracking-tight tabular-nums ${theme.scoreColor}`}
        >
          {roundedScore}
        </span>
        <span className="mt-1 font-mono text-[11px] font-semibold text-[#475569] tabular-nums">
          / 100
        </span>
      </div>
    </div>
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
      className="@container animate-fade-in-up overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)]"
    >
      <div
        className={`border-b px-4 py-4 sm:px-5 sm:py-5 ${theme.headerBg} ${theme.headerBorder}`}
      >
        <div className="flex flex-col items-center gap-4 @sm:flex-row @sm:items-center @sm:justify-between">
          <div className="flex flex-1 flex-col items-center text-center @sm:items-start @sm:text-left">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-bold tracking-wider ${theme.badgeBg} ${theme.badgeText}`}
            >
              <RiskIcon level={result.risk_level} />
              <span>{theme.label}</span>
            </span>

            <h2 className="mt-2 font-display text-2xl tracking-tight text-[#0F172A]">
              {theme.editorialTitle}
            </h2>

            <div className="mt-3 w-full max-w-xs">
              <div
                role="progressbar"
                aria-label="Scam risk score"
                aria-valuenow={clampedScore}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 w-full overflow-hidden rounded-full bg-white/85 ring-1 ring-inset ring-slate-200/80"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${theme.barFill}`}
                  style={{ width: `${clampedScore}%` }}
                />
              </div>
            </div>
          </div>

          <RiskGauge score={clampedScore} theme={theme} />
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <div>
          <h3 className="font-mono text-[11px] font-semibold tracking-wider text-[#475569] uppercase">
            Verdict Summary
          </h3>
          <p className="mt-1.5 text-[15px] leading-relaxed font-medium text-[#0F172A]">
            {result.verdict_summary}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-mono text-[11px] font-semibold tracking-wider text-[#475569] uppercase">
              Detected Tactics
            </h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#475569] tabular-nums">
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
                  style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
                  className="animate-fade-in-up rounded-xl border border-slate-200/90 bg-[#FAF9F6]/70 p-3.5"
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
          <h3 className="font-mono text-[11px] font-semibold tracking-wider text-[#475569] uppercase">
            What to Do Next
          </h3>
          <ol className="mt-2.5 space-y-2.5">
            {result.next_steps.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-[#FAF9F6]/40 px-3.5 py-3 transition-colors hover:border-slate-300/90 hover:bg-white"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0F172A] font-mono text-xs font-bold text-[#DAA520] tabular-nums">
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
