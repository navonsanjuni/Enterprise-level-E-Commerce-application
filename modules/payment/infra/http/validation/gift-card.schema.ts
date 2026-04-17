import { z } from "zod";

export const createGiftCardSchema = z.object({
  code: z.string().min(1).max(64),
  initialBalance: z.number().positive(),
  currency: z.string().length(3).optional(),
  expiresAt: z.iso.datetime().optional(),
  recipientEmail: z.email().optional(),
  recipientName: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
});

export const redeemGiftCardSchema = z.object({
  amount: z.number().positive(),
  orderId: z.uuid(),
});

export const giftCardIdParamsSchema = z.object({
  giftCardId: z.uuid(),
});

export const giftCardBalanceQuerySchema = z.object({
  codeOrId: z.string().min(1),
});
