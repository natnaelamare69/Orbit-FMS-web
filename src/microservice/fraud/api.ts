import { request } from "../../app/api/request";
import type { FraudAlert } from "../../app/domain/types";

/** Triage statuses surfaced by the review UI (decision support, not guilt). */
export type FraudTriage = "INVESTIGATING" | "ESCALATED" | "DISMISSED";

export function listFraudAlerts(): Promise<FraudAlert[]> {
  return request<FraudAlert[]>("/api/v1/fraud/alerts", { method: "GET" });
}

export function reviewFraudAlert(id: number, status: FraudTriage, notes?: string): Promise<FraudAlert> {
  return request<FraudAlert>(`/api/v1/fraud/alerts/${id}/review`, {
    method: "PATCH",
    body: { status, notes },
  });
}