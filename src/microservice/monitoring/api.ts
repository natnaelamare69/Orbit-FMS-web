import { request } from "../../app/api/request";

/**
 * Monitoring service — fleet KPIs for the dashboard.
 * NOTE: /monitoring/overview is the only endpoint exposed today. New endpoints
 * will be added here as the backend grows (see docs/adr for the roadmap).
 */
export interface MonitoringOverview {
  fleetSize: number;
  activeTrips: number;
  vehiclesInTransit: number;
  vehiclesInMaintenance: number;
  openFraudAlerts: number;
  updatedAt: string;
}

export function getMonitoringOverview(): Promise<MonitoringOverview> {
  return request<MonitoringOverview>("/api/v1/monitoring/overview", { method: "GET" });
}