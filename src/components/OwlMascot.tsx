"use client";

import { useEffect, useState } from "react";

export type MascotMood =
  | "idle"
  | "ready"
  | "scanning"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "error";

interface OwlMascotProps {
  mood: MascotMood;
  score?: number;
  tacticsCount?: number;
}

interface SafetyTip {
  headline: string;
  body: string;
}

const IDLE_TIPS: SafetyTip[] = [
  {
    headline: "Guardian Owl is on watch",
    body: "Paste any suspicious SMS, Telegram DM, or job offer below — tap me anytime for a quick scam tip.",
  },
  {
    headline: "Real banks never ask for OTPs",
    body: "If a message demands your 6-digit verification code or PIN urgently, treat it as a red flag immediately.",
  },
  {
    headline: "Upfront job fees are a classic trap",
    body: "Legitimate employers never ask you to pay a registration or VIP unlock fee via mobile wallet first.",
  },
  {
    headline: "Check lookalike links carefully",
    body: "Scammers swap letters or use unfamiliar domains like .xyz to mimic real banks and delivery apps.",
  },
];

const SCANNING_TIPS = [
  "Scanning urgency traps and artificial countdowns...",
  "Checking for upfront payment or OTP requests...",
  "Reviewing impersonation cues and suspicious links...",
];

function getMoodCopy(
  mood: MascotMood,
  tipIndex: number,
  scanTipIndex: number,
  score?: number,
  tacticsCount?: number
): { badge: string; badgeClass: string; headline: string; body: string } {
  switch (mood) {
    case "scanning":
      return {
        badge: "INSPECTING",
        badgeClass: "border-amber-300 bg-amber-50 text-amber-900",
        headline: "Detective Owl is analyzing...",
        body: SCANNING_TIPS[scanTipIndex % SCANNING_TIPS.length],
      };
    case "LOW":
      return {
        badge: "SAFE SIGNAL",
        badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
        headline: `Looking calm (${score ?? 0} / 100)`,
        body: "No strong scam indicators stood out, though staying alert with unexpected links is always smart.",
      };
    case "MEDIUM":
      return {
        badge: "CAUTION",
        badgeClass: "border-amber-200 bg-amber-50 text-amber-900",
        headline: `Proceed with caution (${score ?? 50} / 100)`,
        body:
          tacticsCount && tacticsCount > 0
            ? `Spotted ${tacticsCount} mixed signal${tacticsCount === 1 ? "" : "s"} — double-check through an official channel first.`
            : "A few details look unclear. Verify the sender independently before replying or clicking.",
      };
    case "HIGH":
      return {
        badge: "SHIELD ACTIVE",
        badgeClass: "border-red-200 bg-red-50 text-red-800",
        headline: `Strong scam warning (${score ?? 90} / 100)`,
        body:
          tacticsCount && tacticsCount > 0
            ? `Detected ${tacticsCount} red-flag tactic${tacticsCount === 1 ? "" : "s"}. Do not click links, pay, or share codes.`
            : "High-risk fraud cues detected. Pause right away and follow the safe next steps below.",
      };
    case "error":
      return {
        badge: "NEED INPUT",
        badgeClass: "border-red-200 bg-red-50 text-red-800",
        headline: "Hmm, something tripped me up",
        body: "Check the message box below and try submitting again — I am ready when you are.",
      };
    case "ready": {
      const tip = IDLE_TIPS[tipIndex % IDLE_TIPS.length];
      return {
        badge: "READY TO SCAN",
        badgeClass: "border-slate-200 bg-slate-100 text-[#0F172A]",
        headline: tipIndex === 0 ? "Message loaded — ready to inspect!" : tip.headline,
        body:
          tipIndex === 0
            ? "Hit Analyze Message below and I will break down any manipulation tactics in seconds."
            : tip.body,
      };
    }
    case "idle":
    default: {
      const tip = IDLE_TIPS[tipIndex % IDLE_TIPS.length];
      return {
        badge: "GUARDIAN READY",
        badgeClass: "border-amber-200/90 bg-amber-50/90 text-amber-900",
        headline: tip.headline,
        body: tip.body,
      };
    }
  }
}

export default function OwlMascot({
  mood,
  score,
  tacticsCount,
}: OwlMascotProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [scanTipIndex, setScanTipIndex] = useState(0);
  const [isWaving, setIsWaving] = useState(false);

  useEffect(() => {
    if (mood !== "scanning") return;
    const intervalId = window.setInterval(() => {
      setScanTipIndex((prev) => prev + 1);
    }, 1300);
    return () => window.clearInterval(intervalId);
  }, [mood]);

  useEffect(() => {
    if (!isWaving) return;
    const timeoutId = window.setTimeout(() => {
      setIsWaving(false);
    }, 700);
    return () => window.clearTimeout(timeoutId);
  }, [isWaving]);

  function handleMascotTap() {
    setIsWaving(true);
    if (mood === "idle" || mood === "ready") {
      setTipIndex((prev) => (prev + 1) % IDLE_TIPS.length);
    }
  }

  const copy = getMoodCopy(mood, tipIndex, scanTipIndex, score, tacticsCount);

  const ringColor =
    mood === "LOW"
      ? "#D1FAE5"
      : mood === "HIGH" || mood === "error"
        ? "#FEE2E2"
        : mood === "MEDIUM" || mood === "scanning"
          ? "#FEF3C7"
          : "#FEF3C7";

  const ringStroke =
    mood === "LOW"
      ? "#10B981"
      : mood === "HIGH" || mood === "error"
        ? "#EF4444"
        : "#DAA520";

  const pupilOffset =
    mood === "ready"
      ? { x: 0, y: 2.2 }
      : mood === "MEDIUM"
        ? { x: 2.2, y: -0.8 }
        : mood === "scanning"
          ? { x: -1.5, y: 1.2 }
          : { x: 0, y: 0 };

  return (
    <section
      aria-label="Guardian Owl Companion"
      className="@container flex flex-col items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] backdrop-blur-sm @sm:flex-row @sm:items-center @sm:gap-4 sm:p-4"
    >
      <button
        type="button"
        onClick={handleMascotTap}
        aria-label="Tap ScamShield Guardian Owl for a safety tip"
        className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-slate-200/70 bg-[#FAF9F6] transition-transform duration-200 hover:-translate-y-0.5 hover:border-amber-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DAA520] focus-visible:ring-offset-2 @sm:h-[88px] @sm:w-[88px]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 140 140"
          className={`h-[74px] w-[74px] @sm:h-20 @sm:w-20 ${
            mood === "idle" || mood === "ready" ? "animate-owl-float" : ""
          }`}
          aria-hidden="true"
        >
          {/* Soft backdrop halo */}
          <circle
            cx="70"
            cy="72"
            r="56"
            fill={ringColor}
            fillOpacity={0.55}
            stroke={ringStroke}
            strokeOpacity={0.35}
            strokeWidth="1.5"
            strokeDasharray={mood === "scanning" ? "6 4" : undefined}
          />

          {/* HIGH risk pulse ring */}
          {mood === "HIGH" && (
            <circle
              cx="70"
              cy="72"
              r="58"
              fill="none"
              stroke="#DC2626"
              strokeWidth="2"
              className="animate-owl-alert-ring"
            />
          )}

          {/* LOW risk sparkles */}
          {mood === "LOW" && (
            <g className="animate-owl-sparkle">
              <path
                d="M24 38 L26 32 L28 38 L34 40 L28 42 L26 48 L24 42 L18 40 Z"
                fill="#059669"
              />
              <path
                d="M114 34 L115.5 29 L117 34 L122 35.5 L117 37 L115.5 42 L114 37 L109 35.5 Z"
                fill="#DAA520"
              />
              <circle cx="118" cy="96" r="3" fill="#10B981" />
            </g>
          )}

          {/* Feet */}
          <g fill="#D97706">
            <ellipse cx="56" cy="121" rx="7" ry="3.5" />
            <ellipse cx="84" cy="121" rx="7" ry="3.5" />
          </g>

          {/* Left Wing */}
          {mood === "LOW" ? (
            <path
              d="M36 74 C20 58, 18 44, 30 42 C38 41, 42 56, 44 74 Z"
              fill="#0F172A"
            />
          ) : (
            <path
              d="M38 66 C25 74, 24 98, 36 108 C42 103, 44 86, 44 68 Z"
              fill="#0F172A"
            />
          )}

          {/* Right Wing (interactive / mood-reactive) */}
          {mood === "LOW" ? (
            <path
              d="M104 74 C120 58, 122 44, 110 42 C102 41, 98 56, 96 74 Z"
              fill="#0F172A"
            />
          ) : mood === "MEDIUM" ? (
            <path
              d="M101 70 C114 76, 112 96, 94 94 C88 92, 92 80, 96 70 Z"
              fill="#0F172A"
            />
          ) : (
            <path
              d="M102 66 C115 74, 116 98, 104 108 C98 103, 96 86, 96 68 Z"
              fill="#0F172A"
              className={
                isWaving
                  ? "animate-owl-wave"
                  : "transition-transform duration-200 group-hover:-rotate-6"
              }
            />
          )}

          {/* Owl Body */}
          <ellipse cx="70" cy="84" rx="34" ry="37" fill="#1E293B" />

          {/* Warm Cream Scalloped Belly */}
          <ellipse cx="70" cy="92" rx="23" ry="26" fill="#FAF9F6" />
          <path
            d="M57 86 Q63.5 91 70 86 Q76.5 91 83 86"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Golden Chest Shield Emblem */}
          <g transform="translate(70 100)">
            <path
              d="M0 -10 L9 -6 V1 C9 7 4.5 11.5 0 13.5 C-4.5 11.5 -9 7 -9 1 V-6 Z"
              fill="#DAA520"
              stroke="#0F172A"
              strokeWidth="1.5"
            />
            <path
              d="M-3.5 1 L-1 3.5 L4 -2"
              fill="none"
              stroke="#0F172A"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Ear Tufts */}
          <path d="M40 48 L33 32 L50 40 Z" fill="#0F172A" />
          <path d="M100 48 L107 32 L90 40 Z" fill="#0F172A" />

          {/* Owl Head */}
          <ellipse cx="70" cy="54" rx="31" ry="25" fill="#1E293B" />

          {/* Facial Disc */}
          <circle cx="57" cy="56" r="14.5" fill="#FAF9F6" />
          <circle cx="83" cy="56" r="14.5" fill="#FAF9F6" />

          {/* Detective Cap with Gold Trim */}
          <path
            d="M42 40 C44 25, 96 25, 98 40 Z"
            fill="#0F172A"
          />
          <rect x="40" y="37" width="60" height="4.5" rx="2.2" fill="#DAA520" />
          <path
            d="M36 41.5 Q70 47 104 41.5 Q94 38.5 70 39 Q46 38.5 36 41.5 Z"
            fill="#0F172A"
          />

          {/* Eyes by Mood */}
          {mood === "LOW" ? (
            <g>
              {/* Happy curved smiling eyes */}
              <path
                d="M49 56 Q57 48 65 56"
                fill="none"
                stroke="#0F172A"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M75 56 Q83 48 91 56"
                fill="none"
                stroke="#0F172A"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <ellipse cx="47" cy="63" rx="4" ry="2.2" fill="#FCA5A5" fillOpacity={0.7} />
              <ellipse cx="93" cy="63" rx="4" ry="2.2" fill="#FCA5A5" fillOpacity={0.7} />
            </g>
          ) : (
            <g className={mood === "idle" ? "animate-owl-blink" : ""}>
              {/* Left Eye */}
              <circle cx="57" cy="56" r="8.2" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
              <circle
                cx={57 + pupilOffset.x}
                cy={56 + pupilOffset.y}
                r="4.6"
                fill="#0F172A"
              />
              <circle
                cx={55.3 + pupilOffset.x}
                cy={54 + pupilOffset.y}
                r="1.7"
                fill="#FFFFFF"
              />

              {/* Right Eye */}
              <circle cx="83" cy="56" r="8.2" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
              <circle
                cx={83 + pupilOffset.x}
                cy={56 + pupilOffset.y}
                r="4.6"
                fill="#0F172A"
              />
              <circle
                cx={81.3 + pupilOffset.x}
                cy={54 + pupilOffset.y}
                r="1.7"
                fill="#FFFFFF"
              />

              {/* Expressive Brows */}
              {mood === "HIGH" && (
                <g stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round">
                  <line x1="48" y1="47" x2="63" y2="51" />
                  <line x1="92" y1="47" x2="77" y2="51" />
                </g>
              )}
              {mood === "MEDIUM" && (
                <g stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="48" y1="49" x2="63" y2="49" />
                  <path d="M77 48 Q84 44 92 48" fill="none" />
                </g>
              )}
              {mood === "error" && (
                <g stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="49" y1="50" x2="62" y2="47" />
                  <line x1="91" y1="50" x2="78" y2="47" />
                </g>
              )}
            </g>
          )}

          {/* Round Gold Detective Glasses */}
          <g fill="none" stroke="#DAA520" strokeWidth="2.2">
            <circle cx="57" cy="56" r="11" />
            <circle cx="83" cy="56" r="11" />
            <line x1="68" y1="56" x2="72" y2="56" />
          </g>

          {/* Beak */}
          <path
            d="M65 62 L75 62 L70 70 Z"
            fill="#F59E0B"
            stroke="#0F172A"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />

          {/* Scanning Magnifying Glass */}
          {mood === "scanning" && (
            <g className="animate-owl-scan">
              <line
                x1="101"
                y1="78"
                x2="115"
                y2="93"
                stroke="#0F172A"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle
                cx="93"
                cy="69"
                r="13"
                fill="#FEF3C7"
                fillOpacity={0.35}
                stroke="#DAA520"
                strokeWidth="3.2"
              />
              <path
                d="M86 63 A8 8 0 0 1 94 60"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* HIGH Risk Raised Protective Shield */}
          {mood === "HIGH" && (
            <g transform="translate(106 86)">
              <path
                d="M0 -16 L14 -10 V2 C14 11 7 18 0 21 C-7 18 -14 11 -14 2 V-10 Z"
                fill="#0F172A"
                stroke="#DAA520"
                strokeWidth="2.2"
              />
              <line
                x1="0"
                y1="-6"
                x2="0"
                y2="4"
                stroke="#FCA5A5"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <circle cx="0" cy="9.5" r="1.7" fill="#FCA5A5" />
            </g>
          )}
        </svg>
      </button>

      {/* Editorial Speech Bubble */}
      <div className="min-w-0 flex-1 text-center @sm:text-left" aria-live="polite">
        <div className="flex flex-wrap items-center justify-center gap-2 @sm:justify-start">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase ${copy.badgeClass}`}
          >
            {copy.badge}
          </span>
          {(mood === "idle" || mood === "ready") && (
            <span className="text-[11px] font-medium text-[#475569]">
              Tap owl for safety tips
            </span>
          )}
        </div>

        <h2 className="mt-1 font-display text-base leading-snug text-[#0F172A] @sm:text-lg">
          {copy.headline}
        </h2>
        <p className="mt-0.5 text-xs leading-relaxed text-[#475569] @sm:text-[13px]">
          {copy.body}
        </p>
      </div>
    </section>
  );
}
