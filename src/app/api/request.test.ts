import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, request } from "./request";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("request<T>() envelope handling", () => {
  it("unwraps the success envelope and returns data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({
      success: true,
      message: "Vehicle registered successfully",
      data: { id: 1, registrationNumber: "3-AA-12345" },
      timestamp: "2026-09-06T10:00:00",
    })));

    const data = await request<{ id: number; registrationNumber: string }>("/api/v1/vehicles");
    expect(data.registrationNumber).toBe("3-AA-12345");
  });

  it("injects the Authorization header from the stored token", async () => {
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => (k === "orbit.auth.token" ? "abc.jwt" : null),
    });
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await request<unknown[]>("/api/v1/vehicles");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer abc.jwt");
  });

  it("maps the error envelope onto ApiError and clears session on 401", async () => {
    let cleared = false;
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      removeItem: () => { cleared = true; },
      setItem: () => {},
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({
      status: 409,
      error: "Conflict",
      message: "Invalid state transition",
      path: "/api/v1/trips/1/status",
      timestamp: "2026-09-06T10:00:00",
    }, 409)));

    const thrown = await request<unknown>("/api/v1/trips/1/status").catch((e) => e);
    expect(thrown).toBeInstanceOf(ApiError);
    expect((thrown as ApiError).status).toBe(409);
    expect((thrown as ApiError).message).toBe("Invalid state transition");
    expect(cleared).toBe(false); // only 401 clears the session

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({
      status: 401,
      error: "Unauthorized",
      message: "Session expired",
    }, 401)));
    const second = await request<unknown>("/api/v1/trips/1").catch((e) => e);
    expect(second).toBeInstanceOf(ApiError);
    expect(cleared).toBe(true);
  });
});