/**
 * Shared domain types mirroring the Orbit-FMS backend glossary (CONTEXT.md).
 *
 * These are the canonical frontend terms for the fleet domain. The per-service
 * `models/` folders map between these and the generated transport types
 * (see docs/adr/0002-per-microservice-generated-api-clients.md).
 *
 * Terminology (from the backend CONTEXT.md):
 *  - Vehicle, Driver, Trip, Waybill, Payload, Fuel Transaction, Fuel Anomaly,
 *    Fraud Alert, Maintenance Record, Document.
 */

export enum VehicleStatus {
  AVAILABLE = "AVAILABLE",
  ASSIGNED = "ASSIGNED",
  IN_TRANSIT = "IN_TRANSIT",
  MAINTENANCE = "MAINTENANCE",
  DECOMMISSIONED = "DECOMMISSIONED",
}

export enum DriverStatus {
  ACTIVE = "ACTIVE",
  ON_TRIP = "ON_TRIP",
  ON_LEAVE = "ON_LEAVE",
  SUSPENDED = "SUSPENDED",
  INACTIVE = "INACTIVE",
}

/** Sequential lifecycle stages of a trip (mirrors backend ADR-0002). */
export enum TripStatus {
  UNASSIGNED = "UNASSIGNED",
  ASSIGNED = "ASSIGNED",
  LOADING = "LOADING",
  IN_TRANSIT = "IN_TRANSIT",
  INCIDENT = "INCIDENT",
  UNLOADING = "UNLOADING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

/** Legal TripStatus transitions honoured by the backend state machine. */
export const TRIP_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  [TripStatus.UNASSIGNED]: [TripStatus.ASSIGNED, TripStatus.CANCELLED],
  [TripStatus.ASSIGNED]: [TripStatus.LOADING, TripStatus.CANCELLED],
  [TripStatus.LOADING]: [TripStatus.IN_TRANSIT, TripStatus.CANCELLED],
  [TripStatus.IN_TRANSIT]: [TripStatus.INCIDENT, TripStatus.UNLOADING],
  [TripStatus.INCIDENT]: [TripStatus.IN_TRANSIT, TripStatus.UNLOADING],
  [TripStatus.UNLOADING]: [TripStatus.COMPLETED, TripStatus.INCIDENT],
  [TripStatus.COMPLETED]: [],
  [TripStatus.CANCELLED]: [],
};

export interface Vehicle {
  id: number;
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
  status: VehicleStatus;
}

export interface Driver {
  id: number;
  employeeId: string;
  fullName: string;
  phoneNumber?: string;
  licenseNumber: string;
  licenseCategory?: string;
  licenseExpiryDate?: string;
  status: DriverStatus;
}

export interface Trip {
  id: number;
  tripNumber: string;
  origin: string;
  destination: string;
  status: TripStatus;
  vehicleId?: number;
  driverId?: number;
  routeDistanceKm?: number;
  cargoDescription?: string;
  /** Net commercial load; see Payload glossary term. */
  payloadKg?: number;
  /** Waybill number when one has been issued. */
  waybillNumber?: string;
  scheduledStart?: string;
  actualStart?: string;
  actualEnd?: string;
}

export interface Waybill {
  id: number;
  waybillNumber: string;
  tripId: number;
  cargoDescription: string;
  payloadKg: number;
}

export interface FuelTransaction {
  id: number;
  vehicleId: number;
  date: string;
  quantityLiters: number;
  unitPrice: number;
  totalCost: number;
  odometerReading?: number;
  station?: string;
}

export interface FuelAnomaly {
  id: number;
  vehicleId: number;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

/** Decision-support alert for human review; not an accusation. */
export interface FraudAlert {
  id: number;
  vehicleId?: number;
  fuelAnomalyId?: number;
  summary: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "INVESTIGATING" | "ESCALATED" | "DISMISSED";
  createdAt: string;
}

export interface MaintenanceRecord {
  id: number;
  vehicleId: number;
  serviceDate: string;
  mileage?: number;
  cost?: number;
  provider?: string;
  description?: string;
  nextDueDate?: string;
  /** MNT-YYYY-NNNNN */
  maintenanceCode?: string;
}

export interface FleetDocument {
  id: number;
  /** Vehicle or Driver the compliance file is attached to. */
  ownerType?: "VEHICLE" | "DRIVER";
  ownerId?: number;
  documentType: string;
  fileName: string;
  url?: string;
  expiryDate?: string;
  uploadedAt: string;
}