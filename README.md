# Orbit-FMS Web — Frontend Console

Modern React 18 & TypeScript enterprise management console for commercial freight logistics, vehicle fleet lifecycle tracking, cargo dispatching, and fuel fraud intelligence.

---

## Prerequisites

| Tool | Minimum Version | Check |
|---|:---:|---|
| **Node.js** | 18+ (20+ LTS recommended) | `node -v` |
| **npm** | 9+ | `npm -v` |
| **Modern Browser** | Chrome, Edge, Firefox | — |

> [!IMPORTANT]
> **New to the Project or Contributing?** Please refer to the domain architecture documentation:
> - 📘 [**Orbit-FMS Domain Context**](CONTEXT.md): Canonical domain glossary, cargo trip state machine, and Ethiopian commercial transport corridor specifications.
> - 🏛️ [**Architecture Decision Records (ADRs)**](docs/adr/): Recorded architecture decisions covering [microservice client layout](docs/adr/0002-per-microservice-generated-api-clients.md), [JWT authentication](docs/adr/0003-jwt-localstorage-auth-via-gateway.md), [envelope unwrapping](docs/adr/0005-single-request-wrapper-envelope-unwrapping.md), [Vite dev proxying & code-splitting](docs/adr/0007-vite-dev-proxy-and-base-url-config.md), and [compliance document storage](docs/adr/0008-document-service-attachment-flow.md).

---

## Quick Start (Windows PowerShell)

### Option 1: Instant Offline Demo Mode (No Backend Needed)

Orbit-FMS Web includes an offline simulation engine with realistic commercial trucking data (Addis Ababa &ndash; Djibouti corridor, Modjo Dry Port, ETB pricing, and electronic waybills). No Java, Maven, or PostgreSQL backend is required:

```powershell
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev

# 3. Open http://localhost:5173 in your browser and click:
#    "Explore Demo Mode (No Backend Needed)"
```

### Option 2: Full-Stack Integration with Spring Cloud Gateway

When running alongside the native Spring Boot microservices backend:

```powershell
# 1. Ensure the Orbit-FMS backend Gateway (:8080) is running
curl http://localhost:8080/actuator/health

# 2. Install dependencies (run once)
npm install

# 3. Start the frontend development server
npm run dev

# 4. Open http://localhost:5173 and sign in with your backend credentials
```

The Vite dev server automatically proxies all `/api/**` calls directly to the Spring Cloud Gateway at `http://localhost:8080` to eliminate CORS friction during development.

---

## Verify Everything Is Running

```powershell
# 1. Run automated unit & integration test suite (21 tests)
npm test -- --run

# 2. Run TypeScript strict type-checking
npx tsc --noEmit -p tsconfig.app.json

# 3. Build optimized production bundles (with chunk splitting)
npm run build

# 4. Preview production build locally
npm run preview
```

---

## Architecture

```text
Browser Client (React 18 SPA on :5173)
             │
             │ HTTP / Same-Origin (/api/**)
             ▼
┌────────────────────────────────────────────────────────┐
│        VITE DEV PROXY (Vite Dev Server :5173)          │
└──────────────────────────┬─────────────────────────────┘
                           │ Proxied to Gateway (:8080)
                           ▼
┌────────────────────────────────────────────────────────┐
│        API GATEWAY (Spring Cloud Gateway :8080)        │
└──────────────────────────┬─────────────────────────────┘
                           │ Dynamic Routing (lb://service-name)
                           ▼
┌────────────────────────────────────────────────────────┐
│     SERVICE DISCOVERY (Netflix Eureka Server :8761)    │
└──────────────────────────┬─────────────────────────────┘
                           │
    ┌──────────────┬───────┴──────┬──────────────┐
    ▼              ▼              ▼              ▼
┌────────┐    ┌────────┐     ┌────────┐     ┌────────┐
│  auth  │    │vehicle │     │ driver │     │  trip  │
│ (:8081)│    │ (:8082)│     │ (:8083)│     │ (:8084)│
└────────┘    └────────┘     └────────┘     └────────┘
    │              │              │              │
    ├──────────────┼──────────────┼──────────────┤
    ▼              ▼              ▼              ▼
┌────────┐    ┌────────┐     ┌────────┐     ┌────────┐
│  fuel  │    │ fraud  │     │maint.  │     │document│
│ (:8085)│    │ (:8086)│     │ (:8087)│     │ (:8088)│
└────────┘    └────────┘     └────────┘     └────────┘
    │                                            │
    └──────────────────────┬─────────────────────┘
                           ▼
                     ┌────────────┐
                     │ monitoring │
                     │  (:8089)   │
                     └────────────┘
```

### Core Frontend Layers

1. **Shared Request Client (`src/app/api/request.ts`)**:
   - Single point of contact for all microservice communication through the Gateway.
   - Automatically injects the stored `Authorization: Bearer <token>` JWT header.
   - Transparently unwraps backend success envelopes (`{ success: true, data: T }`) and maps error envelopes onto typed `ApiError` exceptions.
   - Intercepts HTTP 401s centrally, purging the session and redirecting to `/login`.
2. **Synchronous Session Provider (`src/app/session/SessionContext.tsx`)**:
   - Manages authenticated user state in React Context with lazy synchronous initialization from `localStorage`.
   - Protects deep links and prevents authentication flickering upon browser refresh.
3. **MUI Theming & Dark Mode (`src/app/theme/ThemeContext.tsx`)**:
   - Material-UI theme provider supporting real-time Light/Dark mode toggling with persisted user preferences.
4. **App Shell & Role-Based Navigation (`src/app/navigation/AppLayout.tsx`)**:
   - Responsive drawer and top bar that dynamically filters accessible navigation items according to the user's role (`FLEET_MANAGER`, `DISPATCHER`, `FUEL_OFFICER`, `MAINTENANCE_OFFICER`, `VIEWER`).

---

## Feature & Route Map

| Route | Page Component | Gateway Path | Allowed Roles | Primary Responsibilities |
|---|---|---|---|---|
| `/login` | `LoginPage` | `/api/v1/auth/login` | All / Public | JWT authentication, new user registration, and one-click Demo Mode entry. |
| `/` | `DashboardPage` | `/api/v1/monitoring/overview` | All Authenticated | Executive fleet command KPIs, active dispatch feeds, and open fraud alert cards. |
| `/vehicles` | `VehicleListPage` | `/api/v1/vehicles/**` | All Authenticated | Commercial truck inventory, specs (VIN, payload, tank capacity), status filtering, and registration modal. |
| `/drivers` | `DriverListPage` | `/api/v1/drivers/**` | All Authenticated | Commercial driver roster, license category certification (Grade 4/5), expiry alerts, and driver registration. |
| `/trips` | `TripListPage` | `/api/v1/trips/**` | Admin, Manager, Dispatcher, Viewer | Cargo trip dispatch schedule, corridor routes, search, filter, and scheduling modal. |
| `/trips/:id` | `TripDetailPage` | `/api/v1/trips/:id/**` | Admin, Manager, Dispatcher, Viewer | Lifecycle state machine stepper, truck & driver assignment, cancellation dialog, and electronic waybill. |
| `/fuel` | `FuelPage` | `/api/v1/fuel/transactions` | Admin, Manager, Fuel Officer, Viewer | Fuel purchase logs, station tracking, odometer readings, consumption stats, and transaction recording. |
| `/fraud` | `FraudPage` | `/api/v1/fraud/alerts/**` | Admin, Manager, Fuel Officer | AI-assisted statistical anomaly detection feeds, auditor review dialog (Investigate / Escalate / Dismiss). |
| `/maintenance` | `MaintenancePage` | `/api/v1/maintenance/records` | Admin, Manager, Maintenance Officer, Viewer | Preventative servicing history, workshop vendor tracking, overdue service alerts, and maintenance logging. |
| `/documents` | `DocumentPage` | `/api/v1/documents/**` | Admin, Manager, Dispatcher, Viewer | Regulatory compliance files (registration, inspection, insurance, licenses), expiration badges, and secure file downloads. |

---

## Cargo Trip State Machine

Every commercial cargo trip progresses through a strictly validated finite state machine defined in [`CONTEXT.md`](CONTEXT.md):

```text
[ UNASSIGNED ] ───► [ ASSIGNED ] ───► [ LOADING ] ───► [ IN_TRANSIT ] ◄───► [ INCIDENT ]
      │                   │                 │                │                     │
      ▼                   ▼                 ▼                ▼                     ▼
[ CANCELLED ]       [ CANCELLED ]     [ CANCELLED ]     [ UNLOADING ] ─────────► [ COMPLETED ]
```

* **Terminal States**: `COMPLETED` and `CANCELLED` permit no further transitions.
* **Dispatch Actions**: Electronic waybills are automatically generated upon resource assignment.
* **Cancellation**: Permitted from `UNASSIGNED`, `ASSIGNED`, and `LOADING` with audit reason recording.

---

## Offline Demo Mode

Orbit-FMS Web provides a fully featured in-memory simulation engine in `src/app/api/mockData.ts`:
* **Zero Dependencies**: Runs completely offline without backend databases or gateway services.
* **Realistic Latency**: Simulates a 60 ms network round-trip for authentic loading indicators.
* **Ethiopian Logistics Context**: Seeded with authentic regional freight corridors:
  - Addis Ababa (Kality Freight Depot) &ndash; Adama (Dry Port Logistics Hub)
  - Modjo Dry Port &ndash; Hawassa (Industrial Park Phase II)
  - Djibouti Corridor (Galafi Border) &ndash; Addis Ababa
  - Currency localized to Ethiopian Birr (ETB).

---

## Troubleshooting

### "Could not reach the server" / Gateway Connection Refused
The frontend could not establish a connection to the Spring Cloud Gateway. Check:
1. Verify the Gateway is running on port `8080`:
   ```powershell
   curl http://localhost:8080/actuator/health
   ```
2. If running on a different port or remote server, set the `VITE_API_BASE_URL` environment variable:
   ```powershell
   $env:VITE_API_BASE_URL = "http://localhost:8080"
   npm run dev
   ```
3. Alternatively, switch to **Demo Mode** via the login screen to continue development offline.

### 401 Unauthorized / Token Expiration
If a JWT expires or is rejected by the Gateway, `request.ts` automatically purges the stored token from `localStorage` and routes the user back to `/login` with an informative expiration notification.

### Port 5173 Already in Use
If Vite cannot bind to `5173` because another process is occupying the port:

```powershell
# Identify the process listening on port 5173
Get-NetTCPConnection -LocalPort 5173 | Select-Object OwningProcess

# Terminate the process (replace <PID> with the actual process ID)
Stop-Process -Id <PID> -Force
```

### Production Bundle Size & Code-Splitting
The build pipeline utilizes `React.lazy()` route splitting and Rollup `manualChunks` in `vite.config.ts`:
* `vendor-*.js` (~165 kB): Core React and React Router runtimes.
* `mui-*.js` (~332 kB): Material-UI and Emotion component libraries.
* Page chunks (`LoginPage`, `TripDetailPage`, etc.): Compact on-demand bundles (4.5 kB &ndash; 9.2 kB each).

All production chunks remain safely below the 500 kB threshold with zero build warnings.

---

## Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts the Vite development server on `http://localhost:5173` with HMR and Gateway proxying. |
| `npm run build` | Runs strict TypeScript type-checking and builds optimized production bundles in `dist/`. |
| `npm run preview` | Spins up a local static server to preview the built `dist/` directory. |
| `npm test` | Runs the full Vitest automated test suite once. |
| `npm run test:watch` | Starts Vitest in interactive watch mode for test-driven development. |

---

## Architecture Documentation & Guides

- [**CONTEXT.md**](CONTEXT.md) &mdash; Project-wide domain model, glossary terms, role authorization table, and logistics corridors.
- [**docs/adr/**](docs/adr/) &mdash; Architecture Decision Records repository:
  - [ADR 0002: Per-Microservice Domain API Clients & Trip State Machine](docs/adr/0002-per-microservice-generated-api-clients.md)
  - [ADR 0003: JWT LocalStorage Authentication & Session Handling](docs/adr/0003-jwt-localstorage-auth-via-gateway.md)
  - [ADR 0005: Single Request Wrapper & Envelope Unwrapping](docs/adr/0005-single-request-wrapper-envelope-unwrapping.md)
  - [ADR 0007: Vite Dev Proxy, Base URL Config & Code-Splitting](docs/adr/0007-vite-dev-proxy-and-base-url-config.md)
  - [ADR 0008: Compliance Document Storage & Attachment Flow](docs/adr/0008-document-service-attachment-flow.md)
- [**AGENTS.md**](AGENTS.md) &mdash; Development guidelines and repository issue-tracking standards.
