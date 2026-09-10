import { request } from "../../app/api/request";
import type { MaintenanceRecord } from "../../app/domain/types";

export interface RecordMaintenanceInput {
  vehicleId: number;
  serviceDate: string;
  mileage?: number;
  cost?: number;
  provider?: string;
  description?: string;
  nextDueDate?: string;
}

export function listMaintenanceRecords(): Promise<MaintenanceRecord[]> {
  return request<MaintenanceRecord[]>("/api/v1/maintenance/records", { method: "GET" });
}

export function recordMaintenance(input: RecordMaintenanceInput): Promise<MaintenanceRecord> {
  return request<MaintenanceRecord>("/api/v1/maintenance/records", {
    method: "POST",
    body: input,
  });
}