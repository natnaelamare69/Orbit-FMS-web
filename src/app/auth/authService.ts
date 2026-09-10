import { request, type Session } from "../api/request";

export interface Credentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type?: string;
  userId?: number;
  username?: string;
  email?: string;
  role?: string;
  user?: { id: string | number; username: string; role?: string; fullName?: string };
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

/** Login against auth-service via the gateway (POST /api/v1/auth/login). */
export async function login(credentials: Credentials): Promise<Session> {
  const data = await request<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: credentials,
    skipAuth: true,
  });
  return {
    token: data.token,
    user: data.user ?? {
      id: data.userId ?? 1,
      username: data.username ?? credentials.username,
      role: data.role ?? "FLEET_MANAGER",
      fullName: data.username ?? credentials.username,
    },
  };
}

/** Register a new user against auth-service via the gateway (POST /api/v1/auth/register). */
export async function register(input: RegisterInput): Promise<Session> {
  const data = await request<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: input,
    skipAuth: true,
  });
  return {
    token: data.token,
    user: data.user ?? {
      id: data.userId ?? 1,
      username: data.username ?? input.username,
      role: data.role ?? input.role ?? "FLEET_MANAGER",
      fullName: input.fullName,
    },
  };
}