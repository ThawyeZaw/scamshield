"use client";

import { useState, useSyncExternalStore } from "react";
import MessageInput from "@/components/MessageInput";
import RecentScans from "@/components/RecentScans";
import ResultCard from "@/components/ResultCard";
import type { AnalyzeResponse, ScanHistoryItem } from "@/types/scam";

const STORAGE_KEY = "scamshield_history";
const MAX_HISTORY_ITEMS = 5;
const MAX_MESSAGE_LENGTH = 2000;
const EMPTY_HISTORY: ScanHistoryItem[] = [];

const historyListeners = new Set<() => void>();
let cachedRawHistory: string | null = null;
let cachedParsedHistory: ScanHistoryItem[] = EMPTY_HISTORY;

function isValidHistoryItem(item: unknown): item is ScanHistoryItem {
  if (!item || typeof item !== "object") return false;
  const record = item as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.timestamp !== "string" ||
    typeof record.message !== "string" ||
    !record.result ||
    typeof record.result !== "object"
  ) {
    return false;
  }

  const result = record.result as Record<string, unknown>;
  return (
    (result.risk_level === "LOW" ||
      result.risk_level === "MEDIUM" ||
      result.risk_level === "HIGH") &&
    typeof result.risk_score === "number" &&
    typeof result.verdict_summary === "string" &&
    Array.isArray(result.tactics) &&
    Array.isArray(result.next_steps)
  );
}

function subscribeHistory(listener: () => void) {
  historyListeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      listener();
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    historyListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getHistorySnapshot(): ScanHistoryItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRawHistory) {
      return cachedParsedHistory;
    }
    cachedRawHistory = raw;
    if (!raw) {
      cachedParsedHistory = EMPTY_HISTORY;
      return cachedParsedHistory;
    }
    const parsed = JSON.parse(raw) as unknown;
    cachedParsedHistory = Array.isArray(parsed)
      ? parsed.filter(isValidHistoryItem).slice(0, MAX_HISTORY_ITEMS)
      : EMPTY_HISTORY;
    return cachedParsedHistory;
  } catch {
    return EMPTY_HISTORY;
  }
}

function getHistoryServerSnapshot(): ScanHistoryItem[] {
  return EMPTY_HISTORY;
}

function subscribeNoop() {
  return () => {};
}

function notifyHistoryListeners() {
  for (const listener of historyListeners) {
    listener();
  }
}

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const history = useSyncExternalStore(
    subscribeHistory,
    getHistorySnapshot,
    getHistoryServerSnapshot
  );
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  function persistHistory(nextHistory: ScanHistoryItem[]) {
    const serialized = JSON.stringify(nextHistory);
    cachedRawHistory = serialized;
    cachedParsedHistory = nextHistory;
    try {
      window.localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // Ignore storage quota errors
    }
    notifyHistoryListeners();
  }

  async function handleAnalyze() {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please enter a message to analyze.");
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      setError("Message exceeds 2,000 characters.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const payload = (await response.json().catch(() => null)) as
        | (AnalyzeResponse & { error?: string })
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(payload?.error ?? "Analysis failed. Please try again.");
        return;
      }

      if (!payload || !("risk_level" in payload)) {
        setError("Analysis failed. Please try again.");
        return;
      }

      const newId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const newItem: ScanHistoryItem = {
        id: newId,
        timestamp: new Date().toISOString(),
        message: trimmed,
        result: payload,
      };

      setResult(payload);
      setActiveScanId(newId);
      persistHistory([newItem, ...history].slice(0, MAX_HISTORY_ITEMS));
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectScan(scan: ScanHistoryItem) {
    setError(null);
    setMessage(scan.message);
    setResult(scan.result);
    setActiveScanId(scan.id);
  }

  function handleClearHistory() {
    cachedRawHistory = null;
    cachedParsedHistory = EMPTY_HISTORY;
    setActiveScanId(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    notifyHistoryListeners();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="space-y-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-200/80 bg-white shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-[#DAA520]"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
                ScamShield
              </h1>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#DAA520]"
                aria-hidden="true"
              />
              Instant AI Check · No Login
            </span>
          </div>

          <p className="text-sm leading-relaxed text-[#475569] sm:text-base">
            Paste a suspicious SMS, Telegram message, or job offer for an instant
            red-flag check.
          </p>
        </header>

        <MessageInput
          message={message}
          onChange={(value) => {
            setMessage(value);
            if (activeScanId) setActiveScanId(null);
          }}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          error={error}
          onClearError={() => setError(null)}
        />

        {result && <ResultCard result={result} />}

        <RecentScans
          scans={history}
          activeScanId={activeScanId}
          onSelectScan={handleSelectScan}
          onClearHistory={handleClearHistory}
          isHydrated={isHydrated}
        />

        <footer className="pt-1 text-center text-xs text-[#475569]">
          ScamShield checks messages on demand and stores recent scans only in your
          browser. Always verify financial requests through official channels.
        </footer>
      </div>
    </main>
  );
}
