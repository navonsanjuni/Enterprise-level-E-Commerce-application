import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().check(z.url({ error: "Invalid avatar URL" })).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "non_binary", "prefer_not_to_say"]).optional(),
  locale: z.string().max(10).optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code").optional(),
  defaultAddressId: z.string().check(z.uuid({ error: "Invalid address ID" })).optional(),
  defaultPaymentMethodId: z.string().check(z.uuid({ error: "Invalid payment method ID" })).optional(),
  stylePreferences: z.record(z.string(), z.unknown()).optional(),
  preferredSizes: z
    .object({
      shoes: z.string().optional(),
      clothing: z.string().optional(),
    })
    .optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
