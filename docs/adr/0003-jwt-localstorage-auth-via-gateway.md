# ADR 0003: JWT LocalStorage Authentication and Gateway Session Management

## Status
Accepted

## Context
All client requests must authenticate against `auth-service` via Spring Cloud Gateway. The frontend needs to manage authenticated session state, persist user credentials across page refreshes, and handle token expiration (401 Unauthorized) gracefully.

## Decision
1. Persist the raw JWT token (`orbit.auth.token`) and user session (`orbit.auth.session`) in browser `localStorage`.
2. Provide a synchronous lazy initializer in `SessionContext` (`useState(() => getSession())`) so initial page loads and deep-linked routes retain authentication without flickering or triggering false-positive redirects.
3. Automatically attach `Authorization: Bearer <token>` on all requests unless `skipAuth: true` is explicitly provided (e.g. login/register).
4. Register a global unauthorized callback that purges `localStorage` and routes the user to `/login` whenever the gateway returns HTTP 401.

## Consequences
- Single-page application remains authenticated across refreshes and direct URL visits.
- Centralized token expiry and redirect handling in `request.ts`.
- Simple, dependency-free state management without requiring Redux or MobX.
