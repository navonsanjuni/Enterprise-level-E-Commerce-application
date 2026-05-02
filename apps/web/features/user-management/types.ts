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
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  title?: string;
  dateOfBirth?: string;
  residentOf?: string;
  nationality?: string;
  locale: string;
  currency: string;
  createdAt: string;
  defaultAddressId?: string;
  defaultPaymentMethodId?: string;
  prefs?: Record<string, unknown>;
  stylePreferences?: Record<string, unknown>;
  preferredSizes?: Record<string, string | undefined>;
}
