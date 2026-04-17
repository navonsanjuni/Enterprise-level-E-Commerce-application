import { z } from "zod";

export const createStripeIntentSchema = z.object({
  orderId: z.uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  idempotencyKey: z.string().optional(),
});

export const listWebhookEventsQuerySchema = z.object({
  provider: z.string().optional(),
  eventType: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
