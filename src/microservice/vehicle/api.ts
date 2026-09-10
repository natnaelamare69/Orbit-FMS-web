import { request } from "../../app/api/request";
import type { Vehicle, VehicleStatus } from "../../app/domain/types";

/** Vehicle registration payload (vehicle-service via gateway). */
export interface CreateVehicleInput {
  registrationNumber: string;
  vin: string;
  make?: string;
  model?: string;
  year?: number;
  modelYear?: number;
  vehicleType?: string;
  fuelType?: string;
  payloadCapacity?: number;
  fuelTankCapacity?: number;
  currentMileage?: number;
}

export function listVehicles(): Promise<Vehicle[]> {
  return request<Vehicle[]>("/api/v1/vehicles", { method: "GET" });
}

export function getVehicle(id: number): Promise<Vehicle> {
  return request<Vehicle>(`/api/v1/vehicles/${id}`, { method: "GET" });
}

export function createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
  return request<Vehicle>("/api/v1/vehicles", { method: "POST", body: input });
}

export function updateVehicleStatus(id: number, status: VehicleStatus): Promise<Vehicle> {
  return request<Vehicle>(`/api/v1/vehicles/${id}/status`, { method: "PATCH", query: { status } });
}

export function updateVehicleMileage(id: number, currentMileage: number): Promise<Vehicle> {
  return request<Vehicle>(`/api/v1/vehicles/${id}/mileage`, {
    method: "PATCH",
    query: { currentMileage },
  });
}