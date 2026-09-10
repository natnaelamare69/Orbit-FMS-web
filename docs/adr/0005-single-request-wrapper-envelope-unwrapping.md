# ADR 0005: Single Request Wrapper and Backend Envelope Unwrapping

## Status
Accepted

## Context
Orbit-FMS backend microservices standardize HTTP responses in a common Spring envelope:
- Success: `{ success: true, message: string, data: T, timestamp: string }`
- Error: `{ status: number, error: string, message: string, path: string, timestamp: string }`

Writing repetitive response-parsing and error-extraction logic in every individual service client would cause significant code duplication and inconsistent error reporting.

## Decision
1. Implement a single shared `request<T>()` client in `src/app/api/request.ts`.
2. Inspect response payloads: if `{ success: true, data: ... }` is present, return `data` directly to callers.
3. Map non-2xx responses and backend error envelopes into a typed `ApiError` class exposing `status`, `code`, `message`, and `path`.
4. Support multipart file uploads via `formData` option without setting default JSON headers.
5. Provide transparent routing to in-memory `mockData.ts` when running in offline Demo Mode.

## Consequences
- Clean caller signatures (`const vehicles = await listVehicles()`).
- Consistent error message extraction throughout the application UI.
- Unified network exception and session timeout handling.
