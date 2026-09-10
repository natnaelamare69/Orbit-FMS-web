import { request } from "../../app/api/request";
import type { Driver, DriverStatus } from "../../app/domain/types";

/** Driver profile payload (driver-service via gateway). */
export interface CreateDriverInput {
  employeeId: string;
  fullName: string;
  phoneNumber?: string;
  licenseNumber: string;
  licenseCategory?: string;
  licenseExpiry?: string;
  licenseExpiryDate?: string;
}

export function listDrivers(): Promise<Driver[]> {
  return request<Driver[]>("/api/v1/drivers", { method: "GET" });
}

export function getDriver(id: number): Promise<Driver> {
  return request<Driver>(`/api/v1/drivers/${id}`, { method: "GET" });
}

export function createDriver(input: CreateDriverInput): Promise<Driver> {
  return request<Driver>("/api/v1/drivers", { method: "POST", body: input });
}

export function updateDriverStatus(id: number, status: DriverStatus): Promise<Driver> {
  return request<Driver>(`/api/v1/drivers/${id}/status`, {
    method: "PATCH",
    query: { status },
  });
}