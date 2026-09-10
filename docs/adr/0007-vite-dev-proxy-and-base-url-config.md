# ADR 0007: Vite Dev Proxy, Base URL Configuration, and Code-Splitting

## Status
Accepted

## Context
During development, the frontend dev server runs on `localhost:5173` while the Spring Cloud Gateway listens on `localhost:8080`. Making cross-origin HTTP calls from the browser can lead to CORS issues and mismatched ports between local development and production environments.

In addition, the single-page application imports numerous Material-UI components and microservice pages, creating a monolithic JavaScript bundle exceeding recommended chunk size thresholds (>500 kB).

## Decision
1. Configure Vite dev server proxy to forward `/api/**` traffic to `API_BASE_URL` (default `http://localhost:8080`).
2. Read `VITE_API_BASE_URL` via `import.meta.env` for production environments where frontend and gateway might reside on separate domains.
3. Use dynamic route imports (`React.lazy`) and `<React.Suspense>` in `src/main.tsx` to split page components into independent bundles on demand.
4. Separate core runtime vendor libraries (`react`, `react-dom`, `react-router-dom`) and UI libraries (`@mui`, `@emotion`) using Rollup `manualChunks`.

## Consequences
- Zero CORS overhead during local development.
- Production bundles are cleanly split into manageable chunks under 500 kB.
- Faster initial load times since routes are loaded only when navigated to.
