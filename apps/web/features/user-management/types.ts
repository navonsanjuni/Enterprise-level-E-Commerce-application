/**
 * Wire types for the user-management feature. These mirror the response
 * shapes returned by `modules/user-management/infra/http/controllers/*`
 * and the JSON Schema response objects in `validation/auth.schema.ts`.
 *
 * Keeping these here (rather than in `@tasheen/types`) because they're
 * feature-local — only this slice consumes them. Promote to the shared
 * package when a second feature needs them.
 */

export type UserRole = "CUSTOMER" | "ADMIN" | "STAFF" | "GUEST";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole | string;
  isGuest: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: AuthUser;
}

export interface UserIdentity {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
