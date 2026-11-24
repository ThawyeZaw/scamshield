"use client";

import { useEffect, useState } from "react";
import ResultCard from "@/components/ResultCard";
import type { AnalyzeResponse } from "@/types/scam";

interface StatusPanelProps {
  isLoading: boolean;
  hasMessage: boolean;
  result: AnalyzeResponse | null;
  resultKey: string | null;
}

const CHECK_STAGES = [
  "Analyzing urgency & emotional pressure",
  "Checking links, domains & payment requests",
  "Evaluating impersonation & trust signals",
];

function ScanningPreviewCard() {
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCompletedSteps((prev) => (prev < CHECK_STAGES.length ? prev + 1 : prev));
    }, 480);
    return () => window.clearInterval(intervalId);
  }, []);

  const progressPercent = Math.min(100, 22 + completedSteps * 26);

  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Analyzing Message Status"
      className="@container animate-fade-in-up overflow-hidden rounded-2xl border border-amber-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)]"
    >
      <div className="border-b border-amber-200/80 bg-amber-50/80 px-5 py-5">
        <div className="flex flex-col items-center gap-4 @sm:flex-row @sm:items-center @sm:justify-between">
          <div className="flex flex-1 flex-col items-center text-center @sm:items-start @sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-amber-900">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D97706]"
                aria-hidden="true"
              />
              <span>SCANNING MESSAGE</span>
            </span>

            <h2 className="mt-2 font-display text-2xl tracking-tight text-[#0F172A]">
              Inspecting red flags...
            </h2>

            <div className="mt-3 w-full max-w-xs">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/85 ring-1 ring-inset ring-amber-200/80">
                <div
                  className="h-full rounded-full bg-[#DAA520] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pulsing Circular Radar */}
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-amber-200/80">
            <svg
              viewBox="0 0 120 120"
              className="h-28 w-28"
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="rgba(15, 23, 42, 0.08)"
                strokeWidth="2"
              />
              <circle
                cx="60"
                cy="60"
                r="34"
                fill="none"
                stroke="rgba(218, 165, 32, 0.25)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <g className="animate-radar-sweep">
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#DAA520"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="78 230"
                />
                <circle cx="60" cy="12" r="4" fill="#0F172A" />
              </g>
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-300/70">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-[#DAA520]"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <p className="font-mono text-[11px] font-semibold tracking-wider text-[#475569] uppercase">
          Live Inspection Checks
        </p>

        <ul className="space-y-2.5">
          {CHECK_STAGES.map((stage, index) => {
            const isDone = index < completedSteps;
            const isActive = index === completedSteps;

            return (
              <li
                key={stage}
                className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${
                  isDone
                    ? "border-emerald-200 bg-emerald-50/60 text-[#0F172A]"
                    : isActive
                      ? "border-amber-200 bg-amber-50/60 font-medium text-[#0F172A]"
                      : "border-slate-200/80 bg-[#FAF9F6]/60 text-[#475569]"
                }`}
              >
                {isDone ? (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#059669] text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                ) : isActive ? (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#D97706]" />
                  </span>
                ) : (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  </span>
                )}
                <span>{stage}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

const INSPECTION_PILLARS = [
  {
    title: "Urgency & OTP Traps",
    description: "Fake deadlines, suspension threats, or 6-digit verification code requests.",
    icon: (
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
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Upfront Fee & Job Scams",
    description: "High daily pay promises asking for registration or VIP unlock fees.",
    icon: (
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
    ),
  },
  {
    title: "Lookalike Links & Impersonation",
    description: "Suspicious domains mimicking trusted banks, couriers, or employers.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-[#0F172A]"
        aria-hidden="true"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
];

export default function StatusPanel({
  isLoading,
  hasMessage,
  result,
  resultKey,
}: StatusPanelProps) {
  if (isLoading) {
    return <ScanningPreviewCard />;
  }

  if (result) {
    return (
      <ResultCard
        key={resultKey ?? `${result.risk_score}-${result.verdict_summary}`}
        result={result}
      />
    );
  }

  return (
    <section
      aria-label="Inspection Status"
      aria-live="polite"
      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)]"
    >
      <div className="border-b border-slate-200/80 bg-[#FAF9F6]/85 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider ${
              hasMessage
                ? "border-amber-300 bg-amber-50 text-amber-900"
                : "border-slate-200 bg-white text-[#475569]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                hasMessage ? "bg-[#DAA520]" : "bg-slate-400"
              }`}
              aria-hidden="true"
            />
            {hasMessage ? "MESSAGE READY" : "AWAITING MESSAGE"}
          </span>

          <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold">
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[#059669]">
              0–33 LOW
            </span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[#D97706]">
              34–69 MED
            </span>
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[#DC2626]">
              70–100 HIGH
            </span>
          </div>
        </div>

        <h2 className="mt-2.5 font-display text-xl tracking-tight text-[#0F172A]">
          Instant Verdict &amp; Safe Next Steps
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[#475569]">
          Your risk score, detected manipulation tactics, and 3 concrete safety actions will appear right here.
        </p>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <p className="font-mono text-[11px] font-semibold tracking-wider text-[#475569] uppercase">
          What ScamShield Checks
        </p>

        <ul className="space-y-2.5">
          {INSPECTION_PILLARS.map((pillar) => (
            <li
              key={pillar.title}
              className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-[#FAF9F6]/60 px-3.5 py-2.5"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white shadow-2xs">
                {pillar.icon}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0F172A]">
                  {pillar.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#475569]">
                  {pillar.description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {hasMessage && (
          <div className="rounded-xl border border-amber-200/90 bg-amber-50/75 px-3.5 py-2.5 text-xs font-medium text-amber-950">
            Message loaded — press <span className="font-semibold">Analyze Message</span> (or{" "}
            <kbd className="rounded border border-amber-300 bg-white px-1.5 py-0.5 font-mono text-[10px]">
              Ctrl+Enter
            </kbd>
            ) to view the verdict here.
          </div>
        )}
      </div>
    </section>
  );
}
