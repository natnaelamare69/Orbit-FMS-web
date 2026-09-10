# Orbit-FMS Domain Context

Canonical domain glossary and system architecture for the **Orbit-FMS** (Fleet Management System) web application.

---

## 1. System Overview

Orbit-FMS is an enterprise logistics and commercial fleet management platform designed for long-haul freight and commercial transport operations (such as the Addis Ababa - Djibouti economic corridor, Modjo Dry Port, and regional logistics depots).

The frontend is a React 18 Single-Page Application (SPA) built with TypeScript, Vite, and Material-UI. It interfaces with the backend exclusively via a Spring Cloud Gateway (port `8080`), which routes traffic to decentralized domain microservices.

```
+-------------------------------------------------------------+
|               Orbit-FMS Web Frontend (SPA)                 |
|             (React 18 + TypeScript + Vite + MUI)            |
+-------------------------------------------------------------+
                               | (Bearer JWT)
                               v
+-------------------------------------------------------------+
|              Spring Cloud Gateway (:8080)                   |
+-------------------------------------------------------------+
                               |
         +---------------------+---------------------+
         |                     |                     |
         v                     v                     v
+-----------------+   +-----------------+   +-----------------+
|  auth-service   |   | vehicle-service |   |  driver-service |
+-----------------+   +-----------------+   +-----------------+
         |                     |                     |
         v                     v                     v
+-----------------+   +-----------------+   +-----------------+
|  trip-service   |   |  fuel-service   |   | fraud-service   |
+-----------------+   +-----------------+   +-----------------+
         |                     |                     |
         v                     v                     v
+-----------------+   +-----------------+
| maintenance-svc |   |  document-svc   |
+-----------------+   +-----------------+
```

---

## 2. Domain Terminology & Glossary

| Term | Description |
| :--- | :--- |
| **Vehicle** | A commercial transport unit (e.g. Heavy Rigid Truck, Semi-Trailer, Tanker) registered with VIN, registration plate, payload capacity, and operating status. |
| **Driver** | A certified commercial operator holding a professional license (e.g., Grade 4 Commercial, Grade 5 Heavy Truck) with active employment and readiness status. |
| **Trip** | A scheduled cargo dispatch mission between an origin and destination carrying a commercial payload. Follows a validated finite-state lifecycle. |
| **Waybill** | An electronic freight consignment document issued upon dispatch assignment specifying cargo, consignee route, and net payload. |
| **Payload (kg)** | Net cargo weight in kilograms; validated against the assigned vehicle's maximum payload capacity. |
| **Fuel Transaction** | An operational fuel purchase record capturing purchase date, volume (liters), unit price (ETB), dispensing station, and odometer reading. |
| **Fuel Anomaly** | A detected divergence exceeding statistical baselines (e.g., >20% consumption spike, route corridor deviation). |
| **Fraud Alert** | An AI-assisted decision-support alert surfaced for human investigator review. **Notice**: alerts are statistical flags for review, not accusations. |
| **Maintenance Record** | A preventive service or repair log tracking workshop provider, cost (ETB), odometer interval, and next due date. |
| **Fleet Document** | A compliance file attached to a vehicle or driver (e.g., Commercial Registration, Annual Technical Inspection, Insurance, Driving License). |

---

## 3. Trip Lifecycle & State Machine

Cargo trips progress through a strict finite state machine:

```
[ UNASSIGNED ] ---> [ ASSIGNED ] ---> [ LOADING ] ---> [ IN_TRANSIT ] <---> [ INCIDENT ]
      |                   |                 |                |                     |
      v                   v                 v                v                     v
[ CANCELLED ]       [ CANCELLED ]     [ CANCELLED ]     [ UNLOADING ] ---------> [ COMPLETED ]
```

* **Terminal states**: `COMPLETED` and `CANCELLED` allow no further state movement.
* Direct completion from `LOADING` or `UNASSIGNED` is rejected.
* Cancellation is permitted from `UNASSIGNED`, `ASSIGNED`, and `LOADING`.

---

## 4. User Roles & Access Boundaries

| Role | Permissions & Scope |
| :--- | :--- |
| **SYSTEM_ADMIN** | Full administrative privileges across all services, system parameters, and accounts. |
| **FLEET_MANAGER** | Complete operational access across vehicles, drivers, trips, fuel, maintenance, and fraud triage. |
| **DISPATCHER** | Management of cargo trips, vehicle/driver assignment, and waybills. |
| **FUEL_OFFICER** | Logging fuel transactions, monitoring consumption, and triaging fuel anomalies. |
| **MAINTENANCE_OFFICER** | Workshop service scheduling, repair records, and vehicle roadworthiness tracking. |
| **VIEWER** | Read-only visibility across fleet status, trips, and reports. |

---

## 5. Offline Demo Mode

Orbit-FMS provides a zero-dependency **Demo Mode** enabled in the UI. In Demo Mode:
* Mock state is held in-memory within `src/app/api/mockData.ts`.
* Requests simulate gateway latency (60 ms) and handle CRUD operations locally.
* Realistically models commercial Ethiopian freight operations (Addis Ababa Kality Freight Depot, Adama Dry Port, Modjo, Hawassa, and the Galafi Djibouti border corridor).
