import { request } from "../../app/api/request";
import type { Trip, TripStatus, Waybill } from "../../app/domain/types";

export interface ScheduleTripInput {
  origin: string;
  destination: string;
  payloadKg?: number;
  cargoDescription?: string;
  routeDistanceKm?: number;
  scheduledStart?: string;
}

export function listTrips(): Promise<Trip[]> {
  return request<Trip[]>("/api/v1/trips", { method: "GET" });
}

export function getTrip(id: number): Promise<Trip> {
  return request<Trip>(`/api/v1/trips/${id}`, { method: "GET" });
}

export function scheduleTrip(input: ScheduleTripInput): Promise<Trip> {
  return request<Trip>("/api/v1/trips", { method: "POST", body: input });
}

export function assignTrip(id: number, vehicleId: number, driverId: number): Promise<Trip> {
  return request<Trip>(`/api/v1/trips/${id}/assign`, {
    method: "POST",
    body: { vehicleId, driverId },
  });
}

/** Advance a trip to a legal next state (mirrors backend ADR-0002). */
export function transitionTrip(id: number, targetStatus: TripStatus): Promise<Trip> {
  return request<Trip>(`/api/v1/trips/${id}/status`, {
    method: "PATCH",
    query: { status: targetStatus },
  });
}

export function cancelTrip(id: number, reason?: string): Promise<Trip> {
  return request<Trip>(`/api/v1/trips/${id}/cancel`, {
    method: "POST",
    body: reason ? { reason } : undefined,
  });
}

export function getWaybill(tripId: number): Promise<Waybill> {
  return request<Waybill>(`/api/v1/trips/${tripId}/waybill`, { method: "GET" });
}