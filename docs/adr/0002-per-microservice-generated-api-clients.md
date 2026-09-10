# ADR 0002: Per-Microservice Domain API Clients and Trip State Machine

## Status
Accepted

## Context
Orbit-FMS backend comprises multiple decentralized Spring Boot services (vehicle, driver, trip, fuel, fraud, maintenance, document, monitoring). The frontend needed a scalable layout for API integration and domain typing that reflects these service boundaries while keeping UI components clean and decoupled.

Additionally, commercial cargo trips require a rigorous lifecycle (Unassigned -> Assigned -> Loading -> In Transit -> Incident / Unloading -> Completed, plus Cancellation).

## Decision
1. Organize frontend microservice modules under `src/microservice/<domain>/` with dedicated `api.ts` clients and `pages/` views.
2. Define a shared domain model in `src/app/domain/types.ts` containing the canonical `TRIP_TRANSITIONS` state table.
3. Enforce the state machine transitions both in the UI action buttons and in unit tests to guarantee legal transitions before dispatch.

## Consequences
- Clean separation between HTTP transport/endpoints and UI presentation.
- Strong type safety across all microservice boundaries.
- Prevents invalid trip state jumps at the UI layer.
