import { z } from "zod";

/**
 * Auth wire schemas — kept in lockstep with
 * `modules/user-management/infra/http/validation/auth.schema.ts`.
 *
 * The bounds (password 8–128, name max 50) come from
 * `USER_MANAGEMENT_CONSTANTS` on the backend; we re-declare them here so
 * the validation package stays self-contained (no cross-imports from the
 * backend modules into the frontend bundle).
 */

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
const NAME_MAX = 50;

// ─── Wire schemas (exact match with backend) ────────────────────────────────

export const registerRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(PASSWORD_MIN).max(PASSWORD_MAX),
  phone: z.string().optional(),
  firstName: z.string().max(NAME_MAX).optional(),
  lastName: z.string().max(NAME_MAX).optional(),
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(PASSWORD_MAX),
  rememberMe: z.boolean().optional(),
});

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutRequestSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1).max(PASSWORD_MAX),
  newPassword: z.string().min(PASSWORD_MIN).max(PASSWORD_MAX),
});

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordRequestSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(PASSWORD_MIN).max(PASSWORD_MAX),
});

export const verifyEmailRequestSchema = z.object({
  token: z.string().min(1),
});

export const resendVerificationRequestSchema = z.object({
  email: z.string().email(),
});

// ─── Form-level schemas (extend wire schemas with UI-only fields) ───────────
// Sign-up form adds confirmPassword + agreeToTerms which are UI-only — they
// never hit the wire. The submit handler picks the wire fields off this
// shape before calling the API.

export const signUpFormSchema = registerRequestSchema
  .extend({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(NAME_MAX),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(NAME_MAX),
    confirmPassword: z.string(),
    agreeToTerms: z
      .boolean()
      .refine((v) => v === true, {
        message: "You must agree to the Terms of Service and Privacy Policy",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const signInFormSchema = loginRequestSchema;

// ─── Inferred types ─────────────────────────────────────────────────────────

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;
export type LogoutRequest = z.infer<typeof logoutRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;
export type ResendVerificationRequest = z.infer<
  typeof resendVerificationRequestSchema
>;

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
export type SignInFormValues = z.infer<typeof signInFormSchema>;
