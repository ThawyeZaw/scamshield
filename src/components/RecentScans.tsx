"use client";

import type { RiskLevel, ScanHistoryItem } from "@/types/scam";

const RISK_PILL_STYLES: Record<RiskLevel, string> = {
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-800",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-800",
  HIGH: "border-red-200 bg-red-50 text-red-800",
};

function formatShortTimestamp(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return "Just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface RecentScansProps {
  scans: ScanHistoryItem[];
  activeScanId: string | null;
  onSelectScan: (scan: ScanHistoryItem) => void;
  onClearHistory: () => void;
  isHydrated: boolean;
}

export default function RecentScans({
  scans,
  activeScanId,
  onSelectScan,
  onClearHistory,
  isHydrated,
}: RecentScansProps) {
  if (!isHydrated) {
    return null;
  }

  return (
    <section
      aria-label="Recent Scans"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#0F172A]">Recent Scans</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-[#475569] tabular-nums">
            {scans.length} / 5
          </span>
        </div>

        {scans.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#475569] transition-colors hover:bg-slate-100 hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A]"
          >
            Clear History
          </button>
        )}
      </div>

      {scans.length === 0 ? (
        <p className="mt-3 text-sm text-[#475569]">
          No recent checks yet. Your last 5 analyzed messages will be saved privately in this browser.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {scans.map((scan) => {
            const isActive = scan.id === activeScanId;
            return (
              <li key={scan.id}>
                <button
                  type="button"
                  onClick={() => onSelectScan(scan)}
                  aria-current={isActive ? "true" : undefined}
                  className={`flex min-h-[48px] w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-1 ${
                    isActive
                      ? "border-[#0F172A] bg-slate-50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-[#FAF9F6]"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-[#0F172A]">
                    {scan.message}
                  </span>

                  <span className="flex shrink-0 items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums ${
                        RISK_PILL_STYLES[scan.result.risk_level]
                      }`}
                    >
                      {scan.result.risk_level} · {scan.result.risk_score}
                    </span>
                    <span className="hidden text-xs text-[#475569] tabular-nums sm:inline">
                      {formatShortTimestamp(scan.timestamp)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
