import { request } from "../../app/api/request";
import type { FuelTransaction } from "../../app/domain/types";

export interface RecordFuelInput {
  vehicleId: number;
  date: string;
  quantityLiters: number;
  unitPrice: number;
  odometerReading?: number;
  station?: string;
}

export function listFuelTransactions(): Promise<FuelTransaction[]> {
  return request<FuelTransaction[]>("/api/v1/fuel/transactions", { method: "GET" });
}

export function recordFuelTransaction(input: RecordFuelInput): Promise<FuelTransaction> {
  return request<FuelTransaction>("/api/v1/fuel/transactions", {
    method: "POST",
    body: input,
  });
}