"use client";

import { useEffect, useState, type KeyboardEvent } from "react";

export interface QuickPreset {
  id: string;
  label: string;
  text: string;
}

export const QUICK_PRESETS: QuickPreset[] = [
  {
    id: "fake-telegram-job",
    label: "Fake Telegram Job",
    text: "Hi! We are hiring part-time remote reviewers. Earn $150/day just liking YouTube videos. Pay a $20 registration fee via KBZPay to unlock your VIP tasks today!",
  },
  {
    id: "urgent-bank-otp",
    label: "Urgent Bank OTP",
    text: "URGENT: Your bank account will be suspended in 2 hours due to suspicious login. Verify immediately at http://secure-bank-verify-mm.xyz and reply with your 6-digit OTP.",
  },
  {
    id: "legitimate-delivery",
    label: "Legitimate Delivery",
    text: "Hi, your parcel #4821 from ShopMM is out for delivery today between 2 PM and 5 PM. No payment needed (already prepaid).",
  },
];

const MAX_LENGTH = 2000;

const SCAN_STEPS = [
  "Checking urgency cues...",
  "Inspecting links & fee requests...",
  "Spotting impersonation patterns...",
];

function PresetIcon({ id, isSelected }: { id: string; isSelected: boolean }) {
  const iconClass = `h-3.5 w-3.5 shrink-0 ${
    isSelected ? "text-[#DAA520]" : "text-[#475569]"
  }`;

  if (id === "fake-telegram-job") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClass}
        aria-hidden="true"
      >
        <rect width="20" height="14" x="2" y="7" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    );
  }

  if (id === "urgent-bank-otp") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClass}
        aria-hidden="true"
      >
        <rect width="18" height="11" x="3" y="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
      className={iconClass}
      aria-hidden="true"
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

interface MessageInputProps {
  message: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

export default function MessageInput({
  message,
  onChange,
  onAnalyze,
  isLoading,
  error,
  onClearError,
}: MessageInputProps) {
  const [scanStepIndex, setScanStepIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const intervalId = window.setInterval(() => {
      setScanStepIndex((prev) => prev + 1);
    }, 1200);
    return () => window.clearInterval(intervalId);
  }, [isLoading]);

  const isEmpty = message.trim().length === 0;
  const isNearLimit = message.length >= 1800;
  const describedByIds = error
    ? "scam-message-counter scam-message-error"
    : "scam-message-counter";

  function handlePresetClick(presetText: string) {
    if (isLoading) return;
    onClearError();
    onChange(presetText);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      if (!isEmpty && !isLoading) {
        onAnalyze();
      }
    }
  }

  return (
    <section
      aria-label="Message Analyzer"
      className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] sm:p-5"
    >
      <div className="mb-4">
        <p className="mb-2.5 font-mono text-[11px] font-semibold tracking-wider text-[#475569] uppercase">
          Try a sample message
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((preset) => {
            const isSelected = message === preset.text;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={isLoading}
                onClick={() => handlePresetClick(preset.text)}
                aria-pressed={isSelected}
                className={`inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DAA520] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSelected
                    ? "border-[#0F172A] bg-[#0F172A] text-white shadow-sm"
                    : "border-slate-200 bg-[#FAF9F6] text-[#0F172A] hover:-translate-y-0.5 hover:border-amber-300/80 hover:bg-amber-50/40 hover:shadow-sm"
                }`}
              >
                <PresetIcon id={preset.id} isSelected={isSelected} />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between gap-2">
        <label
          htmlFor="scam-message"
          className="text-sm font-semibold text-[#0F172A]"
        >
          Suspicious message
        </label>
        {message.length > 0 && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              onClearError();
              onChange("");
            }}
            className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-[#475569] transition-colors hover:bg-slate-100 hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DAA520] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>

      <div className="relative overflow-hidden rounded-xl">
        <textarea
          id="scam-message"
          rows={5}
          maxLength={MAX_LENGTH}
          value={message}
          disabled={isLoading}
          onChange={(event) => {
            if (error) onClearError();
            onChange(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          aria-describedby={describedByIds}
          aria-invalid={Boolean(error)}
          placeholder="Paste an SMS, Telegram DM, or job offer here (English or Burmese)..."
          className="block w-full resize-y rounded-xl border border-slate-300 bg-[#FAF9F6]/65 px-3.5 py-3 text-sm leading-relaxed text-[#0F172A] placeholder:text-slate-400 transition-colors focus:border-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DAA520]/30 disabled:cursor-not-allowed disabled:opacity-75"
        />

        {isLoading && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-end justify-center rounded-xl bg-[#FAF9F6]/45 p-3 backdrop-blur-[1px]"
          >
            <div className="animate-scan-beam absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-[#DAA520]/25 to-transparent" />
            <div className="relative inline-flex items-center gap-2 rounded-full border border-amber-300/90 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#0F172A] shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#DAA520]" />
              <span>{SCAN_STEPS[scanStepIndex % SCAN_STEPS.length]}</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          id="scam-message-error"
          role="alert"
          className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          id="scam-message-counter"
          className={`font-mono text-xs font-medium tabular-nums ${
            isNearLimit ? "text-[#D97706]" : "text-[#475569]"
          }`}
        >
          {message.length} / {MAX_LENGTH} characters
        </p>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isEmpty || isLoading}
          aria-busy={isLoading}
          className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DAA520] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
        >
          {isLoading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-[#DAA520]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-[#DAA520]"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Analyze Message</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
