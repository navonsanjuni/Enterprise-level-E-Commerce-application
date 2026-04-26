import { z } from "zod";

// ============================================================================
// Constants
// ============================================================================

const USER_ROLES = [
  "GUEST",
  "CUSTOMER",
  "ADMIN",
  "INVENTORY_STAFF",
  "CUSTOMER_SERVICE",
  "ANALYST",
  "VENDOR",
] as const;

const USER_STATUSES = ["active", "inactive", "blocked"] as const;

const MAX_PAGE_SIZE = 100;

// ============================================================================
// Path param schemas
// ============================================================================

export const userIdParamsSchema = z.object({
  userId: z.uuid(),
});

// ============================================================================
// Query schemas
// ============================================================================

export const listUsersQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1)).optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(MAX_PAGE_SIZE))
    .optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  search: z.string().max(200).optional(),
  emailVerified: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
  sortBy: z.enum(["createdAt", "email"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// ============================================================================
// Request body schemas
// ============================================================================

export const updateUserStatusSchema = z.object({
  status: z.enum(USER_STATUSES),
  notes: z.string().max(500).optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(USER_ROLES),
  reason: z.string().max(500).optional(),
});

export const toggleEmailVerifiedSchema = z.object({
  isVerified: z.boolean(),
  reason: z.string().max(500).optional(),
});

// ============================================================================
// Inferred types
// ============================================================================

export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserStatusBody = z.infer<typeof updateUserStatusSchema>;
export type UpdateUserRoleBody = z.infer<typeof updateUserRoleSchema>;
export type ToggleEmailVerifiedBody = z.infer<typeof toggleEmailVerifiedSchema>;

// ============================================================================
// JSON Schema response objects (for Swagger / Fastify schema docs)
// ============================================================================

export const userDetailResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', nullable: true },
    firstName: { type: 'string', nullable: true },
    lastName: { type: 'string', nullable: true },
    role: { type: 'string' },
    status: { type: 'string' },
    emailVerified: { type: 'boolean' },
    phoneVerified: { type: 'boolean' },
    isGuest: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

// Matches PaginatedResult<UserListItem> shape returned by findAllWithFilters
export const userListResponseSchema = {
  type: 'object',
  properties: {
    items: { type: 'array', items: userDetailResponseSchema },
    total: { type: 'number' },
    limit: { type: 'number' },
    offset: { type: 'number' },
    hasMore: { type: 'boolean' },
  },
};
