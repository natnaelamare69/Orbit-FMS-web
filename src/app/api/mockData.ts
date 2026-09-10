import { DriverStatus, TripStatus, VehicleStatus } from "../domain/types";
import type { Driver, FleetDocument, FraudAlert, FuelTransaction, MaintenanceRecord, Trip, Vehicle, Waybill } from "../domain/types";

export let mockVehicles: Vehicle[] = [
  {
    id: 1,
    registrationNumber: "3-AA-10492",
    vin: "1HGCR2F83HA104920",
    make: "Isuzu",
    model: "FVR 34 Commercial",
    year: 2023,
    vehicleType: "Heavy Rigid Truck",
    fuelType: "DIESEL",
    payloadCapacity: 15000,
    fuelTankCapacity: 350,
    currentMileage: 48200,
    status: VehicleStatus.AVAILABLE,
  },
  {
    id: 2,
    registrationNumber: "3-ET-88219",
    vin: "YS2R4X20002882190",
    make: "Scania",
    model: "R500 Highline",
    year: 2022,
    vehicleType: "Semi-Trailer Tractor",
    fuelType: "DIESEL",
    payloadCapacity: 28000,
    fuelTankCapacity: 600,
    currentMileage: 112500,
    status: VehicleStatus.IN_TRANSIT,
  },
  {
    id: 3,
    registrationNumber: "3-AA-77401",
    vin: "YV2RT40A1NA774010",
    make: "Volvo",
    model: "FH16 Globetrotter",
    year: 2024,
    vehicleType: "Heavy Articulated Truck",
    fuelType: "DIESEL",
    payloadCapacity: 32000,
    fuelTankCapacity: 650,
    currentMileage: 23100,
    status: VehicleStatus.MAINTENANCE,
  },
];

export let mockDrivers: Driver[] = [
  {
    id: 1,
    employeeId: "EMP-001",
    fullName: "Abebe Bikila",
    licenseNumber: "DL-ETH-88210",
    licenseCategory: "Heavy Truck (Category 4)",
    licenseExpiryDate: "2027-05-15",
    phoneNumber: "+251 911 223344",
    status: DriverStatus.ACTIVE,
  },
  {
    id: 2,
    employeeId: "EMP-002",
    fullName: "Chala Tufa",
    licenseNumber: "DL-ETH-99342",
    licenseCategory: "Heavy Truck (Category 4)",
    licenseExpiryDate: "2026-11-20",
    phoneNumber: "+251 922 334455",
    status: DriverStatus.ON_TRIP,
  },
  {
    id: 3,
    employeeId: "EMP-003",
    fullName: "Dawit Kebede",
    licenseNumber: "DL-ETH-77194",
    licenseCategory: "Commercial Freight (Category 3)",
    licenseExpiryDate: "2028-02-10",
    phoneNumber: "+251 933 445566",
    status: DriverStatus.ON_LEAVE,
  },
];

export let mockTrips: Trip[] = [
  {
    id: 1,
    tripNumber: "TRP-2026-0001",
    origin: "Addis Ababa (Kality Freight Depot)",
    destination: "Adama (Dry Port Logistics Hub)",
    status: TripStatus.IN_TRANSIT,
    vehicleId: 2,
    driverId: 2,
    payloadKg: 24000,
    cargoDescription: "Manufactured Goods & Steel Rods",
    routeDistanceKm: 98,
    scheduledStart: "2026-09-09T08:00:00",
    actualStart: "2026-09-09T08:45:00",
  },
  {
    id: 2,
    tripNumber: "TRP-2026-0002",
    origin: "Modjo Dry Port",
    destination: "Hawassa (Industrial Park Phase II)",
    status: TripStatus.ASSIGNED,
    vehicleId: 1,
    driverId: 1,
    payloadKg: 13500,
    cargoDescription: "Apparel Textiles & Raw Fabric",
    routeDistanceKm: 215,
    scheduledStart: "2026-09-09T14:00:00",
  },
  {
    id: 3,
    tripNumber: "TRP-2026-0003",
    origin: "Addis Ababa (Akaki Terminal)",
    destination: "Bahir Dar (Regional Distribution)",
    status: TripStatus.UNASSIGNED,
    payloadKg: 19000,
    cargoDescription: "Agricultural Irrigation Pumps",
    routeDistanceKm: 560,
    scheduledStart: "2026-09-10T06:00:00",
  },
  {
    id: 4,
    tripNumber: "TRP-2026-0004",
    origin: "Djibouti Corridor (Galafi Border)",
    destination: "Addis Ababa (Kality Depot)",
    status: TripStatus.COMPLETED,
    vehicleId: 3,
    driverId: 3,
    payloadKg: 30000,
    cargoDescription: "Imported Industrial Machinery",
    routeDistanceKm: 870,
    scheduledStart: "2026-09-05T07:00:00",
    actualStart: "2026-09-05T08:10:00",
    actualEnd: "2026-09-07T16:30:00",
  },
];

export let mockFraudAlerts: FraudAlert[] = [
  {
    id: 1,
    vehicleId: 2,
    severity: "HIGH",
    status: "OPEN",
    summary: "Suspicious fuel consumption spike: 28% variance over expected route terrain baseline.",
    createdAt: "2026-09-09T10:15:00",
  },
  {
    id: 2,
    vehicleId: 3,
    severity: "MEDIUM",
    status: "INVESTIGATING",
    summary: "Fuel card swiped at fuel station 95 km outside approved route corridor.",
    createdAt: "2026-09-08T14:30:00",
  },
];

export let mockFuelTransactions: FuelTransaction[] = [
  {
    id: 1,
    vehicleId: 2,
    date: "2026-09-09",
    quantityLiters: 220,
    unitPrice: 85.5,
    totalCost: 18810,
    station: "TotalEnergies Bishoftu Expressway",
    odometerReading: 112500,
  },
  {
    id: 2,
    vehicleId: 1,
    date: "2026-09-08",
    quantityLiters: 140,
    unitPrice: 85.5,
    totalCost: 11970,
    station: "NOC Addis Ababa Kality",
    odometerReading: 48050,
  },
  {
    id: 3,
    vehicleId: 3,
    date: "2026-09-06",
    quantityLiters: 350,
    unitPrice: 86.0,
    totalCost: 30100,
    station: "OiLibya Semera Junction",
    odometerReading: 22800,
  },
];

export let mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 1,
    vehicleId: 3,
    serviceDate: "2026-09-08",
    mileage: 23100,
    cost: 14500,
    provider: "Central Commercial Depot Workshop",
    description: "Scheduled 25,000 km preventive inspection, brake pad replacement, and fuel injector calibration.",
    nextDueDate: "2026-12-08",
  },
  {
    id: 2,
    vehicleId: 1,
    serviceDate: "2026-08-15",
    mileage: 45000,
    cost: 6800,
    provider: "Ethio-Transport Maintenance Center",
    description: "Transmission fluid flush and tire alignment.",
    nextDueDate: "2026-11-15",
  },
];

export let mockDocuments: FleetDocument[] = [
  {
    id: 1,
    ownerType: "VEHICLE",
    ownerId: 1,
    documentType: "COMMERCIAL_REGISTRATION",
    fileName: "isuzu_commercial_registration_2026.pdf",
    url: "https://example.com/docs/isuzu_commercial_registration_2026.pdf",
    expiryDate: "2027-04-30",
    uploadedAt: "2026-01-15T10:00:00",
  },
  {
    id: 2,
    ownerType: "VEHICLE",
    ownerId: 2,
    documentType: "INSURANCE_POLICY",
    fileName: "scania_comprehensive_freight_insurance.pdf",
    url: "https://example.com/docs/scania_comprehensive_freight_insurance.pdf",
    expiryDate: "2026-10-15",
    uploadedAt: "2025-10-15T09:30:00",
  },
  {
    id: 3,
    ownerType: "DRIVER",
    ownerId: 1,
    documentType: "DRIVING_LICENSE",
    fileName: "abebe_heavy_freight_license.pdf",
    url: "https://example.com/docs/abebe_heavy_freight_license.pdf",
    expiryDate: "2027-05-15",
    uploadedAt: "2025-05-15T11:00:00",
  },
];

export function isDemoMode(): boolean {
  try {
    return localStorage.getItem("orbit.demo.mode") === "true";
  } catch {
    return false;
  }
}

export function setDemoMode(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem("orbit.demo.mode", "true");
    } else {
      localStorage.removeItem("orbit.demo.mode");
    }
  } catch {
    // ignore
  }
}

/** Route mock API requests when running in Demo Mode */
export function handleMockRequest(path: string, options: { method?: string; body?: unknown; query?: Record<string, unknown> } = {}): unknown {
  const method = options.method ?? "GET";
  const body = (options.body ?? {}) as Record<string, unknown>;

  // Auth
  if (path === "/api/v1/auth/login" || path === "/api/v1/auth/register") {
    return {
      token: "demo-jwt-token-orbit-fms",
      type: "Bearer",
      userId: 1,
      username: (body.username as string) || "demo_fleet_manager",
      role: (body.role as string) || "FLEET_MANAGER",
      fullName: (body.fullName as string) || "Demo Fleet Manager",
    };
  }

  // Vehicles
  if (path === "/api/v1/vehicles") {
    if (method === "POST") {
      const newV: Vehicle = {
        id: mockVehicles.length + 1,
        registrationNumber: (body.registrationNumber as string) || "3-NEW-9999",
        vin: (body.vin as string) || "VIN1234567890",
        make: (body.make as string) || "Isuzu",
        model: (body.model as string) || "Truck",
        year: Number(body.year) || 2024,
        vehicleType: (body.vehicleType as string) || "Rigid Truck",
        fuelType: (body.fuelType as string) || "DIESEL",
        payloadCapacity: Number(body.payloadCapacity) || 15000,
        fuelTankCapacity: Number(body.fuelTankCapacity) || 300,
        currentMileage: Number(body.currentMileage) || 0,
        status: VehicleStatus.AVAILABLE,
      };
      mockVehicles = [newV, ...mockVehicles];
      return newV;
    }
    return [...mockVehicles];
  }

  const vehicleMatch = path.match(/^\/api\/v1\/vehicles\/(\d+)$/);
  if (vehicleMatch) {
    const id = Number(vehicleMatch[1]);
    return mockVehicles.find((v) => v.id === id) ?? mockVehicles[0];
  }

  const vehicleStatusMatch = path.match(/^\/api\/v1\/vehicles\/(\d+)\/status$/);
  if (vehicleStatusMatch && method === "PATCH") {
    const id = Number(vehicleStatusMatch[1]);
    const nextStatus = (options.query?.status as VehicleStatus) ?? VehicleStatus.AVAILABLE;
    const v = mockVehicles.find((item) => item.id === id);
    if (v) v.status = nextStatus;
    return v;
  }

  // Drivers
  if (path === "/api/v1/drivers") {
    if (method === "POST") {
      const newD: Driver = {
        id: mockDrivers.length + 1,
        employeeId: (body.employeeId as string) || `EMP-00${mockDrivers.length + 1}`,
        fullName: (body.fullName as string) || "New Driver",
        licenseNumber: (body.licenseNumber as string) || "DL-ETH-1234",
        licenseCategory: (body.licenseCategory as string) || "Heavy Truck (Category 4)",
        licenseExpiryDate: (body.licenseExpiryDate as string) || "2028-01-01",
        phoneNumber: (body.phoneNumber as string) || "+251 900 000000",
        status: DriverStatus.ACTIVE,
      };
      mockDrivers = [newD, ...mockDrivers];
      return newD;
    }
    return [...mockDrivers];
  }

  const driverMatch = path.match(/^\/api\/v1\/drivers\/(\d+)$/);
  if (driverMatch) {
    const id = Number(driverMatch[1]);
    return mockDrivers.find((d) => d.id === id) ?? mockDrivers[0];
  }

  const driverStatusMatch = path.match(/^\/api\/v1\/drivers\/(\d+)\/status$/);
  if (driverStatusMatch && method === "PATCH") {
    const id = Number(driverStatusMatch[1]);
    const nextStatus = (options.query?.status as DriverStatus) ?? DriverStatus.ACTIVE;
    const d = mockDrivers.find((item) => item.id === id);
    if (d) d.status = nextStatus;
    return d;
  }

  // Trips
  if (path === "/api/v1/trips") {
    if (method === "POST") {
      const newTrip: Trip = {
        id: mockTrips.length + 1,
        tripNumber: `TRP-2026-000${mockTrips.length + 1}`,
        origin: (body.origin as string) || "Origin City",
        destination: (body.destination as string) || "Destination City",
        payloadKg: Number(body.payloadKg) || 10000,
        cargoDescription: (body.cargoDescription as string) || "General Freight",
        routeDistanceKm: Number(body.routeDistanceKm) || 120,
        scheduledStart: (body.scheduledStart as string) || new Date().toISOString(),
        status: TripStatus.UNASSIGNED,
      };
      mockTrips = [newTrip, ...mockTrips];
      return newTrip;
    }
    return [...mockTrips];
  }

  const tripMatch = path.match(/^\/api\/v1\/trips\/(\d+)$/);
  if (tripMatch) {
    const id = Number(tripMatch[1]);
    return mockTrips.find((t) => t.id === id) ?? mockTrips[0];
  }

  const tripAssignMatch = path.match(/^\/api\/v1\/trips\/(\d+)\/assign$/);
  if (tripAssignMatch && method === "POST") {
    const id = Number(tripAssignMatch[1]);
    const t = mockTrips.find((item) => item.id === id);
    if (t) {
      t.vehicleId = Number(body.vehicleId);
      t.driverId = Number(body.driverId);
      t.status = TripStatus.ASSIGNED;
    }
    return t;
  }

  const tripStatusMatch = path.match(/^\/api\/v1\/trips\/(\d+)\/status$/);
  if (tripStatusMatch && method === "PATCH") {
    const id = Number(tripStatusMatch[1]);
    const nextStatus = (options.query?.status as TripStatus) ?? TripStatus.IN_TRANSIT;
    const t = mockTrips.find((item) => item.id === id);
    if (t) t.status = nextStatus;
    return t;
  }

  const tripCancelMatch = path.match(/^\/api\/v1\/trips\/(\d+)\/cancel$/);
  if (tripCancelMatch && method === "POST") {
    const id = Number(tripCancelMatch[1]);
    const t = mockTrips.find((item) => item.id === id);
    if (t) {
      t.status = TripStatus.CANCELLED;
    }
    return t;
  }

  const waybillMatch = path.match(/^\/api\/v1\/trips\/(\d+)\/waybill$/);
  if (waybillMatch) {
    const id = Number(waybillMatch[1]);
    const t = mockTrips.find((item) => item.id === id);
    const wb: Waybill = {
      id,
      waybillNumber: `WB-ETH-2026-${String(id).padStart(4, "0")}`,
      tripId: id,
      cargoDescription: t?.cargoDescription ?? "General Commercial Cargo",
      payloadKg: t?.payloadKg ?? 15000,
    };
    return wb;
  }

  // Fuel
  if (path === "/api/v1/fuel/transactions") {
    if (method === "POST") {
      const q = Number(body.quantityLiters) || 100;
      const p = Number(body.unitPrice) || 85.5;
      const newTx: FuelTransaction = {
        id: mockFuelTransactions.length + 1,
        vehicleId: Number(body.vehicleId) || 1,
        date: (body.date as string) || new Date().toISOString().slice(0, 10),
        quantityLiters: q,
        unitPrice: p,
        totalCost: q * p,
        station: (body.station as string) || "Depot Fuel Dispenser",
        odometerReading: Number(body.odometerReading) || 50000,
      };
      mockFuelTransactions = [newTx, ...mockFuelTransactions];
      return newTx;
    }
    return [...mockFuelTransactions];
  }

  // Fraud
  if (path === "/api/v1/fraud/alerts") {
    return [...mockFraudAlerts];
  }

  const fraudReviewMatch = path.match(/^\/api\/v1\/fraud\/alerts\/(\d+)\/review$/);
  if (fraudReviewMatch && method === "PATCH") {
    const id = Number(fraudReviewMatch[1]);
    const alert = mockFraudAlerts.find((a) => a.id === id);
    if (alert) {
      alert.status = (body.status as "INVESTIGATING" | "ESCALATED" | "DISMISSED") || "INVESTIGATING";
    }
    return alert;
  }

  // Maintenance
  if (path === "/api/v1/maintenance/records") {
    if (method === "POST") {
      const newM: MaintenanceRecord = {
        id: mockMaintenanceRecords.length + 1,
        vehicleId: Number(body.vehicleId) || 1,
        serviceDate: (body.serviceDate as string) || new Date().toISOString().slice(0, 10),
        mileage: Number(body.mileage) || 50000,
        cost: Number(body.cost) || 5000,
        description: (body.description as string) || "Scheduled service",
        provider: (body.provider as string) || "Depot Workshop",
        nextDueDate: (body.nextDueDate as string) || "2026-12-31",
      };
      mockMaintenanceRecords = [newM, ...mockMaintenanceRecords];
      return newM;
    }
    return [...mockMaintenanceRecords];
  }

  // Documents
  if (path === "/api/v1/documents") {
    if (method === "POST") {
      const newDoc: FleetDocument = {
        id: mockDocuments.length + 1,
        ownerType: "VEHICLE",
        ownerId: 1,
        documentType: "COMPLIANCE_CERTIFICATE",
        fileName: "uploaded_compliance_doc.pdf",
        url: "https://example.com/docs/uploaded_compliance_doc.pdf",
        expiryDate: "2027-12-31",
        uploadedAt: new Date().toISOString(),
      };
      mockDocuments = [newDoc, ...mockDocuments];
      return newDoc;
    }
    return [...mockDocuments];
  }

  // Monitoring Overview
  if (path === "/api/v1/monitoring/overview") {
    return {
      fleetSize: mockVehicles.length,
      activeTrips: mockTrips.filter(
        (t) =>
          t.status === TripStatus.IN_TRANSIT ||
          t.status === TripStatus.ASSIGNED ||
          t.status === TripStatus.LOADING,
      ).length,
      vehiclesInTransit: mockVehicles.filter((v) => v.status === VehicleStatus.IN_TRANSIT).length,
      vehiclesInMaintenance: mockVehicles.filter((v) => v.status === VehicleStatus.MAINTENANCE).length,
      openFraudAlerts: mockFraudAlerts.filter((a) => a.status === "OPEN").length,
      updatedAt: new Date().toISOString(),
    };
  }

  return {};
}
