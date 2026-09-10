/**
 * Shared request layer for the Orbit-FMS gateway.
 *
 * Every API call in the app funnels through `request<T>()`. This is the single
 * place that:
 *   1. injects the Authorization: Bearer header from the session store,
 *   2. unwraps the backend success envelope { success, message, data, timestamp }
 *      and returns `data`,
 *   3. maps the backend error envelope { status, error, message, path, timestamp }
 *      onto a typed `ApiError`,
 *   4. on 401 clears the session and signals the app to redirect to login.
 *
 * See docs/adr/0005-single-request-wrapper-envelope-unwrapping.md.
 */

// --- Session (JWT) storage -------------------------------------------------

export const TOKEN_KEY = "orbit.auth.token";
export const SESSION_KEY = "orbit.auth.session";

export interface SessionUser {
  id: number | string;
  username: string;
  role?: string;
  fullName?: string;
}

export interface Session {
  token: string;
  user: SessionUser;
}

/** Read the raw JWT from local storage. */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore storage failures (e.g. private browsing)
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    setDemoMode(false);
  } catch {
    // ignore
  }
}

// --- Typed API error -------------------------------------------------------

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly path: string;

  constructor(status: number, code: string, message: string, path: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.path = path;
  }
}

// --- Unauthorized callback (wired by the session context) ------------------

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

// --- Base URL --------------------------------------------------------------

function baseUrl(env?: ImportMetaEnv): string {
  return env?.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? "";
}

function buildUrl(env: ImportMetaEnv | undefined, path: string, query?: RequestQuery): string {
  const q = query
    ? Object.entries(query)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join("&")
    : "";
  return `${baseUrl(env)}${path}${q ? `?${q}` : ""}`;
}

// --- Request ---------------------------------------------------------------

export interface RequestQuery {
  [key: string]: string | number | boolean | undefined | null;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: RequestQuery;
  headers?: Record<string, string>;
  /** Multipart file upload body; sets the body without a JSON content type. */
  formData?: FormData;
  /** Skip the Authorization header. Used by the login endpoint. */
  skipAuth?: boolean;
}

import { isDemoMode, setDemoMode, handleMockRequest } from "./mockData";

export async function request<T>(
  path: string,
  options: RequestOptions = {},
  env: ImportMetaEnv | undefined = import.meta.env,
): Promise<T> {
  if (isDemoMode()) {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return handleMockRequest(path, {
      method: options.method,
      body: options.body,
      query: options.query as Record<string, unknown>,
    }) as T;
  }

  const headers: Record<string, string> = { ...(options.headers ?? {}) };
  if (!options.skipAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let body: BodyInit | null = null;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const url = buildUrl(env, path, options.query);

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body,
    });
  } catch (err) {
    throw new ApiError(0, "NetworkError", "Could not reach the server.", path);
  }

  // Session expired / token rejected.
  if (response.status === 401 && !options.skipAuth) {
    clearSession();
    if (unauthorizedHandler) {
      unauthorizedHandler();
    }
    throw new ApiError(401, "Unauthorized", "Your session has expired. Please sign in again.", path);
  }

  // Parse body defensively (empty bodies, plain text, JSON).
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  const obj = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      typeof obj?.error === "string" ? obj.error : response.statusText,
      typeof obj?.message === "string" ? obj.message : `Request failed (${response.status}).`,
      typeof obj?.path === "string" ? obj.path : path,
    );
  }

  // Standardized success envelope: { success, message, data, timestamp }.
  if (obj && typeof obj.success === "boolean" && "data" in obj) {
    return obj.data as T;
  }
  return payload as T;
}