import { z } from "zod";

export const createPromotionSchema = z.object({
  code: z.string().min(1).max(64).optional(),
  rule: z.record(z.string(), z.unknown()),
  startsAt: z.iso.datetime().optional(),
  endsAt: z.iso.datetime().optional(),
  usageLimit: z.number().int().positive().optional(),
});

export const applyPromotionSchema = z.object({
  promoCode: z.string().min(1),
  orderId: z.uuid().optional(),
  orderAmount: z.number().positive(),
  currency: z.string().length(3).optional(),
  products: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

export const recordPromotionUsageSchema = z.object({
  orderId: z.uuid(),
  discountAmount: z.number().positive(),
  currency: z.string().length(3).optional(),
});

export const promoIdParamsSchema = z.object({
  promoId: z.uuid(),
});
