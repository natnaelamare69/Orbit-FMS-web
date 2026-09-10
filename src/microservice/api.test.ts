import { afterEach, describe, expect, it, vi } from "vitest";
import { TripStatus, VehicleStatus, DriverStatus } from "../app/domain/types";
import { assignTrip, cancelTrip, getWaybill, scheduleTrip, transitionTrip } from "./trip/api";
import { createVehicle, updateVehicleMileage, updateVehicleStatus } from "./vehicle/api";
import { createDriver, updateDriverStatus } from "./driver/api";
import { reviewFraudAlert } from "./fraud/api";
import { recordFuelTransaction } from "./fuel/api";
import { recordMaintenance } from "./maintenance/api";

function mockJsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data, timestamp: "2026-09-09T12:00:00" }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Microservice API clients", () => {
  describe("Trip API", () => {
    it("scheduleTrip sends POST to /api/v1/trips", async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ id: 10, origin: "Addis Ababa" }));
      vi.stubGlobal("fetch", fetchMock);

      const result = await scheduleTrip({
        origin: "Addis Ababa",
        destination: "Adama",
        payloadKg: 12000,
        cargoDescription: "Construction Steel",
      });

      expect(result.id).toBe(10);
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("/api/v1/trips");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({
        origin: "Addis Ababa",
        destination: "Adama",
        payloadKg: 12000,
        cargoDescription: "Construction Steel",
      });
    });

    it("assignTrip sends vehicleId and driverId", async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ id: 10, vehicleId: 1, driverId: 2 }));
      vi.stubGlobal("fetch", fetchMock);

      const result = await assignTrip(10, 1, 2);
      expect(result.vehicleId).toBe(1);
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("/api/v1/trips/10/assign");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({ vehicleId: 1, driverId: 2 });
    });

    it("transitionTrip patches status with query param", async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ id: 10, status: TripStatus.LOADING }));
      vi.stubGlobal("fetch", fetchMock);

      await transitionTrip(10, TripStatus.LOADING);
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("/api/v1/trips/10/status?status=LOADING");
      expect(init.method).toBe("PATCH");
    });

    it("cancelTrip sends cancellation reason", async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ id: 10, status: TripStatus.CANCELLED }));
      vi.stubGlobal("fetch", fetchMock);

      await cancelTrip(10, "Mechanical breakdown before dispatch");
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("/api/v1/trips/10/cancel");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({ reason: "Mechanical breakdown before dispatch" });
    });

    it("getWaybill requests electronic waybill for trip", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        mockJsonResponse({
          waybillNumber: "WB-2026-001",
          tripId: 10,
          origin: "Addis Ababa",
          destination: "Hawassa",
        })
      );
      vi.stubGlobal("fetch", fetchMock);

      const wb = await getWaybill(10);
      expect(wb.waybillNumber).toBe("WB-2026-001");
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("/api/v1/trips/10/waybill");
      expect(init.method).toBe("GET");
    });
  });

  describe("Vehicle API", () => {
    it("createVehicle posts payload and specs", async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ id: 1, registrationNumber: "3-AA-99999" }));
      vi.stubGlobal("fetch", fetchMock);

      await createVehicle({
        registrationNumber: "3-AA-99999",
        vin: "1HGCR2F83HA000000",
        make: "Isuzu",
        model: "FVR",
        year: 2024,
        payloadCapacity: 15000,
        fuelTankCapacity: 300,
      });

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("/api/v1/vehicles");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string).payloadCapacity).toBe(15000);
    });

    it("updateVehicleStatus sets status query param", async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ id: 1, status: VehicleStatus.MAINTENANCE }));
      vi.stubGlobal("fetch", fetchMock);

      await updateVehicleStatus(1, VehicleStatus.MAINTENANCE);
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("/api/v1/vehicles/1/status?status=MAINTENANCE");
      expect(init.method).toBe("PATCH");
    });

    it("updateVehicleMileage patches odometer reading", async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ id: 1, currentMileage: 45200 }));
      vi.stubGlobal("fetch", fetchMock);

      await updateVehicleMileage(1, 45200);
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("/api/v1/vehicles/1/mileage?currentMileage=45200");
      expect(init.method).toBe("PATCH");
    });
  });

  describe("Driver API", () => {
    it("createDriver posts driver credentials and license", async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ id: 3, employeeId: "EMP-042" }));
      vi.stubGlobal("fetch", fetchMock);

      await createDriver({
        employeeId: "EMP-042",
        fullName: "Abebe Bikila",
        licenseNumber: "DL-ETH-8821",
        licenseCategory: "Heavy Truck (Category 4)",
        phoneNumber: "+251911223344",
      });

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("/api/v1/drivers");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string).licenseCategory).toBe("Heavy Truck (Category 4)");
    });

    it("updateDriverStatus updates driver readiness", async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ id: 3, status: DriverStatus.ON_TRIP }));
      vi.stubGlobal("fetch", fetchMock);

      await updateDriverStatus(3, DriverStatus.ON_TRIP);
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("/api/v1/drivers/3/status?status=ON_TRIP");
      expect(init.method).toBe("PATCH");
    });
  });

  describe("Fraud API", () => {
    it("reviewFraudAlert posts human triage decision per ADR-0003", async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ id: 5, status: "INVESTIGATING" }));
      vi.stubGlobal("fetch", fetchMock);

      await reviewFraudAlert(5, "INVESTIGATING", "Fuel variance checked against route terrain");
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("/api/v1/fraud/alerts/5/review");
      expect(init.method).toBe("PATCH");
      expect(JSON.parse(init.body as string)).toEqual({
        status: "INVESTIGATING",
        notes: "Fuel variance checked against route terrain",
      });
    });
  });

  describe("Fuel & Maintenance APIs", () => {
    it("recordFuelTransaction posts fuel log", async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ id: 101, quantityLiters: 120 }));
      vi.stubGlobal("fetch", fetchMock);

      await recordFuelTransaction({
        vehicleId: 1,
        date: "2026-09-09",
        quantityLiters: 120,
        unitPrice: 85.5,
        station: "TotalEnergies Bole",
        odometerReading: 32000,
      });

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("/api/v1/fuel/transactions");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string).station).toBe("TotalEnergies Bole");
    });

    it("recordMaintenance posts maintenance record", async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ id: 201, cost: 4500 }));
      vi.stubGlobal("fetch", fetchMock);

      await recordMaintenance({
        vehicleId: 2,
        serviceDate: "2026-09-09",
        cost: 4500,
        description: "Oil filter change and brake pad check",
        provider: "Central Depot Workshop",
      });

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("/api/v1/maintenance/records");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string).description).toBe("Oil filter change and brake pad check");
    });
  });
});
