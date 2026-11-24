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
