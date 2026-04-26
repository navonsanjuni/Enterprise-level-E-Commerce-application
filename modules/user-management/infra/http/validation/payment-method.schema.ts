import { z } from "zod";

// ============================================================================
// Helpers
// ============================================================================

// Reasonable bounds for card expiry year — entity does the strict
// "not in the past" check per-request via Date comparison.
const MIN_EXP_YEAR = 2000;
const MAX_EXP_YEAR = 2100;

// ============================================================================
// Request body schemas
// ============================================================================

export const addPaymentMethodSchema = z.object({
  type: z.enum(["card", "wallet", "bank", "cod", "gift_card"]),
  brand: z.string().max(50).optional(),
  last4: z.string().regex(/^\d{4}$/).optional(),
  expMonth: z.number().int().min(1).max(12).optional(),
  expYear: z.number().int().min(MIN_EXP_YEAR).max(MAX_EXP_YEAR).optional(),
  billingAddressId: z.uuid().optional(),
  providerRef: z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
});

export const updatePaymentMethodSchema = z.object({
  billingAddressId: z.uuid().optional(),
  expMonth: z.number().int().min(1).max(12).optional(),
  expYear: z.number().int().min(MIN_EXP_YEAR).max(MAX_EXP_YEAR).optional(),
  providerRef: z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
});

// ============================================================================
// Path param schemas
// ============================================================================

export const paymentMethodIdParamsSchema = z.object({
  paymentMethodId: z.uuid(),
});

// ============================================================================
// Query schemas
// ============================================================================

const MAX_PAGE_SIZE = 100;

export const listPaymentMethodsQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1))
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(MAX_PAGE_SIZE))
    .optional(),
});

// ============================================================================
// Inferred types
// ============================================================================

export type AddPaymentMethodBody = z.infer<typeof addPaymentMethodSchema>;
export type UpdatePaymentMethodBody = z.infer<typeof updatePaymentMethodSchema>;
export type PaymentMethodIdParams = z.infer<typeof paymentMethodIdParamsSchema>;
export type ListPaymentMethodsQueryParams = z.infer<typeof listPaymentMethodsQuerySchema>;

// ============================================================================
// JSON Schema response objects (for Swagger / Fastify schema docs)
// ============================================================================

export const paymentMethodResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    type: { type: 'string' },
    brand: { type: 'string', nullable: true },
    last4: { type: 'string', nullable: true },
    expMonth: { type: 'integer', nullable: true },
    expYear: { type: 'integer', nullable: true },
    billingAddressId: { type: 'string', nullable: true },
    isDefault: { type: 'boolean' },
    displayName: { type: 'string' },
    isExpired: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

// Matches PaginatedResult<PaymentMethodDTO> shape returned by PaymentMethodService.getUserPaymentMethods
export const paymentMethodListResponseSchema = {
  type: 'object',
  properties: {
    items: { type: 'array', items: paymentMethodResponseSchema },
    total: { type: 'number' },
    limit: { type: 'number' },
    offset: { type: 'number' },
    hasMore: { type: 'boolean' },
  },
};
