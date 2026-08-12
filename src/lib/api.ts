import type { ApiErrorEnvelope, ApiSuccessEnvelope } from "@/types/api";
import type { AuthTokens } from "@/types/auth";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
const REFRESH_TOKEN_STORAGE_KEY = "home-recipes:refreshToken";

export class ApiError extends Error {
  readonly status: number;
  readonly errorCode: string;

  constructor(status: number, errorCode: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

// The access token only ever lives in memory (cleared on reload); the
// refresh token is the sole piece of client-persisted auth state, mirroring
// the backend's rotate-on-refresh session model (see session.service.ts).
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function setTokens(tokens: AuthTokens): void {
  accessToken = tokens.accessToken;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
  }
}

export function clearTokens(): void {
  accessToken = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Attach `Authorization: Bearer <accessToken>` when available. Default: true. */
  auth?: boolean;
  /** Internal flag to stop a refresh retry from looping forever. */
  skipRefresh?: boolean;
}

// Concurrent 401s share one in-flight refresh call instead of each racing
// their own /auth/refresh request (which would invalidate one another, since
// refresh tokens are rotated and single-use).
let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  const storedRefreshToken = getStoredRefreshToken();
  if (!storedRefreshToken) {
    throw new ApiError(401, "NO_REFRESH_TOKEN", "No refresh token available");
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const tokens = await apiFetch<AuthTokens>("/auth/refresh", {
          method: "POST",
          body: { refreshToken: storedRefreshToken },
          auth: false,
          skipRefresh: true,
        });
        setTokens(tokens);
      } catch (error) {
        clearTokens();
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, auth = true, skipRefresh = false, headers, ...rest } = options;
  const isFormData = body instanceof FormData;

  const requestHeaders = new Headers(headers);
  if (!isFormData && body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (auth && accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, {
      ...rest,
      headers: requestHeaders,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Could not reach the server");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let json: ApiSuccessEnvelope<T> | ApiErrorEnvelope;
  try {
    json = await response.json();
  } catch {
    throw new ApiError(response.status, "INVALID_RESPONSE", "Server returned an invalid response");
  }

  if (!response.ok) {
    if (response.status === 401 && auth && !skipRefresh) {
      await refreshAccessToken();
      return apiFetch<T>(path, { ...options, skipRefresh: true });
    }

    const errorJson = json as ApiErrorEnvelope;
    throw new ApiError(errorJson.status, errorJson.errorCode, errorJson.message);
  }

  return (json as ApiSuccessEnvelope<T>).data as T;
}

export const api = {
  get: <T>(path: string, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
