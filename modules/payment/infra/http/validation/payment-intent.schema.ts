import { z } from "zod";

export const createPaymentIntentSchema = z.object({
  orderId: z.uuid(),
  provider: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  idempotencyKey: z.string().optional(),
  clientSecret: z.string().optional(),
});

export const processPaymentSchema = z.object({
  intentId: z.uuid(),
  pspReference: z.string().optional(),
});

export const refundPaymentSchema = z.object({
  intentId: z.uuid(),
  amount: z.number().positive().optional(),
  reason: z.string().max(255).optional(),
});

export const voidPaymentSchema = z.object({
  intentId: z.uuid(),
  pspReference: z.string().optional(),
});

export const getPaymentIntentQuerySchema = z.object({
  intentId: z.uuid().optional(),
  orderId: z.uuid().optional(),
});

export const intentIdParamsSchema = z.object({
  intentId: z.uuid(),
});
