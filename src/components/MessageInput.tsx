"use client";

import type { KeyboardEvent } from "react";

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
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold tracking-wide text-[#475569] uppercase">
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
                className={`min-h-[38px] cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSelected
                    ? "border-[#0F172A] bg-[#0F172A] text-white"
                    : "border-slate-200 bg-slate-50 text-[#0F172A] hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                {preset.label}
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
            className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-[#475569] transition-colors hover:bg-slate-100 hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>

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
        className="w-full resize-y rounded-xl border border-slate-300 bg-[#FAF9F6]/60 px-3.5 py-3 text-sm leading-relaxed text-[#0F172A] placeholder:text-slate-400 transition-colors focus:border-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F172A]/15 disabled:cursor-not-allowed disabled:opacity-60"
      />

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
          className={`text-xs font-medium tabular-nums ${
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
          className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isLoading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-white"
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
