import { config } from "@/lib/config";
import { setAuthToken, setRefreshToken } from "@/lib/auth";
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ChangePasswordRequest,
  ChangeEmailRequest,
  DeleteAccountRequest,
} from "@tasheen/validation/auth";
import type { AuthResult, UserIdentity, RefreshTokenResult, UserProfile } from "./types";
import { getAuthToken } from "@/lib/auth";



const API_PREFIX = "/api/v1";

export class ApiCallError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiCallError";
    this.statusCode = statusCode;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

interface BackendErrorBody {
  success: false;
  statusCode: number;
  message: string;
  code?: string;
  // The backend's ResponseHelper.error nests Zod's formatted errors under
  // either `error` (object) or `errors` (string[]). We normalise both.
  error?: unknown;
  errors?: string[];
}

interface BackendSuccessBody<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}

type BackendBody<T> = BackendSuccessBody<T> | BackendErrorBody;

async function request<T>(
  path: string,
  init: RequestInit & { body?: BodyInit | null },
): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${config.apiBaseUrl}${API_PREFIX}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  let body: BackendBody<T>;
  try {
    body = (await response.json()) as BackendBody<T>;
  } catch {
    throw new ApiCallError(
      "The server returned an unreadable response.",
      response.status,
    );
  }

  if (!body.success) {
    const fieldErrors = extractFieldErrors(body.error);
    throw new ApiCallError(
      body.message ?? "Request failed",
      body.statusCode ?? response.status,
      body.code,
      fieldErrors,
    );
  }

  return body.data;
}

/**
 * The backend's `ResponseHelper.error` runs `error.format()` on a ZodError
 * which produces a deeply nested `{ field: { _errors: [...] } }` shape.
 * Flatten it to `{ field: "first message" }` so form components can spread
 * server errors back onto react-hook-form.
 */
function extractFieldErrors(
  raw: unknown,
): Record<string, string> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const out: Record<string, string> = {};
  for (const [field, value] of Object.entries(raw)) {
    if (
      value &&
      typeof value === "object" &&
      "_errors" in value &&
      Array.isArray((value as { _errors: unknown })._errors) &&
      (value as { _errors: string[] })._errors.length > 0
    ) {
      out[field] = (value as { _errors: string[] })._errors[0]!;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

// ─── Endpoints ──────────────────────────────────────────────────────────────

export async function register(input: RegisterRequest): Promise<AuthResult> {
  const result = await request<AuthResult>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  persistTokens(result);
  return result;
}

export async function login(input: LoginRequest): Promise<AuthResult> {
  const result = await request<AuthResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  persistTokens(result);
  return result;
}

export async function logout(refreshToken?: string): Promise<void> {
  await request<{ action: string }>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

function persistTokens(result: AuthResult): void {
  setAuthToken(result.accessToken);
  if (result.refreshToken) {
    setRefreshToken(result.refreshToken);
  }
}

export async function forgotPassword(input: ForgotPasswordRequest): Promise<void> {
  await request<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function resetPassword(input: ResetPasswordRequest): Promise<void> {
  await request<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCurrentUser(): Promise<UserIdentity> {
  return request<UserIdentity>("/auth/me", {
    method: "GET",
  });
}

export async function refreshToken(input: RefreshTokenRequest): Promise<RefreshTokenResult> {
  const result = await request<RefreshTokenResult>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setAuthToken(result.accessToken);
  if (result.refreshToken) {
    setRefreshToken(result.refreshToken);
  }
  return result;
}

export async function verifyEmail(input: VerifyEmailRequest): Promise<void> {
  await request<void>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function resendVerification(input: ResendVerificationRequest): Promise<void> {
  await request<void>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function changePassword(input: ChangePasswordRequest): Promise<void> {
  await request<void>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function changeEmail(input: ChangeEmailRequest): Promise<void> {
  await request<void>("/auth/change-email", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteAccount(input: DeleteAccountRequest): Promise<void> {
  await request<void>("/auth/delete", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getUserProfile(): Promise<UserProfile> {
  return request<UserProfile>("/users/me/profile", {
    method: "GET",
  });
}

export async function updateUserProfile(input: Partial<UserProfile>): Promise<UserProfile> {
  return request<UserProfile>("/users/me/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
